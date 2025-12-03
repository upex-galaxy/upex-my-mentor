# 🚀 Setup Guide - Upex My Mentor

Esta guía te ayudará a configurar y ejecutar el proyecto Upex My Mentor en tu entorno local.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Bun** (v1.0.0 o superior) - [Instalar Bun](https://bun.sh/)
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- **Git** - Para clonar el repositorio
- **Node.js** (v18 o superior) - Como fallback si Bun no está disponible

---

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd upex-my-mentor
```

### 2. Instalar Dependencias

Usamos **Bun** como package manager para este proyecto:

```bash
bun install
```

**¿Por qué Bun?**
- ⚡ Hasta 25x más rápido que npm
- 🔧 Ejecuta TypeScript/JavaScript directamente
- 📦 Compatible con todos los paquetes de npm

**Alternativa con npm/pnpm:**
```bash
# Si prefieres usar npm
npm install

# O si prefieres usar pnpm
pnpm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (para pagos)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (opcional - para notificaciones)
EMAIL_FROM=noreply@upexmymentor.com
RESEND_API_KEY=your_resend_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nota:** Para desarrollo local, el sistema de autenticación mock no requiere Supabase configurado inicialmente.

---

## 🚀 Ejecución del Proyecto

### Modo Desarrollo

Inicia el servidor de desarrollo:

```bash
bun run dev
```

La aplicación estará disponible en: **http://localhost:3000**

### Compilar para Producción

```bash
# Build
bun run build

# Iniciar servidor de producción
bun run start
```

### Linting

```bash
bun run lint
```

---

## 📱 Navegando por la Aplicación

Una vez que el servidor esté corriendo, puedes acceder a:

### Páginas Públicas:
- **/** - Landing page con hero, features y "cómo funciona"
- **/mentors** - Galería de mentores con búsqueda y filtros
- **/mentors/[id]** - Perfil detallado de un mentor
- **/login** - Inicio de sesión
- **/signup** - Registro de nuevo usuario

### Páginas Protegidas:
- **/dashboard** - Dashboard personalizado (requiere autenticación)

### Probar Autenticación (Mock):

1. Ve a `/signup`
2. Registra un nuevo usuario:
   - Email: `test@example.com`
   - Password: `password123`
   - Nombre: `Test User`
   - Role: `student` o `mentor`
3. Inicia sesión en `/login` con las mismas credenciales
4. Accede al `/dashboard`

**Nota:** Los datos se guardan en `localStorage` para demo. En producción, se usará Supabase Auth.

---

## 🎨 Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Runtime:** Bun
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui components
- **Iconos:** Lucide React
- **Validación:** Zod
- **Autenticación:** Supabase Auth (mock en desarrollo)
- **Base de Datos:** Supabase PostgreSQL (mock en desarrollo)
- **Pagos:** Stripe (pendiente integración)

---

## 📂 Estructura del Proyecto

```
upex-my-mentor/
├── .context/                 # Documentación de contexto del proyecto
│   ├── PRD/                  # Product Requirements Documents
│   ├── SRS/                  # Software Requirements Specifications
│   ├── PBI/                  # Product Backlog Items
│   └── design-system.md      # Documentación del Design System
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Rutas de autenticación
│   │   ├── mentors/         # Páginas de mentores
│   │   ├── dashboard/       # Dashboard protegido
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── ui/              # shadcn/ui design system components
│   │   ├── landing/         # Componentes de landing page
│   │   ├── layout/          # Navbar, Footer
│   │   └── mentors/         # Componentes específicos de mentores
│   ├── contexts/            # React contexts (AuthContext)
│   ├── lib/                 # Utilidades y helpers
│   └── types/               # TypeScript types
├── public/                  # Archivos estáticos
├── .env.example             # Variables de entorno de ejemplo
├── tailwind.config.ts       # Configuración de Tailwind
├── next.config.ts           # Configuración de Next.js
└── package.json
```

---

## 🎨 Paleta de Colores

El proyecto usa una paleta **Morado Creativo** (Purple/Violet/Fuchsia):

| Color | HSL | Uso |
|-------|-----|-----|
| **Primary** | `271 91% 65%` | Botones principales, links, brand |
| **Secondary** | `277 91% 70%` | Botones secundarios, badges |
| **Accent** | `328 86% 70%` | Highlights, call-to-actions |
| **Background** | `0 0% 100%` | Fondo principal (light mode) |

Ver `.context/design-system.md` para más detalles sobre el sistema de diseño.

---

## 🧪 Desarrollo

### Agregar Nuevos Componentes UI

Los componentes UI siguen el patrón de shadcn/ui. Para agregar nuevos componentes:

1. Crea el archivo en `src/components/ui/[component].tsx`
2. Usa `class-variance-authority` para variantes
3. Aplica la paleta de colores del theme
4. Documenta en `.context/design-system.md`

Ejemplo:
```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      }
    }
  }
)
```

### Usar el cn() Helper

Para combinar clases de Tailwind:

```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", condition && "conditional-class", className)} />
```

---

## 🐛 Solución de Problemas

### El servidor no inicia

**Problema:** Error al ejecutar `bun run dev`

**Solución:**
1. Asegúrate de tener Bun instalado: `bun --version`
2. Limpia la caché: `rm -rf .next node_modules bun.lock`
3. Reinstala: `bun install`
4. Intenta de nuevo: `bun run dev`

### Errores de TypeScript

**Problema:** Errores de tipos al compilar

**Solución:**
1. Verifica que los tipos estén instalados: `bun add -D @types/react @types/node`
2. Reinicia el TypeScript server en tu IDE

### CSS no se aplica correctamente

**Problema:** Los estilos de Tailwind no funcionan

**Solución:**
1. Verifica que `globals.css` esté importado en `app/layout.tsx`
2. Limpia el build: `rm -rf .next`
3. Reinicia el servidor

---

## 📚 Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Design System Documentation](.context/design-system.md)
- [Architecture Specifications](.context/frontend-architecture.md)

---

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crea una rama para tu feature: `git checkout -b feature/nombre-feature`
2. Realiza tus cambios siguiendo las convenciones del proyecto
3. Ejecuta linting: `bun run lint`
4. Compila para verificar: `bun run build`
5. Commit con mensaje descriptivo
6. Push y crea un Pull Request

---

## 📄 Licencia

[Especificar licencia del proyecto]

---

**¡Listo para empezar a desarrollar! 🎉**

Para más información sobre el diseño y componentes, revisa `.context/design-system.md`.
