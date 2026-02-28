<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Business Model Canvas - Manual

> **Fase:** 1 - Constitution
> **Tiempo estimado:** 45-90 minutos
> **Herramientas:** Papel/Whiteboard, Google Docs, Notion, o Miro
> **Prerequisitos:** Una idea de negocio o producto en mente

---

## 🎯 Objetivo

Crear un **Business Model Canvas** completo que defina cómo tu producto/servicio generará valor para los usuarios y para el negocio.

Al finalizar tendrás el archivo `.context/idea/business-model.md` que servirá como base para todas las decisiones de producto y técnicas.

---

## 🔑 Conceptos Clave

Antes de empezar, asegúrate de entender estos términos:

| Término                   | Significado                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| **Business Model Canvas** | Framework visual de 9 bloques que describe cómo un negocio crea, entrega y captura valor |
| **Value Proposition**     | La promesa de valor que haces a tus clientes - por qué deberían elegirte                 |
| **Customer Segment**      | Grupo específico de personas o empresas a las que diriges tu producto                    |
| **MVP**                   | Minimum Viable Product - versión mínima del producto con funcionalidad esencial          |
| **Pain Point**            | Problema, frustración o necesidad no satisfecha de tus usuarios                          |
| **Revenue Stream**        | Forma en que tu negocio genera ingresos                                                  |

---

## 📐 El Business Model Canvas

El canvas tiene 9 bloques que debes completar. Aquí está la estructura:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS MODEL CANVAS                               │
├─────────────────┬─────────────────┬───────────────┬─────────────────────────┤
│                 │                 │               │                         │
│  8. KEY         │  7. KEY         │  2. VALUE     │  4. CUSTOMER            │
│  PARTNERS       │  ACTIVITIES     │  PROPOSITIONS │  RELATIONSHIPS          │
│                 │                 │               │                         │
│  ¿Con quién     │  ¿Qué hacemos   │  ¿Qué valor   │  ¿Qué tipo de          │
│  trabajamos?    │  para entregar  │  ofrecemos?   │  relación              │
│                 │  valor?         │               │  establecemos?          │
│                 ├─────────────────┤               ├─────────────────────────┤
│                 │                 │               │                         │
│                 │  6. KEY         │               │  3. CHANNELS            │
│                 │  RESOURCES      │               │                         │
│                 │                 │               │  ¿Cómo llegamos         │
│                 │  ¿Qué recursos  │               │  a los clientes?        │
│                 │  necesitamos?   │               │                         │
│                 │                 │               │                         │
├─────────────────┴─────────────────┴───────────────┴─────────────────────────┤
│                 │                                                           │
│  9. COST        │                    5. REVENUE STREAMS                     │
│  STRUCTURE      │                                                           │
│                 │                    ¿Cómo generamos ingresos?              │
│  ¿Cuáles son    │                                                           │
│  los costos?    │                                                           │
│                 │                                                           │
└─────────────────┴───────────────────────────────────────────────────────────┘

                              1. CUSTOMER SEGMENTS
                              ¿Para quién creamos valor?
```

---

## 📋 Paso a Paso

### Paso 1: Prepara tu espacio de trabajo

**¿Qué hacer?**
Crea el archivo donde documentarás tu Business Model.

**¿Por qué?**
Tener un lugar estructurado para documentar te ayuda a organizar ideas y facilita la revisión posterior.

**¿Cómo?**

1. Navega a tu proyecto
2. Crea la carpeta `.context/idea/` si no existe
3. Crea el archivo `business-model.md`

```bash
# Desde la raíz de tu proyecto
mkdir -p .context/idea
touch .context/idea/business-model.md
```

---

### Paso 2: Define el Problem Statement

**¿Qué hacer?**
Escribe 2-3 párrafos describiendo el problema que resuelves.

**¿Por qué?**
El problema es la base de todo. Si no hay un problema real, no hay negocio viable.

**¿Cómo?**

Responde estas preguntas:

1. ¿Qué frustración/necesidad tienen tus usuarios?
2. ¿Cómo resuelven actualmente este problema?
3. ¿Por qué las soluciones actuales no son suficientes?

**Ejemplo:**

```markdown
## Problem Statement

