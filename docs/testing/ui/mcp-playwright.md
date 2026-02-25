# UI Testing con Playwright MCP

Esta guia explica como configurar y usar el **Playwright MCP Server oficial** de Microsoft para testing de UI asistido por IA.

---

## Que es Playwright MCP?

El **Playwright MCP Server** conecta herramientas de IA con un navegador real, permitiendo:

- Automatizacion de navegacion y clicks
- Captura de snapshots de accesibilidad (sin necesidad de vision)
- Llenado de formularios y validacion
- Capturas de pantalla y PDFs
- Manejo de tabs y dialogs
- Generacion de locators para tests

**Caracteristicas clave:**

| Caracteristica      | Descripcion                                                  |
| ------------------- | ------------------------------------------------------------ |
| **Rapido y ligero** | Usa el arbol de accesibilidad, no capturas de pantalla       |
| **LLM-friendly**    | No requiere modelos de vision, opera con datos estructurados |
| **Determinista**    | Evita ambiguedades de enfoques basados en screenshots        |

---

## Requisitos

- Node.js 18 o superior
- Un cliente MCP (Claude Code, VS Code, Cursor, etc.)
- Navegador compatible (Chrome, Firefox, WebKit, Edge)

---

## Configuracion

### Claude Code

**Agregar via CLI (Recomendado):**

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

**Configuracion manual en `.mcp.json`:**

```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

**Configuracion con capacidades adicionales:**

```json
{
  "playwright": {
    "command": "npx",
    "args": [
      "@playwright/mcp@latest",
      "--caps",
      "vision,pdf,testing,tracing,tabs",
      "--timeout-action",
      "10000",
      "--timeout-navigation",
      "30000",
      "--viewport-size",
      "1920x1080"
    ]
  }
}
```

### VS Code (Copilot)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Cursor

Ve a `Cursor Settings` -> `MCP` -> `Add new MCP Server`:

- Nombre: `playwright`
- Tipo: `command`
- Comando: `npx @playwright/mcp@latest`

### Gemini CLI

```bash
gemini mcp add playwright npx @playwright/mcp@latest
```

---

## Capacidades (--caps)

El MCP soporta diferentes capacidades que se activan via `--caps`:

| Capacidad | Tools adicionales                                 | Descripcion                   |
| --------- | ------------------------------------------------- | ----------------------------- |
| `vision`  | `browser_mouse_click_xy`, `browser_mouse_drag_xy` | Interacciones por coordenadas |
| `pdf`     | `browser_pdf_save`                                | Generacion de PDFs            |
| `testing` | `browser_generate_locator`, `browser_verify_*`    | Aserciones de test            |
| `tracing` | `browser_start_tracing`, `browser_stop_tracing`   | Grabacion de traces           |
| `tabs`    | `browser_tabs`                                    | Gestion de pestanas           |

Ejemplo activando todas:

```json
{
  "args": ["@playwright/mcp@latest", "--caps", "vision,pdf,testing,tracing,tabs"]
}
```

---

## Opciones de Configuracion

| Opcion                  | Descripcion                                      | Ejemplo                                 |
| ----------------------- | ------------------------------------------------ | --------------------------------------- |
| `--browser`             | Navegador a usar                                 | `chrome`, `firefox`, `webkit`, `msedge` |
| `--headless`            | Ejecutar sin interfaz grafica                    | `--headless`                            |
| `--viewport-size`       | Tamano de ventana                                | `1920x1080`                             |
| `--timeout-action`      | Timeout para acciones (ms)                       | `10000`                                 |
| `--timeout-navigation`  | Timeout para navegacion (ms)                     | `30000`                                 |
| `--user-data-dir`       | Directorio de perfil del navegador               | `/path/to/profile`                      |
| `--isolated`            | Usar perfil temporal (no persistente)            | `--isolated`                            |
| `--storage-state`       | Cargar estado de storage (cookies, localStorage) | `path/to/storage.json`                  |
| `--proxy-server`        | Servidor proxy                                   | `http://proxy:3128`                     |
| `--ignore-https-errors` | Ignorar errores de certificados                  | `--ignore-https-errors`                 |
| `--save-trace`          | Guardar trace de la sesion                       | `--save-trace`                          |
| `--save-video`          | Grabar video de la sesion                        | `--save-video=1280x720`                 |

