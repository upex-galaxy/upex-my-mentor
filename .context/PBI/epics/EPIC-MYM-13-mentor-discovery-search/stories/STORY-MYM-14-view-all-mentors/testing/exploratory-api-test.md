# Notas de testing exploratorio de API

**Fecha:** 2026-02-13
**Feature:** MYM-14 - View All Available Mentors
**Epic:** MYM-13 - Mentor Discovery & Search
**Base URL (staging):** https://staging-upexmymentor.vercel.app
**Duracion:** 30 min

---

## Resumen ejecutivo

- **Estado general:** ISSUES FOUND (BLOCKED)
- **Bloqueador principal:** /api/mentors retorna 404 en staging
- **Conclusion:** La funcionalidad parece no estar desplegada en staging; se requiere deployment para continuar pruebas.
- **Endpoints probados:** 1
- **Escenarios ejecutados:** 1 de 4 planificados
- **Issues encontrados:** 2 (MYM-141, MYM-142)
- **RLS Policies:** NOT TESTED (endpoint publico bloqueado)

---

## Hallazgos clave

1. **Endpoint critico inexistente en staging:** /api/mentors retorna 404, bloquea la US MYM-14.
2. **La funcionalidad no parece desplegada:** sin el endpoint activo no se puede validar el flujo.
3. **Contrato desalineado:** el OpenAPI apunta a un dominio de staging no resolvible.
4. **Testing incompleto por bloqueo:** no fue posible validar paginacion, filtros, orden por rating ni datos.
5. **Acceso TLS:** el primer intento sin -k fallo por verificacion TLS (revocation check).

---

## API Exploration Plan (US MYM-14)

**Endpoint objetivo:**

| Metodo | Endpoint     | Proposito                     |
| ------ | ------------ | ----------------------------- |
| GET    | /api/mentors | Listar mentores verificados   |

**Escenarios previstos:**

1. Happy path: lista devuelve 200 y solo mentores is_verified = true.
2. Paginacion: parametros page/limit o cursor segun AC.
3. Filtros: keyword, min_rating.
4. Errores: parametros invalidos (ej. min_rating=6).

---

## Endpoint Testing

### 1) GET /api/mentors - FAILED

**Request:**

- Metodo: GET
- URL: https://staging-upexmymentor.vercel.app/api/mentors
- Headers: Accept: application/json

**Expected Response:**

- Status: 200 OK
- Body: JSON con lista de mentores verificados + paginacion

**Actual Response:**

- Status: 404 Not Found
- Body: HTML (Next.js 404)

**Assertions:**

- [ ] Status code matches
- [ ] Response schema valid
- [ ] Solo mentores verificados

**Outcome:** FAILED

**Notas:**

- Bloquea la validacion de la US MYM-14 en API y UI.

---

## Observaciones de Infra/Acceso

- El primer intento sin -k (curl) fallo por verificacion TLS (revocation check). Con -k se pudo obtener la respuesta, pero fue 404.

---

## Issues Encontrados (detallados)

### MYM-141 - MentorDiscovery: API: GET /api/mentors retorna 404 en staging

- **Tipo:** Functional
- **Severidad:** Critica
- **Impacto:** Bloquea la galeria de mentores y toda validacion API/UX de MYM-14.
- **Reproduccion rapida:** GET https://staging-upexmymentor.vercel.app/api/mentors
- **Expected:** 200 OK + JSON con mentores verificados y paginacion
- **Actual:** 404 Not Found (HTML Next.js)
- **Workaround:** No aplica

### MYM-142 - MentorDiscovery: Docs: URL de staging incorrecta en api-contracts.yaml

- **Tipo:** Content
- **Severidad:** Moderada
- **Impacto:** Bloquea testing basado en contrato al usar un URL no resolvible
- **Reproduccion rapida:** servers[staging].url = https://staging.upexmymentor.com (no resuelve)
- **Expected:** URL real y resolvible de staging
- **Actual:** DNS no resuelve
- **Workaround:** Usar https://staging-upexmymentor.vercel.app como base URL para pruebas

---

## Test Plan (post-fix)

1. Reintentar GET /api/mentors y validar 200 OK.
2. Verificar que solo retorna mentores con is_verified = true.
3. Validar orden por rating descendente (si aplica al API).
4. Validar paginacion (page/limit o cursor segun AC).
5. Validar filtros: keyword y min_rating.
6. Validar errores: min_rating=6 (400) y parametros invalidos.
7. Validar consistencia de campos minimos en la respuesta (nombre, especialidad, rating, reviews, hourly_rate).

---

## Recomendaciones

- Implementar y desplegar el handler de /api/mentors en staging.
- Corregir el server URL de staging en .context/SRS/api-contracts.yaml.
- Reintentar exploracion completa despues del despliegue.

---

## Decision

- **Resultado:** FAILED (endpoint critico no disponible)
- **Accion:** Esperar fix y redeploy antes de continuar con pruebas API/UX
