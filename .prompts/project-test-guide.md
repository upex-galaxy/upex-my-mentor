# Testing Guide

Actúa como un **QA senior** que conoce profundamente el proyecto y está explicando a otro tester qué debería validarse y por qué.

---

## MISIÓN

Generar una **guía conversacional** que oriente sobre:

- QUÉ testear en cada flujo del sistema
- Qué escenarios son importantes y por qué
- Qué dependencias y efectos secundarios considerar
- Ideas de casos que podrían romperse

**Filosofía:**

- **Conversacional:** Como si un compañero te explicara qué validar
- **QUÉ, no CÓMO:** Orientar sobre qué testear, no dictar implementación de tests
- **Asumir infraestructura existente:** El lector ya tiene su framework de testing
- **Visual cuando ayude:** Diagramas ASCII para mostrar flujos y dependencias

**NO incluir:** Snippets de tests, payloads exactos, comandos específicos

**Prerequisito:** Debe existir `.context/business-data-map.md`

**Output:** `.context/project-test-guide.md`

---

## FASE 0: VALIDACIÓN

### 0.1 Verificar Business Data Map

```
¿Existe .context/business-data-map.md?
  → NO: DETENER. Indicar que primero debe ejecutarse business-data-map.md
  → SÍ: Continuar
```

### 0.2 Comprender el Sistema

Leer el business-data-map.md y comprender:

- Flujos de negocio (estos son los flujos a testear)
- State machines (transiciones a validar)
- Procesos automáticos (triggers, cron, webhooks)
- Integraciones externas
- Reglas de negocio

---

## FASE 1: GENERACIÓN DEL DOCUMENTO

### Genera: `.context/project-test-guide.md`

El documento debe sentirse como una conversación con un QA senior que te explica qué es importante validar y por qué.

---

### ESTRUCTURA DEL OUTPUT

```markdown
# Testing Guide: [Nombre del Proyecto]

╔══════════════════════════════════════════════════════════════════════════════╗
║ GUÍA DE TESTING ║
║ "Qué validar y por qué importa" ║
╚══════════════════════════════════════════════════════════════════════════════╝

> Este documento asume que ya leíste `.context/business-data-map.md` para
> entender los flujos. Aquí te explico qué deberías testear y qué considerar.
```

---

#### 1. VISIÓN GENERAL

```markdown
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🎯 VISIÓN GENERAL │
└──────────────────────────────────────────────────────────────────────────────┘

## Los flujos más críticos

[Explicación conversacional de qué flujos son más importantes y por qué]

"Si tuviera que priorizar qué testear primero, me enfocaría en:

1. **[Flujo más crítico]** - Porque [razón de negocio]...
2. **[Segundo flujo]** - Porque [razón]...
3. **[Tercer flujo]** - Porque [razón]..."

## Diagrama de dependencias entre flujos

[Diagrama ASCII mostrando cómo los flujos se afectan entre sí]

    ┌─────────────┐
    │  Registro   │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐     ┌─────────────┐
    │   Booking   │────►│    Pago     │
    └──────┬──────┘     └──────┬──────┘
           │                   │
           ▼                   ▼
    ┌─────────────┐     ┌─────────────┐
    │   Review    │     │   Payout    │
    └─────────────┘     └─────────────┘

"Esto significa que si algo falla en [flujo arriba], probablemente
afecte a [flujos abajo]..."
```

---

#### 2. QUÉ TESTEAR POR FLUJO

```markdown
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🔄 QUÉ TESTEAR POR FLUJO │
└──────────────────────────────────────────────────────────────────────────────┘

[Para cada flujo principal del business-data-map, explicar conversacionalmente
qué debería validarse]

---

## Flujo: [Nombre del Flujo]

[Diagrama ASCII simplificado del flujo]

### Por qué es importante testearlo

[Contexto de negocio que justifica la importancia]

"Este flujo es crítico porque [impacto en el negocio]. Si falla,
[consecuencia para el usuario/sistema]..."

### El camino feliz

[Descripción conversacional del happy path]

"Lo básico que debería funcionar es:

1. El usuario [acción inicial]...
2. El sistema [respuesta esperada]...
3. Al final, [estado final esperado]..."

### Escenarios que podrían romperse

[Ideas de edge cases y situaciones problemáticas]

"Basándome en cómo funciona este flujo, estos escenarios me preocuparían:

- **¿Qué pasa si [situación A]?** Debería [comportamiento esperado]...

- **¿Y si [situación B] ocurre a mitad del proceso?** El sistema tendría
  que [comportamiento]...

- **Un caso interesante sería [situación C]...** Porque [razón]..."

### Reglas de negocio a validar

[Lista de reglas importantes que deben cumplirse]

"Este flujo tiene algunas reglas que no son obvias:

- [Regla 1]: Por ejemplo, [explicación de la regla y por qué existe]...
- [Regla 2]: Esto significa que [implicación]...
- [Regla 3]: Cuidado porque [consideración]..."

### Efectos secundarios

[Diagrama ASCII si ayuda]

"Cuando este flujo completa exitosamente, también pasan otras cosas:"

    Flujo completado
           │
           ├──► Se envía [notificación/email]
           ├──► Se actualiza [otra entidad]
           └──► Se dispara [proceso automático]

"Estos efectos también deberían validarse..."

---

[Repetir para cada flujo importante]
```

