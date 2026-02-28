# Debugging con Chrome DevTools MCP

Esta guia explica como configurar y usar el **Chrome DevTools MCP Server oficial** de Google para debugging de UI asistido por IA.

---

## Que es Chrome DevTools MCP?

El **Chrome DevTools MCP Server** conecta herramientas de IA con Chrome DevTools, permitiendo:

- Analisis de performance con trazas detalladas
- Inspeccion de requests de red
- Captura de screenshots y snapshots de accesibilidad
- Automatizacion confiable con Puppeteer
- Evaluacion de JavaScript en la pagina
- Monitoreo de mensajes de consola

**Caracteristicas clave:**

| Caracteristica         | Descripcion                                        |
| ---------------------- | -------------------------------------------------- |
| **Performance Traces** | Graba y analiza trazas de rendimiento con insights |
| **Network Debugging**  | Inspecciona requests/responses de red              |
| **Puppeteer Backend**  | Automatizacion confiable con waits automaticos     |
| **Full DevTools**      | Acceso completo al poder de Chrome DevTools        |

---

## Requisitos

- Node.js v20.19 o superior (LTS recomendado)
- Chrome version estable actual o superior
- npm

---

## Configuracion

### Claude Code

**Agregar via CLI (Recomendado):**

```bash
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

**Configuracion manual en `.mcp.json`:**

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest"]
  }
}
```

**Configuracion con opciones adicionales:**

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest", "--headless", "--isolated", "--viewport=1920x1080"]
  }
}
```

### VS Code (Copilot)

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

O via CLI:

```bash
code --add-mcp '{"name":"chrome-devtools","command":"npx","args":["chrome-devtools-mcp@latest"]}'
```

### Cursor

Ve a `Cursor Settings` -> `MCP` -> `New MCP Server`:

- Nombre: `chrome-devtools`
- Tipo: `command`
- Comando: `npx -y chrome-devtools-mcp@latest`

### Gemini CLI

```bash
# Project-wide
gemini mcp add chrome-devtools npx chrome-devtools-mcp@latest

# Global
gemini mcp add -s user chrome-devtools npx chrome-devtools-mcp@latest
```

---

## Opciones de Configuracion

| Opcion                    | Descripcion                                 | Ejemplo                                 |
| ------------------------- | ------------------------------------------- | --------------------------------------- |
| `--headless`              | Ejecutar sin interfaz grafica               | `--headless`                            |
| `--isolated`              | Usar perfil temporal (limpio cada sesion)   | `--isolated`                            |
| `--viewport`              | Tamano inicial de ventana                   | `--viewport=1920x1080`                  |
| `--channel`               | Canal de Chrome a usar                      | `stable`, `canary`, `beta`, `dev`       |
| `--browser-url`           | Conectar a Chrome existente                 | `http://127.0.0.1:9222`                 |
| `--ws-endpoint`           | WebSocket endpoint de Chrome                | `ws://127.0.0.1:9222/devtools/browser/` |
| `--ws-headers`            | Headers custom para WebSocket (JSON)        | `{"Authorization":"Bearer token"}`      |
| `--executable-path`       | Ruta a Chrome custom                        | `/path/to/chrome`                       |
| `--user-data-dir`         | Directorio de perfil de usuario             | `/path/to/profile`                      |
| `--proxy-server`          | Servidor proxy                              | `http://proxy:3128`                     |
| `--accept-insecure-certs` | Ignorar errores de certificados             | `--accept-insecure-certs`               |
| `--log-file`              | Archivo para logs de debug                  | `/path/to/debug.log`                    |
| `--auto-connect`          | Conectar automaticamente a Chrome (v144+)   | `--auto-connect`                        |
| `--category-emulation`    | Habilitar/deshabilitar tools de emulacion   | `false`                                 |
| `--category-performance`  | Habilitar/deshabilitar tools de performance | `false`                                 |
| `--category-network`      | Habilitar/deshabilitar tools de network     | `false`                                 |
| `--chrome-arg`            | Argumentos adicionales para Chrome          | `--chrome-arg=--disable-gpu`            |

---

## Herramientas Disponibles

### Input Automation (8 tools)

| Herramienta     | Descripcion                              |
| --------------- | ---------------------------------------- |
| `click`         | Click en un elemento                     |
| `drag`          | Arrastrar un elemento                    |
| `fill`          | Llenar un campo de texto                 |
| `fill_form`     | Llenar multiples campos de formulario    |
| `handle_dialog` | Manejar dialogs (alert, confirm, prompt) |
| `hover`         | Hover sobre un elemento                  |
| `press_key`     | Presionar una tecla                      |
| `upload_file`   | Subir archivos                           |

