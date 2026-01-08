<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Market Context - Manual

> **Fase:** 1 - Constitution
> **Tiempo estimado:** 30-60 minutos
> **Herramientas:** Google, Crunchbase, LinkedIn, G2/Capterra
> **Prerequisitos:** Haber completado `business-model.MANUAL.md`

---

## 🎯 Objetivo

Crear un análisis de mercado que identifique competidores, oportunidades y tendencias relevantes para tu producto.

Al finalizar tendrás el archivo `.context/idea/market-context.md` con información estratégica para diferenciarte.

---

## 🔑 Conceptos Clave

| Término                   | Significado                                                    |
| ------------------------- | -------------------------------------------------------------- |
| **TAM**                   | Total Addressable Market - Mercado total (si capturas 100%)    |
| **SAM**                   | Serviceable Addressable Market - Segmento al que puedes llegar |
| **SOM**                   | Serviceable Obtainable Market - Porción realista a capturar    |
| **Competitive Landscape** | Mapa de competidores directos e indirectos                     |
| **Moat**                  | Ventaja competitiva difícil de replicar                        |
| **Barrier to Entry**      | Obstáculos para nuevos competidores                            |

---

## 📐 Framework de Análisis

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANÁLISIS DE MERCADO                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. COMPETENCIA          2. OPORTUNIDAD         3. TENDENCIAS   │
│  ┌───────────────┐       ┌───────────────┐      ┌─────────────┐ │
│  │ ¿Quiénes son? │       │ ¿Qué tan      │      │ ¿Hacia      │ │
│  │ ¿Qué hacen?   │       │  grande es?   │      │  dónde va   │ │
│  │ ¿Qué falta?   │       │ ¿Está creciendo│     │  el mercado?│ │
│  └───────────────┘       └───────────────┘      └─────────────┘ │
│         │                       │                      │        │
│         ▼                       ▼                      ▼        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    TU DIFERENCIACIÓN                        ││
│  │  ¿Cómo te posicionas? ¿Qué haces diferente?                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Paso a Paso

### Paso 1: Prepara tu archivo

**¿Qué hacer?**
Crea el archivo para documentar el análisis.

**¿Cómo?**

```bash
# Asegúrate de tener la carpeta
mkdir -p .context/idea

# Crea el archivo
touch .context/idea/market-context.md
```

---

### Paso 2: Identifica competidores directos

**¿Qué hacer?**
Encuentra 3-5 productos que resuelven el mismo problema.

**¿Por qué?**
Conocer a tus competidores te ayuda a diferenciarte y evitar errores que otros ya cometieron.

**¿Cómo?**

1. **Busca en Google:**
   - "[tu problema] software"
   - "[tu solución] tool"
   - "best [categoría] 2025"

2. **Revisa marketplaces:**
   - G2.com
   - Capterra.com
   - ProductHunt.com

3. **Pregunta en comunidades:**
   - Reddit (subreddits relevantes)
   - Twitter/X
   - LinkedIn

**Formato de documentación:**

```markdown
## Competitive Landscape

### Competidor 1: [Nombre]

- **Website:** [URL]
- **Descripción:** [Qué hacen en 1 oración]
- **Pricing:** [Modelo y rangos de precio]
- **Target:** [A quién apuntan]
- **Fortalezas:**
  - [Fortaleza 1]
  - [Fortaleza 2]
- **Debilidades:**
  - [Debilidad 1]
  - [Debilidad 2]
- **Reviews:** [Puntuación en G2/Capterra]
```

> 💡 **Tip:** Lee las reviews negativas de competidores. Ahí encontrarás pain points que puedes resolver.

---

### Paso 3: Analiza competidores indirectos

**¿Qué hacer?**
Identifica soluciones alternativas que no son competencia directa.

**¿Por qué?**
Tu competencia real incluye cualquier forma en que el usuario resuelve su problema hoy.

**¿Cómo?**

Piensa en estas categorías:

```
┌────────────────────────────────────────────────────────────┐
│              TIPOS DE COMPETENCIA                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  DIRECTA              INDIRECTA            ALTERNATIVA     │
│  ────────             ─────────            ───────────     │
│  Mismo problema       Mismo problema       Mismo outcome   │
│  Misma solución       Diferente solución   Diferente camino│
│                                                            │
│  Ejemplo (Testing):   Ejemplo:             Ejemplo:        │
│  • TestRail           • Jira + plugins     • No automatizar│
│  • Xray               • Spreadsheets       • Contratar QA  │
│  • Zephyr             • Notion databases   • Outsourcing   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Documenta:**

```markdown
### Competidores Indirectos

