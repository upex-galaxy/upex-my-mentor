# Regression Execution

> **Fase**: 1 de 3 (Execution → Analysis → Report)
> **Propósito**: Ejecutar suite de tests y monitorear hasta completar.
> **Output**: Run ID, status, duración, URLs de reportes.

---

## Input Requerido

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PARÁMETROS DE EJECUCIÓN                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Suite Type:    [ ] regression   [ ] smoke   [ ] sanity                      │
│                                                                             │
│ Environment:   [ ] local        [ ] staging                                 │
│                                                                             │
│ Options:                                                                    │
│   Video Recording:    [ ] Yes   [x] No                                      │
│   Generate Allure:    [x] Yes   [ ] No                                      │
│                                                                             │
│ Sanity Only:                                                                │
│   Grep Pattern:    _________________________________ (ej: @auth)            │
│   Test File:       _________________________________ (ej: tests/e2e/auth/)  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Ejecución

### Paso 1: Seleccionar y Disparar Workflow

#### Regression (Suite Completa)

```bash
gh workflow run regression.yml \
  -f environment=staging \
  -f video_record=false \
  -f generate_allure=true
```

#### Smoke (Tests Críticos)

```bash
gh workflow run smoke.yml \
  -f environment=staging \
  -f generate_allure=true
```

#### Sanity (Tests Específicos)

```bash
# Por patrón grep
gh workflow run sanity.yml \
  -f environment=staging \
  -f grep="@auth" \
  -f test_type=e2e

# Por archivo específico
gh workflow run sanity.yml \
  -f environment=staging \
  -f test_file="tests/e2e/auth/login.test.ts"
```

---

### Paso 2: Obtener Run ID

Inmediatamente después de disparar:

```bash
# Listar runs más recientes del workflow
gh run list --workflow=regression.yml --limit=1 --json databaseId,status,createdAt

# Output esperado:
# [{"databaseId": 12345678, "status": "in_progress", "createdAt": "2024-..."}]
```

Guardar el `databaseId` como `RUN_ID`.

---

### Paso 3: Monitorear Ejecución

#### Opción A: Watch (Tiempo Real)

```bash
gh run watch <RUN_ID>
```

Esto muestra progreso en tiempo real hasta que termina.

#### Opción B: Polling (Programático)

```bash
# Verificar status cada 30 segundos
while true; do
  STATUS=$(gh run view <RUN_ID> --json status,conclusion --jq '.status')
  echo "Status: $STATUS"
  if [ "$STATUS" = "completed" ]; then
    break
  fi
  sleep 30
done
```

---

### Paso 4: Verificar Resultado

Una vez completado:

```bash
# Ver resumen
gh run view <RUN_ID>

# Ver detalles completos en JSON
gh run view <RUN_ID> --json status,conclusion,jobs,createdAt,updatedAt,url
```

Expected output:

```json
{
  "status": "completed",
  "conclusion": "success | failure | cancelled",
  "jobs": [...],
  "url": "https://github.com/org/repo/actions/runs/12345678"
}
```

---

### Paso 5: Obtener URLs de Reportes

```bash
# URL del Allure Report (si se generó)
echo "Allure: https://{owner}.github.io/{repo}/staging/regression/"

# URL del run en GitHub Actions
gh run view <RUN_ID> --json url --jq '.url'

# Listar artefactos disponibles
gh run view <RUN_ID> --json artifacts --jq '.artifacts[].name'
```

---

## Template de Output

```markdown
## Execution Summary

| Attribute        | Value                       |
| ---------------- | --------------------------- |
| **Run ID**       | {RUN_ID}                    |
| **Workflow**     | regression / smoke / sanity |
| **Environment**  | staging / local             |
| **Status**       | {completed}                 |
| **Conclusion**   | {success / failure}         |
| **Duration**     | {X min Y sec}               |
| **Started At**   | {ISO timestamp}             |
| **Completed At** | {ISO timestamp}             |

## Report URLs

| Report         | URL                       |
| -------------- | ------------------------- |
| GitHub Actions | {run URL}                 |
| Allure Report  | {allure URL if generated} |

## Next Steps

- [ ] If **success**: Verify Allure report looks correct
- [ ] If **failure**: Proceed to `regression-analysis.md` with Run ID
```

---

## Troubleshooting

### Workflow No Se Encuentra

```bash
# Listar workflows disponibles
gh workflow list

# Verificar nombre exacto
gh workflow view regression.yml
```

### Run Se Cancela Inmediatamente

Verificar:

- Branch correcto
- Secrets configurados
- Workflow habilitado en repo

### Timeout Largo

Los regression pueden tomar 15-30 min. Usar `--timeout` si es necesario:

```bash
gh run watch <RUN_ID> --exit-status
```

---

## Siguiente Paso

Una vez que el run complete:

→ **Si success**: Verificar reporte o proceder a siguiente release step
→ **Si failure**: Proceder a `regression-analysis.md` con el Run ID
