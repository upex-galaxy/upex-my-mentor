# Fase 10: Exploratory Testing

## Purpose

Execute manual exploratory testing to validate functionality and discover defects BEFORE investing in test automation.

**Why exploratory testing first:**

- Rapid feedback (minutes vs hours)
- Finds UX bugs that automated tests miss
- Validates features before automating
- Shift-left = feedback as early as possible

---

## Prerequisites

- Feature deployed to staging
- User Story in "Ready For QA" status
- Test cases from Shift-Left Testing (or Acceptance Criteria)

---

## Prompts in This Phase

| Order | Prompt                | Purpose                                        |
| ----- | --------------------- | ---------------------------------------------- |
| 1     | `smoke-test.md`       | Quick validation that deployment is functional |
| 2     | `exploratory-test.md` | Deep exploration using Playwright MCP          |
| 3     | `bug-report.md`       | Report defects found (conditional)             |

---

## Execution Flow

```
US Status: Ready For QA
        ↓
[1] Smoke Test (5-10 min)
    └── FAILED? → Report blocker, STOP
        ↓
[2] Exploratory Test (30-60 min)
    └── Uses Playwright MCP for UI exploration
    └── Documents findings as session notes
        ↓
[3] Bug Report (if issues found)
    └── Retest to confirm
    └── Report to Jira (with human confirmation)
        ↓
Decision: PASSED or FAILED?
    └── PASSED → Transition US to "QA Approved"
    └── FAILED → Wait for fixes, re-test
```

---

## Tools Required

| Tool                 | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `mcp__playwright__*` | UI exploration, screenshots, interactions |
| `mcp__atlassian__*`  | Bug creation, story transitions           |

---

## Output

- Smoke test results (PASSED/FAILED)
- Exploratory session notes with findings
- Bugs reported in Jira (if any)
- US transitioned to appropriate status

---

## Next Phase

If exploratory testing **PASSED**:

- Proceed to **Fase 11: Test Documentation**
- Document test cases in Jira
- Identify automation candidates

---

## Related Documentation

- **QA Workflow:** `.prompts/us-qa-workflow.md`
- **KATA Guidelines:** `.context/guidelines/TAE/`
