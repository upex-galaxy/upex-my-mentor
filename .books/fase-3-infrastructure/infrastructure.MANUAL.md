<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Infrastructure Setup - Manual

> **Fase:** 3 - Infrastructure (Setup Técnico Base)
> **Tiempo estimado:** 4-8 horas
> **Herramientas:** Supabase, Next.js, TailwindCSS, TypeScript, Terminal
> **Pre-requisito:** Fase 2 (Architecture) completada

---

## Objetivo

Configurar la **base técnica completa** del proyecto que será reutilizada en todas las features del MVP:

- Backend: Database + Auth + API Layer + Tipos TypeScript
- Frontend: Design System + Layout + Páginas demo
- Integración: Frontend conectado a backend real

Esta fase se ejecuta **UNA SOLA VEZ** antes de comenzar el desarrollo iterativo de features.

---

## Conceptos Clave

### 🔑 Backend-First Philosophy

El backend define el schema de la base de datos, lo cual genera automáticamente tipos TypeScript que el frontend importa. Esto elimina type mismatches.

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   DB Schema      │ ──→ │  TypeScript      │ ──→ │   Frontend       │
│   (Supabase)     │     │  Types (auto)    │     │   Components     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

**Beneficio:** Si cambias el schema, TypeScript te avisa dónde hay errores.

### 🔑 Tablas Fundacionales vs Tablas de Features

- **Fundacionales (Fase 3):** `users`, `profiles`, `roles` - Tablas que TODAS las features necesitan
- **De Features (Fase 7):** Tablas específicas de cada story que implementas

### 🔑 Row Level Security (RLS)

Políticas de seguridad a nivel de fila en PostgreSQL. Definen qué usuarios pueden ver/modificar qué datos.

```
Ejemplo: "Solo el dueño puede ver sus propios pedidos"
→ SELECT * FROM orders WHERE user_id = auth.uid()
```

### 🔑 Design System

Colección de componentes UI reutilizables (Button, Card, Input, etc.) con estilos consistentes. Se crea UNA vez y se reutiliza en todas las páginas.

---

## Pre-requisitos

### Fase 2 Completada

- [ ] `.context/SRS/architecture-specs.md` - Tech stack, ERD de base de datos
- [ ] `.context/SRS/design-specs.md` - Paleta de colores, wireframes
- [ ] `.context/SRS/functional-specs.md` - Features principales
- [ ] `.context/PRD/` - PRD completo

### Herramientas Locales

- [ ] Node.js v18+ instalado
- [ ] Git instalado y configurado
- [ ] Editor de código (VS Code recomendado)

### Cuentas en Servicios Cloud

