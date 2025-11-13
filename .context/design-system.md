# Design System - Upex My Mentor

**Generado:** Fase 2.5 - Frontend Scaffolding
**Fecha:** 2025-11-12
**Estilo Visual:** Moderno/Bold (Morado Creativo)
**Framework:** Next.js 15 + TailwindCSS + shadcn/ui

---

## 🎨 Paleta de Colores

### Colores Principales

| Color | HSL | Hex Aproximado | Uso |
|-------|-----|----------------|-----|
| **Primary** | `271 91% 65%` | `#9333EA` (Purple-600) | Botones primarios, links, focus states, elementos de marca principal |
| **Secondary** | `277 91% 70%` | `#8B5CF6` (Violet-500) | Botones secundarios, elementos secundarios, badges alternativos |
| **Accent** | `328 86% 70%` | `#D946EF` (Fuchsia-500) | Highlights, badges especiales, call-to-actions secundarios, efectos de gradiente |

### Colores de Sistema

| Color | HSL (Light) | HSL (Dark) | Uso |
|-------|-------------|------------|-----|
| **Background** | `0 0% 100%` | `240 10% 3.9%` | Fondo de la aplicación |
| **Foreground** | `240 10% 3.9%` | `0 0% 98%` | Texto principal |
| **Card** | `0 0% 100%` | `240 10% 3.9%` | Fondo de cards, modals, contenedores |
| **Card Foreground** | `240 10% 3.9%` | `0 0% 98%` | Texto dentro de cards |
| **Muted** | `240 4.8% 95.9%` | `240 3.7% 15.9%` | Fondos sutiles, áreas desactivadas |
| **Muted Foreground** | `240 3.8% 46.1%` | `240 5% 64.9%` | Texto secundario, placeholders, subtítulos |
| **Border** | `240 5.9% 90%` | `240 3.7% 15.9%` | Bordes de inputs, cards, dividers |
| **Input** | `240 5.9% 90%` | `240 3.7% 15.9%` | Fondos de inputs |
| **Ring** | `271 91% 65%` | `271 91% 65%` | Anillos de foco (focus-visible) |

### Colores Semánticos

| Color | HSL | Uso |
|-------|-----|-----|
| **Destructive** | `0 84.2% 60.2%` | Errores, validaciones fallidas, acciones destructivas |
| **Destructive Foreground** | `0 0% 98%` | Texto en elementos destructivos |

### Colores de Gráficos (Chart)

| Color | HSL | Uso |
|-------|-----|-----|
| **Chart 1** | `12 76% 61%` | Gráficos y visualizaciones |
| **Chart 2** | `173 58% 39%` | Gráficos y visualizaciones |
| **Chart 3** | `197 37% 24%` | Gráficos y visualizaciones |
| **Chart 4** | `43 74% 66%` | Gráficos y visualizaciones |
| **Chart 5** | `27 87% 67%` | Gráficos y visualizaciones |

### Acceso en Código

```tsx
// Usando clases de Tailwind
<div className="bg-primary text-primary-foreground">Primary</div>
<div className="bg-secondary text-secondary-foreground">Secondary</div>
<div className="bg-accent text-accent-foreground">Accent</div>
<div className="text-muted-foreground">Texto secundario</div>
<div className="border-border">Con borde</div>

// Usando CSS variables (si necesitas hex directo)
<div style={{ color: 'hsl(var(--primary))' }}>Custom</div>
```

---

## 🧱 Componentes UI

### Button

**Ubicación:** `src/components/ui/button.tsx`

**Descripción:** Botón reutilizable con múltiples variantes y tamaños, construido con `class-variance-authority`.

**Variantes Disponibles:**

| Variante | Apariencia | Uso Recomendado |
|----------|-----------|-----------------|
| `default` | Fondo primary, texto blanco | Acciones principales (Guardar, Enviar, Registrarse) |
| `secondary` | Fondo secondary, texto blanco | Acciones secundarias importantes |
| `outline` | Borde primary, fondo transparente | Acciones terciarias (Cancelar, Ver más) |
| `ghost` | Sin fondo, hover con accent | Acciones sutiles (Editar, íconos) |
| `destructive` | Fondo rojo, texto blanco | Acciones destructivas (Eliminar, Cancelar reserva) |
| `link` | Como link con underline | Enlaces estilizados |

