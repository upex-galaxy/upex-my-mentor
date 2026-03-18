# Test Prioritization Report & ROI Analysis

**Story:** MYM-59 Mentor Respond to Messages from Dashboard
**Scope:** MVP (Realtime Refresh y Stress Testing diferidos)

---

## 1. Fase 0: Filtro de Preguntas Críticas (Scope AC1-AC5)

| # | Escenario (ATC) | ¿Protege futuro? | ¿Bug previo? | ¿Nivel feature? | ¿Pasa filtro? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Validar visualización del widget de mensajes con conversaciones activas | SÍ | SÍ (MYM-96/UI) | SÍ | ✅ |
| 2 | Validar estado vacío del widget cuando el mentor no tiene conversaciones | SÍ | NO | SÍ | ✅ |
| 3 | Validar visualización de la conversación completa al hacer clic en el widget | SÍ | NO | SÍ | ✅ |
| 4 | Validar envío de respuesta rápida desde el modal | SÍ | SÍ (MYM-132, MYM-155) | SÍ | ✅ |
| 5 | Validar navegación al inbox completo ("View All") | SÍ | NO | SÍ | ✅ |

*Nota sobre ATC 5:* Aunque la navegación a través de un `<Link>` nativo es un flujo de baja probabilidad de regresión en UI (bajo ROI de automatización aislado), se incluye obligatoriamente en el plan de pruebas manuales para mantener la **trazabilidad estricta con el AC4**.

---

## 2. Análisis ROI (Core MVP ATCs)

*Fórmula ROI: (Freq × Impact × Stab) / (Effort × Deps)*

| # | ATC | Tipo | Freq | Imp | Stab | Eff | Dep | ROI | Path | Justificación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Validar visualización del widget de mensajes con conversaciones activas | Functional | 5 | 4 | 4 | 2 | 2 | **20.0** | **Candidate** | Punto de entrada principal (AC1). Previene regresiones visuales críticas del dashboard. |
| 2 | Validar estado vacío del widget cuando el mentor no tiene conversaciones | Functional | 4 | 3 | 5 | 1 | 1 | **60.0** | **Candidate** | Altísima estabilidad y muy bajo esfuerzo de automatización (solo requiere un user vacío). (AC1) |
| 3 | Validar visualización de la conversación completa al hacer clic en el widget | Functional | 5 | 4 | 4 | 2 | 2 | **20.0** | **Candidate** | Flujo base para acceder a la respuesta rápida (AC2, AC5). |
| 4 | Validar envío de respuesta rápida desde el modal | E2E | 5 | 5 | 3 | 3 | 3 | **8.3** | **Candidate** | Flujo más crítico de negocio (AC3). Alto riesgo histórico por bugs MYM-132 (Network) y MYM-155 (UI rendering). |
| 5 | Validar navegación al inbox completo ("View All") | Functional | 3 | 2 | 5 | 1 | 1 | **30.0** | **Manual** | Requisito explícito de negocio (AC4). Se asigna a Manual porque su validación automatizada se asume cubierta implícitamente en la suite E2E global, pero requiere un ticket explícito por trazabilidad. |

---

## 3. Regression Extras (Bonus / Edge Cases)

Estos casos **no forman parte de los Criterios de Aceptación Core (AC1-AC5)** pero aportan un alto valor de resiliencia al sistema basado en descubrimientos de la fase exploratoria.

| # | Escenario (ATC) | ROI Estimado | Path | Justificación |
| :--- | :--- | :--- | :--- | :--- |
| Extra 1 | Validar preservación del borrador (Ghost Effect) al actualizarse el widget en segundo plano | 4.5 | **Candidate** | Evita pérdida de datos introducidos por el usuario si ocurre un re-render (Condición de carrera). Recomendado para automatización E2E si el esfuerzo no penaliza el sprint. |

---

## 4. Diferidos (No entran en regresión formal)

| Escenario | AC | Razón para diferir |
| :--- | :--- | :--- |
| Validar actualizaciones Realtime sin refresh | - | Scope movido a Epic futura (Enhancement MYM-96). |
| Stress Tests ("Spammer") | - | Fuera del alcance MVP funcional. |

---

## 5. Resumen y Plan de Acción

| Categoría | Total | Detalle |
| :--- | :--- | :--- |
| **Automation Candidates (Regresión)** | **4** | ATCs 1, 2, 3, 4 (Cubren AC1a, AC1b, AC2, AC3, AC5) |
| **Manual (Regresión)** | **1** | ATC 5 (Cubre AC4) |
| **Extras (Automation Bonus)** | **1** | Ghost Effect |
| **Diferidos** | **2** | Realtime, Stress Test |

**Siguiente paso:** Generar los tickets en Jira para los 4 Automation Candidates, el test Manual y el Extra 1.