### Navigation Automation (6 tools)

| Herramienta     | Descripcion                         |
| --------------- | ----------------------------------- |
| `navigate_page` | Navegar a una URL                   |
| `new_page`      | Abrir nueva pestaña                 |
| `close_page`    | Cerrar pestaña actual               |
| `list_pages`    | Listar pestañas abiertas            |
| `select_page`   | Seleccionar una pestaña             |
| `wait_for`      | Esperar por un elemento o condicion |

### Performance (3 tools)

| Herramienta                   | Descripcion                              |
| ----------------------------- | ---------------------------------------- |
| `performance_start_trace`     | Iniciar grabacion de trace               |
| `performance_stop_trace`      | Detener grabacion y obtener resultados   |
| `performance_analyze_insight` | Analizar un insight especifico del trace |

### Network (2 tools)

| Herramienta             | Descripcion                      |
| ----------------------- | -------------------------------- |
| `list_network_requests` | Listar todos los requests de red |
| `get_network_request`   | Obtener detalles de un request   |

### Emulation (2 tools)

| Herramienta   | Descripcion                         |
| ------------- | ----------------------------------- |
| `emulate`     | Emular dispositivo movil            |
| `resize_page` | Redimensionar ventana del navegador |

### Debugging (5 tools)

| Herramienta             | Descripcion                        |
| ----------------------- | ---------------------------------- |
| `take_screenshot`       | Capturar screenshot de la pagina   |
| `take_snapshot`         | Capturar snapshot de accesibilidad |
| `evaluate_script`       | Ejecutar JavaScript en la pagina   |
| `list_console_messages` | Listar mensajes de consola         |
| `get_console_message`   | Obtener detalles de un mensaje     |

---

## Casos de Uso para QA

### 1. Analizar Performance de una Pagina

```
Usuario: "Analiza el performance de la pagina de login"

IA ejecutara:
1. navigate_page("https://miapp.com/login")
2. performance_start_trace()
3. Interactuar con la pagina (login flow)
4. performance_stop_trace()
5. performance_analyze_insight() para cada insight
6. Reportar:
   - LCP (Largest Contentful Paint): 1.2s
   - CLS (Cumulative Layout Shift): 0.05
   - TBT (Total Blocking Time): 150ms
   - Insights y recomendaciones
```

### 2. Debugging de Errores de Consola

```
Usuario: "Verifica si hay errores en consola durante el checkout"

IA ejecutara:
1. navigate_page("/cart")
2. click en "Checkout"
3. fill_form con datos de prueba
4. click en "Place Order"
5. list_console_messages()
6. Filtrar y reportar:
   - Errors: 2
   - Warnings: 5
   - Detalles de cada error con stack trace
```

### 3. Inspeccion de Requests de API

```
Usuario: "Verifica que requests hace el login"

IA ejecutara:
1. navigate_page("/login")
2. fill({ selector: "email", value: "test@example.com" })
3. fill({ selector: "password", value: "password123" })
4. click en "Submit"
5. list_network_requests()
6. get_network_request para el POST /auth/v1/token
7. Reportar:
   - Endpoint: POST /auth/v1/token
   - Status: 200
   - Headers enviados
   - Response body (tokens)
```

### 4. Testing Responsive

```
Usuario: "Prueba el menu responsive en mobile"

IA ejecutara:
1. navigate_page("/")
2. emulate({ device: "iPhone 14" })
3. take_screenshot() → captura mobile
4. click en hamburger menu
5. take_snapshot() → verificar accesibilidad
6. resize_page({ width: 1920, height: 1080 })
7. take_screenshot() → captura desktop
8. Comparar comportamiento en ambos viewports
```

### 5. Flujo Completo con Evidencia

```
Usuario: "Documenta el flujo de registro con screenshots"

IA ejecutara:
1. navigate_page("/register")
2. take_screenshot() → "01-register-form.png"
3. fill_form({
     fields: [
       { selector: "name", value: "Test User" },
       { selector: "email", value: "test@example.com" },
       { selector: "password", value: "Password123!" }
     ]
   })
4. take_screenshot() → "02-form-filled.png"
5. click({ selector: "button[type=submit]" })
6. wait_for({ text: "Welcome" })
7. take_screenshot() → "03-success.png"
8. list_console_messages() → verificar no hay errores
```

