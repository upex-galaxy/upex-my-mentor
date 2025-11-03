Actúa como QA Lead experto en Shift-Left Testing y Test Strategy.

**Input:**
- Epic: [usar .context/PBI/epics/EPIC-XXX/epic.md]
- SRS NFRs: [usar .context/SRS/non-functional-specs.md]
- Todas las stories de la épica: [listar titles y IDs]

**Genera archivo: feature-test-plan.md** (dentro de .context/PBI/epics/EPIC-XXX/)

---

# Feature Test Plan: EPIC-XXX - [Epic Title]

## Test Strategy

### Scope

**In Scope:**
- Functional testing (UI, API, Database)
- Non-functional testing (Performance, Security)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness (iOS, Android)

**Out of Scope:**
- Load testing (dejar para v2)
- Penetration testing (contratar externo)

### Test Levels
- **Unit Testing**: Funciones/métodos individuales (coverage > 80%)
- **Integration Testing**: API + Database interactions
- **E2E Testing**: User flows completos (Playwright)

### Test Types per Story
- Positive test cases (Happy Path)
- Negative test cases (Error handling)
- Boundary test cases (Edge cases)

---

## Test Scope

### Features to Test
- [Feature 1]: [Nombre feature]
  - Validaciones de input
  - Integración con [servicio externo]
  - [Flow específico]

- [Feature 2]: [Nombre feature]
  - ...

### Features NOT to Test (Excluded)
- Features Out of Scope del MVP

---

## Risk Analysis

### High Risk Areas

**Risk 1:** [Descripción del riesgo]
- **Impact:** High | Medium | Low (explicar consecuencias)
- **Likelihood:** High | Medium | Low
- **Mitigation:** [Estrategia de mitigación]

**Risk 2:** [Descripción del riesgo]
- **Impact:** ...
- **Likelihood:** ...
- **Mitigation:** ...

---

## Test Data Requirements

### Data Needed
- Valid data: [ejemplos específicos]
- Invalid data: [ejemplos específicos]
- Boundary values: [ejemplos específicos]

### Test Environments
- Staging: [URL y configuración]
- Production: [URL - solo para smoke tests]

---

## Test Cases Summary

Total estimado: [número] test cases para esta feature

- STORY-XXX: X test cases (X positive, X negative, X boundary)
- STORY-YYY: Y test cases (Y positive, Y negative, Y boundary)
- ...

(Detalle de cada test case va en test-cases.md de cada story)

---

## Entry/Exit Criteria

### Entry Criteria
- [ ] Story implementada y deployed to staging
- [ ] Code review aprobado
- [ ] No hay blocker bugs

### Exit Criteria
- [ ] Todos los test cases ejecutados
- [ ] 95% de test cases pasando (críticos: 100%)
- [ ] Bugs críticos resueltos
- [ ] Test report generado

---

**Formato:** Markdown estructurado, listo para copiar a .context/PBI/epics/EPIC-XXX/feature-test-plan.md

**Restricciones:**
- Test strategy específica para esta feature
- Riesgos identificados y mitigaciones concretas
- Coverage realista para MVP