| Alternativa   | Cómo resuelven el problema | Por qué elegirían esto |
| ------------- | -------------------------- | ---------------------- |
| Spreadsheets  | Manual, gratis             | Ya lo conocen          |
| Jira nativo   | Integrado, sin costo extra | Ya pagan Jira          |
| No hacer nada | Aceptar el status quo      | Resistencia al cambio  |
```

---

### Paso 4: Crea la matriz de posicionamiento

**¿Qué hacer?**
Ubica a cada competidor en un mapa 2D según dos variables relevantes.

**¿Por qué?**
Visualizar el landscape te ayuda a encontrar espacios vacíos (oportunidades).

**¿Cómo?**

1. Elige 2 dimensiones relevantes para tu mercado:
   - Precio (bajo ↔ alto)
   - Complejidad (simple ↔ enterprise)
   - Enfoque (generalista ↔ especializado)
   - Target (SMB ↔ Enterprise)

2. Ubica competidores en el mapa:

```
                        ENTERPRISE
                            │
              TestRail      │      Xray
                 ●          │        ●
                            │
    SIMPLE ─────────────────┼─────────────────── COMPLEJO
                            │
                 ●          │        ●
              Notion        │      Zephyr
                            │
                           SMB

    ★ = TU OPORTUNIDAD (espacio vacío)
```

**Documenta:**

```markdown
### Matriz de Posicionamiento

**Ejes:**

- X: Complejidad (Simple → Complejo)
- Y: Target (SMB → Enterprise)

**Posiciones:**

- TestRail: Simple + Enterprise
- Xray: Complejo + Enterprise
- Zephyr: Complejo + SMB
- Notion: Simple + SMB

**Nuestra posición objetivo:**
[Describir el espacio que ocuparás y por qué]
```

---

### Paso 5: Estima el tamaño de mercado

**¿Qué hacer?**
Calcula TAM, SAM y SOM.

**¿Por qué?**
Necesitas saber si el mercado es lo suficientemente grande para sostener tu negocio.

**¿Cómo?**

```
┌─────────────────────────────────────────────────────────────────┐
│                    TAM → SAM → SOM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│        ┌─────────────────────────────────────┐                  │
│        │              TAM                    │                  │
│        │   Total Addressable Market          │                  │
│        │   "Si vendiéramos a TODOS"          │                  │
│        │                                     │                  │
│        │     ┌─────────────────────┐         │                  │
│        │     │        SAM          │         │                  │
│        │     │  Mercado alcanzable │         │                  │
│        │     │  "A quiénes PODEMOS │         │                  │
│        │     │   llegar"           │         │                  │
│        │     │                     │         │                  │
│        │     │   ┌───────────┐     │         │                  │
│        │     │   │    SOM    │     │         │                  │
│        │     │   │ Realista  │     │         │                  │
│        │     │   │ "Lo que   │     │         │                  │
│        │     │   │ capturaremos"   │         │                  │
│        │     │   └───────────┘     │         │                  │
│        │     └─────────────────────┘         │                  │
│        └─────────────────────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Métodos de cálculo:**

**Método Top-Down:**

```
TAM = Número total de empresas × Precio promedio anual
SAM = TAM × % que usa tecnología relevante
SOM = SAM × % realista de captura (1-5% para startups)
```

**Método Bottom-Up:**

```
SOM = Clientes objetivo en año 1 × Precio
SAM = SOM × 10-20x (mercado alcanzable)
TAM = SAM × 5-10x (mercado total)
```

**Ejemplo:**

```markdown
### Market Opportunity

**Método:** Bottom-up

**TAM (Total Addressable Market):**

- 500,000 empresas de software globalmente
- $100/mes promedio por herramienta de testing
- TAM = $600M/año

**SAM (Serviceable Addressable Market):**

- Empresas con >10 developers que usan Jira
- ~50,000 empresas
- SAM = $60M/año

**SOM (Serviceable Obtainable Market):**

- Objetivo año 1: 500 clientes
- ARPU: $50/mes
- SOM = $300K/año (0.5% del SAM)

**Crecimiento:** Mercado de testing automation crece 15% anual (Gartner)
```

