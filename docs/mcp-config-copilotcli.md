# Configuración de MCP para GitHub Copilot CLI

**GitHub Copilot CLI** es la herramienta oficial de GitHub para interactuar con Copilot desde la terminal, con capacidades agentic.

> 💡 Para conceptos generales de MCP, consulta [MCP - Guía General](./mcp-config-general.md)

---

## 🚀 Quick Start

### Archivos de Configuración

- **Principal**: `~/.copilot/mcp-config.json`
- **Otros archivos**:
  - `~/.copilot/config.json` - Preferencias generales
  - `~/.copilot/command-history-state.json` - Historial
  - `~/.copilot/logs/` - Logs de depuración

---

## 📝 Configuración de MCPs

### Método 1: Comando Interactivo

```bash
/mcp add
```

Esto abrirá un asistente interactivo que te pedirá:
1. **Server Name**: Nombre del servidor
2. **Server Type**: stdio / HTTP / SSE
3. **URL** (si es HTTP/SSE): URL del servidor
4. **HTTP Headers** (opcional): Para autenticación
5. **Tools**: Seleccionar herramientas específicas o todas

### Método 2: Edición Manual

#### ~/.copilot/mcp-config.json

**Servidor stdio Local**:
```json
{
  "mcpServers": {
    "context7": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "tools": ["*"]
    }
  }
}
```

**Servidor HTTP Remoto**:
```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://mcp.github.com/",
      "tools": ["*"]
    }
  }
}
```

**Servidor con Autenticación**:
```json
{
  "mcpServers": {
    "postman": {
      "type": "http",
      "url": "https://mcp.postman.com/mcp",
      "headers": {
        "Authorization": "Bearer your-api-key"
      },
      "tools": ["*"]
    }
  }
}
```

**Servidor con Herramientas Específicas**:
```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://context7.mcp.io",
      "headers": {
        "X-API-Key": "your-api-key"
      },
      "tools": ["search_docs", "get_library"]
    }
  }
}
```

---

## 🔧 Transportes Soportados

- ✅ **stdio**: Totalmente soportado (referido como "local")
- ⚠️ **SSE**: Soporte limitado (siendo deprecado)
- ✅ **HTTP**: Totalmente soportado

---

## 📋 Ejemplos Prácticos

### Ejemplo 1: Context7 (Documentación)

```json
{
  "mcpServers": {
    "context7": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "tools": ["*"]
    }
  }
}
```

### Ejemplo 2: Sequential Thinking MCP

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "tools": ["*"]
    }
  }
}
```

### Ejemplo 3: Playwright MCP

```json
{
  "mcpServers": {
    "playwright": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "tools": ["*"]
    }
  }
}
```

### Ejemplo 4: Configuración Multi-Servidor

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://mcp.github.com/",
      "tools": ["*"]
    },
    "context7": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "tools": ["*"]
    },
    "sequential-thinking": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "tools": ["*"]
    }
  }
}
```

---

## 🎯 Comandos en Sesión

### Ver servidores y herramientas disponibles
```bash
/mcp
```

### Agregar nuevo servidor
```bash
/mcp add
```

### Gestionar permisos de sesión
```bash
/session
```

### Restablecer permisos
```bash
/reset
```

### Agregar directorio permitido
```bash
/add-directory /ruta/al/directorio
```

### Cambiar modelo
```bash
/model o1
/model gpt-4o
```

### Habilitar modo reasoning
```bash
/model --reasoning
```

---

## 🌟 Servidor GitHub MCP (Preconfigurado)

Copilot CLI viene con el **servidor GitHub MCP ya instalado**.

Operaciones disponibles automáticamente:
- Buscar issues
- Crear issues
- Listar PRs
- Leer contenido de repositorios
- Gestión de proyectos

```bash
# Usar directamente en sesión
Usuario: "Busca issues relacionados con MCP en este repo"
Copilot: [usa github-mcp] "Encontré 3 issues..."
```

---

## 🔑 Características Especiales

### Agente de GitHub
Acceso directo a GitHub.com sin configuración adicional.

### Gestión de Permisos
Sistema de allowlist interactivo:
```bash
/session  # Ver permisos actuales
/add-directory /path/to/project  # Agregar acceso
```

### Historial Persistente
Configuración se mantiene entre sesiones.

### Modelos Múltiples
Cambio dinámico entre GPT-4o, o1, etc.:
```bash
/model gpt-4o
/model o1
```

### Selección de Herramientas
Puedes especificar qué herramientas de un servidor cargar:
```json
{
  "tools": ["search_docs", "get_library"]  // Solo estas
}
```

O cargar todas:
```json
{
  "tools": ["*"]  // Todas las herramientas
}
```

---

## 🐛 Troubleshooting

### Herramientas no aparecen

**Causa**: Configuración incorrecta de `tools`

**Solución**:
1. Verifica que uses `"tools": ["*"]` o listes herramientas específicas
2. Reinicia Copilot CLI completamente
3. Revisa logs en `~/.copilot/logs/`

### "Servidor no se encuentra"

**Solución**: Usar rutas absolutas
```json
{
  "command": "/usr/local/bin/npx"
}
```

**Verificar instalación**:
```bash
which npx
which node
```

### Permisos denegados

**Solución**:
```bash
/add-directory /path/to/project
```

### Logs para debugging

```bash
# Revisar logs
cat ~/.copilot/logs/latest.log

# O navegar al directorio
cd ~/.copilot/logs/
```

---

## 💡 Tips y Mejores Prácticas

### 1. Usar `tools: ["*"]` por Defecto

```json
{
  "tools": ["*"]  // Más fácil, carga todo
}
```

### 2. Combinar Local + Remote

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://mcp.github.com/"
    },
    "playwright": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### 3. Usar Variables de Entorno para Secrets

```bash
# ~/.bashrc o ~/.zshrc
export POSTMAN_API_KEY="pmk_your_key"
```

```json
{
  "headers": {
    "Authorization": "Bearer ${POSTMAN_API_KEY}"
  }
}
```

### 4. Aprovechar GitHub MCP

Ya viene configurado, úsalo:
```bash
Usuario: "Crea un issue para implementar dark mode"
Copilot: [usa github-mcp] "Issue #123 creado"
```

---

## 📊 Configuración Recomendada

### Para Desarrollo Full-Stack

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://mcp.github.com/",
      "tools": ["*"]
    },
    "playwright": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "tools": ["*"]
    },
    "context7": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "tools": ["*"]
    }
  }
}
```

### Para Testing

```json
{
  "mcpServers": {
    "playwright": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "tools": ["*"]
    },
    "postman": {
      "type": "http",
      "url": "https://mcp.postman.com/mcp",
      "headers": {
        "Authorization": "Bearer ${POSTMAN_API_KEY}"
      },
      "tools": ["*"]
    }
  }
}
```

### Para Gestión de Proyectos

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://mcp.github.com/",
      "tools": ["*"]
    },
    "slack": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "slack-mcp-server@latest"],
      "env": {
        "SLACK_MCP_XOXP_TOKEN": "${SLACK_TOKEN}"
      },
      "tools": ["*"]
    }
  }
}
```

---

## 📚 Recursos Adicionales

- **Documentación Oficial**: https://github.com/github/copilot-cli
- **Conceptos MCP**: [MCP - Guía General](./mcp-config-general.md)
- **MCP Builder Strategy**: [MCP Builder](./mcp-builder-strategy.md)

---

**Última actualización**: 2025-10-29
**Versión GitHub Copilot CLI**: Latest
