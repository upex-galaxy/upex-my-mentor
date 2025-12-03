# Fase 11: Test Automation

## IMPORTANTE
Esta fase viene DESPUÉS de Exploratory Testing (Fase 10).
Solo automatizas funcionalidad ya validada manualmente.

## Arquitectura: KATA Framework
Este proyecto usa **KATA** (Keyword-Action-Test Architecture) para organizar tests.

Lee primero:
1. `test-strategy.md` - Estrategia general KATA
2. `kata-implementation-plan.md` - Plan de implementación KATA
3. `automation-standards.md` - Estándares de código

## Tipos de tests en esta fase
- ✅ Integration tests (API)
- ✅ E2E tests (UI con Playwright)
- ❌ Unit tests (esos van en Fase 7 - Implementation)

## Orden de ejecución
1. test-strategy.md (una vez - setup inicial KATA)
2. kata-implementation-plan.md (una vez - plan maestro)
3. integration-test-plan.md (por feature - plan de tests API)
4. implement-integration-tests.md (implementar tests API)
5. e2e-test-plan.md (por feature - plan de tests E2E)
6. implement-e2e-tests.md (implementar tests E2E)

## Output
- Tests de integración funcionando en CI/CD
- Tests E2E funcionando en staging
- Suite de regression (nightly runs)
