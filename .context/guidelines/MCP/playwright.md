# Playwright MCP

> **Tipo**: E2E Testing
> **Roles**: TAE, QA

---

## Cuándo Usar

- Generar tests E2E automatizados
- Crear Page Object Models
- Simular interacciones de usuario
- Explorar la aplicación de manera automatizada

---

## Ejemplos de Uso

### Test Automation (Fase 12)

```
"Genera un test E2E para el flujo de login"
"Crea un Page Object para la página de checkout"
"Simula el llenado de formulario de registro"
```

### Exploratory Testing (Fase 10)

```
"Navega a la página de productos y lista los elementos"
"Verifica que el botón de submit está visible"
"Captura screenshot de la página de error"
```

### Debugging

```
"Ejecuta el test y muestra el trace"
"¿Qué elementos tienen data-testid en esta página?"
```

---

## NO Usar Para

- ❌ Unit tests (usa Jest/Vitest directamente)
- ❌ Integration tests simples de API
- ❌ Tests que no involucran UI

---

## Complementa con DevTools

| Playwright          | DevTools            |
| ------------------- | ------------------- |
| Ejecuta tests       | Debug cuando fallan |
| Interactúa con UI   | Inspecciona network |
| Captura screenshots | Analiza console     |

---

## Tips

1. **data-testid primero**: Siempre usa data-testid para selectores
2. **Waits explícitos**: Usa `waitFor` en vez de delays
3. **Assertions claras**: Un expect por concepto

---

## Integración con KATA

Ver `../TAE/kata-architecture.md` para cómo Playwright se integra con el framework KATA.

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js uitest    # Incluye playwright
node scripts/mcp-builder.js frontend  # Incluye playwright
```

---

**Última actualización**: 2025-12-21