Los desarrolladores junior pierden entre 2-4 horas diarias buscando
documentación fragmentada y ejemplos de código desactualizados cuando
aprenden nuevas tecnologías.

Actualmente, deben saltar entre Stack Overflow, docs oficiales, tutoriales
de YouTube y cursos pagos. Ninguna fuente integra todo el conocimiento
necesario con ejemplos prácticos y contextualizados.

El costo real no es solo tiempo: es la frustración que lleva al burnout
y la desmotivación, causando que muchos abandonen proyectos o cambien
de carrera.
```

> 💡 **Tip:** Sé específico. "Los usuarios tienen problemas" es vago. "Los QA Engineers gastan 3 horas configurando entornos de test" es específico y medible.

---

### Paso 3: Identifica Customer Segments (Bloque 1)

**¿Qué hacer?**
Define 2-3 grupos de usuarios específicos.

**¿Por qué?**
No puedes diseñar para "todos". Necesitas saber exactamente quién usará tu producto.

**¿Cómo?**

Para cada segmento, define:

- **Quiénes son** (demografía, rol)
- **Qué necesitan** (objetivo principal)
- **Pain points** (frustraciones específicas)

**Formato sugerido:**

```markdown
## Customer Segments

### Segmento 1: [Nombre descriptivo]

- **Perfil:** [Quiénes son - edad, rol, experiencia]
- **Objetivo:** [Qué quieren lograr]
- **Pain Points:**
  - [Frustración 1]
  - [Frustración 2]
  - [Frustración 3]

### Segmento 2: [Nombre descriptivo]

- **Perfil:** [...]
- **Objetivo:** [...]
- **Pain Points:** [...]
```

> ⚠️ **Cuidado:** No confundas "usuarios" con "clientes". El usuario usa el producto; el cliente paga por él. A veces son la misma persona, a veces no.

---

### Paso 4: Define Value Propositions (Bloque 2)

**¿Qué hacer?**
Escribe qué valor único ofreces a cada segmento.

**¿Por qué?**
La propuesta de valor es tu diferenciador. Es la razón por la que alguien te elegiría sobre alternativas.

**¿Cómo?**

Para cada segmento, completa esta frase:

```
Para [SEGMENTO], que [PROBLEMA/NECESIDAD],
nuestro producto ofrece [SOLUCIÓN CLAVE]
que [BENEFICIO PRINCIPAL].
A diferencia de [ALTERNATIVAS],
nosotros [DIFERENCIADOR].
```

**Ejemplo:**

```markdown
## Value Propositions

### Para QA Engineers

- **Problema que resolvemos:** Crear test cases desde cero consume 60% del tiempo de testing
- **Nuestra solución:** Generación asistida de test cases basada en user stories
- **Beneficio principal:** Reducir tiempo de diseño de tests en 70%
- **Diferenciador:** Integración nativa con Jira y frameworks de automatización
```

---

### Paso 5: Mapea los Channels (Bloque 3)

**¿Qué hacer?**
Identifica cómo llegarás a tus clientes.

**¿Por qué?**
Un gran producto sin distribución no sirve. Necesitas saber cómo te descubrirán.

**¿Cómo?**

Piensa en 5 fases del journey:

```
AWARENESS → EVALUACIÓN → COMPRA → ENTREGA → POST-VENTA
¿Cómo nos    ¿Cómo nos    ¿Cómo     ¿Cómo      ¿Cómo
descubren?   evalúan?     compran?  reciben    damos
                                    el valor?  soporte?
```

**Ejemplo:**

```markdown
## Channels

