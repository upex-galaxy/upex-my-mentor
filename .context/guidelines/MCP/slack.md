# Slack MCP

> **Tipo**: Communication
> **Roles**: DEV, QA, TAE

---

## Cuándo Usar

- Notificar al equipo de cambios importantes
- Enviar reportes de test results
- Comunicar deploys
- Alertas de errores críticos

---

## Ejemplos de Uso

### Test Automation (Fase 12)

```
"Envía reporte de test results al canal #qa"
"Notifica que los E2E tests pasaron"
```

### Implementation (Fase 7)

```
"Notifica en #engineering que el feature está listo"
"Envía resumen del PR al canal de reviews"
```

### Deployment (Fase 13)

```
"Notifica al canal #deploys que se hizo deploy a staging"
"Alerta de rollback necesario"
```

---

## NO Usar Para

- ❌ Conversaciones que requieren respuesta
- ❌ Preguntas al equipo (hazlas directamente)
- ❌ Spam de notificaciones

---

## Tips

1. **Canal correcto**: Cada tipo de notificación a su canal
2. **Conciso**: Mensaje claro y directo
3. **Actionable**: Incluye links relevantes

---

## Canales Típicos

| Canal        | Propósito                |
| ------------ | ------------------------ |
| #engineering | Updates de desarrollo    |
| #qa          | Reportes de testing      |
| #deploys     | Notificaciones de deploy |
| #alerts      | Errores críticos         |

---

## Perfil MCP Builder

```bash
node scripts/mcp-builder.js notify    # Incluye slack
node scripts/mcp-builder.js cicd      # Incluye slack
```

---

**Última actualización**: 2025-12-21