- [ ] Cuenta en [Supabase](https://supabase.com) (o el DB provider elegido)
- [ ] Cuenta en [Vercel](https://vercel.com) (o el hosting provider elegido)

---

## Paso a Paso

El proceso se divide en dos grandes bloques:

1. **Backend Setup** (1.5-3 horas)
2. **Frontend Setup** (2-4 horas)

---

# PARTE 1: BACKEND SETUP

## Paso 1: Crear Proyecto en Supabase

### 1.1 Crear cuenta y proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en "New project"
3. Configura:
   - **Name:** Nombre de tu proyecto
   - **Database Password:** Genera una contraseña fuerte (guárdala)
   - **Region:** Elige la más cercana a tus usuarios
4. Click "Create new project" (toma ~2 minutos)

### 1.2 Obtener credenciales

1. Ve a **Settings → API** en el dashboard de Supabase
2. Copia y guarda:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (para cliente)
   - **service_role key:** `eyJhbGc...` (solo servidor, NO exponer)

> 💡 **Tip:** Crea un archivo local temporal para guardar estas credenciales mientras trabajas. Luego las moverás a `.env`.

---

## Paso 2: Configurar Variables de Entorno

### 2.1 Crear archivo .env

En la raíz de tu proyecto:

```bash
# Copiar template
cp .env.example .env
```

### 2.2 Agregar credenciales

Edita `.env` con tus credenciales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...tu-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Cuidado:** El `SUPABASE_SERVICE_ROLE_KEY` tiene acceso total a tu base de datos. NUNCA lo expongas en el frontend ni lo comitas a git.

### 2.3 Actualizar .env.example

Actualiza el template para otros developers:

```env
# =============================================================================
# Supabase Configuration
# =============================================================================
# Obtén credenciales en: https://supabase.com/dashboard/project/[PROJECT_ID]/settings/api
#
# IMPORTANTE: Copia este archivo como .env y reemplaza los valores
# =============================================================================

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # ⚠️ SOLO servidor

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Paso 3: Instalar Dependencias de Backend

### 3.1 Verificar package manager

Identifica qué package manager usa tu proyecto:

```bash
# Si existe bun.lock → usa bun
# Si existe pnpm-lock.yaml → usa pnpm
# Si existe package-lock.json → usa npm
ls -la *.lock* 2>/dev/null || ls -la *lock* 2>/dev/null
```

### 3.2 Instalar Supabase SDK

```bash
# Con bun (recomendado)
bun add @supabase/ssr @supabase/supabase-js

# Con pnpm
pnpm add @supabase/ssr @supabase/supabase-js

# Con npm
npm install @supabase/ssr @supabase/supabase-js
```

> 📝 **Nota:** `@supabase/ssr` es el paquete moderno para Next.js App Router. El antiguo `@supabase/auth-helpers-nextjs` está deprecado.

### 3.3 Instalar Supabase CLI

```bash
# Con npm (global)
npm install -g supabase

# Verificar instalación
supabase --version
```

---

## Paso 4: Crear Supabase Clients

### 4.1 Crear archivo de configuración

Crea `src/lib/config.ts`:

```typescript
// Configuración centralizada de la aplicación
// Variables de entorno validadas

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Validaciones
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
```

### 4.2 Crear cliente para Browser

Crea `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { supabaseUrl, supabaseAnonKey } from '../config';

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
```

### 4.3 Crear cliente para Server Components

Crea `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { supabaseUrl, supabaseAnonKey } from '../config';

export async function createServer() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignorar si se llama desde un Server Component
        }
      },
    },
  });
}
```

> 📝 **Nota:** En Next.js 15+, `cookies()` es async. En Next.js 13-14, quita el `await`.

---

## Paso 5: Crear Database Schema

### 5.1 Identificar tablas fundacionales

Revisa tu ERD en `.context/SRS/architecture-specs.md` e identifica:

1. **Tablas que todos los features necesitan:**
   - `profiles` - Información de usuario extendida
   - `roles` (si aplica) - Roles de usuario

2. **Relación con auth.users:**
   - Supabase ya tiene una tabla `auth.users` para autenticación
   - Tu tabla `profiles` extiende esa información

### 5.2 Crear tablas en Supabase Dashboard

1. Ve a **Table Editor** en tu proyecto Supabase
2. Click "New Table"
3. Crea la tabla `profiles`:

```
Table: profiles
├── id: uuid (Primary Key, references auth.users)
├── email: text (not null)
├── full_name: text
├── avatar_url: text
├── role: text (default: 'user')
├── created_at: timestamptz (default: now())
└── updated_at: timestamptz (default: now())
```

4. Habilita RLS:
   - Toggle "Enable Row Level Security" = ON

### 5.3 Crear tablas vía SQL (alternativa)

En **SQL Editor**, ejecuta:

```sql
-- Tabla de perfiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

> 💡 **Tip:** Repite este proceso para cada tabla fundacional de tu ERD.

---

## Paso 6: Configurar Row Level Security (RLS)

### 6.1 Entender las políticas básicas

