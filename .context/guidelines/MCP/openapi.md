# OpenAPI MCP

> **Tipo**: API Testing (via spec)
> **Roles**: QA, TAE

---

## Cuándo Usar

- Explorar endpoints directamente desde el spec OpenAPI
- Ejecutar requests rápidos sin configurar colecciones
- Validar respuestas contra el schema
- Testing exploratorio de API sin autenticación

---

## Ejemplos de Uso

### Exploratory Testing (Fase 10)

```
"Lista todos los productos de la categoría electronics"
"Muéstrame las reviews del producto abc123"
"¿Cuántas órdenes hay con status pending?"
```

### Schema Exploration

```
"¿Qué endpoints tiene la API?"
"¿Cuál es el schema de respuesta de /products?"
"¿Qué campos son requeridos para crear un usuario?"
```

### Quick Verification

```
"Verifica que GET /products retorna 200"
"¿Qué retorna el endpoint /health?"
```

---

## NO Usar Para

- ❌ Operaciones autenticadas como usuario específico
- ❌ Testing de RLS policies por usuario (usa dbhub)
- ❌ Flujos complejos multi-request (usa Postman)

---

## Complementa con Postman y DBHub

| OpenAPI              | Postman              | DBHub                 |
| -------------------- | -------------------- | --------------------- |
| Requests rápidos     | Colecciones de tests | Verificación de datos |
| Exploración via spec | Flujos autenticados  | SQL directo           |
| Sin auth de usuario  | Con JWT de usuario   | Bypassa RLS           |

---

## Tips

1. **Solo anon_key**: El MCP usa anon_key, no simula usuarios
2. **Para auth**: Usa Postman MCP con environments
3. **Verificar datos**: Combina con DBHub para verificar en DB

---

## Documentación Detallada

Ver `docs/testing/api-guide/mcp-testing.md` para configuración y ejemplos avanzados.

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js apitest   # Incluye openapi
node scripts/mcp-builder.js backend   # Incluye openapi
```

---

**Última actualización**: 2025-12-26
