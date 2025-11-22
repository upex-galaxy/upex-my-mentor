# Ambientes de Desarrollo - Guía para QA Engineers

## Qué son los ambientes

Un ambiente es una **copia independiente de tu aplicación** donde se ejecuta el código. Cada ambiente tiene su propia base de datos, configuración y propósito específico.

Los ambientes te permiten probar cambios sin afectar a usuarios reales. Son como ensayar una obra de teatro antes del estreno.

## Los 4 ambientes estándar del mercado

### 1. Development (dev)
**Propósito:** Desarrollo activo de código.

Aquí los desarrolladores escriben features nuevas, experimentan y hacen cambios frecuentes. El código puede romperse varias veces al día.

**Características:**
- Cambios constantes
- Tests básicos (unitarios, integración)
- Datos de prueba simples
- Puede estar "roto" temporalmente

**Quién lo usa:** Principalmente desarrolladores

**Ejemplo real:** Un dev está creando un nuevo formulario de login. Lo prueba aquí primero antes de compartirlo.

---

### 2. Staging (stage/pre-prod)
**Propósito:** Testing formal antes de producción.

Es una **réplica casi exacta de producción**. Aquí se ejecutan todos los tests de QA, validaciones y ensayos finales.

**Características:**
- Réplica de producción (mismo OS, versiones, configuración)
- Datos similares a producción (pero no reales)
- Tests completos de QA
- Estabilidad importante

**Quién lo usa:** QA Engineers, Product Owners, Stakeholders

**Ejemplo real:** Terminaste de automatizar tests para el checkout. Los ejecutas en staging porque imita exactamente cómo funciona en producción.

---

### 3. Production (prod)
**Propósito:** Usuarios reales usando la aplicación.

El ambiente que tus clientes ven. **Nunca se prueba aquí**, solo se monitorea.

**Características:**
- Usuarios reales
- Datos reales
- Máxima estabilidad requerida
- Monitoreo 24/7
- Rollback rápido si algo falla

**Quién lo usa:** Usuarios finales

**Ejemplo real:** Tu app de e-commerce procesando compras reales de clientes reales.

---

### 4. Local (tu computadora)
**Propósito:** Desarrollo y pruebas individuales.

No es técnicamente un "ambiente compartido", pero es donde pasas la mayor parte del tiempo como QA.

**Características:**
- Solo tú lo ves
- Puedes romper todo sin consecuencias
- Iteración rápida
- Datos de prueba personalizados

**Quién lo usa:** Cada desarrollador/QA en su máquina

**Ejemplo real:** Estás escribiendo un test de Cypress. Lo ejecutas localmente 20 veces hasta que funciona perfecto.

## Flujo típico de código

```
Local → Development → Staging → Production
  ↓          ↓           ↓           ↓
 Dev       Devs        QA         Users
prueba    integran    valida      usan
```

**Paso a paso:**

1. **Local:** Escribes código/tests en tu computadora
2. **Development:** Haces commit y push, se integra con código de otros
3. **Staging:** El equipo valida que todo funcione correctamente
4. **Production:** Si staging pasa, se despliega a usuarios reales

## Variaciones en empresas

No todas las empresas usan los mismos nombres o cantidad de ambientes.

### Empresas pequeñas (startup)
```
Local → Staging → Production
```
Solo 2 ambientes compartidos. Development y staging se combinan.

### Empresas medianas (más común)
```
Local → Development → Staging → Production
```
El estándar de la industria.

### Empresas grandes (enterprise)
```
Local → Development → QA → Staging → Production
```
Ambiente de QA separado para testing extensivo. Staging solo para validación final.

### Empresas muy grandes (tech giants)
```
Local → Dev → QA → Staging → Canary → Production
```
Múltiples ambientes intermedios. "Canary" despliega a un pequeño % de usuarios reales primero.

## Ambientes en este repositorio template

Para este proyecto educativo, usamos **3 ambientes**:

### Local (tu máquina)
Desarrollas y pruebas tus tests de automation aquí.

### Staging (rama `staging`)
Ambiente de integración donde todos los cambios se validan antes de production.

**Este es tu ambiente principal de trabajo como QA.**

### Production (rama `main`)
Código estable y aprobado.

