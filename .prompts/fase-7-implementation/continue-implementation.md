Actúa como Senior Full-Stack Developer.

---

## 🎯 TAREA

Continuar la implementación de **STORY-[PROYECTO]-[NUM]-[nombre]** que fue pausada.

---

## 📚 CONTEXTO A LEER

```
.context/PBI/epics/EPIC-[PROYECTO]-[NUM]-[nombre]/stories/STORY-[PROYECTO]-[NUM]-[nombre]/implementation-plan.md
```

**Además:**
- Código ya implementado en el proyecto
- Archivos modificados recientemente

---

## 🔄 PROCESO

### Paso 1: Análisis del Estado Actual

1. **Revisa el `implementation-plan.md`**
   - Identifica qué steps están completos
   - Identifica qué falta por hacer

2. **Revisa el código existente**
   - Archivos ya creados/modificados
   - Funcionalidad ya implementada

3. **Valida estado actual**
   - Ejecuta `npm run build` (verificar si compila)
   - Prueba manual rápida (qué funciona)

---

### Paso 2: Genera Resumen de Estado

**Output esperado:**
```markdown
## 📊 Estado Actual de STORY-XXX

### ✅ Completado:
- Step 1: [Nombre] - [Archivos: x, y, z]
- Step 2: [Nombre] - [Archivos: a, b]

### ⏳ En Progreso:
- Step 3: [Nombre] - Parcialmente implementado
  - ✅ [Parte completada]
  - ⏸️ [Parte pendiente]

### ⏸️ Pendiente:
- Step 4: [Nombre]
- Step 5: [Nombre]

### 🧪 Validación Actual:
- Build: ✅ Compila / ❌ Errores
- Funcionalidad: [Qué funciona ahora]

### 🎯 Próximo Paso:
[Descripción del siguiente step a implementar]
```

---

### Paso 3: Continuar Implementación

**Desde el step pendiente:**
1. Implementa el siguiente step completo
2. Valida que funciona (build + prueba manual)
3. Continúa con el siguiente

**Sigue las mismas restricciones de `implement-story.md`:**
- ❌ NO tests (eso es Fase 8)
- ✅ Code standards
- ✅ Error handling
- ✅ Design system

---

## 🎯 EJEMPLO DE USO

```markdown
Continúa la implementación de STORY-MYM-14-view-mentors.

**Proceso:**
1. Analiza qué steps ya están completados
2. Dame resumen del estado actual
3. Continúa desde donde quedó
4. Valida que funciona

**Importante:**
- Lee el implementation plan
- Revisa código ya existente
- NO agregues tests (Fase 8)
```

---

**Nota:** Si encuentras errores en código ya implementado, usa `fix-issues.md` para debuggear primero.
