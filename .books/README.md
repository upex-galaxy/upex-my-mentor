# BOOKS - Manuales de Instrucciones para Humanos

Este directorio contiene **manuales paso a paso** para que los humanos ejecuten las tareas de desarrollo de software **sin necesidad de IA**.

> **Nota para IA:** Este directorio NO contiene prompts. Son instrucciones diseñadas para lectura humana. Si estás buscando prompts, ve a `.prompts/`.

---

## ¿Qué es BOOKS?

BOOKS es el complemento humano de los PROMPTS. Mientras que `.prompts/` contiene instrucciones optimizadas para IA, `.books/` contiene **manuales educativos** que enseñan a las personas a realizar las mismas tareas por sí mismas.

```
┌─────────────────────────────────────────────────────────────┐
│                    AI-Driven Project                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   .prompts/                    .books/                      │
│   ┌─────────────────┐          ┌─────────────────┐          │
│   │ Instrucciones   │          │ Manuales para   │          │
│   │ para IA         │    ↔     │ Humanos         │          │
│   │                 │          │                 │          │
│   │ "Actúa como..." │          │ "Paso 1: ..."   │          │
│   └─────────────────┘          └─────────────────┘          │
│                                                             │
│   La IA ejecuta              El humano aprende              │
│   las tareas                 y ejecuta las tareas           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ¿Para quién es BOOKS?

- **QA Engineers** que quieren dominar el proceso completo de testing
- **Developers** que quieren entender cada fase del desarrollo
- **Estudiantes** que están aprendiendo desarrollo de software
- **Cualquier persona** que prefiere hacer las cosas manualmente antes de delegarlas a IA

---

## Estructura de BOOKS

Los manuales siguen la misma estructura de 14 fases que los prompts:

### Fases Sincrónicas (Setup Inicial - Una sola vez)

| Fase | Carpeta                  | Descripción                             |
| ---- | ------------------------ | --------------------------------------- |
| 1    | `fase-1-constitution/`   | Definición del modelo de negocio        |
| 2    | `fase-2-architecture/`   | Especificaciones de producto y técnicas |
| 3    | `fase-3-infrastructure/` | Configuración de backend y frontend     |

### Fases Asincrónicas (Iterativas - Por sprint/feature)

| Fase | Carpeta                          | Descripción                             |
| ---- | -------------------------------- | --------------------------------------- |
| 4    | `fase-4-specification/`          | Product Backlog (epics y stories)       |
| 5    | `fase-5-shift-left-testing/`     | Testing temprano (antes de implementar) |
| 6    | `fase-6-planning/`               | Planificación técnica de implementación |
| 7    | `fase-7-implementation/`         | Desarrollo + Unit Tests                 |
| 8    | `fase-8-code-review/`            | Revisión de código                      |
| 9    | `fase-9-deployment-staging/`     | CI/CD y deploy a staging                |
| 10   | `fase-10-exploratory-testing/`   | Testing exploratorio manual             |
| 11   | `fase-11-test-documentation/`    | Documentación de test cases             |
| 12   | `fase-12-test-automation/`       | Automatización de tests                 |
| 13   | `fase-13-production-deployment/` | Deploy a producción                     |
| 14   | `fase-14-shift-right-testing/`   | Monitoring y observabilidad             |

---

## Nomenclatura de Archivos

Cada manual corresponde a un prompt en `.prompts/`:

```
.prompts/fase-X/nombre-archivo.md      →  Prompt para IA
.books/fase-X/nombre-archivo.MANUAL.md →  Manual para humano
```

**Ejemplos:**

| Prompt (IA)               | Manual (Humano)                  |
| ------------------------- | -------------------------------- |
| `exploratory-test.md`     | `exploratory-test.MANUAL.md`     |
| `backend-setup.md`        | `backend-setup.MANUAL.md`        |
| `acceptance-test-plan.md` | `acceptance-test-plan.MANUAL.md` |

**¿Por qué `.MANUAL.md`?**

1. **Fácil búsqueda:** Escribe "manual" y verás todos los manuales
2. **Distinción clara:** El sufijo en MAYÚSCULAS indica que es para humanos
3. **Relación visible:** Puedes ver prompt y manual juntos al buscar el nombre

---

## Cómo usar BOOKS

### Paso 1: Identifica en qué fase estás

```
¿Estás definiendo el negocio?           → Fase 1: Constitution
¿Estás diseñando la arquitectura?       → Fase 2: Architecture
¿Estás configurando el proyecto?        → Fase 3: Infrastructure
¿Estás definiendo features?             → Fase 4: Specification
¿Estás planificando tests?              → Fase 5: Shift-Left Testing
¿Estás planificando implementación?     → Fase 6: Planning
¿Estás escribiendo código?              → Fase 7: Implementation
¿Estás revisando código?                → Fase 8: Code Review
¿Estás desplegando a staging?           → Fase 9: Deployment Staging
¿Estás haciendo testing manual?         → Fase 10: Exploratory Testing
¿Estás documentando tests?              → Fase 11: Test Documentation
¿Estás automatizando tests?             → Fase 12: Test Automation
¿Estás desplegando a producción?        → Fase 13: Production Deployment
¿Estás monitoreando en producción?      → Fase 14: Shift-Right Testing
```

### Paso 2: Abre el manual correspondiente

Navega a la carpeta de la fase y abre el archivo `.MANUAL.md` que necesitas.

### Paso 3: Sigue el paso a paso

Cada manual incluye:

- **Objetivo:** Qué vas a lograr
- **Conceptos clave:** Lo que necesitas entender
- **Paso a paso:** Instrucciones detalladas
- **Checklist:** Verificación de que completaste todo

---

## Formato de los Manuales

Todos los manuales siguen esta estructura:

```markdown
<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# [Nombre de la Tarea] - Manual