```
┌─────────────────────────────────────────────────────────────────┐
│                        TIPOS DE POLÍTICAS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PÚBLICAS (catálogos, listados públicos)                        │
│  └── SELECT: Permitir a todos                                   │
│                                                                  │
│  AUTENTICADAS (datos de usuario)                                │
│  ├── SELECT: Solo usuarios autenticados                         │
│  ├── INSERT: Solo usuarios autenticados                         │
│  ├── UPDATE: Solo si user_id = auth.uid()                       │
│  └── DELETE: Solo si user_id = auth.uid()                       │
│                                                                  │
│  ADMIN (configuración, reportes)                                │
│  └── ALL: Solo si role = 'admin'                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Crear políticas para profiles

En **SQL Editor**, ejecuta:

```sql
-- Política: Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Política: Crear perfil automáticamente al registrarse
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 6.3 Trigger para crear perfil automáticamente

```sql
-- Función que crea perfil cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Paso 7: Generar Tipos TypeScript

### 7.1 Obtener Project ID

Tu Project ID está en la URL de Supabase:
`https://supabase.com/dashboard/project/[PROJECT_ID]`

### 7.2 Generar tipos

```bash
# Generar tipos desde el schema de tu base de datos
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/supabase.ts
```

### 7.3 Verificar el archivo generado

Abre `src/types/supabase.ts` y verifica que contiene:

- Interface `Database`
- Tipos para cada tabla: `Row`, `Insert`, `Update`

### 7.4 Crear helper de tipos

Crea `src/lib/types.ts`:

```typescript
import type { Database } from '@/types/supabase';

// Extraer tipos de tablas
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Agrega más tipos según tus tablas
// export type Entity = Database['public']['Tables']['entities']['Row'];
```

---

## Paso 8: Crear Middleware de Autenticación

Crea `middleware.ts` en la raíz del proyecto:

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refrescar sesión si existe
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rutas protegidas (ajusta según tu proyecto)
  const protectedRoutes = ['/dashboard', '/profile', '/settings'];
  const isProtected = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Redirect si no autenticado y ruta protegida
  if (!user && isProtected) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect si autenticado y en login/signup
  const authRoutes = ['/login', '/signup'];
  if (user && authRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

---

## Paso 9: Insertar Seed Data

### 9.1 Analizar mock data existente

Si tu frontend tiene mock data en archivos como `lib/data.ts`:

1. Identifica la estructura de los datos
2. Cuenta cuántos registros hay
3. Anota los campos y valores típicos

### 9.2 Insertar datos de prueba

En **SQL Editor** de Supabase:

```sql
-- Ejemplo: Insertar perfiles de prueba
-- NOTA: Primero debes crear usuarios en Authentication → Users
-- Luego los perfiles se crean automáticamente via trigger

-- O insertar datos directamente para otras tablas:
INSERT INTO tu_tabla (campo1, campo2, created_at)
VALUES
  ('valor1', 'valor2', now()),
  ('valor3', 'valor4', now());
```

> 💡 **Tip:** Usa datos realistas, no "Lorem ipsum". Esto mejora la experiencia al hacer demos.

---

## Paso 10: Validar Backend

### 10.1 Verificar TypeScript

```bash
# Debe compilar sin errores
npx tsc --noEmit
```

### 10.2 Verificar Build

```bash
# Debe completar sin errores
bun run build  # o npm run build
```

### 10.3 Probar en desarrollo

```bash
bun run dev  # o npm run dev
```

Verifica:

- [ ] App inicia sin errores de env
- [ ] Supabase Dashboard muestra las tablas
- [ ] RLS policies están activas (check en Table Editor)

---

# PARTE 2: FRONTEND SETUP

## Paso 11: Instalar Dependencias de UI

### 11.1 TailwindCSS (si no está instalado)

```bash
# Instalar Tailwind v3 (estable, compatible con shadcn/ui)
bun add tailwindcss@3 postcss autoprefixer

# Inicializar configuración
npx tailwindcss init -p
```

### 11.2 Configurar tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Agrega tu paleta de colores del design-specs.md
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... más tonos
          500: '#0ea5e9',
          600: '#0284c7',
          // ... hasta 950
        },
        // secondary, accent, etc.
      },
    },
  },
  plugins: [],
};
```

### 11.3 Configurar globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Variables CSS personalizadas */
:root {
  --primary: 199 89% 48%;
  --primary-foreground: 0 0% 100%;
  /* Agrega más variables según tu paleta */
}

/* Dark mode (si aplica) */
.dark {
  --primary: 199 89% 48%;
  --primary-foreground: 0 0% 100%;
}
```

