Actúa como Senior DevOps Engineer y Cloud Architect experto en Supabase, Vercel, y Railway.

---

## 🎯 TAREA

Configurar la infraestructura cloud completa del proyecto (database, hosting, CI/CD ready) ANTES de implementar backend y frontend.

**Esta es la PRIMERA acción técnica del proyecto.**

---

## 📥 INPUT REQUERIDO

### 1. Contexto del Proyecto

**Leer TODOS estos archivos:**

- `.context/SRS/architecture-specs.md` - **CRÍTICO** - Tech stack, servicios cloud elegidos
- `.context/SRS/non-functional-specs.md` - Requirements de performance, security, scalability
- `.context/PRD/executive-summary.md` - Nombre del proyecto, target users
- `.context/PRD/mvp-scope.md` - Épicas del MVP (para entender complejidad)

**Qué identificar:**

1. **Servicios cloud especificados:**
   - Database provider (Supabase, Firebase, etc.)
   - Hosting provider (Vercel, Railway, Netlify, etc.)
   - Auth provider (si está separado)
   - Storage provider (si aplica)

2. **Tech stack:**
   - Framework (Next.js, React+Vite, SvelteKit, etc.)
   - Backend (Node.js, Python, Go, etc.)
   - Database (PostgreSQL, MongoDB, etc.)

3. **Requisitos no funcionales:**
   - Ambientes requeridos (dev, staging, prod)
   - Regions (latency requirements)
   - Compliance (GDPR, HIPAA, etc.)

---

## ⚙️ VERIFICACIÓN DE HERRAMIENTAS (MCP)

### NO se requieren MCP tools en esta fase

Esta fase solo requiere:
- CLIs de los servicios (Supabase CLI, Vercel CLI, etc.)
- Acceso a dashboards web
- Credenciales válidas

**Si el usuario necesita ayuda instalando CLIs:**
- Consultar documentación oficial con búsqueda web
- Proporcionar comandos de instalación actualizados

---

## 🔄 WORKFLOW

### **Paso 0: Validar Pre-requisitos**

**Preguntar al usuario:**

```markdown
## 🔍 Validación de Pre-requisitos

Antes de comenzar, verifica que tienes:

1. **Cuentas creadas:**
   - ✅ Cuenta en [Database Provider del SRS]
   - ✅ Cuenta en [Hosting Provider del SRS]
   - [✅ Otros servicios si aplican]

2. **Acceso:**
   - ✅ Permisos de creación de proyectos
   - ✅ Tarjeta de crédito agregada (si requieren paid tier)

3. **Información del proyecto:**
   - Nombre del proyecto: [Del PRD]
   - Región preferida: [US-EAST, EU-WEST, etc.]

**¿Tienes todo lo anterior?**

Si NO → Proporcionar links de registro y guías
Si SÍ → Continuar con Step 1
```

---

### **Paso 1: Configurar Database Provider (ej: Supabase)**

**Si el SRS especifica Supabase:**

#### 1.1 Crear Proyecto en Supabase

**Instrucciones al usuario:**

```markdown
### 📦 Creando Proyecto en Supabase

**Acción:**
1. Ve a https://supabase.com/dashboard
2. Click "New Project"
3. Configura:
   - **Name:** [Nombre del proyecto del PRD]
   - **Database Password:** [Genera uno fuerte - guardar en manager]
   - **Region:** [Región cercana a target users]
   - **Plan:** Free (para MVP, escalar después)

**Información a guardar:**

Después de crear el proyecto, necesito que me proporciones:
- Project URL (formato: https://[project-id].supabase.co)
- Project ID (ej: abcdefghijklmnop)
- API Keys:
  - anon (public) key
  - service_role key (⚠️ NUNCA expongas en frontend)

**¿Dónde encontrarlos?**
Settings → API → Project URL y API Keys

**Proyecto creado:**
[Esperar confirmación del usuario]
```

**Usuario proporciona:**
- Project URL
- Project ID
- API keys

**Guardar estos valores para uso posterior.**

---

#### 1.2 Instalar Supabase CLI