---

## Herramientas Disponibles

### Core Automation

| Herramienta             | Descripcion                                     |
| ----------------------- | ----------------------------------------------- |
| `browser_navigate`      | Navegar a una URL                               |
| `browser_navigate_back` | Volver a la pagina anterior                     |
| `browser_snapshot`      | Capturar snapshot de accesibilidad de la pagina |
| `browser_click`         | Click en un elemento                            |
| `browser_type`          | Escribir texto en un campo                      |
| `browser_fill_form`     | Llenar multiples campos de formulario           |
| `browser_select_option` | Seleccionar opcion en dropdown                  |
| `browser_hover`         | Hover sobre un elemento                         |
| `browser_drag`          | Arrastrar entre dos elementos                   |
| `browser_press_key`     | Presionar una tecla                             |
| `browser_file_upload`   | Subir archivos                                  |
| `browser_handle_dialog` | Manejar dialogs (alert, confirm, prompt)        |
| `browser_wait_for`      | Esperar por texto o tiempo                      |
| `browser_resize`        | Redimensionar ventana del navegador             |
| `browser_close`         | Cerrar el navegador                             |

### Debugging

| Herramienta                | Descripcion                      |
| -------------------------- | -------------------------------- |
| `browser_take_screenshot`  | Capturar screenshot de la pagina |
| `browser_console_messages` | Obtener mensajes de consola      |
| `browser_network_requests` | Listar requests de red           |
| `browser_evaluate`         | Ejecutar JavaScript en la pagina |
| `browser_run_code`         | Ejecutar codigo Playwright       |

### Tab Management (--caps=tabs)

| Herramienta    | Descripcion                              |
| -------------- | ---------------------------------------- |
| `browser_tabs` | Listar, crear, cerrar o seleccionar tabs |

### Vision (--caps=vision)

| Herramienta              | Descripcion                      |
| ------------------------ | -------------------------------- |
| `browser_mouse_click_xy` | Click en coordenadas especificas |
| `browser_mouse_move_xy`  | Mover mouse a coordenadas        |
| `browser_mouse_drag_xy`  | Arrastrar entre coordenadas      |

### PDF (--caps=pdf)

| Herramienta        | Descripcion             |
| ------------------ | ----------------------- |
| `browser_pdf_save` | Guardar pagina como PDF |

### Testing (--caps=testing)

| Herramienta                      | Descripcion                       |
| -------------------------------- | --------------------------------- |
| `browser_generate_locator`       | Generar locator para un elemento  |
| `browser_verify_element_visible` | Verificar que elemento es visible |
| `browser_verify_text_visible`    | Verificar que texto es visible    |
| `browser_verify_list_visible`    | Verificar que lista es visible    |
| `browser_verify_value`           | Verificar valor de un elemento    |

### Tracing (--caps=tracing)

| Herramienta             | Descripcion                |
| ----------------------- | -------------------------- |
| `browser_start_tracing` | Iniciar grabacion de trace |
| `browser_stop_tracing`  | Detener grabacion de trace |

---

## Casos de Uso para QA

### 1. Explorar una Pagina

```
Usuario: "Explora la pagina de login y dime que elementos hay"

IA ejecutara:
1. browser_navigate("https://miapp.com/login")
2. browser_snapshot()
3. Analizar y reportar:
   - Campos: email, password
   - Botones: submit, forgot password
   - Links: register
```

### 2. Probar un Formulario

```
Usuario: "Prueba el formulario de registro con datos validos"

IA ejecutara:
1. browser_navigate("/register")
2. browser_snapshot() → identificar campos
3. browser_fill_form({
     fields: [
       { element: "Name field", ref: "name", value: "Test User" },
       { element: "Email field", ref: "email", value: "test@example.com" },
       { element: "Password field", ref: "password", value: "Password123!" }
     ]
   })
4. browser_click({ element: "Submit button", ref: "submit" })
5. browser_snapshot() → verificar resultado
6. browser_take_screenshot() → evidencia
```

### 3. Verificar Errores de Validacion

