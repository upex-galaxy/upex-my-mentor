# Chrome DevTools MCP

> **Tipo**: E2E Debugging
> **Roles**: TAE, DEV

---

## Cuándo Usar

- Debug de tests E2E fallidos
- Inspeccionar network requests durante testing
- Ver console errors en tests
- Performance profiling de aplicación
- Analizar comportamiento del DOM
- Capturar screenshots/videos de tests

---

## Ejemplos de Uso

### Test Automation (Fase 12)

```
"Inspecciona los console errors durante el test de login"
"Captura network requests durante el checkout flow"
"¿Qué recursos se están cargando lentamente?"
```

### Debugging

```
"Analiza el performance de la página de dashboard"
"Muestra los eventos del DOM durante el test"
"¿Hay errores de JavaScript en la consola?"
```

### Investigation

```
"¿Qué requests fallan con 4xx/5xx?"
"¿Cuánto tarda en cargar el bundle principal?"
```

---

## NO Usar Para

- ❌ Unit testing (usa Jest/Vitest)
- ❌ Production debugging (usa Sentry MCP)
- ❌ API testing (usa Postman MCP)

---

## Complementa con Playwright

| Playwright        | DevTools                    |
| ----------------- | --------------------------- |
| Ejecuta tests E2E | Debug cuando tests fallan   |
| Interactúa con UI | Inspecciona network/console |
| Assertions        | Investigación profunda      |

**Workflow típico**:

1. Playwright ejecuta test → falla
2. DevTools inspecciona qué pasó
3. Fix y re-ejecutar

---

## Tips

1. **Console primero**: Los errores de JS suelen estar en console
2. **Network tab**: Verifica que las APIs responden correctamente
3. **Performance**: Identifica bottlenecks de carga

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js uitest  # Incluye devtools
node scripts/mcp-builder.js debug   # Incluye devtools
```

---

**Última actualización**: 2025-12-21
