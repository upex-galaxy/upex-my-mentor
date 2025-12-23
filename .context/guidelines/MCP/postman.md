# Postman MCP

> **Tipo**: API Testing
> **Roles**: DEV, TAE

---

## Cuándo Usar

- Testear endpoints de API
- Verificar respuestas de API
- Crear colecciones de requests
- Validar contratos de API

---

## Ejemplos de Uso

### Implementation (Fase 7)

```
"Testea el endpoint POST /api/users"
"¿Qué responde GET /api/products/123?"
"Verifica que el endpoint retorna 401 sin auth"
```

### Test Automation (Fase 12)

```
"Crea una colección de Postman para la API de auth"
"Genera tests para validar el schema de respuesta"
"Ejecuta la colección de integration tests"
```

### Debugging

```
"¿Qué headers retorna el endpoint?"
"¿El endpoint acepta este payload?"
```

---

## NO Usar Para

- ❌ Testing de UI (usa Playwright)
- ❌ Load testing (usa herramienta específica)
- ❌ Exploración de UI (usa browser)

---

## Tips

1. **Environments**: Usa variables de environment para URLs
2. **Tests automáticos**: Agrega assertions en cada request
3. **Colecciones organizadas**: Agrupa por feature/dominio

---

## Integración con KATA

Para integration tests en el framework KATA, ver:

- `../TAE/kata-architecture.md`
- `../TAE/api-setup-guide.md`

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js apitest   # Incluye postman
node scripts/mcp-builder.js backend   # Puede incluir postman
```

---

**Última actualización**: 2025-12-21
