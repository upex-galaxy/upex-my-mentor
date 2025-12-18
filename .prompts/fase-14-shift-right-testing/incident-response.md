# Prompt: Incident Response Playbook

## Playbook de Incidentes

### Severidad 1 (Critical)
**Definición:** Servicio completamente caído

**Acciones:**
1. Alert team immediately
2. Investigate logs/monitoring
3. Rollback si es deployment reciente
4. Fix + hotfix deploy
5. Post-mortem

### Severidad 2 (High)
**Definición:** Funcionalidad parcial

**Acciones:**
1. Notify stakeholders
2. Investigate + triage
3. Fix en próximo deployment
4. Workaround si es posible

### Severidad 3 (Medium)
**Definición:** Issue no crítico

**Acciones:**
1. Create ticket
2. Prioritize en backlog
3. Fix en próximo sprint

## Checklist de Investigación
- [ ] Check Sentry errors
- [ ] Check logs
- [ ] Check monitoring dashboards
- [ ] Reproduce locally
- [ ] Identify root cause
- [ ] Document findings
- [ ] Create fix
- [ ] Deploy fix
- [ ] Verify resolution
- [ ] Write post-mortem

## Output
- Playbook documentado
- Team trained
- Incidents tracked
