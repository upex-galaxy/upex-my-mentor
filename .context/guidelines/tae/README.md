# Test Automation Engineering (TAE)

**Fase 7**: Arquitectura de testing automatizado basada en **KATA Framework**

---

## 📂 Contenido de este Directorio

Este directorio contiene la **estrategia completa de testing automatizado** del proyecto, incluyendo:
- Estrategia general de testing
- Plan de implementación KATA
- Estándares de código para tests
- Documentación de arquitectura KATA
- Plantillas para catalogar componentes y ATCs
- Guías de integración con TMS y CI/CD

---

## 📋 Archivos

### 🤖 Archivos Estratégicos (Generados con Prompts)

Estos archivos se generan usando los prompts de `.prompts/07-tae.md`:

| Archivo | Descripción | Generado con |
|---------|-------------|--------------|
| `test-strategy.md` | Estrategia general de testing del proyecto | Prompt 1 |
| `kata-implementation-plan.md` | Plan específico de implementación KATA | Prompt 2 |
| `automation-standards.md` | Estándares de código para tests | Prompt 3 |

### 📚 Archivos de Reference (Contenido Completo Estático)

Estos archivos contienen documentación de referencia completa:

| Archivo | Descripción |
|---------|-------------|
| `kata-architecture.md` | Arquitectura KATA adaptada al proyecto |
| `test-data-management.md` | Estrategias de gestión de datos de prueba |
| `tms-integration.md` | Integración con Xray/TestRail |
| `ci-cd-integration.md` | Integración con GitHub Actions |

### 📋 Archivos Plantilla (Para llenar manualmente)

Estos archivos son plantillas que el QA llena conforme implementa:

| Archivo | Descripción |
|---------|-------------|
| `component-catalog.md` | Catálogo de componentes implementados |
| `atc-registry.md` | Registro de ATCs con trazabilidad a Jira |

---

## 🔄 Workflow de Uso

### 1. Generar Documentación Estratégica

**Para Greenfield:**
```
1. Leer: .prompts/07-tae.md → Sección GREENFIELD
2. Ejecutar: Prompt 1 (test-strategy.md)
3. Ejecutar: Prompt 2 (kata-implementation-plan.md)
4. Ejecutar: Prompt 3 (automation-standards.md)
5. Outputs generados en .context/tae/
```

**Para Legacy:**
```
1. Leer: .prompts/07-tae.md → Sección LEGACY
2. Ejecutar: Fase 0 (evaluación de suite existente)
3. Generar: legacy-test-assessment.md
4. Ejecutar: Prompts 1-3 (versiones adaptadas para legacy)
5. Outputs generados en .context/tae/
```

### 2. Completar Archivos de Reference

Copiar contenido de docs/kata-test-architecture.md adaptado al proyecto específico.

### 3. Usar Durante Implementación

Cuando el equipo QA implementa la suite KATA:
- Consultar `test-strategy.md` para decisiones de cobertura
- Seguir `kata-implementation-plan.md` para orden de componentes
- Aplicar `automation-standards.md` en code reviews
- Actualizar `component-catalog.md` conforme se crean componentes
- Registrar ATCs en `atc-registry.md` con IDs de Jira

---

## 🎯 Para QA / Test Engineers

**Antes de empezar a codear tests:**
1. ✅ Leer `test-strategy.md` completo
2. ✅ Leer `kata-architecture.md` para entender KATA
3. ✅ Leer `kata-implementation-plan.md` para saber qué componentes crear
4. ✅ Leer `automation-standards.md` para conocer naming conventions

**Durante implementación:**
- Referenciar `automation-standards.md` en cada PR
- Actualizar `component-catalog.md` al crear componentes nuevos
- Agregar ATCs a `atc-registry.md` con sus test IDs de Jira

**Al configurar TMS y CI/CD:**
- Seguir `tms-integration.md` para Xray setup
- Seguir `ci-cd-integration.md` para GitHub Actions

---

## 📚 Referencias

- **Blueprint completo**: `/docs/ai-driven-software-project-blueprint.md`
- **KATA Documentation**: `/docs/kata-test-architecture.md`
- **Prompts generadores**: `.prompts/07-tae.md`
- **PBI (para mapeo de componentes)**: `.context/pbi/epic-tree.md`
