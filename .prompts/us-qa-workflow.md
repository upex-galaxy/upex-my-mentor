# US QA Workflow

> Complete workflow for QA activities on a User Story, from exploratory testing to test automation.

---

## Overview

This workflow guides AI through the complete QA process for a User Story, covering:

- **Fase 10:** Exploratory Testing (validation)
- **Fase 11:** Test Documentation (regression planning)
- **Fase 12:** Test Automation (KATA implementation)

**Input options:**

- Single User Story
- Multiple related User Stories
- Complete Epic

---

## Prerequisites

- User Story in "Ready For QA" status
- Feature deployed to staging
- Access to Playwright MCP (`mcp__playwright__*`)
- Access to Atlassian MCP (`mcp__atlassian__*`)

---

## Workflow Steps

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 10: EXPLORATORY TESTING                  │
├─────────────────────────────────────────────────────────────────┤
│ Step 0 → Verify "Ready For QA"                                  │
│ Step 1 → Smoke Test                                             │
│ Step 2 → Exploratory Testing                                    │
│ Step 3 → Bug Report (conditional)                               │
│ Step 4 → Decision: PASSED / FAILED                              │
│      └── FAILED? → Wait for fixes, return to Step 1             │
│      └── PASSED? → Transition to "QA Approved", continue        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 FASE 11: TEST DOCUMENTATION                      │
├─────────────────────────────────────────────────────────────────┤
│ Step 5 → Analyze test candidates                                │
│ Step 6 → Prioritize ATCs for regression                         │
│ Step 7 → Create Test issues in Jira                             │
│      └── Mark automation candidates                             │
│      └── Mark manual-only tests                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  FASE 12: TEST AUTOMATION                        │
├─────────────────────────────────────────────────────────────────┤
│ Step 8 → Select test to automate                                │
│ Step 9 → Implement ATC (E2E or Integration)                     │
│ Step 10 → Validate in CI                                        │
│ Step 11 → Update Jira test status                               │
│ Step 12 → Repeat for remaining candidates                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 0: Verify Ready For QA

**Objective:** Confirm the User Story is ready for testing.

**Actions:**

```
1. Read the User Story from Jira (mcp__atlassian__getJiraIssue)
2. Verify status is "Ready For QA" (or equivalent)
3. Identify staging URL for testing
4. Gather acceptance criteria
5. Check for Shift-Left test cases (if available)
```

**Output:**

```markdown
## QA Workflow Started

**User Story:** [US-XXX] [Title]
**Status:** Ready For QA ✓
**Staging URL:** [URL]
**Acceptance Criteria:** [Count]
**Shift-Left Test Cases:** [Yes/No]

Proceeding to Smoke Test...
```

---

## Step 1: Smoke Test

**Prompt:** `.prompts/fase-10-exploratory-testing/smoke-test.md`

**Objective:** Quick validation that the deployment is functional.

**Actions:**

1. Navigate to staging
2. Verify page loads
3. Check critical paths work
4. Validate no blocking errors

**Decision:**

- **PASSED** → Continue to Step 2
- **FAILED** → Report blocker, STOP workflow

---

## Step 2: Exploratory Testing

**Prompt:** `.prompts/fase-10-exploratory-testing/exploratory-test.md`

**Objective:** Deep exploration of the feature to find edge cases and defects.

**Actions:**

1. Use Shift-Left test cases as guide (or ACs if no Shift-Left)
2. Execute scenarios using Playwright MCP
3. Document findings as session notes
4. Identify any issues

**Tools:**

- `mcp__playwright__browser_navigate`
- `mcp__playwright__browser_snapshot`
- `mcp__playwright__browser_click`
- `mcp__playwright__browser_type`
- `mcp__playwright__browser_take_screenshot`

**Output:**

- Session notes with tested scenarios
- List of issues found (if any)
- Recommendations

---

## Step 3: Bug Report (Conditional)

**Prompt:** `.prompts/fase-10-exploratory-testing/bug-report.md`