---

#### 3. LAS MÁQUINAS DE ESTADO

```markdown
┌──────────────────────────────────────────────────────────────────────────────┐
│ 📊 VALIDANDO MÁQUINAS DE ESTADO │
└──────────────────────────────────────────────────────────────────────────────┘

"Las máquinas de estado son críticas. Si una transición inválida es posible,
el sistema puede quedar en un estado inconsistente..."

## [Entidad con estados]

[Diagrama ASCII de la máquina de estados]

    ┌──────────┐         ┌──────────┐         ┌──────────┐
    │ Estado A │ ──(1)─► │ Estado B │ ──(2)─► │ Estado C │
    └──────────┘         └──────────┘         └──────────┘
         │                    │
         │                    └──(3)─► ┌──────────┐
         └──────(4)──────────────────► │ Cancelado│
                                       └──────────┘

### Transiciones a validar

"Para cada transición, habría que verificar:

- **(1) A → B:** ¿Bajo qué condiciones debería ocurrir? ¿Qué debería
  impedirla si no se cumplen?

- **(2) B → C:** ¿Qué efectos secundarios dispara? ¿Se ejecutan
  correctamente?

- **(3) B → Cancelado:** ¿Hay restricciones de tiempo o condiciones?

- **(4) A → Cancelado:** ¿Es diferente cancelar desde aquí que desde B?"

### Transiciones que NO deberían ser posibles

"Igual de importante es validar que estas transiciones NO ocurran:

- A → C directamente (saltándose B)
- C → cualquier otro estado (C es terminal)
- Cancelado → cualquier otro estado"

### Estados terminales

"Los estados [X] y [Y] son terminales. Una vez ahí, la entidad no debería
poder cambiar. Esto es importante validarlo..."
```

---

#### 4. PROCESOS AUTOMÁTICOS

```markdown
┌──────────────────────────────────────────────────────────────────────────────┐
│ ⚡ TESTEANDO PROCESOS AUTOMÁTICOS │
└──────────────────────────────────────────────────────────────────────────────┘

"Los procesos automáticos son fáciles de olvidar en testing, pero son
críticos porque corren sin supervisión..."

## Triggers

### [Nombre del trigger]

"Este trigger se dispara cuando [evento]. Debería validarse que:

- Se ejecuta cuando corresponde...
- NO se ejecuta cuando no debería...
- Si falla, [comportamiento esperado]..."

## Cron Jobs

### [Nombre del cron job]

"Este job corre [frecuencia] y procesa [qué]. Para testearlo:

- ¿Qué pasa si no hay nada que procesar?
- ¿Qué pasa si hay muchos items?
- ¿Qué pasa si un item falla a mitad del proceso?
- ¿Es idempotente? (¿Puede correr dos veces sin problemas?)"

## Webhooks

### [Nombre del webhook]

"Los webhooks de [servicio] llegan cuando [evento]. Consideraciones:

- ¿Qué pasa si el webhook llega duplicado?
- ¿Qué pasa si llega tarde o fuera de orden?
- ¿Qué pasa si el payload viene incompleto o malformado?
- ¿El sistema responde correctamente para que el servicio no reintente?"
```

---

#### 5. INTEGRACIONES EXTERNAS

```markdown
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🔗 TESTEANDO INTEGRACIONES │
└──────────────────────────────────────────────────────────────────────────────┘

"Las integraciones con servicios externos son puntos de falla comunes.
No solo hay que testear el happy path, sino qué pasa cuando fallan..."

## [Servicio Externo]

### Qué validar del happy path

[Descripción conversacional]

"Cuando todo funciona bien, el flujo con [servicio] debería:

1. [Paso 1]...
2. [Paso 2]...
3. [Resultado esperado]..."

### Qué podría salir mal

"Estos son escenarios de falla a considerar:

- **El servicio no responde:** ¿El sistema tiene timeout? ¿Qué pasa
  con la operación en curso?

- **El servicio responde con error:** ¿Se maneja correctamente?
  ¿Se notifica al usuario?

- **El servicio responde tarde:** ¿Hay race conditions posibles?

- **El webhook nunca llega:** ¿Hay un mecanismo de reconciliación?"

### Diagrama de la integración

[Diagrama ASCII mostrando el flujo con el servicio externo]

    Tu Sistema                    Servicio Externo
         │                              │
         │──── solicitud ─────────────►│
         │                              │
         │◄─── respuesta inmediata ────│
         │                              │
    [continúa proceso]                  │
         │                              │
         │◄──── webhook (async) ───────│
         │                              │
    [actualiza estado]
```

---

#### 6. ESCENARIOS DE INTEGRACIÓN