**Tamaños:**
- `sm` - Pequeño (height: 36px, px: 12px)
- `default` - Mediano (height: 40px, px: 16px) - **Recomendado**
- `lg` - Grande (height: 44px, px: 32px)
- `icon` - Cuadrado (40x40px) para iconos

**Ejemplo de Uso:**

```tsx
import { Button } from '@/components/ui/button'

// Botón primary (default)
<Button>Guardar</Button>

// Botón secondary
<Button variant="secondary">Cancelar</Button>

// Botón outline grande
<Button variant="outline" size="lg">Ver más</Button>

// Botón danger
<Button variant="destructive">Eliminar</Button>

// Botón con icono
<Button size="icon">
  <User className="h-4 w-4" />
</Button>

// Botón con loading state
<Button disabled={isLoading}>
  {isLoading ? "Guardando..." : "Guardar"}
</Button>
```

---

### Card

**Ubicación:** `src/components/ui/card.tsx`

**Descripción:** Contenedor versátil para agrupar información relacionada con sombras sutiles y bordes redondeados.

**Sub-componentes:**
- `Card` - Contenedor principal
- `CardHeader` - Header con espacio para título
- `CardTitle` - Título del card (2xl, semibold)
- `CardDescription` - Descripción/subtítulo (sm, muted)
- `CardContent` - Contenido principal
- `CardFooter` - Footer con acciones

**Variantes de Uso:**
- **Default** - Card básica con borde y sombra sutil
- **Hover** - Agregar `hover:shadow-lg transition-shadow` para efecto elevación
- **Clickable** - Agregar `cursor-pointer` para cards interactivas

**Ejemplo de Uso:**

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Título del Card</CardTitle>
    <CardDescription>Descripción breve del contenido</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">
      Contenido principal del card. Puede contener texto, imágenes, etc.
    </p>
  </CardContent>
  <CardFooter className="gap-2">
    <Button variant="outline">Cancelar</Button>
    <Button>Aceptar</Button>
  </CardFooter>
</Card>
```

**Casos de Uso:**
- Stats cards en dashboard
- Tarjetas de mentores (ver `MentorCard`)
- Formularios contenidos
- Secciones de información

---

### Input

**Ubicación:** `src/components/ui/input.tsx`

**Descripción:** Input estilizado con estados de foco, disabled y error.

**Estados:**
- **Normal** - Borde border, fondo background
- **Focus** - Ring primary (2px), outline removido
- **Disabled** - Opacidad 50%, cursor not-allowed
- **Error** - Requiere wrapper custom con borde rojo

**Ejemplo de Uso:**

```tsx
import { Input } from '@/components/ui/input'

// Input básico
<Input
  type="email"
  placeholder="tu@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Con label
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">
    Email
  </label>
  <Input id="email" type="email" placeholder="tu@email.com" />
</div>

// Con estado de error
<div className="space-y-2">
  <Input
    className={error ? "border-red-500" : ""}
    placeholder="Email"
  />
  {error && (
    <p className="text-sm text-red-500">{error}</p>
  )}
</div>
```

---

### Badge

**Ubicación:** `src/components/ui/badge.tsx`

**Descripción:** Etiqueta pequeña para mostrar estados, categorías o metadatos.

**Variantes:**
- `default` - Fondo primary, texto blanco
- `secondary` - Fondo secondary, texto blanco
- `destructive` - Fondo rojo, texto blanco
- `outline` - Solo borde, fondo transparente

**Ejemplo de Uso:**

```tsx
import { Badge } from '@/components/ui/badge'

// Badge default
<Badge>React</Badge>

// Badge secondary
<Badge variant="secondary">TypeScript</Badge>

// Badge outline
<Badge variant="outline">+3</Badge>

// Skills list
<div className="flex flex-wrap gap-2">
  {skills.map((skill) => (
    <Badge key={skill} variant="secondary">{skill}</Badge>
  ))}