> ⚠️ **Cuidado:** No necesitas números exactos. Estimaciones razonables con fuentes están bien.

---

### Paso 6: Identifica tendencias relevantes

**¿Qué hacer?**
Documenta 3-5 tendencias que afectan tu mercado.

**¿Por qué?**
Las tendencias indican hacia dónde va el mercado. Quieres estar del lado correcto.

**¿Cómo?**

Categorías a investigar:

| Categoría          | Qué buscar                    | Fuentes                |
| ------------------ | ----------------------------- | ---------------------- |
| **Tecnológicas**   | Nuevas tecnologías adoptadas  | Gartner, Forrester     |
| **Comportamiento** | Cómo cambian los usuarios     | Encuestas, Reddit      |
| **Regulatorias**   | Nuevas leyes/estándares       | Noticias, ISO          |
| **Económicas**     | Budget, hiring trends         | LinkedIn, Glassdoor    |
| **Industria**      | Consolidación, nuevos players | Crunchbase, TechCrunch |

**Ejemplo:**

```markdown
### Trends & Insights

#### Tendencia 1: Shift-Left Testing

- **Qué es:** Testing cada vez más temprano en el ciclo
- **Impacto:** Mayor demanda de herramientas integradas con desarrollo
- **Para nosotros:** Oportunidad de integrarnos pre-commit

#### Tendencia 2: AI en Testing

- **Qué es:** IA para generar/mantener tests automáticamente
- **Impacto:** Los testers buscan herramientas AI-powered
- **Para nosotros:** Core de nuestra propuesta de valor

#### Tendencia 3: Quality Engineering

- **Qué es:** QA evoluciona de "testers" a "quality engineers"
- **Impacto:** Necesitan herramientas más técnicas
- **Para nosotros:** Target audience más técnico y dispuesto a pagar
```

---

### Paso 7: Define tu diferenciación

**¿Qué hacer?**
Articula claramente por qué eres diferente/mejor.

**¿Por qué?**
Sin diferenciación clara, competirás solo en precio (mala estrategia).

**¿Cómo?**

Usa este framework:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIFERENCIACIÓN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐                                              │
│  │  ¿QUÉ HACEMOS │                                              │
│  │  DIFERENTE?   │                                              │
│  └───────┬───────┘                                              │
│          │                                                      │
│          ▼                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        │
│  │   FEATURE     │  │   ENFOQUE     │  │   MODELO      │        │
│  │               │  │               │  │               │        │
│  │ Algo que      │  │ A quién       │  │ Cómo          │        │
│  │ otros no      │  │ servimos      │  │ cobramos      │        │
│  │ tienen        │  │ mejor         │  │ diferente     │        │
│  └───────────────┘  └───────────────┘  └───────────────┘        │
│                                                                 │
│  Ejemplos:          Ejemplos:          Ejemplos:                │
│  • AI integrada     • Solo startups    • Usage-based            │
│  • Open source      • Solo enterprise  • Freemium               │
│  • Sin código       • Solo QA teams    • Per-seat               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Documenta:**

```markdown
### Nuestra Diferenciación

**Competidor A vs Nosotros:**

- Ellos: Testing manual con plantillas
- Nosotros: Generación AI de tests desde user stories

**Competidor B vs Nosotros:**

- Ellos: Enterprise-only, implementación de 3 meses
- Nosotros: Self-service, productivo en 10 minutos

**Moat (Ventaja defensible):**

1. Dataset propietario de test patterns
2. Integraciones nativas con stack moderno
3. Community de early adopters (lock-in por network effects)
```

---

### Paso 8: Documenta barreras y riesgos

**¿Qué hacer?**
Lista obstáculos para entrar al mercado y riesgos principales.

**¿Por qué?**
Anticipar riesgos te permite preparar mitigaciones.

**¿Cómo?**

```markdown
### Barriers to Entry

**Barreras que enfrentamos:**
| Barrera | Severidad | Mitigación |
|---------|-----------|------------|
| Competidores establecidos | Alta | Enfoque en nicho desatendido |
| Costo de adquisición | Media | Content marketing + community |
| Integraciones requeridas | Media | Priorizar Jira/GitHub primero |

**Barreras que nos protegen (una vez dentro):**
| Barrera | Cómo nos protege |
|---------|------------------|
| Switching costs | Datos de tests migrados difíciles de mover |
| Network effects | Comunidad genera contenido |
| Integraciones | Lock-in con stack del cliente |
```