```markdown
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🧩 ESCENARIOS DE INTEGRACIÓN │
└──────────────────────────────────────────────────────────────────────────────┘

"Más allá de testear cada flujo individualmente, hay escenarios que
involucran múltiples flujos y son importantes de validar..."

## Flujos encadenados

[Diagrama ASCII de flujos que se conectan]

### [Escenario: Flujo completo de X a Y]

"Un escenario end-to-end importante sería:

1. Un usuario [hace acción inicial]...
2. Esto dispara [flujo A]...
3. Que a su vez afecta [flujo B]...
4. Y finalmente [resultado final]...

¿Qué podría fallar en este camino?

- Si [flujo A] falla a mitad, ¿qué pasa con el estado?
- Si [flujo B] tarda mucho, ¿el usuario ve algo raro?
- ¿Los datos son consistentes al final?"

## Concurrencia

"Hay escenarios de concurrencia que podrían causar problemas:

- ¿Qué pasa si dos usuarios intentan [acción] al mismo tiempo?
- ¿Qué pasa si un proceso automático y un usuario tocan la misma
  entidad simultáneamente?
- ¿Los índices únicos y constraints previenen duplicados correctamente?"
```

---

#### 7. IDEAS DE CASOS EDGE

```markdown
┌──────────────────────────────────────────────────────────────────────────────┐
│ 💡 IDEAS DE CASOS EDGE │
└──────────────────────────────────────────────────────────────────────────────┘

"Después de entender el sistema, estos son casos edge que me parecen
interesantes de explorar..."

## Por cada flujo

[Lista conversacional de ideas]

### [Flujo 1]

- "¿Qué pasa si [situación inusual]?"
- "¿Se maneja bien cuando [condición extrema]?"
- "¿El sistema se recupera si [falla a mitad]?"

### [Flujo 2]

- "Un caso interesante sería [escenario]..."
- "Habría que verificar qué pasa cuando [situación]..."

## Casos de datos

- "¿Qué pasa con datos muy largos o muy cortos?"
- "¿Caracteres especiales se manejan bien?"
- "¿Valores en los límites (0, máximo, negativo)?"

## Casos de tiempo

- "¿Qué pasa cerca de la medianoche / cambio de día?"
- "¿Zonas horarias se manejan correctamente?"
- "¿Expiración de sesiones / tokens?"
```

---

#### 8. CONSIDERACIONES FINALES

```markdown
┌──────────────────────────────────────────────────────────────────────────────┐
│ 📋 CONSIDERACIONES FINALES │
└──────────────────────────────────────────────────────────────────────────────┘

## Priorización sugerida

"Si el tiempo es limitado, yo priorizaría:

1. **Crítico:** [flujos que si fallan, el negocio para]
2. **Alto:** [flujos importantes pero con workarounds]
3. **Medio:** [flujos secundarios]
4. **Bajo:** [nice to have]"

## Qué revisar antes de un release

[Lista conversacional de sanity checks]

"Antes de cualquier release, como mínimo validaría:

- ¿Los flujos principales funcionan?
- ¿Las transiciones de estado son correctas?
- ¿Los procesos automáticos siguen corriendo?
- ¿Las integraciones externas responden?"

## Recursos relacionados

- `.context/business-data-map.md` - Para entender los flujos en detalle
- `.context/project-dev-guide.md` - Para entender la estructura del código
```

---

## FASE 2: INTEGRACIÓN

### Actualizar System Prompt

Si no existe una sección de "Testing Guide" en el system prompt, agregar:

```markdown
## Testing Guide

See `.context/project-test-guide.md` for orientation on:

- What to test in each business flow
- Important scenarios and edge cases
- State machine validations
- Integration testing considerations

**Based on:** Business Data Map
```

---

## CHECKLIST FINAL

Antes de guardar, verificar:

- [ ] El tono es conversacional, como un QA explicando
- [ ] NO hay snippets de tests ni payloads exactos
- [ ] Cada flujo tiene su sección con qué validar
- [ ] Los diagramas ASCII ayudan a visualizar dependencias
- [ ] Las ideas de edge cases son útiles
- [ ] Referencia al business-data-map

---

## REPORTE FINAL

```markdown
# ✅ Testing Guide Generado

## Archivo Creado:

`.context/project-test-guide.md`

## Basado en:

`.context/business-data-map.md`

## Contenido:

- [N] flujos con escenarios a testear
- [N] máquinas de estado con transiciones a validar
- [N] procesos automáticos explicados
- [N] integraciones con consideraciones
- Ideas de edge cases por flujo
```

---

## FILOSOFÍA DE ESTE PROMPT

- **Conversacional:** Como si un QA te explicara qué validar
- **QUÉ, no CÓMO:** Orientar sobre qué testear, no cómo implementar tests
- **Visual:** Diagramas ASCII para mostrar flujos y dependencias
- **Ideas, no recetas:** Dar ideas de escenarios a explorar
- **Asume infraestructura:** El lector ya tiene su framework de testing
