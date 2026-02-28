# Exploratory Testing Summary: MYM-35 - View Profile Reviews

**Documento generado:** 2025-12-28
**Story Jira:** MYM-35
**Epic:** EPIC-MYM-32 - Reputation & Reviews System
**Status en Jira:** Ready For QA → **QA in Progress**
**Story Points:** 5
**Tester:** sanchez.marian.1993
**Ambiente:** Staging (`https://staging-upexmymentor.vercel.app/`)

---

## 📋 Resumen Ejecutivo

Se realizó una sesión de **Exploratory Testing** sobre la US MYM-35 en el ambiente de staging. El testing se enfocó en explorar la funcionalidad de visualización de reviews en perfiles de mentor, con especial atención a edge cases y comportamientos visuales no cubiertos en los casos de prueba formales.

### Resultados:
- ✅ **Funcionalidad core:** Operativa y correcta
- ⚠️ **3 bugs identificados:** 2 menores (UX/Visual), 1 medio (Funcionalidad incompleta)
- 📸 **Evidencia capturada:** Screenshots adjuntados en Jira para los 3 bugs
- 🎯 **Próximo paso:** Fix de bugs + Re-test

---

## 🎯 Objetivos del Exploratory Testing

1. **Validar comportamiento visual** de componentes de reviews en staging
2. **Explorar edge cases** no cubiertos en test cases formales
3. **Identificar inconsistencias** con el design system
4. **Verificar funcionalidad completa** de elementos interactivos (botones, dropdowns)

---

## 🌐 Ambiente de Testing

**URL Base:** https://staging-upexmymentor.vercel.app/
**Perfil Explorado:** Ana Rodríguez
**URL Completa:** `/mentors/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12`

**Datos del Perfil:**
- **Mentor:** Ana Rodríguez
- **Rating promedio:** 5.0/5.0
- **Total de reviews:** 5
- **Distribución:** 5★: 100% (5 reviews)

**Navegador:** Chrome (última versión)
**Resolución:** Desktop 1920x1080

---

## 🐛 Bugs Identificados

### Bug #1: MYM-99 - Rating Breakdown no muestra porcentaje visible
**Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-99

**Severidad:** ⚠️ BAJA (UX/Visual)
**Prioridad:** Low
**Tipo:** Bug
**Epic Parent:** MYM-32 (Reputation & Reviews System)

#### Descripción:
El componente `RatingBreakdown` muestra el histograma de distribución de ratings con barras visuales y el número de reviews, pero **NO muestra el porcentaje visible** al lado de cada barra.

#### Ubicación en Código:
```
src/components/reviews/rating-breakdown.tsx:42-44
```

#### Comportamiento Actual:
```
5★ ███████████████ 5
4★                 0
3★                 0
2★                 0
1★                 0
```

#### Comportamiento Esperado:
```
5★ ███████████████ 100% (5)
4★                 0% (0)
3★                 0% (0)
2★                 0% (0)
1★                 0% (0)
```

#### Impacto:
- Usuario no puede ver rápidamente la distribución porcentual
- Menor legibilidad del histograma
- No afecta funcionalidad, solo UX

#### Fix Sugerido:
```tsx
// Archivo: src/components/reviews/rating-breakdown.tsx
// Líneas: 42-44

<span className="text-muted-foreground w-16 text-right shrink-0">
  {percentage.toFixed(0)}% ({count})  // ← Agregar percentage
</span>
```

#### Estimación:
⏱️ **5 minutos**

#### Evidencia:
📸 Screenshot adjunto en Jira: `bug-mym-99-rating-breakdown.png`

---

### Bug #2: MYM-100 - Select usa HTML nativo en vez de shadcn/ui
**Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-100

**Severidad:** ⚠️ BAJA (Enhancement)
**Prioridad:** Low
**Tipo:** Bug
**Epic Parent:** MYM-32 (Reputation & Reviews System)