## Por qué NO usamos "qa" como nombre de rama

Aunque algunas empresas tienen ambientes llamados "qa", **staging es el término estándar** que encontrarás en:
- 90% de ofertas de trabajo
- Documentación de CI/CD (GitHub Actions, GitLab CI, Jenkins)
- Tutoriales y cursos
- Convenciones de la industria

Los QA engineers **trabajan en staging**, no necesitan un ambiente separado llamado "qa".

## Cómo se relacionan ramas Git con ambientes

Cada rama suele tener un ambiente asociado:

```
Rama Git              Ambiente           Auto-deploy?
─────────────────────────────────────────────────────
feature/login    →    Local              No
staging          →    Staging            Sí (automático)
main             →    Production         Sí (con aprobación)
```

**Auto-deploy:** Cuando haces push a `staging`, automáticamente se despliega al ambiente de staging mediante CI/CD.

## Configuración por ambiente

Cada ambiente tiene su propia configuración:

**Development/Staging:**
```
DATABASE_URL=postgres://staging-db.company.com
API_KEY=test_key_12345
DEBUG_MODE=true
```

**Production:**
```
DATABASE_URL=postgres://prod-db.company.com
API_KEY=live_key_67890
DEBUG_MODE=false
```

Esto se maneja con archivos `.env` o variables de entorno en el servidor.

## Testing en cada ambiente

### Local
- Tests unitarios
- Tests de componentes
- Debugging de tests

### Staging
- Test suites completas (E2E)
- Regression testing
- Performance testing básico
- Validación de features nuevas

### Production
- **NO se ejecutan tests**
- Solo monitoring y alertas
- Smoke tests post-deploy (verificación rápida)

## Datos en cada ambiente

### Local
Datos ficticios que creas tú. Puedes resetearlos cuando quieras.

### Staging
Datos de prueba realistas pero no reales. Usuarios ficticios con nombres como "Test User 1".

**Importante:** Nunca uses datos reales de clientes en staging.

### Production
Datos reales de usuarios reales. Protegidos por leyes (GDPR, etc).

## Errores comunes que debes evitar

**❌ Probar en production**
Nunca ejecutes tests experimentales en producción. Siempre usa staging.

**❌ Usar datos de producción en staging**
Violarías privacidad de usuarios y posibles regulaciones legales.

**❌ Pushear directamente a main**
Siempre pasa por staging primero.

**❌ Asumir que staging = production**
Aunque son similares, pueden tener diferencias sutiles. Monitorea producción post-deploy.

## Vocabulario que escucharás

**Deploy:** Subir código a un ambiente
**Rollback:** Revertir a versión anterior si algo falla
**Hotfix:** Corrección urgente que va directo a production
**Smoke test:** Prueba rápida de funcionalidad básica
**Sanity test:** Similar a smoke test, verifica que el sistema esté "cuerdo"

## Preguntas frecuentes

**¿Por qué no puedo probar en production?**
Porque afectarías a usuarios reales. Un bug en un test puede borrar datos, crashear la app o crear mal experiencia.

**¿Staging siempre es idéntico a production?**
Idealmente sí, pero a veces hay diferencias en recursos (staging usa servidores más pequeños para ahorrar costos).

**¿Cuántos ambientes son suficientes?**
Para aprendizaje: Local + Staging + Production es perfecto. En el trabajo real, depende del tamaño de la empresa.

**¿Qué pasa si encuentro un bug en production?**
Se crea un hotfix inmediato. Algunos equipos lo prueban rápido en staging antes, otros van directo a production si es urgente.

## Recursos para profundizar

- **The Twelve-Factor App** - Buenas prácticas para aplicaciones modernas
- **GitFlow Workflow** - Estrategia de ramas más detallada
- **CI/CD Pipelines** - Automatización de deploys entre ambientes

## Resumen ejecutivo

Los ambientes te protegen de errores costosos. Pruebas localmente, integras en staging, despliegas a production solo cuando todo está validado.

**Como QA Engineer, tu ambiente principal es staging.** Ahí ejecutas tus test suites, validas features y aseguras calidad antes de que el código llegue a usuarios reales.

El mercado usa principalmente: Local → Dev → Staging → Production.

Este template usa: Local → Staging → Production (simplificado para aprendizaje).
