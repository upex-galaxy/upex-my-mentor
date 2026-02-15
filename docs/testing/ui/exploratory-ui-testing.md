# Exploratory UI Testing con IA

Guia para realizar testing exploratorio de UI asistido por IA usando Playwright MCP.

---

## Proposito

El testing exploratorio de UI permite:

- Validar experiencia de usuario de forma rapida
- Descubrir problemas de UX antes de automatizar
- Documentar hallazgos con screenshots
- Identificar candidatos para automatizacion

---

## Prerequisitos

- Aplicacion desplegada en staging (o localhost)
- Playwright MCP configurado y conectado
- DevTools MCP (opcional, para debugging)

---

## Herramientas MCP

### Playwright MCP

| Herramienta                                | Uso                               |
| ------------------------------------------ | --------------------------------- |
| `mcp__playwright__browser_navigate`        | Navegar a una URL                 |
| `mcp__playwright__browser_snapshot`        | Obtener estructura de la pagina   |
| `mcp__playwright__browser_click`           | Click en elementos                |
| `mcp__playwright__browser_type`            | Escribir en campos                |
| `mcp__playwright__browser_take_screenshot` | Capturar screenshot               |
| `mcp__playwright__browser_select_option`   | Seleccionar opciones en dropdowns |
| `mcp__playwright__browser_hover`           | Hover sobre elementos             |

### DevTools MCP (para debugging)

| Herramienta                           | Uso                     |
| ------------------------------------- | ----------------------- |
| `mcp__devtools__console_get_logs`     | Ver errores en console  |
| `mcp__devtools__network_get_requests` | Ver requests de red     |
| `mcp__devtools__performance_metrics`  | Metricas de performance |

---

## Flujos de Exploracion

### 1. Exploracion de Pagina Nueva

```
Usuario: "Explora la pagina de login y dime que elementos hay"

IA ejecuta:
1. browser_navigate("/login")
2. browser_snapshot()
3. Analiza y reporta:
   - Campos encontrados (email, password)
   - Botones (submit, forgot password)
   - Links (register, help)
   - Validaciones visibles
```

### 2. Testing de Formulario

```
Usuario: "Prueba el formulario de registro con datos validos"

IA ejecuta:
1. browser_navigate("/register")
2. browser_snapshot() → identificar campos
3. browser_type en cada campo:
   - name: "Test User"
   - email: "test@example.com"
   - password: "Password123!"
4. browser_click en submit
5. browser_snapshot() → verificar resultado
6. browser_take_screenshot() → evidencia
```

### 3. Navegacion de Flujo

```
Usuario: "Simula el flujo completo de compra"

IA ejecuta:
1. browser_navigate("/products")
2. browser_click en producto
3. browser_click en "Add to Cart"
4. browser_navigate("/cart")
5. browser_click en "Checkout"
6. browser_type en campos de shipping
7. browser_click en "Place Order"
8. browser_take_screenshot() en cada paso
```

### 4. Verificacion de Errores

```
Usuario: "Verifica que muestra error con email invalido"

IA ejecuta:
1. browser_navigate("/register")
2. browser_type("invalid-email", campo email)
3. browser_click en submit
4. browser_snapshot() → buscar mensaje de error
5. Reportar si el error es visible y claro
```

---

## Tecnicas de Exploracion

### Happy Path

Probar el flujo principal esperado:

```markdown
Escenario: Usuario hace login exitoso

1. Navegar a /login
2. Ingresar email valido
3. Ingresar password valido
4. Click en Submit
   ✓ Resultado: Redirect a dashboard
   ✓ Usuario ve su nombre en header
```

### Negative Testing

Probar casos de error:

```markdown
Escenarios negativos:

- Email vacio → Mensaje "Email required"
- Password muy corto → Mensaje "Min 8 characters"
- Email invalido → Mensaje "Invalid email format"
- Credenciales incorrectas → Mensaje "Invalid credentials"
```

### Boundary Testing

Probar limites:

| Campo    | Min | Max | Probar             |
| -------- | --- | --- | ------------------ |
| Name     | 2   | 100 | 1 char, 101 chars  |
| Email    | -   | 254 | 255 chars          |
| Password | 8   | 128 | 7 chars, 129 chars |
| Bio      | 0   | 500 | 501 chars          |

### State Testing

Probar diferentes estados:

- Refresh a mitad de formulario
- Back button despues de submit
- Session timeout
- Multiple tabs

---

## Documentacion de Sesion

Durante la exploracion, documentar:

```markdown
## Session Notes - [Feature]

**Fecha:** YYYY-MM-DD
**URL:** [staging URL]
**Duracion:** X minutos

### Escenarios Probados

#### 1. [Escenario] - PASSED/FAILED

- Accion: [lo que hice]
- Esperado: [lo que debia pasar]
- Actual: [lo que paso]
- Screenshot: [nombre del archivo]

### Issues Encontrados

1. **[Titulo del issue]**
   - Severidad: Critical/High/Medium/Low
   - Pasos para reproducir
   - Screenshot de evidencia

### Observaciones

- [UX que funciono bien]
- [Areas de mejora]
- [Candidatos para automatizacion]
```

---

## Checklist de Exploracion

### Antes de Empezar

- [ ] URL de staging accesible
- [ ] Playwright MCP conectado
- [ ] Conocer los Acceptance Criteria
- [ ] Test cases disponibles (si existen)

### Durante la Exploracion

- [ ] Probar happy path primero
- [ ] Probar casos negativos
- [ ] Verificar mensajes de error
- [ ] Capturar screenshots de evidencia
- [ ] Documentar hallazgos en tiempo real
- [ ] Revisar console para errores

### Al Finalizar

- [ ] Resumir hallazgos
- [ ] Clasificar issues por severidad
- [ ] Identificar candidatos para automatizacion
- [ ] Decidir: PASSED o FAILED

---

## Integracion con Workflow QA

```
US Status: Ready For QA
        ↓
[1] Smoke Test (5-10 min)
    └── FAILED? → Report blocker, STOP
        ↓
[2] UI Exploratory Testing (this)
    └── Usar Playwright MCP
    └── Documentar hallazgos
        ↓
[3] API Testing (si aplica)
    └── Verificar backend
        ↓
[4] DB Testing (si aplica)
    └── Verificar datos
        ↓
[5] Bug Report (si hay issues)
        ↓
Decision: PASSED / FAILED
```

---

## Best Practices

### DO

- Explorar con ojos criticos, no solo ejecutar
- Documentar en tiempo real
- Tomar screenshots de todo lo relevante
- Pensar como usuario final
- Verificar responsive (mobile, tablet)
- Revisar console/network para errores ocultos

### DON'T

- No automatizar antes de explorar manualmente
- No ignorar edge cases
- No asumir que funciona sin verificar
- No crear bugs sin confirmar reproducibilidad

---

## Recursos

- `.prompts/fase-10-exploratory-testing/exploratory-test.md` - Prompt detallado
- `.context/guidelines/QA/exploratory-testing.md` - Guidelines completos
- `mcp-playwright.md` - Configuracion del MCP