```markdown
### Risks & Assumptions

**Riesgos de mercado:**

1. **Riesgo:** Competidor grande lanza feature similar
   - **Probabilidad:** Media
   - **Impacto:** Alto
   - **Mitigación:** Velocidad de innovación, enfoque en UX

2. **Riesgo:** Mercado más pequeño de lo estimado
   - **Probabilidad:** Baja
   - **Impacto:** Alto
   - **Mitigación:** Validar con MVP antes de escalar

**Assumptions a validar:**

- [ ] Los QA engineers están dispuestos a pagar por herramientas
- [ ] La integración con Jira es deal-breaker
- [ ] AI-generated tests son suficientemente confiables
```

---

## 📋 Checklist Final

Antes de proceder a Fase 2, verifica:

- [ ] Archivo `.context/idea/market-context.md` existe
- [ ] 3-5 competidores directos documentados con fortalezas/debilidades
- [ ] Competidores indirectos identificados
- [ ] Matriz de posicionamiento creada
- [ ] TAM/SAM/SOM estimados con metodología clara
- [ ] 3+ tendencias de mercado documentadas
- [ ] Diferenciación articulada claramente
- [ ] Riesgos y barreras documentados

---

## 📚 Template Final

```markdown
# Market Context - [Nombre del Proyecto]

**Fecha:** [YYYY-MM-DD]
**Versión:** 1.0
**Autor:** [Tu nombre]

---

## Competitive Landscape

### Competidor 1: [Nombre]

- **Website:** [URL]
- **Descripción:** [...]
- **Pricing:** [...]
- **Fortalezas:** [...]
- **Debilidades:** [...]

### Competidor 2: [Nombre]

[...]

### Competidor 3: [Nombre]

[...]

---

## Competidores Indirectos

| Alternativa | Cómo resuelven | Por qué lo eligen |
| ----------- | -------------- | ----------------- |
| ...         | ...            | ...               |

---

## Matriz de Posicionamiento

[Diagrama ASCII o descripción]

---

## Market Opportunity

### TAM

[...]

### SAM

[...]

### SOM

[...]

---

## Trends & Insights

### Tendencia 1: [Nombre]

[...]

### Tendencia 2: [Nombre]

[...]

### Tendencia 3: [Nombre]

[...]

---

## Nuestra Diferenciación

[...]

---

## Barriers to Entry

[Tabla de barreras]

---

## Risks & Assumptions

[Lista de riesgos y assumptions]

---

**Siguiente paso:** Proceder a Fase 2 - Architecture (PRD)
```

---

## 🎓 Recursos Adicionales

**Herramientas de investigación:**

- [G2.com](https://g2.com) - Reviews de software B2B
- [Capterra](https://capterra.com) - Comparativas de software
- [Crunchbase](https://crunchbase.com) - Datos de funding de competidores
- [SimilarWeb](https://similarweb.com) - Tráfico web de competidores
- [BuiltWith](https://builtwith.com) - Tech stack de competidores

**Para sizing de mercado:**

- [Statista](https://statista.com) - Estadísticas de mercado
- [Gartner](https://gartner.com) - Reports de industria
- [CBInsights](https://cbinsights.com) - Análisis de mercado tech

---

## ❓ Preguntas Frecuentes

**P: ¿Y si no encuentro competidores directos?**
R: Dos opciones: (1) El mercado no existe (malo), o (2) No buscaste bien. Siempre hay alternativas - aunque sea "hacerlo manual" o "no hacerlo".

**P: ¿Cuántos competidores debo analizar?**
R: 3-5 directos es suficiente. Más es mejor para perspectiva, pero no te paralices.

**P: ¿Mis estimaciones de mercado deben ser exactas?**
R: No. Necesitas orden de magnitud correcto ($10M vs $1B). La precisión viene después.

**P: ¿Qué pasa si el mercado parece muy pequeño?**
R: Considera: (1) ¿Estás definiendo muy estrecho? (2) ¿Puedes expandir a mercados adyacentes? (3) ¿Es suficiente para un negocio rentable aunque no sea "unicornio"?

---

**Fase 1 completa.** Siguiente: Fase 2 - Architecture (PRD y SRS)