### 11.4 (Opcional) Instalar shadcn/ui

Si elegiste shadcn/ui como librería de componentes:

```bash
# Inicializar shadcn/ui
npx shadcn-ui@latest init

# Seguir el wizard:
# - TypeScript: Yes
# - Style: Default o New York
# - Base color: Según tu paleta
# - CSS variables: Yes
# - Tailwind config: tailwind.config.js
# - Components alias: @/components
```

Instalar componentes básicos:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add avatar
# ... más según necesites
```

---

## Paso 12: Crear Layout Components

### 12.1 Estructura de carpetas

```
src/components/
├── ui/                 # Componentes atómicos (Button, Card, Input)
├── layout/             # Layout components
│   ├── navbar.tsx
│   ├── sidebar.tsx
│   ├── footer.tsx
│   └── main-layout.tsx
└── [feature]/          # Componentes específicos de features
```

### 12.2 Crear Navbar básico

Crea `src/components/layout/navbar.tsx`:

```typescript
import Link from 'next/link';
// Importa tus componentes UI (Button, Avatar, etc.)

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">TuApp</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}
```

### 12.3 Integrar en layout.tsx

Edita `src/app/layout.tsx`:

```typescript
import { Navbar } from '@/components/layout/navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main>{children}</main>
        {/* <Footer /> si aplica */}
      </body>
    </html>
  );
}
```

---

## Paso 13: Crear Páginas Demo

### 13.1 Identificar páginas estratégicas

Basándote en el MVP Scope (`.context/PRD/mvp-scope.md`), selecciona 2-3 páginas:

1. **Landing/Home** - Primera impresión, hero, features, CTA
2. **Página principal de la app** - Dashboard o listado principal
3. **Página de detalle** - Muestra una entidad específica

### 13.2 Crear Landing Page

Edita `src/app/page.tsx`:

```typescript
export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Título principal de tu app
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Descripción breve del valor que ofreces a tus usuarios.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg">Empezar gratis</Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg">Ver demo</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Features principales
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cards de features */}
        </div>
      </section>
    </div>
  );
}
```

### 13.3 Crear página con datos de Supabase

Ejemplo de Server Component que consume datos reales:

```typescript
// src/app/dashboard/page.tsx
import { createServer } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createServer();

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  // Obtener datos de la base de datos
  const { data: items, error } = await supabase
    .from('tu_tabla')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching data:', error);
    return <div>Error al cargar datos</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4">
        {items?.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg">
            {/* Renderizar item */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Paso 14: Crear Páginas de Auth

### 14.1 Página de Login

Crea `src/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold text-center">Iniciar sesión</h1>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-primary text-white rounded disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}
```

### 14.2 Página de Signup

Similar a login, pero usa `supabase.auth.signUp()`.

---

## Paso 15: Documentar el Design System

Crea `.context/design-system.md`:

```markdown
# Design System - [Nombre del Proyecto]

## Paleta de Colores

### Primary

- 500: #0ea5e9 (principal)
- 600: #0284c7 (hover)

### Secondary

- [colores secundarios]

### Neutrals

- [grises para texto, backgrounds]

## Tipografía

- **Headings:** Inter, sans-serif
- **Body:** Inter, sans-serif
- **Monospace:** JetBrains Mono (código)

### Tamaños

- h1: 2.25rem (36px)
- h2: 1.875rem (30px)
- h3: 1.5rem (24px)
- body: 1rem (16px)
- small: 0.875rem (14px)

## Componentes

### Button

Ubicación: `src/components/ui/button.tsx`
Variantes: default, outline, ghost, destructive
Tamaños: sm, default, lg

### Card

Ubicación: `src/components/ui/card.tsx`
Uso: Contenedor para información agrupada

[... más componentes]

## Layouts

### Navbar

- Altura: 64px (h-16)
- Sticky top
- Blur background

### Main Content

- Container max-width: 1280px
- Padding: responsive (px-4 md:px-6 lg:px-8)

## Iconos

Librería: Lucide React
Instalación: `bun add lucide-react`
Uso: `import { IconName } from 'lucide-react'`

## Spacing

Sistema de 4px:

- 1: 4px
- 2: 8px
- 4: 16px
- 6: 24px
- 8: 32px
- 12: 48px
- 16: 64px
- 24: 96px
```

---

## Paso 16: Validación Final

### 16.1 Verificar TypeScript

```bash
npx tsc --noEmit
```

Debe pasar sin errores.

### 16.2 Verificar Build

```bash
bun run build  # o npm run build
```

Debe completar exitosamente.

### 16.3 Verificar en desarrollo

```bash
bun run dev
```

**Checklist visual:**

- [ ] Landing page se ve correctamente
- [ ] Paleta de colores aplicada
- [ ] Navbar funciona
- [ ] Links funcionan
- [ ] Responsive en mobile

**Checklist funcional:**

- [ ] Signup crea usuario en Supabase
- [ ] Login funciona
- [ ] Middleware protege rutas
- [ ] Datos de Supabase se muestran

---

## Checklist Final

### Backend ✅

- [ ] Proyecto Supabase creado
- [ ] Variables de entorno configuradas
- [ ] Tablas fundacionales creadas
- [ ] RLS policies configuradas
- [ ] Trigger de perfil automático
- [ ] Tipos TypeScript generados
- [ ] Supabase clients creados
- [ ] Middleware de auth funcionando

### Frontend ✅

- [ ] TailwindCSS configurado
- [ ] Paleta de colores aplicada
- [ ] Componentes UI base creados
- [ ] Layout components (Navbar, Footer)
- [ ] 2-3 páginas demo
- [ ] Páginas de auth (login, signup)
- [ ] Integración con Supabase

### Documentación ✅

- [ ] `.env.example` actualizado
- [ ] `.context/backend-setup.md` creado
- [ ] `.context/design-system.md` creado
- [ ] README actualizado con instrucciones

### Validación ✅

- [ ] `tsc --noEmit` sin errores
- [ ] `npm run build` exitoso
- [ ] App funciona en desarrollo
- [ ] Auth flow completo probado

---

## Troubleshooting

### Error: "Missing NEXT_PUBLIC_SUPABASE_URL"

**Causa:** Variables de entorno no cargadas.

**Solución:**

1. Verifica que `.env` existe
2. Reinicia el servidor de desarrollo
3. Limpia caché: `rm -rf .next && bun run dev`

### Error: "Cannot find module '@/types/supabase'"

**Causa:** Tipos no generados.

**Solución:**

```bash
npx supabase gen types typescript --project-id TU_ID > src/types/supabase.ts
```

### Error: "cookies() expects to be called within a request scope"

**Causa:** Versión de Next.js.

**Solución:**

- Next.js 15+: `const cookieStore = await cookies()`
- Next.js 13-14: `const cookieStore = cookies()` (sin await)

### RLS bloquea queries

**Causa:** Políticas muy restrictivas o faltantes.

**Solución:**

1. Ve a Supabase → Table Editor → Tu tabla
2. Click en "Policies"
3. Verifica que existan políticas para SELECT, INSERT, etc.
4. Usa el SQL Editor para crear políticas faltantes

---

## Recursos Adicionales

- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TailwindCSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [@supabase/ssr Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

## Próximos Pasos

Con la infraestructura lista, puedes proceder a:

1. **Fase 4: Specification** → Crear product backlog (épicas, stories)
2. **Fase 5: Shift-Left Testing** → Planear tests antes de implementar
3. **Fase 7: Implementation** → Implementar features usando esta base

La base técnica de esta fase será **reutilizada en TODAS las stories**:

- DB schemas fundacionales ya existen
- Auth ya está configurado
- Design System ya está creado
- Solo implementas lógica de negocio específica

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
**Autor:** UPEX Galaxy - DOJO AI-Powered Quality Engineer