</div>
```

---

## 📐 Layout Components

### Navbar

**Ubicación:** `src/components/layout/navbar.tsx`

**Descripción:** Barra de navegación superior con diseño responsive y sticky positioning.

**Características:**
- **Sticky** - Permanece visible al hacer scroll
- **Backdrop Blur** - Efecto glassmorphism moderno
- **Responsive** - Hamburger menu en mobile
- **Logo con Gradiente** - Brand identity con primary → accent
- **Auth States** - Muestra usuario logueado o botones login/signup

**Elementos:**
- Logo "Upex My Mentor" con gradiente
- Links de navegación (Explorar Mentores, Cómo Funciona)
- User menu con avatar y logout
- Mobile menu collapsible

**Uso:**
```tsx
import { Navbar } from '@/components/layout/navbar'

<div className="min-h-screen flex flex-col">
  <Navbar />
  <main className="flex-1">
    {/* Contenido */}
  </main>
</div>
```

---

### Footer

**Ubicación:** `src/components/layout/footer.tsx`

**Descripción:** Footer de la aplicación con links y información.

*(Documentar detalles cuando se revise el componente)*

---

## 🎨 Componentes Específicos del Dominio

### MentorCard

**Ubicación:** `src/components/mentors/mentor-card.tsx`

**Descripción:** Tarjeta para mostrar información resumida de un mentor.

**Características:**
- Avatar con fallback a inicial
- Rating con estrellas
- Skills con badges (máximo 3 visibles)
- Precio por hora destacado
- Botón "Ver Perfil"
- Hover effect (shadow-lg)

**Uso:**
```tsx
import { MentorCard } from '@/components/mentors/mentor-card'

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {mentors.map((mentor) => (
    <MentorCard key={mentor.id} mentor={mentor} />
  ))}
