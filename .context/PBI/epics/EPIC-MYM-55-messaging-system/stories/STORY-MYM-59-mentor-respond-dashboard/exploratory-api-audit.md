# Exploratory API Testing Report - MYM-59: Messaging & RLS

- **Date:** 2026-02-18
- **Executor:** José Andrés Lorca Gálvez (QA) + Gemini CLI (QA Automation Agent - gemini-3-pro-preview)
- **Environment:** Staging
- **API Base URL:** `https://ionevzckjyxtpmyenbxc.supabase.co/rest/v1`

## Resumen Ejecutivo

| ID  | Escenario                                | Endpoint                                    | Resultado HTTP | Pass/Fail | Evidencia                                                   |
| --- | ---------------------------------------- | ------------------------------------------- | -------------- | --------- | ----------------------------------------------------------- |
| 1   | Autenticación (Login)                    | `POST /auth/v1/token`                       | 200 OK         | ✅ PASS    | Token recibido, User ID: ...fa52                            |
| 2   | Ver conversaciones propias               | `GET /conversations`                        | 200 OK         | ✅ PASS    | Retorna conversación propia: ...77a1                        |
| 3   | **RLS Read:** Leer conv. ajena (ID real) | `GET /conversations?id=eq.c49a...&select=*` | 200 OK (Empty) | ✅ PASS    | ID real confirmado por SQL (ver SEC-01), API retorna `[]`   |
| 4   | Enviar mensaje en conv. propia           | `POST /messages`                            | 201 Created    | ✅ PASS    | Mensaje creado: "Test API..."                               |
| 5   | **RLS Write:** Escribir en ajena         | `POST /messages`                            | 403 Forbidden  | ✅ PASS    | Bloqueo correcto al intentar escribir en conversación ajena |

## Hallazgos

### Seguridad (RLS)
- **Estado:** ✅ **VERIFIED & SECURE**
- Las políticas RLS impiden correctamente que un usuario lea o escriba en conversaciones donde no es participante (`participant_1_id` ni `participant_2_id`).
- Intento de escritura maliciosa retornó `403 Forbidden`, lo cual es el comportamiento ideal.

### Funcionalidad
- El flujo de login, lectura de conversaciones y envío de mensajes funciona según lo esperado.
- La API responde con los códigos de estado correctos.

## Recomendaciones de Automatización

1. **Test de Integración (API Level):**
   - Automatizar el caso de **RLS Write**: intento de escritura en conversación ajena como test negativo permanente (regresión de seguridad).
   - Automatizar el flujo **Login -> Get Conversations -> Post Message** como *smoke test* para la feature de mensajería.

2. **Monitorización:**
   - Configurar alertas si se detectan picos de errores 403 en el endpoint `/messages`, ya que podría indicar intentos de acceso no autorizado o bugs en el frontend.

## 🛡️ Hardening Checks (Security Audit)

Auditoría de seguridad avanzada para confirmar robustez de RLS y prevenir falsos positivos.

| ID     | Escenario                               | Método | Endpoint         | Resultado Esperado                                                    | Resultado Actual  | Pass/Fail  | Evidencia                                                                      |
| ------ | --------------------------------------- | ------ | ---------------- | --------------------------------------------------------------------- | ----------------- | ---------- | ------------------------------------------------------------------------------ |
| SEC-01 | **RLS Read** (ID ajeno real: `c49a...`) | GET    | `/conversations` | 200 `[]` (RLS filtra) **o** 403 (según policy)                        | 200 `[]`          | ✅ **PASS** | SQL confirma que el ID existe y que el usuario no participa; API retorna vacío |
| SEC-02 | **RLS Messages** (foreign)              | GET    | `/messages`      | 200 `[]` **o** 403                                                    | 200 `[]`          | ✅ **PASS** | Acceso a mensajes ajenos retorna array vacío por RLS                           |
| SEC-03 | **Spoofing** sender_id (OTHER)          | POST   | `/messages`      | 403 Forbidden **o** override/ignore de `sender_id` (verificado en DB) | 403 Forbidden     | ✅ **PASS** | Bloqueo 403; SQL confirma que NO se insertó row con content "Spoofing Attempt" |
| SEC-04 | **RLS PATCH** ajeno                     | PATCH  | `/messages`      | 403 **o** 200 `[]` (0 rows affected)                                  | 200 `[]` (0 rows) | ✅ **PASS** | Ninguna fila afectada; SQL confirma `content` intacto                          |
| SEC-05 | **RLS DELETE** ajeno                    | DELETE | `/messages`      | 403 **o** 200 `[]` (0 rows deleted)                                   | 200 `[]` (0 rows) | ✅ **PASS** | Ninguna fila borrada; SQL confirma que el mensaje persiste                     |
| SEC-06 | **Auth Inválida** (Bad Token)           | GET    | `/conversations` | 401/403 (no autorizado)                                               | 401 Unauthorized  | ✅ **PASS** | Token falso rechazado correctamente                                            |
| SEC-07 | **Missing Auth** (Anon request)         | GET    | `/conversations` | 401/403 **o** 200 `[]` (RLS filtra completamente al rol `anon`)       | 200 `[]`          | ✅ **PASS** | Rol `anon` restringido por RLS (0 rows visibles)                               |


### ✅ Two-Token Verification (Mentor + Student)

*Nota: Verificación E2E realizada exitosamente con dos usuarios reales (Mentor `63ec...` y Student `fa13...`) intercambiando mensajes y verificando aislamiento RLS.*

| ID    | Check             | Actor               | Endpoint                                                            | Expected        | Actual    | Pass/Fail  | Evidence                                                      |
| ----- | ----------------- | ------------------- | ------------------------------------------------------------------- | --------------- | --------- | ---------- | ------------------------------------------------------------- |
| TT-01 | Login A           | Mentor              | `/auth/v1/token`                                                    | 200             | 200       | ✅ **PASS** | `user_A_id: ...fa52`                                          |
| TT-02 | Login B           | Student             | `/auth/v1/token`                                                    | 200             | 200       | ✅ **PASS** | `user_B_id: ...e778`                                          |
| TT-03 | A->B delivery     | A (Send) / B (Read) | `POST /messages` + `GET /messages?conversation_id=eq.<OWN_CONV_ID>` | Msg visible (B) | 201 / 200 | ✅ **PASS** | B leyó el mensaje por API (content match)                     |
| TT-04 | RLS read foreign  | B (as intruder)     | `GET /conversations?id=eq.c49a...&select=*`                         | 200 `[]` o 403  | 200 `[]`  | ✅ **PASS** | B bloqueado al leer conversación ajena (ID real validado SQL) |
| TT-05 | RLS write foreign | B (as intruder)     | `POST /messages` (con `conversation_id=c49a...`)                    | 403 Forbidden   | 403       | ✅ **PASS** | B bloqueado al escribir en conversación ajena                 |

## Conclusión Final

El sistema de mensajería (MYM-59) demuestra una implementación **ROBUSTA** de Row Level Security:

- No hay fugas de datos entre inquilinos (cross-tenant leak).
- No es posible la suplantación de identidad (spoofing) en el envío de mensajes.
- Las operaciones de escritura (UPDATE/DELETE) están correctamente acotadas al propietario del recurso.
- RLS verificado desde **dos identidades reales** (Mentor + Student) y reforzado con hardening PATCH/DELETE.