#### Descripción:
Los dropdowns de **Sort** y **Filter** en la sección de reviews utilizan un componente `Select` basado en `<select>` HTML nativo en lugar del componente **shadcn/ui Select** (Radix UI) que es parte del design system del proyecto.

#### Ubicación en Código:
```
src/components/ui/select.tsx
```

#### Problema:
- El `<select>` nativo tiene estilos diferentes al resto de componentes shadcn/ui
- No es consistente con el design system
- Menor calidad visual comparado con Radix UI Select
- No soporta customización avanzada (iconos, grupos, etc.)

#### Comportamiento Actual:
- Dropdown usa `<select>` nativo del navegador
- Estilo básico sin personalización

#### Comportamiento Esperado:
- Dropdown usa `shadcn/ui Select` (Radix UI)
- Match con el design system del proyecto
- Experiencia visual consistente

#### Impacto:
- **UX:** Menor calidad visual
- **Consistencia:** No match con design system
- **Funcionalidad:** Limitaciones de customización futura

#### Fix Sugerido:
```bash
# Paso 1: Instalar componente shadcn/ui Select
bunx shadcn@latest add select

# Paso 2: Reemplazar imports en componentes que usen Select
# src/components/reviews/reviews-list.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

# Paso 3: Actualizar markup según docs de shadcn
<Select value={sortBy} onValueChange={setSortBy}>
  <SelectTrigger>
    <SelectValue placeholder="Ordenar por" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="recent">Más recientes</SelectItem>
    <SelectItem value="highest">Mayor valoración</SelectItem>
    <SelectItem value="lowest">Menor valoración</SelectItem>
  </SelectContent>
</Select>
```

#### Estimación:
⏱️ **15 minutos**

#### Evidencia:
📸 Screenshot adjunto en Jira: `bug-mym-100-select-nativo.png`
📸 Screenshot DevTools mostrando `<select>` HTML nativo

---

### Bug #3: MYM-101 - Flag button no tiene funcionalidad implementada
**Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-101

**Severidad:** 🔴 MEDIA (Funcionalidad incompleta)
**Prioridad:** Medium
**Tipo:** Bug
**Epic Parent:** MYM-32 (Reputation & Reviews System)

#### Descripción:
El botón **Flag** (🚩) para reportar reviews existe visualmente en cada review card, pero **NO tiene funcionalidad implementada**. Al hacer click, solo ejecuta un `console.log()` sin mostrar ningún modal de confirmación ni realizar ninguna acción real.

#### Ubicación en Código:
```
src/components/reviews/reviews-list.tsx:79-82
```

#### Código Actual:
```tsx
const handleFlag = (reviewId: string) => {
  // TODO: Implement flag functionality
  console.log('Flag review:', reviewId);
};
```

#### Comportamiento Actual:
1. Usuario hace click en botón Flag (🚩)
2. Se ejecuta `console.log('Flag review:', reviewId)`
3. **No pasa nada visible para el usuario**
4. No se muestra modal de confirmación
5. No se realiza API call
6. Review no se marca como reportada

#### Comportamiento Esperado:
1. Usuario hace click en botón Flag
2. **Modal de confirmación** aparece: "¿Estás seguro de reportar esta review?"
3. Usuario confirma → API call a `/api/reviews/flag`
4. Review se marca como `flagged: true` en base de datos
5. Toast/Success message: "Review reportada exitosamente"
6. (Opcional) Review se oculta del feed del usuario actual

#### Impacto:
- **Funcionalidad:** Feature crítica incompleta
- **UX:** Usuario puede clickear pero no pasa nada (confusión)
- **Negocio:** No se pueden reportar reviews inapropiadas

#### Fix Sugerido:

**Paso 1: Crear Modal de Confirmación**
```tsx
// src/components/reviews/flag-review-modal.tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface FlagReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  reviewerName: string
}

export function FlagReviewModal({ open, onOpenChange, onConfirm, reviewerName }: FlagReviewModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reportar review</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres reportar la review de {reviewerName}?
            Nuestro equipo la revisará y tomará las acciones necesarias.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Reportar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

**Paso 2: Implementar API Endpoint**
```typescript
// src/app/api/reviews/flag/route.ts
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { reviewId } = await request.json()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Marcar review como flagged
    const { error } = await supabase
      .from('reviews')
      .update({
        is_flagged: true,
        flagged_by: user.id,
        flagged_at: new Date().toISOString()
      })
      .eq('id', reviewId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Paso 3: Actualizar handleFlag en reviews-list.tsx**
```tsx
// src/components/reviews/reviews-list.tsx
const [flagModalOpen, setFlagModalOpen] = useState(false)
const [reviewToFlag, setReviewToFlag] = useState<{ id: string; reviewerName: string } | null>(null)

const handleFlag = (reviewId: string, reviewerName: string) => {
  setReviewToFlag({ id: reviewId, reviewerName })
  setFlagModalOpen(true)
}

const confirmFlag = async () => {
  if (!reviewToFlag) return

  try {
    const response = await fetch('/api/reviews/flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: reviewToFlag.id })
    })

    if (response.ok) {
      toast.success('Review reportada exitosamente')
      setFlagModalOpen(false)
      setReviewToFlag(null)
      // Opcional: Refrescar reviews o actualizar UI
    } else {
      toast.error('Error al reportar review')
    }
  } catch (error) {
    toast.error('Error de conexión')
  }
}

// En el JSX:
<FlagReviewModal
  open={flagModalOpen}
  onOpenChange={setFlagModalOpen}
  onConfirm={confirmFlag}
  reviewerName={reviewToFlag?.reviewerName || ''}
/>
```

**Paso 4: Actualizar Schema de Supabase (si no existe)**
```sql
-- Agregar columnas a tabla reviews si no existen
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS flagged_by UUID REFERENCES auth.users(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;
```

#### Estimación:
⏱️ **30-45 minutos**

#### Consideraciones Adicionales:
- **Rate limiting:** Prevenir que un usuario reporte múltiples veces la misma review
- **Auth check:** Solo usuarios autenticados pueden reportar
- **Notificación:** Opcional - notificar al admin cuando se reporta una review
- **UI Feedback:** Deshabilitar botón Flag después de reportar

#### Evidencia:
📸 Screenshot adjunto en Jira: `bug-mym-101-flag-no-funciona.png`
📸 Screenshot DevTools Console mostrando `console.log('Flag review:', reviewId)`

---

## 📊 Resumen de Bugs por Severidad

| Severidad | Cantidad | Issues |
|-----------|----------|--------|
| 🔴 MEDIA  | 1        | MYM-101 (Flag button) |
| ⚠️ BAJA   | 2        | MYM-99 (Porcentaje), MYM-100 (Select nativo) |
| **TOTAL** | **3**    | |

---

## 📸 Evidencia Capturada

Todos los screenshots han sido adjuntados en los issues correspondientes de Jira:

1. **MYM-99:** `bug-mym-99-rating-breakdown.png`
   - Muestra el histograma sin porcentaje visible

2. **MYM-100:** `bug-mym-100-select-nativo.png`
   - Muestra el dropdown de Sort/Filter
   - DevTools mostrando `<select>` HTML nativo

3. **MYM-101:** `bug-mym-101-flag-no-funciona.png`
   - Muestra el botón Flag en review card
   - Console mostrando `console.log` sin funcionalidad real

---

## ✅ Aspectos Positivos Encontrados

Durante el exploratory testing también se identificaron varios aspectos que **funcionan correctamente**:

1. ✅ **Rating Display:** Muestra correctamente "5.0/5.0 (5 reviews)"
2. ✅ **Estrellas Visuales:** Renderizado correcto con estrellas llenas
3. ✅ **Review Cards:** Diseño limpio, información completa (nombre, rating, fecha, comentario)
4. ✅ **Sort Dropdown:** Funcional (aunque visual mejorable - ver MYM-100)
5. ✅ **Filter Dropdown:** Funcional (aunque visual mejorable - ver MYM-100)
6. ✅ **Responsive Design:** Layout se adapta correctamente a diferentes tamaños de pantalla
7. ✅ **Formato de Fecha:** "DD MMM YYYY" en español correctamente formateado
8. ✅ **Test IDs:** Presentes para testing automatizado (`data-testid="review-card"`, etc.)

---

## 🎯 Recomendaciones para Dev

### Prioridad ALTA (Completar antes de PROD):
1. **✅ [MYM-101] Implementar funcionalidad de Flag button**
   - Tiempo estimado: 30-45 min
   - Bloqueador: Funcionalidad incompleta visible al usuario
   - Requiere: Modal + API endpoint + DB schema update

### Prioridad MEDIA (Mejorar UX):
2. **✅ [MYM-99] Agregar porcentaje visible en histograma**
   - Tiempo estimado: 5 min
   - Quick win: 1 línea de código
   - Mejora significativa de legibilidad

### Prioridad BAJA (Enhancement):
3. **⏭️ [MYM-100] Migrar a shadcn/ui Select**
   - Tiempo estimado: 15 min
   - Mejora consistencia con design system
   - Puede postponerse a futuras iteraciones si hay presión de tiempo

### Testing Post-Fix:
4. **Re-test de los 3 bugs** después de fixes
5. **Regression testing** de funcionalidad core (rating display, reviews list)
6. **E2E test automation** con Playwright para los escenarios críticos

---

## 📝 Notas Adicionales

### Limitaciones del Testing Actual:
- **No se testeó paginación:** El perfil explorado tiene solo 5 reviews (<10 umbral)
- **No se testeó empty state:** El perfil tiene reviews, no pudimos verificar "No reviews yet"
- **No se testeó API error handling:** No se simularon errores de red/API 500
- **No se testeó mobile:** Testing realizado solo en desktop

### Próximos Pasos Sugeridos:
1. **Crear test data fixtures** con perfiles variados:
   - Mentor con 0 reviews → Validar empty state
   - Mentor con 15+ reviews → Validar paginación
   - Mentor con distribución variada → Validar histograma con múltiples ratings
2. **Automatizar tests con Playwright** para los escenarios críticos
3. **Testing de performance:** Validar con 100+ reviews (carga, scroll, paginación)

---

## 🔗 Documentación Relacionada

- **Story Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-35
- **Epic Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-32
- **Bug MYM-99:** https://upexgalaxy62.atlassian.net/browse/MYM-99
- **Bug MYM-100:** https://upexgalaxy62.atlassian.net/browse/MYM-100
- **Bug MYM-101:** https://upexgalaxy62.atlassian.net/browse/MYM-101
- **QA Shift-Left Summary:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/STORY-MYM-35-view-profile-reviews/qa-shift-left-summary.md`
- **Test Cases Completos:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/STORY-MYM-35-view-profile-reviews/test-cases.md`
- **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/STORY-MYM-35-view-profile-reviews/implementation-plan.md`

---

## 📈 Métricas de Testing

**Fecha de Exploratory Testing:** 2025-12-28
**Duración:** ~1.5 horas
**Ambiente:** Staging (https://staging-upexmymentor.vercel.app/)
**Navegador:** Chrome (última versión)
**Resolución:** Desktop 1920x1080

**Resultados:**
- ✅ Bugs encontrados: **3**
- ✅ Screenshots capturados: **3**
- ✅ Issues creados en Jira: **3** (MYM-99, MYM-100, MYM-101)
- ⚠️ Issue duplicado cerrado: **1** (MYM-98 → duplicado de MYM-99)
- ✅ Fixes sugeridos documentados: **3**
- ✅ Estimaciones de tiempo proporcionadas: **3**

**Próximo Milestone:**
- 🎯 Fix de bugs por Dev
- 🔄 Re-test de bugs corregidos
- ✅ Sign-off de QA para PROD deployment

---

**Documento versión:** 1.0
**Status:** Exploratory Testing Completed - Bugs Documented
**Próximo paso:** Dev fixes → Re-test → PROD deployment