**Objective:** Report any defects found during exploration.

**Trigger:** Only if issues were found in Step 2

**CRITICAL:** Always confirm with human before creating bug in Jira.

**Actions:**

1. Ask user if bug should be retested
2. Retest to confirm reproducibility (if requested)
3. Document bug details
4. Ask user to confirm creation
5. Create Bug in Jira (if confirmed)

**Output:**

- Bug issue created in Jira
- Bug linked to User Story
- Session notes updated

---

## Step 4: Decision Point

**Objective:** Determine if the feature passes QA.

**Criteria for PASSED:**

- All acceptance criteria validated
- No critical or high bugs
- UX is acceptable
- Performance is acceptable

**Actions based on result:**

| Result                 | Action                                             |
| ---------------------- | -------------------------------------------------- |
| **PASSED**             | Transition US to "QA Approved", continue to Step 5 |
| **PASSED WITH ISSUES** | Create bugs, wait for fixes, re-test               |
| **FAILED**             | Report issues, do NOT continue                     |

**Transition:**

```
Tool: mcp__atlassian__transitionJiraIssue (if available)

Transition US to "QA Approved" status
```

---

## Step 5: Analyze Test Candidates

**Prompt:** `.prompts/fase-11-test-documentation/test-analysis.md`

**Objective:** Identify which scenarios should become regression tests.

**Timing:** This step happens AFTER "QA Approved" (asynchronous).

**Actions:**

1. Review exploratory session notes
2. Identify scenarios for regression
3. Classify: automatable vs manual-only
4. Generate analysis report

**Output:**

- List of regression test candidates
- Automation recommendations

---

## Step 6: Prioritize ATCs

**Prompt:** `.prompts/fase-11-test-documentation/test-prioritization.md`

**Objective:** Determine priority for regression tests.

**Actions:**

1. Apply risk-based scoring
2. Rank tests by business impact × failure risk
3. Separate automated vs manual tracks
4. Generate prioritization report

**Output:**

- Prioritized test list
- Clear automation vs manual separation

---

## Step 7: Create Tests in Jira

**Prompt:** `.prompts/fase-11-test-documentation/test-documentation.md`

**Objective:** Document test cases in Jira for traceability.

**Actions:**

1. Ask user: Gherkin format or Traditional?
2. Generate test case content
3. Create "Test" issues in Jira
4. Mark automation candidates with label
5. Link tests to User Story

**Tools:**

- `mcp__atlassian__createJiraIssue`
- `mcp__atlassian__getJiraProjectIssueTypesMetadata`

**Output:**

- Test issues created in Jira
- Tests linked to User Story
- Automation candidates identified

---

## Step 8: Select Test to Automate

**Objective:** Choose which test to implement.

**Ask user:**

```
The following tests are marked for automation:

1. [TEST-001] Login with valid credentials (E2E)
2. [TEST-002] API authentication (Integration)
3. [TEST-003] Password validation (E2E)

Which test would you like to automate?
- Enter test number(s) or "all"
```

---

## Step 9: Implement ATC

**Prompt (E2E):** `.prompts/fase-12-test-automation/automation-e2e-test.md`
**Prompt (Integration):** `.prompts/fase-12-test-automation/automation-integration-test.md`

**CRITICAL:** Before implementing, read KATA guidelines:

- `.context/guidelines/TAE/automation-standards.md`
- `.context/guidelines/TAE/kata-architecture.md`

**Actions:**

1. Determine if component exists
2. Create/update component with ATC
3. Create test file
4. Register in fixture

**Output:**

- ATC implemented following KATA standards
- Test file created
- Component registered

---

## Step 10: Validate in CI

**Objective:** Ensure test passes locally and in CI.

**Actions:**

1. Run test locally: `bun run test [test-file]`
2. Verify passes
3. Check CI pipeline (if configured)

**KATA Compliance Check:**

