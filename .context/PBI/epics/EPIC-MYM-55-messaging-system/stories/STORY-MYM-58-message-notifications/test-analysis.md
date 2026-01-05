# Test Analysis Report

**Feature:** Message Notifications & Realtime Badge (STORY-MYM-58)
**Date:** 4 de enero de 2026
**Source:** [Exploratory session notes](./exploratory.md)

---

## Summary

- **Total scenarios analyzed:** 6
- **Regression candidates:** 6
- **Automation candidates:** 5
- **Manual-only:** 1 (TC-05 partially manual due to reported consistency issues, though technically automatable)
- **Deferred:** 0

---

## Regression Test Candidates

### Critical Priority

| #   | Scenario                                       | Type       | Automatable | Notes                                                                 |
| --- | ---------------------------------------------- | ---------- | ----------- | --------------------------------------------------------------------- |
| 1   | TC-01: Badge visible con mensajes no leídos    | Happy path | Yes         | Core UI feedback. Verifies unread count > 0.                          |
| 2   | TC-05: Contador actualiza en tiempo real       | Functional | Partial     | Core realtime feature. Reported flaky; requires robust syncing logic. |

### High Priority

| #   | Scenario                                           | Type       | Automatable | Notes                                                                 |
| --- | -------------------------------------------------- | ---------- | ----------- | --------------------------------------------------------------------- |
| 3   | TC-03: Toast notification al recibir mensaje       | Functional | Yes         | Critical for user engagement outside conversation.                    |
| 4   | TC-06: Click en toast navega a la conversación     | Navigation | Yes         | Verifies deep linking from notification.                              |

### Medium Priority

| #   | Scenario                                           | Type       | Automatable | Notes                                                                 |
| --- | -------------------------------------------------- | ---------- | ----------- | --------------------------------------------------------------------- |
| 5   | TC-04: Sin toast cuando estás en la conversación   | UX         | Yes         | Prevents notification spam.                                           |
| 6   | TC-02: Badge oculto cuando contador es 0           | UI         | Yes         | Visual cleanup.                                                       |

### Low Priority / Deferred

*None.*

---

## Automation Candidates Summary

**Ready for automation (Fase 12):**

1.  **TC-01, TC-02:** Standard E2E UI checks for element visibility/text.
2.  **TC-03, TC-04, TC-06:** E2E tests involving message injection (mocked or real) and Toast interception.

**Manual regression / Investigation:**

1.  **TC-05 (Realtime Consistency):** While technically automatable with multi-client E2E (e.g., Playwright contexts), the reported inconsistency suggests it needs manual verification or unit tests on the logic first before stable E2E.

---

## Recommendations

### For Test Documentation (next step):

- Document **TC-01, TC-03, TC-05** as distinct Test Cases in Jira.
- TC-02 can be a step within TC-01 (Verify reset).
- TC-04 and TC-06 can be variants/steps of the Toast notification test.

### For Automation (Fase 12):

- Prioritize **TC-01 and TC-03** for the first pass.
- Investigate **TC-05** flakiness before attempting full automation.

### For Manual Regression:

- **TC-05** must be manually stress-tested during release candidates until the optimistic update logic is fixed.