---

## Modos de Perfil

### Persistente (por defecto)

El navegador guarda cookies, localStorage y sesiones entre ejecuciones:

```json
{
  "args": ["-y", "chrome-devtools-mcp@latest"]
}
```

Ubicacion del perfil:

- Linux/macOS: `$HOME/.cache/chrome-devtools-mcp/chrome-profile-stable`
- Windows: `%HOMEPATH%/.cache/chrome-devtools-mcp/chrome-profile-stable`

### Aislado

Cada sesion inicia limpia, sin datos previos:

```json
{
  "args": ["-y", "chrome-devtools-mcp@latest", "--isolated"]
}
```

### Headless (sin UI)

Para CI/CD o ambientes sin display:

```json
{
  "args": ["-y", "chrome-devtools-mcp@latest", "--headless", "--isolated"]
}
```

---

## Conectar a Chrome Existente

### Conexion Manual (Port Forwarding)

Util para usar sesiones ya logueadas o ambientes sandbox.

**Paso 1: Configurar MCP**

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest", "--browser-url=http://127.0.0.1:9222"]
  }
}
```

**Paso 2: Iniciar Chrome con debugging**

```bash
# Linux
/usr/bin/google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-profile"
```

**Paso 3: Probar conexion**

```
Prompt: "Check the performance of https://example.com"
```

### Conexion Automatica (Chrome 144+)

```json
{
  "args": ["-y", "chrome-devtools-mcp@latest", "--auto-connect", "--channel=stable"]
}
```

Requiere habilitar remote debugging en Chrome:

1. Navegar a `chrome://inspect/#remote-debugging`
2. Habilitar debugging y aprobar conexiones

---

## Integracion con Playwright MCP

Combinar ambos MCPs para testing completo:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--caps", "vision,pdf,testing,tracing,tabs"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

**Flujo combinado:**

| Tarea                  | MCP Recomendado |
| ---------------------- | --------------- |
| Navegacion/Interaccion | Playwright      |
| Performance Profiling  | DevTools        |
| Network Debugging      | DevTools        |
| Screenshots/Snapshots  | Ambos           |
| Console Errors         | DevTools        |
| Generar Locators       | Playwright      |

---

## Mejores Practicas

### DO

- Usar `--isolated` para tests que requieren estado limpio
- Capturar screenshots como evidencia en puntos clave
- Revisar `list_console_messages` para errores ocultos
- Usar `performance_start_trace` / `performance_stop_trace` para benchmarks
- Combinar con Playwright MCP para testing completo

### DON'T

- No usar `--accept-insecure-certs` en produccion
- No exponer el debugging port a redes publicas
- No ignorar warnings de consola en tests
- No usar timeouts muy cortos en conexiones lentas

---

## Troubleshooting

### Error: "Browser not found"

Verificar que Chrome esta instalado y en el PATH. Opcionalmente especificar la ruta:

```json
{
  "args": ["-y", "chrome-devtools-mcp@latest", "--executable-path=/usr/bin/google-chrome"]
}
```

### Error: "Connection refused" (port 9222)

1. Verificar que Chrome esta corriendo con `--remote-debugging-port=9222`
2. Verificar que no hay firewall bloqueando
3. Usar `http://127.0.0.1:9222/json/version` para verificar

### Error: Sandbox issues

En ambientes containerizados o con restricciones de sandbox:

```json
{
  "args": [
    "-y",
    "chrome-devtools-mcp@latest",
    "--chrome-arg=--no-sandbox",
    "--chrome-arg=--disable-setuid-sandbox"
  ]
}
```

### Habilitar logs de debug

```json
{
  "args": ["-y", "chrome-devtools-mcp@latest", "--log-file=/tmp/chrome-devtools-mcp.log"],
  "env": {
    "DEBUG": "*"
  }
}
```

---

## Recursos Adicionales

- [Chrome DevTools MCP - GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Chrome DevTools MCP - NPM](https://www.npmjs.com/package/chrome-devtools-mcp)
- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [Remote Debugging Guide](https://developer.chrome.com/docs/devtools/remote-debugging/)

---

## Siguiente Paso

Para automatizacion de navegador con Playwright:
--> [mcp-playwright.md](./mcp-playwright.md)

Para tecnicas de exploracion:
--> [exploratory-ui-testing.md](./exploratory-ui-testing.md)