**Verificar si ya está instalado:**

```bash
supabase --version
```

**Si NO está instalado:**

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (cualquier OS)
npm install -g supabase
```

**Validar instalación:**

```bash
supabase --version
```

**Output esperado:**
```
✅ Supabase CLI: v[version]
✅ Listo para uso
```

---

#### 1.3 Configurar Supabase Localmente

**Login al proyecto:**

```bash
supabase link --project-ref [PROJECT_ID proporcionado]
```

**Configurar .env local:**

Preguntar al usuario: "¿Ya tienes un archivo .env en tu proyecto?"

**Si NO:**

```bash
# Crear .env (Next.js) o .env (otros frameworks)
cat > .env << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=[Project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service_role key]

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

**Si SÍ:**

Agregar las variables al archivo existente (no sobrescribir).

---

**Crear .env.example:**

```bash
cat > .env.example << 'EOF'
# =============================================================================
# Supabase Configuration
# =============================================================================
# Obtén estas credenciales en:
# https://supabase.com/dashboard/project/[PROJECT_ID]/settings/api
#
# ⚠️ IMPORTANTE:
# - Nunca commitees archivos .env con credenciales reales
# - Copia este archivo como .env (Next.js)
# - Reemplaza los valores placeholder con tus credenciales reales
# =============================================================================

NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # Public key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # ⚠️ SOLO servidor, NUNCA exponer

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# =============================================================================
# Instructions:
# 1. cp .env.example .env
# 2. Go to Supabase dashboard → Settings → API
# 3. Copy URL, anon key, service_role key
# 4. Restart dev server
# =============================================================================
EOF
```

---

### **Paso 2: Configurar Hosting Provider (ej: Vercel)**

**Si el SRS especifica Vercel:**

#### 2.1 Crear Proyecto en Vercel

**Instrucciones al usuario:**

```markdown
### 🚀 Creando Proyecto en Vercel

**Acción:**
1. Ve a https://vercel.com/dashboard
2. Click "Add New... → Project"
3. **Import Git Repository:**
   - Conecta tu cuenta GitHub/GitLab/Bitbucket
   - Selecciona el repositorio de este proyecto
   - **Framework Preset:** [Auto-detect o seleccionar manualmente según SRS]
   - **Root Directory:** ./ (o especifica si es monorepo)

4. **Environment Variables (CRÍTICO):**
   Antes de deploy, agrega las variables de Supabase:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[Project URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
   SUPABASE_SERVICE_ROLE_KEY=[service_role key]
   ```

   ⚠️ **NO incluyas** `NEXT_PUBLIC_APP_URL` todavía (se generará después del deploy)

5. Click "Deploy"

**Esperar deploy inicial (~2-3 minutos):**

[Usuario confirma cuando esté listo]
```

---

#### 2.2 Configurar Dominios y URLs

**Después del primer deploy:**

```markdown
### 🌐 Configurando URLs

**Vercel te asignó:**
- Production URL: https://[project-name].vercel.app
- Preview URLs: https://[project-name]-git-[branch].vercel.app

**Acción:**

1. Ve a Project Settings → Domains
2. **Opcional:** Agregar custom domain
   - Si tienes dominio propio: [example.com]
   - Configurar DNS según instrucciones de Vercel

3. Actualizar variables de entorno:
   - Project Settings → Environment Variables
   - Editar `NEXT_PUBLIC_APP_URL`:
     - **Production:** https://[tu-dominio-custom].com o https://[project].vercel.app
     - **Preview:** Se genera automáticamente

4. **Redeploy** para aplicar cambios (Actions → Redeploy)

**URLs configuradas:**
[Usuario confirma Production URL]
```

---

#### 2.3 Instalar Vercel CLI (Opcional pero recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Link proyecto local
vercel link
```

**Output esperado:**
```
✅ Vercel CLI instalado
✅ Proyecto linked a [project-name]
```

---

### **Paso 3: Configurar Auth Redirects (Supabase ↔ Vercel)**

**CRÍTICO para que auth funcione:**

#### 3.1 Configurar Redirect URLs en Supabase