| Fase       | Canal             | Descripción                        |
| ---------- | ----------------- | ---------------------------------- |
| Awareness  | Content Marketing | Blog técnico, YouTube tutorials    |
| Awareness  | Community         | Discord, Reddit r/QualityAssurance |
| Evaluación | Free Trial        | 14 días sin tarjeta                |
| Compra     | Self-service      | Checkout online                    |
| Entrega    | SaaS              | Acceso inmediato web               |
| Post-venta | Helpdesk          | Zendesk + community forum          |
```

---

### Paso 6: Define Customer Relationships (Bloque 4)

**¿Qué hacer?**
Decide qué tipo de relación tendrás con cada segmento.

**¿Por qué?**
La relación afecta expectativas, costos y retención.

**¿Cómo?**

Elige el tipo de relación:

| Tipo                    | Descripción                      | Ejemplo          |
| ----------------------- | -------------------------------- | ---------------- |
| **Self-service**        | El cliente se ayuda solo         | FAQs, docs       |
| **Automatizada**        | Sistema automatizado             | Emails, chatbots |
| **Asistencia personal** | Soporte humano                   | Chat, llamadas   |
| **Dedicada**            | Cuenta asignada                  | Account manager  |
| **Comunidad**           | Usuarios se ayudan entre sí      | Foros, Discord   |
| **Co-creación**         | Usuarios contribuyen al producto | Beta testers     |

```markdown
## Customer Relationships

- **Usuarios Free:** Self-service + Comunidad
- **Usuarios Pro:** Asistencia personal (chat)
- **Enterprise:** Dedicada (account manager)
```

---

### Paso 7: Identifica Revenue Streams (Bloque 5)

**¿Qué hacer?**
Define cómo generarás ingresos.

**¿Por qué?**
Sin modelo de monetización claro, no hay negocio sostenible.

**¿Cómo?**

Elige uno o combina:

| Modelo           | Cómo funciona            | Ejemplo           |
| ---------------- | ------------------------ | ----------------- |
| **Subscription** | Pago recurrente          | $29/mes           |
| **Freemium**     | Gratis + premium         | Slack, Spotify    |
| **Pay-per-use**  | Pago por consumo         | AWS, Twilio       |
| **One-time**     | Pago único               | Licencia perpetua |
| **Marketplace**  | Comisión por transacción | Uber (20%)        |
| **Advertising**  | Publicidad               | Google, Facebook  |

```markdown
## Revenue Streams

### Modelo: Freemium + Subscription

| Tier       | Precio  | Incluye                           |
| ---------- | ------- | --------------------------------- |
| Free       | $0      | 5 proyectos, 100 tests/mes        |
| Pro        | $29/mes | Ilimitado, integraciones          |
| Team       | $99/mes | Pro + colaboración, analytics     |
| Enterprise | Custom  | Team + SSO, SLA, soporte dedicado |

### Proyección MVP (6 meses)

- Target: 1,000 usuarios free → 50 Pro → $1,450/mes MRR
```

---

### Paso 8: Lista Key Resources (Bloque 6)

**¿Qué hacer?**
Identifica los recursos críticos para operar.

**¿Por qué?**
Sin recursos no puedes entregar valor. Esto ayuda a planificar y presupuestar.

**¿Cómo?**

Categoriza en 4 tipos:

```markdown
## Key Resources

### Físicos

- Infraestructura cloud (AWS/Vercel)
- Dominio y SSL

### Intelectuales

- Codebase propietario
- Algoritmos de generación de tests
- Documentación técnica

### Humanos

- 2 developers full-stack
- 1 QA engineer (dogfooding)
- 1 founder (producto + ventas)

### Financieros

- Runway de 12 meses
- Budget para herramientas (~$500/mes)
```

---

### Paso 9: Define Key Activities (Bloque 7)

**¿Qué hacer?**
Lista las actividades críticas para entregar valor.

**¿Por qué?**
Clarifica en qué debes enfocarte y qué puedes delegar/automatizar.

**¿Cómo?**

```markdown
## Key Activities

### Desarrollo de Producto

- Implementar nuevas features (sprints de 2 semanas)
- Mantener integraciones (Jira, GitHub, Playwright)
- Corregir bugs (SLA: críticos en 24h)

### Adquisición de Usuarios

- Publicar contenido técnico (2 posts/semana)
- Participar en comunidades (daily)
- Gestionar free trials

