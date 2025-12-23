# Tavily MCP

> **Tipo**: Web Search
> **Roles**: DEV, QA, TAE

---

## Cuándo Usar

- Buscar soluciones a problemas técnicos
- Investigar errores específicos (Stack Overflow, GitHub issues)
- Comparar tecnologías/bibliotecas
- Buscar best practices recientes
- Encontrar discusiones en foros (Reddit, dev.to, etc.)
- Investigar bugs conocidos de bibliotecas

---

## Ejemplos de Uso

### Planning

```
"Busca best practices para estructurar folders en Next.js 15"
"¿Cómo manejan otros proyectos la autenticación con Supabase?"
"Compara Zod vs Yup para validación"
```

### Implementation

```
"Busca soluciones al error 'Cannot read property of undefined'"
"¿Qué dicen en Stack Overflow sobre optimizar Playwright tests?"
"Investiga si hay issues conocidos con React 19 y Zustand"
```

### Debugging

```
"Error: hydration mismatch en Next.js - soluciones"
"¿Por qué Supabase Auth no funciona con SSR?"
"Busca el issue de GitHub para este error"
```

---

## NO Usar Para

- ❌ Docs oficiales (usa Context7)
- ❌ Código de tu proyecto (lee archivos locales)
- ❌ Información de tu DB (usa Supabase MCP)

---

## Tavily vs Context7

| Escenario                  | Context7 | Tavily |
| -------------------------- | -------- | ------ |
| "¿Cómo usar useState?"     | ✅       | ❌     |
| "Error hydration mismatch" | ❌       | ✅     |
| "Docs de Playwright"       | ✅       | ❌     |
| "Best practices testing"   | ❌       | ✅     |
| "Bugs conocidos de lib X"  | ❌       | ✅     |

**Regla**: Context7 para **"cómo usar"**, Tavily para **"cómo resolver"**.

---

## Casos de Uso Únicos

- Buscar en GitHub issues de bibliotecas
- Investigar discusiones en Reddit/dev.to
- Encontrar posts de blogs técnicos
- Buscar comparaciones de tecnologías
- Investigar problemas específicos de versiones

---

## Tips

1. **Específico > Genérico**: Incluye versiones, frameworks, contexto
2. **Error exacto**: Copia el mensaje de error completo
3. **Fuente preferida**: "site:stackoverflow.com" si quieres SO específicamente

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js backend   # Incluye tavily
node scripts/mcp-builder.js frontend  # Incluye tavily
node scripts/mcp-builder.js uitest    # Incluye tavily
node scripts/mcp-builder.js debug     # Incluye tavily
```

---

**Última actualización**: 2025-12-21