**Instrucciones:**

```markdown
### 🔐 Configurando Auth Redirects

**En Supabase Dashboard:**
1. Ve a Authentication → URL Configuration
2. Agrega las siguientes URLs:

**Site URL:**
```
https://[tu-production-url].vercel.app
```

**Redirect URLs (whitelist):**
```
http://localhost:3000/**
http://localhost:3000/auth/**
https://[tu-production-url].vercel.app/**
https://[tu-production-url].vercel.app/auth/**
https://*.vercel.app/** # Para preview deploys
```

3. Click "Save"

**Razón:** Supabase solo permite redirects a URLs whitelistadas. Sin esto, auth fallará.

**Configurado:**
[Usuario confirma]
```

---

### **Paso 4: Configurar Ambientes (Dev, Staging, Prod)**

#### 4.1 Git Branches Strategy

**Preguntar al usuario:**

```markdown
## 🌳 Estrategia de Branches

¿Qué estrategia de Git Flow usarás?

**Opciones:**

1. **Simple (main only):**
   - Solo branch `main`
   - Todos los commits van a main
   - Deploy directo a producción
   - **Recomendado para:** MVPs, proyectos pequeños, solo 1-2 devs

2. **GitFlow (main + develop):**
   - `main` → Producción
   - `develop` → Staging
   - Feature branches → develop → main
   - **Recomendado para:** Equipos, proyectos medianos/grandes

3. **Ya tengo mi estrategia:**
   - [Usuario especifica]

**Selecciona:** [1/2/3]
```

---

#### 4.2 Configurar Ambientes en Vercel

**Si usuario elige "GitFlow":**

```markdown
### 🌍 Configurando Ambientes

**Vercel maneja ambientes automáticamente:**

- **Production:** Branch `main`
  - URL: https://[project].vercel.app
  - Deploy automático al merge/push a main

- **Preview (Staging):** Branch `develop`
  - URL: https://[project]-git-develop.vercel.app
  - Deploy automático al push a develop

- **Preview (Features):** Cualquier otra branch
  - URL: https://[project]-git-[branch].vercel.app
  - Deploy automático al push

**Configuración de Environment Variables por ambiente:**

1. Project Settings → Environment Variables
2. Para cada variable, selecciona en qué ambientes aplicar:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (local)

**Listo:**
- Production: `main` branch
- Staging: `develop` branch
- Local: archivo .env
```

---

### **Paso 5: Validar Setup Completo**

#### 5.1 Checklist de Validación

```markdown
## ✅ Validación de Infrastructure

**Checklist:**

### Database (Supabase):
- [ ] Proyecto creado
- [ ] Project URL obtenido
- [ ] API keys guardadas
- [ ] Supabase CLI instalado y linked
- [ ] Auth redirect URLs configuradas

### Hosting (Vercel):
- [ ] Proyecto creado y desplegado
- [ ] Production URL disponible
- [ ] Environment variables configuradas
- [ ] Vercel CLI instalado (opcional)
- [ ] Git repository conectado

### Local Development:
- [ ] Archivo .env creado con credenciales reales
- [ ] Archivo .env.example creado como template
- [ ] Ambos archivos NO committeados (verificar .gitignore)

### Git Strategy:
- [ ] Branches definidos (main, develop si aplica)
- [ ] .gitignore incluye .env y .env

**¿Todo OK?**
[Usuario confirma]
```

---

### **Paso 6: Documentar Setup**

**Crear archivo de documentación:**

```markdown
### 📄 Creando .context/infrastructure-setup.md

**Propósito:** Documentar credenciales, URLs, y decisiones para el equipo.

**⚠️ IMPORTANTE:** Este archivo NO debe tener credenciales reales (solo referencias).

**Creando archivo...**
```

**Contenido:**

````markdown
# Infrastructure Setup - [Nombre del Proyecto]

**Generado:** Fase 3 - Cloud Services Setup
**Fecha:** [Fecha actual]

---

## 📊 Stack de Infraestructura