### Operaciones

- Monitoreo de plataforma (24/7 automatizado)
- Soporte al cliente (respuesta en 4h)
- Billing y facturación
```

---

### Paso 10: Identifica Key Partners (Bloque 8)

**¿Qué hacer?**
Lista alianzas estratégicas necesarias.

**¿Por qué?**
No puedes hacer todo solo. Los partners extienden capacidades.

**¿Cómo?**

Tipos de partnerships:

| Tipo             | Propósito            | Ejemplo          |
| ---------------- | -------------------- | ---------------- |
| **Proveedor**    | Recursos necesarios  | AWS, Stripe      |
| **Integración**  | Conectar ecosistemas | Jira, GitHub     |
| **Distribución** | Alcanzar usuarios    | Marketplaces     |
| **Contenido**    | Credibilidad         | Influencers tech |

```markdown
## Key Partners

| Partner           | Tipo        | Valor que aporta         |
| ----------------- | ----------- | ------------------------ |
| Vercel            | Proveedor   | Hosting, deployment      |
| Supabase          | Proveedor   | Database, auth           |
| Atlassian         | Integración | Acceso a usuarios Jira   |
| Stripe            | Proveedor   | Pagos                    |
| Testing community | Contenido   | Early adopters, feedback |
```

---

### Paso 11: Calcula Cost Structure (Bloque 9)

**¿Qué hacer?**
Estima los costos principales de operar.

**¿Por qué?**
Necesitas saber cuánto cuesta entregar valor para calcular viabilidad.

**¿Cómo?**

```markdown
## Cost Structure

### Costos Fijos (mensuales)

| Concepto       | Costo  | Notas                 |
| -------------- | ------ | --------------------- |
| Salarios       | $X     | Founders, empleados   |
| Hosting        | $200   | Vercel Pro + Supabase |
| Herramientas   | $300   | GitHub, Figma, etc.   |
| Marketing      | $500   | Ads, herramientas     |
| **Total fijo** | **$X** |                       |

### Costos Variables

| Concepto             | Costo por unidad |
| -------------------- | ---------------- |
| Bandwidth            | $0.10/GB         |
| Storage              | $0.02/GB/mes     |
| Transacciones Stripe | 2.9% + $0.30     |

### Break-even

Para cubrir costos fijos de $X/mes, necesitamos:

- X usuarios Pro ($29) o
- X usuarios Team ($99)
```

---

### Paso 12: Escribe las MVP Hypotheses

**¿Qué hacer?**
Define 3 hipótesis que validarás con el MVP.

**¿Por qué?**
El MVP existe para aprender. Sin hipótesis claras, no sabes qué estás validando.

**¿Cómo?**

Usa el formato:

```
Creemos que [SEGMENTO] pagará por [SOLUCIÓN]
porque [RAZÓN].
Sabremos que es cierto cuando [MÉTRICA MEDIBLE].
```

**Ejemplo:**

```markdown
## MVP Hypotheses

### Hipótesis 1: Demanda

Creemos que QA Engineers adoptarán una herramienta de generación de tests
porque reduce significativamente el tiempo de diseño.
**Validación:** 100 signups en los primeros 30 días.

### Hipótesis 2: Valor

Creemos que usuarios activos reducirán tiempo de testing en 50%+
porque la generación asistida elimina tareas repetitivas.
**Validación:** Encuesta post-uso con NPS > 40.

### Hipótesis 3: Monetización

