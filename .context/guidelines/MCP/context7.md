# Context7 MCP

> **Tipo**: Documentación Oficial
> **Roles**: DEV, QA, TAE

---

## Cuándo Usar

- Necesitas documentación OFICIAL de bibliotecas
- Quieres ver ejemplos de uso de una librería
- Verificar API de framework (Next.js, React, etc.)
- Sintaxis correcta de una función/método

---

## Ejemplos de Uso

### Planning (Fase 6)

```
"¿Cómo implementar server actions en Next.js 14?"
"¿Cuál es la API de React Hook Form?"
"¿Cómo configurar Zod para validación?"
```

### Implementation (Fase 7)

```
"¿Cómo usar useEffect con cleanup?"
"Dame un ejemplo de uso de Playwright locators"
"¿Cómo hacer redirect en Next.js App Router?"
```

### Test Automation (Fase 12)

```
"¿Cuál es la sintaxis de expect en Playwright?"
"¿Cómo hacer mock de fetch en Vitest?"
```

---

## NO Usar Para

- ❌ Preguntas sobre tu código específico
- ❌ Debugging (usa IDE diagnostics)
- ❌ Búsquedas en foros (usa Tavily)
- ❌ Problemas específicos de versiones

---

## Context7 vs Tavily

| Pregunta                          | Usar     |
| --------------------------------- | -------- |
| "¿Cómo usar useState?"            | Context7 |
| "Error hydration mismatch"        | Tavily   |
| "¿Playwright tiene retry?"        | Context7 |
| "Best practices folder structure" | Tavily   |

**Regla**: Context7 para **"cómo usar"**, Tavily para **"cómo resolver"**.

---

## Tips

1. **Específico > Genérico**: "Next.js 14 App Router redirect" es mejor que "redirect en Next"
2. **Incluye versión**: Si la sintaxis cambió entre versiones, especifica cuál
3. **Framework primero**: "React useEffect cleanup" no "useEffect cleanup"

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js backend   # Incluye context7
node scripts/mcp-builder.js frontend  # Incluye context7
node scripts/mcp-builder.js uitest    # Incluye context7
```

---

**Última actualización**: 2025-12-21
