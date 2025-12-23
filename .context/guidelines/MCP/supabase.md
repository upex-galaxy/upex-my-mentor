# Supabase MCP

> **Tipo**: Database
> **Roles**: DEV, TAE

---

## Cuándo Usar

- Necesitas schema real de base de datos
- Quieres ver datos de ejemplo
- Verificar relaciones entre tablas
- Conocer constraints, indexes, policies

---

## Ejemplos de Uso

### Planning (Fase 6)

```
"¿Qué columnas tiene la tabla users?"
"¿Cuál es la relación entre users y orders?"
"Dame el schema de la tabla profiles"
```

### Implementation (Fase 7)

```
"Dame un ejemplo de row de la tabla products"
"¿Qué policies RLS tiene la tabla profiles?"
"¿Qué tipo de dato es el campo 'metadata'?"
```

### Debugging

```
"¿Hay datos en la tabla sessions?"
"¿Cuáles son los constraints de esta tabla?"
```

---

## NO Usar Para

- ❌ Operaciones que modifican datos (solo lectura)
- ❌ Consultas complejas (usa tu DB client directamente)
- ❌ Migraciones (usa Supabase CLI)

---

## Tips

1. **Schema real > Docs estáticos**: Siempre pregunta al MCP, el schema puede haber cambiado
2. **Verifica relaciones**: Antes de crear JOINs, confirma las foreign keys
3. **Policies RLS**: Siempre verifica qué policies aplican

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js backend
# Incluye: supabase + context7 + tavily
```

---

**Última actualización**: 2025-12-21
