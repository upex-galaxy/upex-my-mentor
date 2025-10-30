# Configuración de MCP para Claude Code

**Claude Code** es la herramienta CLI oficial de Anthropic para codificación asistida directamente desde la terminal.

> 💡 Para conceptos generales de MCP, consulta [MCP - Guía General](./mcp-config-general.md)

---

## 🚀 Quick Start

### Setup Inicial Crítico

La primera vez que uses Claude Code:

```bash
# Bypass de permisos inicial (NECESARIO)
claude --dangerously-skip-permissions
```

Esto:
- Inicializa el directorio de configuración
- Establece permisos de seguridad
- Crea tokens de autenticación
- Configura el registro de MCP

### Archivos de Configuración

Claude Code usa un sistema jerárquico:

1. **Proyecto** (`.mcp.json` en la raíz del proyecto) - Mayor prioridad
2. **Local** (`.mcp.json` en el directorio actual)
3. **Usuario** (`~/.claude.json`) - Configuración global

### Scopes de Configuración

- `user`: Global para todos los proyectos
- `project`: Específico del proyecto actual
- `local`: Directorio de trabajo actual

---

## 📝 Configuración de MCPs

### Método 1: Mediante CLI (Recomendado)

#### Agregar servidor stdio
```bash
claude mcp add -t stdio -s user mi-servidor -- npx -y @paquete/servidor
```

#### Agregar servidor HTTP
```bash
claude mcp add --transport http --scope user firebase https://firebase.mcp.com
```

#### Listar servidores
```bash
claude mcp list
```

#### Eliminar servidor
```bash
claude mcp remove mi-servidor
```

### Método 2: Edición Manual

#### ~/.claude.json

**Servidor stdio Local**:
```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

**Servidor HTTP con Autenticación**:
```json
{
  "mcpServers": {
    "postman": {
      "type": "http",
      "url": "https://mcp.postman.com/mcp",
      "headers": {
        "Authorization": "Bearer ${input:postman-api-key}"
      }
    }
  },
  "inputs": [
    {
      "id": "postman-api-key",
      "type": "promptString",
      "description": "Enter your Postman API key"
    }
  ]
}
```

**Servidor con npx**:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${input:supabase-token}"
      }
    }
  }
}
```

---

## 🔧 Transportes Soportados

- ✅ **stdio**: Totalmente soportado
- ⚠️ **SSE**: **Eliminado en versiones >2.0.9** (deprecado del estándar MCP)
- ✅ **HTTP Streamable**: Totalmente soportado

### ⚠️ Cambio Importante en Versión 2.0.9+

Claude Code eliminó soporte para SSE en versiones superiores a 2.0.9.

**Si tienes servidores SSE**:

**Solución 1**: Usar versión anterior de Claude Code
```bash
npm install -g claude-code@2.0.9
```

**Solución 2**: Migrar a HTTP Streamable (recomendado)

**Solución 3**: Usar proxy stdio-to-SSE

---

## 📋 Ejemplos Prácticos

### Ejemplo 1: Supabase MCP

```bash
# Mediante CLI
claude mcp add -t stdio -s user supabase -- npx -y @supabase/mcp-server-supabase@latest
```

**O manualmente en ~/.claude.json**:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${input:supabase-token}"
      }
    }
  },
  "inputs": [
    {
      "id": "supabase-token",
      "type": "promptString",
      "description": "Enter your Supabase access token",
      "password": true
    }
  ]
}
```

### Ejemplo 2: GitHub MCP

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp",
      "headers": {
        "Authorization": "Bearer ${input:github-token}"
      }
    }
  },
  "inputs": [
    {
      "id": "github-token",
      "type": "promptString",
      "description": "Enter your GitHub token",
      "password": true
    }
  ]
}
```

### Ejemplo 3: Playwright MCP

```bash
claude mcp add -t stdio -s user playwright -- npx -y @playwright/mcp@latest
```

### Ejemplo 4: Context7 (Documentación)

```bash
claude mcp add --transport http --scope user context7 https://context7.mcp.io
```

---

## 🎯 Características Especiales

### Sistema Jerárquico
Project > Local > User

Los archivos en el proyecto sobrescriben configuración local y global.

### Gestión de Permisos
Control granular de acceso a recursos del sistema.

### Registry de MCP
Acceso a servidores verificados desde el registro oficial.

### Variables de Entrada
Soporte para inputs interactivos:

```json
{
  "inputs": [
    {
      "id": "unique-id",
      "type": "promptString",
      "description": "User-friendly description",
      "password": true  // Oculta entrada
    }
  ]
}
```

---

## 🐛 Troubleshooting

### "Permission denied"

**Solución**: Ejecutar setup inicial
```bash
claude --dangerously-skip-permissions
```

### "SSE transport not supported"

**Causa**: Versión >2.0.9 no soporta SSE

**Solución**:
```bash
# Downgrade
npm install -g claude-code@2.0.9

# O migrar a HTTP
```

### Servidor no se encuentra

**Solución**: Usar rutas absolutas
```json
{
  "command": "/usr/local/bin/node",
  "args": ["/ruta/completa/a/servidor.js"]
}
```

**Verificar PATH**:
```bash
which npx
which node
```

### Herramientas no aparecen

**Diagnóstico**:
```bash
claude mcp list
```

**Soluciones**:
1. Reiniciar Claude Code completamente
2. Verificar que el servidor use scope correcto
3. Revisar logs de MCP

---

## 💡 Tips y Mejores Prácticas

### 1. Usar Proyecto para Configuración Específica

`.mcp.json` en raíz del proyecto:
```json
{
  "mcpServers": {
    "project-specific": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "custom-mcp-server"]
    }
  }
}
```

### 2. Variables de Entorno para Secrets

```json
{
  "env": {
    "API_KEY": "${input:api-key}"
  }
}
```

### 3. Combinar Global + Proyecto

- Global (`~/.claude.json`): MCPs comunes (context7, memory)
- Proyecto (`.mcp.json`): MCPs específicos (supabase para este proyecto)

### 4. Usar Registry Oficial

```bash
# Explorar servidores verificados
claude mcp registry
```

---

## 📊 Configuración Recomendada

### Para Desarrollo Backend

```json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${input:supabase-token}"
      }
    },
    "context7": {
      "type": "http",
      "url": "https://context7.mcp.io"
    }
  }
}
```

### Para Desarrollo Frontend

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "context7": {
      "type": "http",
      "url": "https://context7.mcp.io"
    }
  }
}
```

### Para Testing

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "postman": {
      "type": "http",
      "url": "https://mcp.postman.com/mcp",
      "headers": {
        "Authorization": "Bearer ${input:postman-key}"
      }
    }
  }
}
```

---

## 📚 Recursos Adicionales

- **Documentación Oficial**: https://docs.claude.com/en/docs/claude-code
- **Conceptos MCP**: [MCP - Guía General](./mcp-config-general.md)
- **MCP Builder Strategy**: [MCP Builder](./mcp-builder-strategy.md)

---

**Última actualización**: 2025-10-29
**Versión Claude Code**: 2.0.9+