```
Usuario: "Verifica que muestra error con email invalido"

IA ejecutara:
1. browser_navigate("/register")
2. browser_type({ element: "Email", ref: "email", text: "invalid-email" })
3. browser_click({ element: "Submit", ref: "submit" })
4. browser_snapshot() → buscar mensaje de error
5. Reportar si el error es visible y claro
```

### 4. Flujo de Compra Completo

```
Usuario: "Simula el flujo completo de checkout"

IA ejecutara:
1. browser_navigate("/products")
2. browser_click en producto
3. browser_click en "Add to Cart"
4. browser_navigate("/cart")
5. browser_click en "Checkout"
6. browser_fill_form con datos de shipping
7. browser_take_screenshot en cada paso
8. browser_click en "Place Order"
9. browser_verify_text_visible("Order confirmed")
```

### 5. Generar Locators para Automatizacion

```
Usuario: "Genera los locators para el boton de login"

IA ejecutara:
1. browser_navigate("/login")
2. browser_snapshot()
3. browser_generate_locator({ element: "Login button", ref: "login" })

Resultado: getByRole('button', { name: 'Login' })
```

---

## Modos de Perfil

### Persistente (por defecto)

El navegador guarda cookies, localStorage y sesiones entre ejecuciones:

```json
{
  "args": ["@playwright/mcp@latest"]
}
```

Ubicacion del perfil:

- Linux: `~/.cache/playwright-mcp/`
- macOS: `~/Library/Caches/playwright-mcp/`
- Windows: `%LOCALAPPDATA%\playwright-mcp\`

### Aislado

Cada sesion inicia limpia, sin datos previos:

```json
{
  "args": ["@playwright/mcp@latest", "--isolated"]
}
```

### Con Estado Inicial

Cargar cookies/storage de un archivo:

```json
{
  "args": ["@playwright/mcp@latest", "--isolated", "--storage-state=path/to/storage.json"]
}
```

---

## Extension del Navegador

El Playwright MCP tiene una extension de Chrome que permite conectarse a tabs existentes:

1. Instalar la extension desde el directorio `extension/` del repo
2. Configurar el MCP con `--extension`

Esto permite usar sesiones ya logueadas en el navegador real.

---

## Docker

Para ambientes sin display o CI/CD:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "--init", "--pull=always", "mcr.microsoft.com/playwright/mcp"]
    }
  }
}
```

**Nota:** Solo soporta Chromium headless en Docker.

---

## Integracion con Testing Framework

### Generar Tests desde Exploracion

```
Usuario: "Explora el login y genera un test de Playwright"

IA ejecutara:
1. Explorar con browser_snapshot
2. Identificar flujo
3. Usar browser_generate_locator para cada elemento
4. Generar codigo de test

Resultado:
test('login flow', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

---

## Mejores Practicas

### DO

- Usar `browser_snapshot` antes de interactuar (entender la estructura)
- Capturar screenshots como evidencia en puntos clave
- Usar `--isolated` para tests que requieren estado limpio
- Activar `--caps=testing` para usar aserciones
- Guardar traces con `--save-trace` para debugging

### DON'T

- No usar coordenadas (vision) a menos que sea necesario
- No asumir que elementos existen sin verificar snapshot
- No ignorar mensajes de consola (pueden indicar errores)
- No usar timeouts muy cortos en conexiones lentas

---

## Troubleshooting

### Error: "Browser not installed"

```
Usuario: "browser_install"

IA ejecutara:
browser_install() → Instala el navegador automaticamente
```

### Error: Timeout en navegacion

Aumentar el timeout:

```json
{
  "args": ["@playwright/mcp@latest", "--timeout-navigation", "60000"]
}
```

### Error: "Element not found"

1. Ejecutar `browser_snapshot` para ver estructura actual
2. Verificar que el `ref` es correcto
3. Usar `browser_wait_for` si el elemento carga asincronamente

---

## Recursos Adicionales

- [Playwright MCP - GitHub](https://github.com/microsoft/playwright-mcp)
- [Playwright MCP - NPM](https://www.npmjs.com/package/@playwright/mcp)
- [Playwright Documentation](https://playwright.dev/docs/intro)

---

## Siguiente Paso

Para debugging avanzado con DevTools:
--> [mcp-devtools.md](./mcp-devtools.md)

Para tecnicas de exploracion:
--> [exploratory-ui-testing.md](./exploratory-ui-testing.md)
