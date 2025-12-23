# Sentry MCP

> **Tipo**: Error Monitoring
> **Roles**: DEV, TAE

---

## Cuándo Usar

- Investigar errores en producción
- Ver stack traces de bugs reportados
- Analizar frecuencia de errores
- Crear tests para reproducir errores
- Monitorear performance issues
- Verificar si un bug ya fue reportado

---

## Ejemplos de Uso

### Implementation (Fase 7)

```
"¿Qué errores se están reportando en production?"
"Dame el stack trace del error más frecuente"
"¿Cuántas veces ha ocurrido el error SENTRY-ABC123?"
```

### Test Automation (Fase 12)

```
"Crea un test para reproducir el error SENTRY-XYZ"
"¿Qué usuarios están afectados por este error?"
"Muestra los últimos 10 errores de tipo 'TypeError'"
```

### Debugging

```
"¿Este error sigue ocurriendo después del deploy?"
"¿Hay errores relacionados con la feature X?"
```

---

## NO Usar Para

- ❌ Local debugging (usa DevTools)
- ❌ Test errors (usa Playwright trace viewer)
- ❌ Build errors (usa logs de CI/CD)

---

## Trazabilidad de Bugs

1. **Ver errores reportados** en tiempo real
2. **Analizar patrones** de errores
3. **Priorizar fixes** basado en frecuencia
4. **Verificar resolución** post-deploy

---

## Tips

1. **Frecuencia primero**: Los errores más frecuentes tienen prioridad
2. **Usuarios afectados**: Considera el impacto, no solo la cantidad
3. **Reproducir antes de fix**: Crea test case del error

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js debug     # Incluye sentry
node scripts/mcp-builder.js monitor   # Incluye sentry
```

---

**Última actualización**: 2025-12-21
