# Test Prioritization Report

**Feature:** Message Notifications & Realtime Badge (STORY-MYM-58)
**Date:** 4 de enero de 2026
**Total Candidates:** 6

---

## Prioritization Summary

| Track                | Count | Execution            |
| -------------------- | ----- | -------------------- |
| Automated Regression | 5     | CI/CD Pipeline       |
| Manual Regression    | 1     | Sprint end / Release |
| Deferred             | 0     | Backlog              |

---

## Automated Regression (Priority Order)

| Rank | Scenario                                     | Score | Test Type | ATC ID |
| ---- | -------------------------------------------- | ----- | --------- | ------ |
| 1    | TC-03: Toast notification al recibir mensaje | 16    | E2E       | TBD    |
| 2    | TC-01: Badge visible con mensajes no leídos  | 12    | E2E       | TBD    |
| 3    | TC-04: Sin toast en conversación activa      | 9     | E2E       | TBD    |
| 4    | TC-06: Click en toast navega a conversación  | 9     | E2E       | TBD    |
| 5    | TC-02: Badge oculto cuando contador es 0     | 4     | E2E       | TBD    |

**Estimated automation effort:** 5 ATCs

---

## Manual Regression

| Rank | Scenario                                     | Score | Reason Not Automated                  |
| ---- | -------------------------------------------- | ----- | ------------------------------------- |
| 1    | TC-05: Contador actualiza en tiempo real     | 25    | High instability/flakiness reported.  |

**Manual execution time:** ~10 minutes (requires multi-device/tab sync check)

---

## Deferred (Backlog)

*None.*

---

## Recommendations

### Immediate Actions:

1.  **Document TC-03, TC-01, TC-05** in Jira immediately. These represent the highest risk/value.
2.  **TC-04, TC-06** should be documented as part of the Toast Notification suite (possibly as variants).
3.  **TC-05** requires a specific "Bug/Task" ticket to address the inconsistency before full automation is attempted.

### For Fase 12 (Automation):

-   Start with **TC-03 and TC-01** (Highest ROI).
-   Mock the backend events to ensure stability for these tests initially.
