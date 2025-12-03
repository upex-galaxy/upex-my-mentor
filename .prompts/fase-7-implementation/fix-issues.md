Actúa como Senior Full-Stack Developer y Debugging Expert.

---

## 🎯 TAREA

Debuggear y corregir errores en la implementación de **STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}**.

---

## 🐛 PROCESO DE DEBUGGING

### Paso 1: Reproducir y Entender el Error

**Información a recopilar:**

1. **¿Qué error ocurre?**
   - Mensaje de error completo
   - Stack trace
   - Archivo y línea

2. **¿Cuándo ocurre?**
   - Durante build (`npm run build`)
   - Durante dev (`npm run dev`)
   - En navegador (runtime)
   - En servidor (API/backend)

3. **¿Cómo reproducir?**
   - Pasos exactos
   - Datos/inputs usados

**Output:**
```markdown
## 🐛 Error Identificado

**Tipo:** [Build error / Runtime error / TypeScript error / etc.]

**Mensaje:**
```
[Copiar mensaje de error completo]
```

**Ubicación:**
- Archivo: `[ruta]`
- Línea: [número]

**Cómo reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Resultado: error]
```

---

### Paso 2: Investigación y Diagnóstico

**Analiza posibles causas:**

1. **Revisa el código en la ubicación del error**
2. **Consulta Context7 MCP si es error de biblioteca externa**
   - Ejemplo: Error de Next.js → buscar en docs oficiales
3. **Revisa guidelines:**
   - `.context/guidelines/error-handling.md`
   - `.context/guidelines/code-standards.md`

**Causas comunes:**
- ❌ Tipo TypeScript incorrecto
- ❌ Import mal escrito
- ❌ Variable undefined
- ❌ API call sin error handling
- ❌ Missing dependency

**Output:**
```markdown
## 🔍 Diagnóstico

**Causa raíz:** [Descripción]

**Por qué ocurre:** [Explicación]

**Solución propuesta:** [Descripción de cómo corregir]
```

---

### Paso 3: Aplicar Corrección

**Implementa la solución:**

1. Modifica el código
2. Explica el cambio
3. Valida que corrige el error

**Output:**
```markdown
## ✅ Corrección Aplicada

**Archivo:** `[ruta]`

**Cambio:**
[Descripción del cambio]

**Código antes:**
```typescript
[Código con error]
```

**Código después:**
```typescript
[Código corregido]
```

**Por qué funciona:** [Explicación]
```

---

### Paso 4: Validación

**Valida que el error está resuelto:**

1. **Build exitoso:**
```bash
npm run build
```
- ✅ Sin errores TypeScript
- ✅ Sin errores de linting

2. **Prueba manual:**
   - Reproduce los pasos que causaban el error
   - Verifica que ahora funciona

**Output:**
```markdown
## ✅ Validación

**Build:** ✅ Exitoso

**Prueba manual:**
- ✅ [Paso 1] - Funciona
- ✅ [Paso 2] - Funciona
- ✅ Error ya no ocurre

**Próximo paso:** Continuar implementación o pasar a Code Review
```

---

## ⚠️ Tipos de Errores Comunes

### 1. Error de TypeScript

**Síntoma:** `Type 'X' is not assignable to type 'Y'`

**Solución:**
- Verifica tipos en interfaces/types
- Consulta Context7 MCP para tipos correctos de biblioteca
- Usa type guards si necesario

### 2. Error de Import

**Síntoma:** `Cannot find module 'X'`

**Solución:**
- Verifica ruta del import
- Instala dependency si falta: `npm install [paquete]`
- Verifica alias de paths (si usa `@/` o similar)

### 3. Error de Runtime (Navegador)

**Síntoma:** Error en console del navegador

**Solución:**
- Revisa stack trace
- Valida que datos existen antes de acceder
- Agrega error handling (try-catch)

### 4. Error de Build

**Síntoma:** Build falla

**Solución:**
- Lee mensaje completo
- Verifica configuración (next.config.js, tsconfig.json)
- Consulta Context7 MCP para framework específico

---

## 🎯 EJEMPLO DE USO

```markdown
Tengo este error en STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}:

**Error:**
```
Type 'undefined' is not assignable to type 'EntityType[]'
  at EntityList.tsx:15
```

**Proceso:**
1. Analiza el error
2. Diagnostica la causa
3. Propón solución
4. Implementa la corrección
5. Valida que funciona

**Importante:**
- Consulta Context7 MCP si no estás seguro
- Sigue code standards al corregir
- Valida con build + prueba manual

(Donde EntityType y EntityList se reemplazan según el dominio del proyecto. Ejemplos: Mentor[]/MentorList en MYM, Product[]/ProductList en SHOP)
```

---

## 💡 Tips de Debugging

1. **Lee el error completo** - No asumas
2. **Reproduce consistentemente** - Entiende cuándo/por qué ocurre
3. **Consulta docs oficiales** - Usa Context7 MCP
4. **Revisa cambios recientes** - ¿Qué se modificó antes del error?
5. **Valida la corrección** - Build + prueba manual

---

**Nota:** Si el error persiste o es complejo, considera solicitar ayuda o revisar la arquitectura de la solución.
