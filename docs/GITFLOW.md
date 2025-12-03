# GitFlow Simplificado - Proyecto con IA

## Filosofía del flujo

Este proyecto usa un GitFlow adaptado para trabajo con inteligencia artificial. La IA genera código y lo commitea de forma inteligente, pero **tú mantienes el control** en puntos clave.

## Estructura de ramas

### main
Código en producción. Solo recibe merges desde `staging` mediante pull requests aprobados.

### staging
Rama de integración y testing. Aquí la IA commitea cambios agrupados mientras trabajas. Representa tu ambiente de QA/pre-producción.

### feature/nombre-tarea
Una rama por funcionalidad específica. La IA crea estas ramas cuando inicias una tarea nueva.

**Ejemplo de nomenclatura:**
- `feature/login-validation`
- `feature/dashboard-analytics`
- `feature/payment-integration`

## Ciclo de trabajo típico

### 1. Iniciar nueva tarea
```bash
# Desde staging
git checkout staging
git pull origin staging
git checkout -b feature/nombre-tarea
```

### 2. Desarrollo con IA
- Le das instrucciones a la IA sobre qué construir
- La IA genera código y lo agrupa en commits semánticos
- Cada commit es pequeño, funcional e independiente

### 3. Commits agrupados
La IA analiza cambios y propone commits separados:

**feat:** Nueva funcionalidad
```
feat: añade validación de email en formulario
```

**fix:** Corrección de bugs
```
fix: corrige cálculo de descuentos en checkout
```

**refactor:** Mejora de código existente
```
refactor: optimiza consultas de base de datos
```

**test:** Tests nuevos o modificados
```
test: añade casos de prueba para login
```

**docs:** Documentación
```
docs: actualiza README con nuevas variables de entorno
```

### 4. Push opcional
Después de cada grupo de commits, decides:
- **Push ahora:** Sube cambios al repo remoto
- **Continuar local:** Sigues iterando sin push

### 5. Pull Request
Cuando la feature está completa:
- Haces push final de la rama
- Creas PR desde `feature/nombre` hacia `staging` o `main`
- Revisas cambios en GitHub
- Apruebas y haces merge

## Ventajas de este sistema

**Historial limpio:** Cada commit cuenta una historia clara de qué problema resolvió.

**Reversibilidad:** Puedes revertir cambios específicos sin destruir todo el trabajo.

**Control humano:** La IA ejecuta, pero tú decides cuándo y qué se sube.

**Iteración rápida:** Trabajas localmente sin "ensuciar" el repo hasta estar satisfecho.

## Flujo visual

```
main ─────────────●─────────────●─────────────●
                   ↑             ↑             ↑
                   PR            PR            PR
                   │             │             │
staging ───●───●───●───●───●─────●───●───●─────●
            ↑   ↑       ↑   ↑
            │   │       │   │
feature/x ──●───●       │   │
                        │   │
feature/y ──────────────●───●
```

## Comandos útiles

### Ver estado actual
```bash
git status
git log --oneline -10
```

### Ver diferencias antes de commit
```bash
git diff
git diff --stat
```

### Revertir último commit (mantiene cambios)
```bash
git reset HEAD~1
```

### Ver historial de una rama
```bash
git log --graph --oneline --all
```

## Buenas prácticas

1. **Un commit = una responsabilidad:** No mezcles fix con features
2. **Mensajes claros:** Alguien debe entender qué hace sin ver el código
3. **Push frecuente en features largas:** No acumules días de trabajo sin backup
4. **PRs pequeños:** Más fáciles de revisar y aprobar
5. **Tests antes de merge:** Asegura que nada se rompe

## Integración con GitHub

Este flujo se potencia con GitHub MCP, que permite a la IA:
- Ver pull requests existentes
- Crear nuevos PRs con descripción automática
- Listar issues y vincularlos a commits
- Verificar estado de checks automáticos

Sin GitHub MCP configurado, el flujo funciona pero pierdes automatización en la parte de PRs.

---

**Nota sobre ambientes:** La rama `staging` representa tu ambiente de testing y QA. Para entender mejor la relación entre ramas Git y ambientes de desarrollo, consulta el documento `AMBIENTES.md`.