Creemos que 5% de usuarios free convertirán a Pro
porque las features premium resuelven problemas reales de equipos.
**Validación:** Tasa de conversión free→paid ≥ 3% en 90 días.
```

---

### Paso 13: Revisa y consolida

**¿Qué hacer?**
Revisa todo el documento y asegura coherencia.

**¿Por qué?**
Los 9 bloques deben conectar entre sí. Si algo no cuadra, hay un problema en el modelo.

**¿Cómo?**

Hazte estas preguntas:

```
┌────────────────────────────────────────────────────────────────┐
│                    VALIDACIÓN DE COHERENCIA                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Value Prop ←→ Customer Segments                               │
│  ¿La propuesta de valor resuelve los pain points              │
│   de cada segmento específico?                                 │
│                                                                │
│  Channels ←→ Customer Segments                                 │
│  ¿Los canales elegidos son donde están tus usuarios?          │
│                                                                │
│  Revenue ←→ Value Prop                                         │
│  ¿Los clientes pagarán por este valor?                        │
│                                                                │
│  Key Resources ←→ Key Activities                               │
│  ¿Tienes los recursos para ejecutar las actividades?          │
│                                                                │
│  Cost Structure ←→ Revenue Streams                             │
│  ¿Los ingresos cubren los costos? ¿Es rentable?               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 📋 Checklist Final

Antes de continuar a la siguiente fase, verifica:

- [ ] El archivo `.context/idea/business-model.md` existe
- [ ] Problem Statement es claro y específico (2-3 párrafos)
- [ ] Customer Segments incluye 2-3 segmentos con pain points
- [ ] Value Proposition explica el diferenciador para cada segmento
- [ ] Los 9 bloques del canvas están completos
- [ ] Revenue Streams incluye precios específicos
- [ ] Cost Structure tiene estimaciones numéricas
- [ ] Hay 3 MVP Hypotheses con métricas de validación
- [ ] El modelo es coherente (todos los bloques conectan)

---

## 📚 Template Final

Copia esta estructura a tu archivo `.context/idea/business-model.md`:

```markdown
# Business Model - [Nombre del Proyecto]

**Fecha:** [YYYY-MM-DD]
**Versión:** 1.0
**Autor:** [Tu nombre]

---

## Problem Statement

[2-3 párrafos describiendo el problema]

---

## Customer Segments

### Segmento 1: [Nombre]

- **Perfil:** [...]
- **Objetivo:** [...]
- **Pain Points:** [...]

### Segmento 2: [Nombre]

[...]

---

## Value Propositions

### Para [Segmento 1]

[...]

### Para [Segmento 2]

[...]

---

## Channels

| Fase | Canal | Descripción |
| ---- | ----- | ----------- |
| ...  | ...   | ...         |

---

## Customer Relationships

[...]

---

## Revenue Streams

| Tier | Precio | Incluye |
| ---- | ------ | ------- |
| ...  | ...    | ...     |

---

## Key Resources

[...]

---

## Key Activities

[...]

---

## Key Partners

| Partner | Tipo | Valor |
| ------- | ---- | ----- |
| ...     | ...  | ...   |

---

## Cost Structure

### Costos Fijos

| Concepto | Costo |
| -------- | ----- |
| ...      | ...   |

### Costos Variables

[...]

---

## MVP Hypotheses

### Hipótesis 1: [Nombre]

[...]

### Hipótesis 2: [Nombre]

[...]

### Hipótesis 3: [Nombre]

[...]

---

**Siguiente paso:** Crear market-context.md (Fase 1.2)
```

---

## 🎓 Recursos Adicionales

- [Business Model Canvas - Strategyzer](https://strategyzer.com/canvas/business-model-canvas) - El original
- [Lean Canvas - Ash Maurya](https://leanstack.com/lean-canvas) - Variante para startups
- [Value Proposition Canvas](https://strategyzer.com/canvas/value-proposition-canvas) - Deep-dive en propuesta de valor

---

## ❓ Preguntas Frecuentes

**P: ¿Cuánto tiempo debería tomar esto?**
R: 45-90 minutos para un primer draft. Puedes iterar después.

**P: ¿Necesito datos exactos de mercado?**
R: No para el MVP. Estimaciones educadas están bien. Valida después.

**P: ¿Qué pasa si mi modelo cambia después?**
R: Es esperado. El canvas es un documento vivo. Actualízalo cuando aprendas.

**P: ¿Puedo tener múltiples value propositions?**
R: Sí, pero para el MVP enfócate en 1-2. No intentes resolver todo.

---

**Siguiente manual:** `market-context.MANUAL.md` - Análisis de mercado y competencia