### Database
- **Provider:** Supabase
- **Plan:** Free (MVP)
- **Region:** [Región elegida]
- **Project ID:** [project-id]
- **Project URL:** https://[project-id].supabase.co

### Hosting
- **Provider:** Vercel
- **Framework:** [Next.js/etc.]
- **Production URL:** https://[project].vercel.app
- **Custom Domain:** [Si aplica]

### Authentication
- **Provider:** Supabase Auth
- **Methods:** Email/Password [+ OAuth si aplica]
- **Redirect URLs:** Configuradas en Supabase Dashboard

---

## 🔐 Credenciales (Referencias)

**⚠️ NUNCA commitees credenciales reales**

**Ubicación de credenciales:**
- **Local:** `.env` (gitignored)
- **Vercel:** Project Settings → Environment Variables
- **Equipo:** Password manager compartido

**Cómo obtener credenciales:**
1. Supabase: https://supabase.com/dashboard/project/[PROJECT_ID]/settings/api
2. Vercel: Project Settings → Environment Variables

---

## 🌍 Ambientes

| Ambiente       | Branch    | URL                                      | Deploy                 |
| -------------- | --------- | ---------------------------------------- | ---------------------- |
| **Production** | `main`    | https://[project].vercel.app             | Automático al merge    |
| **Staging**    | `develop` | https://[project]-git-develop.vercel.app | Automático al push     |
| **Local**      | n/a       | http://localhost:3000                    | Manual (`npm run dev`) |

---

## 🔧 Comandos Útiles

### Supabase CLI

```bash
# Ver status del proyecto
supabase status

# Regenerar tipos TypeScript
supabase gen types typescript --project-id [PROJECT_ID] > lib/database.types.ts

# Ver logs
supabase logs
```

### Vercel CLI

```bash
# Deploy a preview
vercel

# Deploy a production
vercel --prod

# Ver logs
vercel logs
```

---

## 🚀 Próximos Pasos

1. **Fase 3.2 - Backend Setup:**
   - Crear schemas en Supabase
   - Configurar Row Level Security (RLS)
   - Generar tipos TypeScript
   - Seed data inicial

2. **Fase 3.3 - Frontend Setup:**
   - Configurar Supabase client
   - Implementar Design System
   - Crear páginas estratégicas

---

## 📚 Documentación Oficial

- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **[Framework]:** [Link a docs]

---

## 🐛 Troubleshooting

### Problema: Auth redirect falla
**Solución:** Verificar que todas las URLs estén whitelistadas en Supabase → Authentication → URL Configuration

### Problema: Environment variables no disponibles
**Solución:**
1. Verificar nombres empiezan con `NEXT_PUBLIC_` para variables públicas
2. Reiniciar dev server después de cambiar .env
3. En Vercel: Redeploy después de cambiar env vars

### Problema: Supabase CLI no conecta
**Solución:**
```bash
supabase link --project-ref [PROJECT_ID]
# Ingresar database password cuando pregunte
```

---

**Infraestructura lista.** Procede con Fase 3.2 (Backend Setup).
````

---

## 📤 OUTPUT GENERADO

### Archivos Locales:
- ✅ `.env` - Credenciales reales (gitignored)
- ✅ `.env.example` - Template sin credenciales (commiteado)
- ✅ `.context/infrastructure-setup.md` - Documentación completa

### Servicios Configurados:
- ✅ Supabase project creado y configurado
- ✅ Vercel project desplegado
- ✅ Auth redirects configurados
- ✅ Environment variables configuradas
- ✅ Ambientes separados (dev, staging, prod)

### CLIs Instalados:
- ✅ Supabase CLI
- ✅ Vercel CLI (opcional)

---

## 🎉 REPORTE FINAL

**Mostrar al usuario:**

