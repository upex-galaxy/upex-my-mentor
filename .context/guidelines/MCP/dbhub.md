# DBHub MCP

> **Tipo**: Database Testing (SQL)
> **Roles**: QA, TAE

---

## Cuándo Usar

- Verificar datos creados por API/UI
- Ejecutar queries SQL directamente
- Validar constraints y triggers
- Testing de integridad de datos
- Preparar/limpiar datos de prueba

---

## Ejemplos de Uso

### Data Verification (Fase 10)

```
"Verifica que la orden abc123 existe con status 'paid'"
"¿Cuántos usuarios hay por rol?"
"Muestra las órdenes creadas hoy"
```

### Constraint Testing

```
"Verifica que no hay órdenes huérfanas (sin usuario)"
"¿El trigger de cálculo de total funciona?"
"¿Hay reviews con rating fuera de rango 1-5?"
```

### Data Setup/Cleanup

```
"Crea un usuario de prueba con email test@example.com"
"Elimina las órdenes de prueba de hoy"
"Inserta productos de prueba para testing"
```

---

## NO Usar Para

- ❌ Modificar datos en producción
- ❌ Ejecutar migraciones (usa Supabase MCP)
- ❌ Cambiar schema (usa migraciones)

---

## Ventaja: Rol `qa_team`

El MCP conecta con rol `qa_team` que tiene **RLS bypassed**:

- ✅ Ve todos los datos sin restricciones
- ✅ Puede verificar datos de cualquier usuario
- ✅ Crea/modifica datos de prueba libremente

---

## Complementa con OpenAPI y Postman

| DBHub                 | OpenAPI           | Postman             |
| --------------------- | ----------------- | ------------------- |
| Verifica datos en DB  | Requests a API    | Flujos autenticados |
| SQL directo           | Via spec OpenAPI  | Con colecciones     |
| Post-API verification | Quick exploration | Full test suites    |

---

## Tips

1. **SELECT antes de modificar**: Siempre verifica qué vas a cambiar
2. **Transacciones para tests**: `BEGIN; ...test...; ROLLBACK;`
3. **Documenta queries**: Para reproducibilidad de bugs

---

## Documentación Detallada

Ver `docs/testing/database-guide/mcp-dbhub.md` para configuración y patrones SQL.

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js dbtest    # Incluye dbhub
node scripts/mcp-builder.js qatest    # Incluye dbhub
```

---

**Última actualización**: 2025-12-26