</div>
```

---

## ✨ Estilo Visual: Moderno/Bold

### Características del Estilo

**Espaciado:**
- Generoso - Uso de `p-6`, `gap-6` para respiro visual
- Consistente - Múltiplos de 4px (Tailwind default spacing)

**Bordes:**
- Border radius: `0.5rem` (8px) - Redondeados moderados
- Bordes sutiles: `border-border` (gris claro)

**Sombras:**
- Sombra default: `shadow-sm` (sutil)
- Sombra hover: `shadow-lg` (pronunciada)
- Uso de `transition-shadow` para animaciones suaves

**Tipografía:**
- Font family: Sistema (sans-serif)
- Headings: Bold/Semibold con gradientes en elementos clave
- Body text: Regular con buen line-height
- Tamaños:
  - `text-4xl` - Títulos de página
  - `text-2xl` - Títulos de sección
  - `text-xl` - Card titles
  - `text-base/text-sm` - Body text

**Efectos Especiales:**
- **Gradientes** - `bg-gradient-to-br from-primary to-accent` en elementos clave
- **Backdrop Blur** - `backdrop-blur supports-[backdrop-filter]:bg-background/60` en navbar
- **Glassmorphism** - Combinación de blur + transparencia
- **Transitions** - `transition-colors`, `transition-shadow` para interacciones suaves

---

## 📖 Guidelines de Uso

### ✅ DO (Hacer)

1. **Usa componentes del design system:**
   ```tsx
   // ✅ Correcto
   <Button>Guardar</Button>

   // ❌ Incorrecto
   <button className="bg-blue-500 px-4 py-2">Guardar</button>
   ```

2. **Mantén consistencia de colores:**
   ```tsx
   // ✅ Correcto
   <div className="bg-primary text-primary-foreground">

   // ❌ Incorrecto
   <div className="bg-blue-600 text-white">
   ```

3. **Usa variantes semánticas:**
   ```tsx
   // ✅ Correcto
   <Button variant="destructive">Eliminar</Button>

   // ❌ Incorrecto
   <Button className="bg-red-500">Eliminar</Button>
   ```

4. **Aplica spacing consistente:**
   ```tsx
   // ✅ Correcto - Múltiplos de 4
   <div className="p-6 gap-6">

   // ❌ Incorrecto - Valores arbitrarios
   <div className="p-5 gap-7">
   ```

5. **Usa text-muted-foreground para texto secundario:**
   ```tsx
   // ✅ Correcto
   <p className="text-sm text-muted-foreground">Descripción</p>
   ```

### ❌ DON'T (No hacer)

1. **No uses colores hardcodeados:**
   ```tsx
   // ❌ Nunca hagas esto
   <div className="bg-blue-500 text-white">
   <div style={{ background: '#3B82F6' }}>
   ```

2. **No crees botones custom sin cva:**
   ```tsx
   // ❌ Evita esto
   <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2">

   // ✅ Usa el componente
   <Button>Acción</Button>
   ```

3. **No rompas la consistencia de bordes:**
   ```tsx
   // ❌ Evita border radius inconsistentes
   <Card className="rounded-xl"> {/* Debería ser rounded-lg */}
   ```

4. **No uses múltiples sombras diferentes:**
   ```tsx
   // ❌ Evita sombras custom
   <div className="shadow-[0_10px_50px_rgba(0,0,0,0.3)]">

   // ✅ Usa las definidas
   <div className="shadow-sm"> o <div className="shadow-lg">
   ```

---

## 🚀 Extender el Design System

### Agregar Nuevo Componente UI

1. **Crear archivo en `src/components/ui/[nombre].tsx`**
2. **Usar pattern de shadcn/ui con cva:**
   ```tsx
   import { cva, type VariantProps } from "class-variance-authority"
   import { cn } from "@/lib/utils"

   const componentVariants = cva(
     "base-classes",
     {
       variants: {
         variant: {
           default: "bg-primary text-primary-foreground",
           // ...
         }
       }
     }
   )
   ```
3. **Aplicar paleta de colores del theme**
4. **Documentar aquí en este archivo**

### Modificar Componente Existente

1. **Editar archivo en `src/components/ui/`**
2. **Mantener compatibilidad con uso existente**
3. **Actualizar esta documentación**

### Agregar Nueva Página

1. **Usar layout components existentes** (Navbar, Footer)
2. **Usar componentes del design system** (Button, Card, Input)
3. **Aplicar paleta de colores** (bg-primary, text-muted-foreground)
4. **Mantener spacing consistente** (p-6, gap-6, etc.)
5. **Agregar gradientes en headers** cuando sea apropiado:
   ```tsx
   <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
   ```

---

## 🎯 Patrones de Diseño Comunes

### Header de Página con Gradiente

```tsx
<div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 py-12">
  <div className="container mx-auto px-4">
    <h1 className="text-4xl font-bold mb-4">Título de Página</h1>
    <p className="text-lg text-muted-foreground max-w-2xl">
      Descripción de la página
    </p>
  </div>
</div>
```

### Grid de Cards Responsive

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      {/* Contenido */}
    </Card>
  ))}
</div>
```

### Form con Validación Visual

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <label className="text-sm font-medium">Email</label>
    <Input
      type="email"
      className={error ? "border-red-500" : ""}
      placeholder="tu@email.com"
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
</div>
```

### Loading State

```tsx
<div className="flex items-center justify-center py-12">
  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
</div>
```

### Empty State

```tsx
<div className="text-center py-12">
  <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
  <p className="text-muted-foreground mb-4">
    No hay elementos para mostrar
  </p>
  <Button>Agregar Nuevo</Button>
</div>
```

---

## 📚 Referencias

- **Tailwind Config:** `tailwind.config.ts` - Paleta completa y configuración
- **Estilos Globales:** `src/app/globals.css` - Variables CSS y base styles
- **Componentes UI:** `src/components/ui/` - Todos los componentes del design system
- **Layout Components:** `src/components/layout/` - Navbar, Footer
- **Utilidades:** `src/lib/utils.ts` - Función `cn()` para merge de clases

---

## 🔄 Changelog

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-11-12 | 1.0.0 | Documentación inicial del Design System |

---

**Este design system es la fuente única de verdad para el diseño visual del proyecto. Manténlo consistente durante todo el desarrollo.**

Para setup y ejecución del proyecto, ver `SETUP.md` en la raíz.
