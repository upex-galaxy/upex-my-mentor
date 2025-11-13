# Prompt: Pre-Deploy Checklist

## Contexto
Antes de desplegar a producción, validar que todo está listo.

## Checklist

### 1. Tests
- [ ] Unit tests pasando (100%)
- [ ] Integration tests pasando
- [ ] E2E tests pasando en staging
- [ ] Smoke tests manuales OK
- [ ] Performance tests OK (si aplica)

### 2. Code Quality
- [ ] Code review aprobado
- [ ] No hay TODOs críticos
- [ ] Linting pasando
- [ ] Security scan OK

### 3. Infraestructura
- [ ] Variables de entorno configuradas en producción
- [ ] Secrets configurados correctamente
- [ ] Database migrations ready (si aplica)
- [ ] Backup de producción reciente

### 4. Monitoreo
- [ ] Sentry/DataDog configurado
- [ ] Alertas configuradas
- [ ] Dashboards listos

### 5. Stakeholders
- [ ] PM aprobó deployment
- [ ] QA aprobó testing
- [ ] DevOps listo para monitorear

## Output
✅ Listo para deploy a producción