- [ ] ATC has `@atc('TEST-XXX')` decorator
- [ ] Locators inline (not separate)
- [ ] Fixed assertions in ATC
- [ ] Uses import aliases
- [ ] No unnecessary helpers

---

## Step 11: Update Jira

**Objective:** Mark test as automated in Jira.

**Actions:**

1. Update Test issue status to "Automated"
2. Add label "automated"
3. Add comment with implementation reference

---

## Step 12: Repeat for Remaining

**Objective:** Continue until all candidates are automated.

**Loop:**

```
For each remaining automation candidate:
  → Go to Step 8
```

**When complete:**

```markdown
## QA Workflow Complete

**User Story:** [US-XXX]
**Status:** QA Approved

### Summary:

- Exploratory Testing: PASSED
- Tests Documented: [N] tests in Jira
- Tests Automated: [M] ATCs implemented

### Files Created/Modified:

- [List of test files]

### Next Steps:

- Tests will run in CI pipeline
- Manual tests added to regression checklist
```

---

## Context Files Required

Before starting, ensure these files are available:

| File                                              | Purpose                |
| ------------------------------------------------- | ---------------------- |
| `.context/guidelines/TAE/KATA-AI-GUIDE.md`        | Quick KATA orientation |
| `.context/guidelines/TAE/automation-standards.md` | Coding standards       |
| `.context/guidelines/TAE/kata-architecture.md`    | Framework architecture |

---

## MCP Tools Used

| Tool                                       | Phase | Purpose                |
| ------------------------------------------ | ----- | ---------------------- |
| `mcp__atlassian__getJiraIssue`             | All   | Read US details        |
| `mcp__atlassian__createJiraIssue`          | 11    | Create Test/Bug issues |
| `mcp__atlassian__addCommentToJiraIssue`    | All   | Add comments           |
| `mcp__playwright__browser_navigate`        | 10    | Navigate pages         |
| `mcp__playwright__browser_snapshot`        | 10    | Get page structure     |
| `mcp__playwright__browser_click`           | 10    | Click elements         |
| `mcp__playwright__browser_type`            | 10    | Type text              |
| `mcp__playwright__browser_take_screenshot` | 10    | Capture evidence       |

---

## Tracking Progress

Use this template to track workflow progress:

```markdown
## QA Workflow Progress: [US-XXX]

### Fase 10: Exploratory Testing

- [x] Step 0: Verify Ready For QA
- [x] Step 1: Smoke Test - PASSED
- [x] Step 2: Exploratory Testing - PASSED
- [ ] Step 3: Bug Report - N/A (no bugs)
- [x] Step 4: Decision - PASSED → QA Approved

### Fase 11: Test Documentation

- [x] Step 5: Analyze candidates - 5 tests identified
- [x] Step 6: Prioritize - 3 for automation, 2 manual
- [x] Step 7: Created in Jira - TEST-001 to TEST-005

### Fase 12: Test Automation

- [x] Step 8-11: TEST-001 - Automated
- [x] Step 8-11: TEST-002 - Automated
- [ ] Step 8-11: TEST-003 - In progress
- [ ] Step 12: Complete remaining

**Current Status:** Step 8-11 (TEST-003)
```

---

## Error Handling

| Situation            | Action                                    |
| -------------------- | ----------------------------------------- |
| Smoke test fails     | Report blocker, stop workflow             |
| Critical bug found   | Create bug, wait for fix, re-test         |
| Can't reach staging  | Verify URL, check deployment status       |
| Jira MCP unavailable | Document locally, create manually later   |
| Automation blocked   | Mark as manual-only, continue with others |

---

## Related Documentation

- **Developer Workflow:** `.prompts/us-dev-workflow.md`
- **KATA Guidelines:** `.context/guidelines/TAE/`
- **Phase 10:** `.prompts/fase-10-exploratory-testing/`
- **Phase 11:** `.prompts/fase-11-test-documentation/`
- **Phase 12:** `.prompts/fase-12-test-automation/`