> **Fase:** [Número y nombre]
> **Tiempo estimado:** [X min]
> **Herramientas:** [Lista de herramientas necesarias]

---

## Objetivo

[Qué vas a lograr]

## Conceptos Clave

[Terminología y conocimiento previo]

## Paso a Paso

### Paso 1: [Título]

[Instrucciones detalladas]

### Paso 2: [Título]

...

## Checklist Final

- [ ] [Verificación 1]
- [ ] [Verificación 2]

## Recursos Adicionales

[Links útiles]
```

---

## Relación con PROMPTS

```
┌────────────────────────────────────────────────────────────────┐
│                         FLUJO DE TRABAJO                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│    OPCIÓN A: Usar IA                                           │
│    ┌──────────────┐                                            │
│    │  .prompts/   │ ──→ Copiar prompt ──→ Pegar en IA ──→ ✅   │
│    └──────────────┘                                            │
│                                                                │
│    OPCIÓN B: Hacerlo tú mismo                                  │
│    ┌──────────────┐                                            │
│    │   .books/    │ ──→ Leer manual ──→ Ejecutar pasos ──→ ✅  │
│    └──────────────┘                                            │
│                                                                │
│    OPCIÓN C: Híbrido                                           │
│    ┌──────────────┐    ┌──────────────┐                        │
│    │   .books/    │ +  │  .prompts/   │                        │
│    └──────────────┘    └──────────────┘                        │
│           │                   │                                │
│           ▼                   ▼                                │
│    Entender el proceso  +  Delegar a IA  ──→ ✅                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Beneficios de BOOKS

1. **Aprendizaje:** Entiendes cada paso del proceso
2. **Independencia:** No dependes de IA para todo
3. **Conocimiento profundo:** Sabes el "por qué" de cada acción
4. **Referencia rápida:** Checklists para validar tu trabajo
5. **Onboarding:** Nuevos miembros del equipo aprenden el proceso

---

## Herramientas Mencionadas en los Manuales

A lo largo de los manuales encontrarás referencias a estas herramientas:

| Categoría              | Herramientas                          |
| ---------------------- | ------------------------------------- |
| **Project Management** | Jira, GitHub Issues                   |
| **Testing**            | Playwright, Postman, Browser DevTools |
| **Test Management**    | Xray, Zephyr                          |
| **Database**           | Supabase, SQLite, DBeaver             |
| **CI/CD**              | GitHub Actions, Vercel                |
| **Version Control**    | Git, GitHub                           |
| **Documentación**      | Markdown, Mermaid, Notion             |

---

## Convenciones de Formato

### Iconos usados en los manuales

| Icono | Significado           |
| ----- | --------------------- |
| ✅    | Completado / Correcto |
| ❌    | Evitar / Incorrecto   |
| ⚠️    | Advertencia / Cuidado |
| 💡    | Tip / Consejo         |
| 📝    | Nota importante       |
| 🔑    | Concepto clave        |
| 🎯    | Objetivo              |
| 📋    | Checklist             |

### Bloques especiales

```markdown
> 💡 **Tip:** Información útil pero no crítica

> ⚠️ **Cuidado:** Algo que puede causar problemas

> 📝 **Nota:** Información adicional relevante

> 🔑 **Concepto:** Definición de un término técnico
```

---

## Contribuir a BOOKS

Si quieres mejorar o agregar manuales:

1. Sigue el formato establecido
2. Usa español con terminología IT en inglés
3. Incluye el "por qué" de cada paso
4. Agrega diagramas ASCII cuando ayude a entender
5. Mantén los checklists actualizados

---

## Estadísticas

- **Fases totales:** 14 (3 sincrónicas + 11 asincrónicas)
- **Manuales por fase:** Variable según complejidad
- **Idioma:** Español (terminología IT en inglés)

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
**Autor:** UPEX Galaxy - DOJO AI-Powered Quality Engineer
