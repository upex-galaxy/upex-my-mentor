# Code Standards

> **Para**: Fases 6-7 (Implementation + Code Review)
> **Propósito**: Estándares de código para mantener calidad y consistencia

---

## 🎯 Principios Fundamentales

### 1. **DRY** (Don't Repeat Yourself)
```typescript
// ❌ MAL - Repetición
function getUserEmail(userId: string) {
  const response = await fetch(`/api/users/${userId}`)
  const user = await response.json()
  return user.email
}

function getUserName(userId: string) {
  const response = await fetch(`/api/users/${userId}`)
  const user = await response.json()
  return user.name
}

// ✅ BIEN - Reutilizable
async function getUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`)
  return await response.json()
}

function getUserEmail(userId: string) {
  const user = await getUser(userId)
  return user.email
}
```

### 2. **KISS** (Keep It Simple, Stupid)
```typescript
// ❌ MAL - Over-engineering
const getUserStatus = (user: User): UserStatus => {
  return user.isActive
    ? user.isPremium
      ? user.trialEnded
        ? UserStatus.PREMIUM_ACTIVE
        : UserStatus.TRIAL_ACTIVE
      : UserStatus.FREE_ACTIVE
    : UserStatus.INACTIVE
}

// ✅ BIEN - Simple y legible
const getUserStatus = (user: User): UserStatus => {
  if (!user.isActive) return UserStatus.INACTIVE
  if (!user.isPremium) return UserStatus.FREE_ACTIVE
  if (user.trialEnded) return UserStatus.PREMIUM_ACTIVE
  return UserStatus.TRIAL_ACTIVE
}
```

### 3. **YAGNI** (You Aren't Gonna Need It)
```typescript
// ❌ MAL - Funcionalidad que nadie pidió
interface User {
  id: string
  name: string
  email: string
  socialSecurity?: string  // ¿Para qué?
  bloodType?: string       // ¿Para qué?
  favoriteColor?: string   // ¿Para qué?
}

// ✅ BIEN - Solo lo necesario
interface User {
  id: string
  name: string
  email: string
}
```

---

## 📝 Naming Conventions

### Variables y Funciones
```typescript
// ✅ camelCase para variables y funciones
const userName = "John"
const isActive = true
const totalCount = 42

function getUserById(id: string) {}
function calculateTotal(items: Item[]) {}
```

### Componentes React
```typescript
// ✅ PascalCase para componentes
function LoginForm() {}
function UserProfile() {}
const NavBar = () => {}
```

### Constantes
```typescript
// ✅ UPPER_SNAKE_CASE para constantes
const MAX_RETRIES = 3
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
const DEFAULT_TIMEOUT = 5000
```

### Tipos e Interfaces
```typescript
// ✅ PascalCase con 'I' o 'T' prefix (opcional)
interface User {}
interface UserResponse {}
type UserId = string
type UserRole = "admin" | "user" | "guest"
```

### Archivos
```
✅ kebab-case para archivos:
- user-profile.tsx
- api-client.ts
- error-handler.ts

✅ PascalCase para componentes:
- LoginForm.tsx
- UserCard.tsx
- NavBar.tsx
```

---

## 🏗️ TypeScript Strict Mode

**SIEMPRE usar TypeScript en modo strict**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Evitar `any`
```typescript
// ❌ MAL
function processData(data: any) {
  return data.value
}

// ✅ BIEN
interface DataPayload {
  value: string
}

function processData(data: DataPayload) {
  return data.value
}
```

### Usar tipos explícitos
```typescript
// ❌ MAL - Tipo inferido puede cambiar
const users = []

// ✅ BIEN - Tipo explícito
const users: User[] = []
```

---

## 🎨 Component Structure (React)

### Orden de elementos
```typescript
// ✅ Orden estándar
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getUserById } from '@/lib/api'
import type { User } from '@/types'

interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  // 1. Hooks
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 2. Effects
  useEffect(() => {
    loadUser()
  }, [userId])

  // 3. Handlers
  const loadUser = async () => {
    const data = await getUserById(userId)
    setUser(data)
    setLoading(false)
  }

  // 4. Early returns
  if (loading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  // 5. Render
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

### Props destructuring
```typescript
// ✅ Destructure props en signature
function UserCard({ name, email, avatar }: UserCardProps) {
  return <div>{name}</div>
}

// ❌ No usar props object
function UserCard(props: UserCardProps) {
  return <div>{props.name}</div>
}
```

---

## ⚡ Performance Best Practices

### 1. Memoization
```typescript
import { useMemo, useCallback } from 'react'

function ExpensiveComponent({ items }: Props) {
  // ✅ Memoize cálculos costosos
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0)
  }, [items])

  // ✅ Memoize callbacks
  const handleClick = useCallback(() => {
    console.log('Clicked')
  }, [])

  return <div>Total: {total}</div>
}
```

### 2. Lazy loading
```typescript
import { lazy, Suspense } from 'react'

// ✅ Lazy load componentes pesados
const HeavyChart = lazy(() => import('./HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <HeavyChart />
    </Suspense>
  )
}
```

### 3. Evitar re-renders innecesarios
```typescript
import { memo } from 'react'

// ✅ Memoize componentes puros
export const UserCard = memo(function UserCard({ user }: Props) {
  return <div>{user.name}</div>
})
```

---

## ♿ Accessibility (a11y)

### Semantic HTML
```tsx
// ❌ MAL
<div onClick={handleClick}>Click me</div>

// ✅ BIEN
<button onClick={handleClick}>Click me</button>
```

### ARIA labels
```tsx
// ✅ Labels descriptivos
<button aria-label="Close dialog">
  <XIcon />
</button>

<input
  type="text"
  aria-label="Search users"
  placeholder="Search..."
/>
```

### Keyboard navigation
```tsx
// ✅ Soporte de teclado
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Custom button
</div>
```

---

## 📦 Code Organization

### Estructura de carpetas
```
src/
├── components/
│   ├── ui/              # Componentes reutilizables
│   └── features/        # Componentes específicos
├── lib/
│   ├── api/             # API clients
│   ├── utils/           # Utilities
│   └── hooks/           # Custom hooks
├── types/               # TypeScript types
└── app/                 # Pages (Next.js App Router)
```

### Barrel exports
```typescript
// components/ui/index.ts
export { Button } from './Button'
export { Input } from './Input'
export { Card } from './Card'

// Uso
import { Button, Input, Card } from '@/components/ui'
```

---

## 🚫 Qué NO Hacer

### 1. NO hardcodear valores
```typescript
// ❌ MAL
const apiUrl = "https://api.example.com"

// ✅ BIEN
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

### 2. NO dejar console.log()
```typescript
// ❌ MAL
console.log('User data:', user)

// ✅ BIEN (si necesitas logging)
import { logger } from '@/lib/logger'
logger.info('User data loaded', { userId: user.id })
```

### 3. NO usar var
```typescript
// ❌ MAL
var count = 0

// ✅ BIEN
const count = 0
let counter = 0
```

### 4. NO mutar state directamente
```typescript
// ❌ MAL
const [users, setUsers] = useState<User[]>([])
users.push(newUser) // ❌ Mutation!

// ✅ BIEN
setUsers([...users, newUser])
```

### 5. NO ignorar errores
```typescript
// ❌ MAL
try {
  await fetchData()
} catch (error) {
  // Silenciosamente ignorado
}

// ✅ BIEN
try {
  await fetchData()
} catch (error) {
  logger.error('Failed to fetch data', error)
  throw new AppError('FETCH_FAILED', 'Unable to load data')
}
```

---

## ✅ Checklist de Code Quality

Antes de commit:
- [ ] Código sigue DRY, KISS, YAGNI
- [ ] Naming conventions seguidas
- [ ] TypeScript strict (sin `any`)
- [ ] No hay valores hardcodeados
- [ ] No hay console.log() olvidados
- [ ] Accessibility considerada
- [ ] Performance optimizada
- [ ] Componentes memoizados (si necesario)
- [ ] Error handling implementado
- [ ] Tests escritos

---

**Última actualización**: 2025-10-29
**Fase**: Implementation (Fase 6)