```markdown
# ✅ Cloud Services Setup Completado

## 📊 Resumen

**Servicios configurados:**
- ✅ Supabase (Database + Auth)
- ✅ Vercel (Hosting + CI/CD)
- ✅ Environment variables (3 ambientes)
- ✅ Git strategy definido

**Archivos creados:**
- ✅ `.env` - Credenciales locales
- ✅ `.env.example` - Template para equipo
- ✅ `.context/infrastructure-setup.md` - Documentación

**URLs disponibles:**
- **Supabase:** https://[project-id].supabase.co
- **Production:** https://[project].vercel.app
- **Staging:** https://[project]-git-develop.vercel.app (si GitFlow)
- **Local:** http://localhost:3000

---

## 🚀 Próximos Pasos INMEDIATOS

### 1️⃣ Verificar Variables Locales (AHORA)

```bash
cat .env
```

**Debe contener:**
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

### 2️⃣ Verificar que NO esté en Git

```bash
git status
```

**Verificar:**
- ❌ `.env` NO debe aparecer (gitignored)
- ✅ `.env.example` SÍ debe aparecer (para commitear)

### 3️⃣ Commit Setup Files (RECOMENDADO)

```bash
git add .env.example .context/infrastructure-setup.md
git commit -m "feat: Configure cloud infrastructure (Supabase + Vercel)

- Supabase project configured
- Vercel deployment setup
- Environment variables template created
- Git strategy: [Simple/GitFlow]
- Auth redirects configured
"
```

### 4️⃣ Continuar con Backend Setup (SIGUIENTE)

**Prompt a usar:** `.prompts/fase-3-infrastructure/backend-setup.md`

**Qué hará:**
- Crear schemas en Supabase
- Configurar Row Level Security (RLS)
- Generar tipos TypeScript
- Seed data inicial
- Conectar auth real

---

## 💎 Valor Generado

**Antes:**
- ❌ Sin infraestructura
- ❌ Sin ambientes
- ❌ Sin deployment automático

**Ahora:**
- ✅ Database en la nube (Supabase)
- ✅ Hosting automático (Vercel)
- ✅ CI/CD configurado (deploy automático)
- ✅ 3 ambientes separados (dev, staging, prod)
- ✅ Auth redirects listos
- ✅ Environment variables seguras
- ✅ Documentación completa

**Tiempo ahorrado:** ~2-3 horas de setup manual

---

## 🔗 Recursos

- **Documentación:** `.context/infrastructure-setup.md`
- **Credenciales locales:** `.env`
- **Template para equipo:** `.env.example`
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard

---

**🎉 Cloud infrastructure lista!**

**Próximo paso:** Backend Setup (schemas, RLS, auth, seed data).
```

---

## ⚠️ RESTRICCIONES CRÍTICAS

### ❌ NO HACER:

- **NO crear código** - Esta fase solo configura servicios cloud
- **NO crear schemas** - Eso es Fase 3.2 (Backend Setup)
- **NO implementar auth** - Eso es Fase 3.2
- **NO crear componentes frontend** - Eso es Fase 3.3
- **NO commitear credenciales reales** - Solo template (.env.example)
- **NO proceder sin confirmación del usuario** - Validar cada step

### ✅ SÍ HACER:

- **Preguntar al usuario** - Confirmación, preferencias, strategy
- **Educar** - Explicar por qué cada step es necesario
- **Documentar TODO** - Infrastructure setup, URLs, comandos
- **Validar** - Checklist completo antes de finalizar
- **Guardar información** - Project IDs, URLs, regions para fases posteriores
- **Ser descriptivo** - .env.example con instrucciones claras

---

## 📋 CHECKLIST INTERNO (NO MOSTRAR)

Validar que se completó:

- [ ] Supabase project creado
- [ ] Supabase CLI instalado
- [ ] Project linked localmente
- [ ] Vercel project creado y desplegado
- [ ] Vercel CLI instalado (opcional pero recomendado)
- [ ] Environment variables configuradas en Vercel
- [ ] Auth redirect URLs whitelist configurado
- [ ] .env creado con credenciales reales
- [ ] .env.example creado sin credenciales
- [ ] .gitignore incluye .env* (verificado)
- [ ] Git strategy definido
- [ ] infrastructure-setup.md creado
- [ ] Usuario confirmó que todo funciona
- [ ] Recomendación de commit proporcionada

---

**Output final:** Infraestructura cloud completamente configurada y documentada, lista para backend setup.
