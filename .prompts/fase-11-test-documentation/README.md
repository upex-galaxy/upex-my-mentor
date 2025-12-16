# Fase 11: Test Documentation

## Purpose

Asynchronous documentation of test cases in Jira AFTER the feature has passed exploratory testing.

**Why this phase exists:**
- Features are validated first (rapid feedback)
- Documentation happens when feature is stable
- Tests are documented for regression (manual or automated)
- Clear traceability between requirements and tests

---

## Prerequisites

- US status: "QA Approved" (exploratory testing passed)
- Exploratory session notes with validated scenarios
- Access to Atlassian MCP tools

---

## Prompts in This Phase

| Order | Prompt                   | Purpose                                   |
| ----- | ------------------------ | ----------------------------------------- |
| 1     | `test-analysis.md`       | Analyze candidates for regression testing |
| 2     | `test-prioritization.md` | Prioritize which tests to document        |
| 3     | `test-documentation.md`  | Create Test issues in Jira                |

---

## Execution Flow

```
US Status: QA Approved
        ↓
[1] Test Analysis
    └── Review exploratory findings
    └── Identify scenarios for regression
    └── Classify: automatable vs manual-only
        ↓
[2] Test Prioritization
    └── Apply risk-based prioritization
    └── Determine which tests go to regression
    └── Mark automation candidates
        ↓
[3] Test Documentation
    └── Create "Test" issues in Jira
    └── Format: Gherkin (recommended) or Traditional
    └── Link to related User Story
        ↓
Output: Test cases documented in Jira
    └── Some marked for automation → Fase 12
    └── Some marked manual-only → Manual regression
```

---

## Test Case Classification

| Type            | Description                  | Next Step                  |
| --------------- | ---------------------------- | -------------------------- |
| **Automatable** | Can be automated with KATA   | → Fase 12: Test Automation |
| **Manual-only** | Requires human judgment      | → Manual regression suite  |
| **Deferred**    | Low priority, document later | → Backlog                  |

---

## Jira Issue Type: Test

**Required fields:**
- Issue Type: `Test` (Custom Issue Type)
- Summary: Clear test case name
- Description: Test case in Gherkin or Traditional format
- Custom Field: `Test Status` (New, Automated, Manual)
- Labels: `regression`, `automation-candidate`, etc.
- Link: Related User Story

---

## Test Case Formats

### Gherkin (KATA Standard - Recommended)

```gherkin
Feature: User Login

Scenario: Successful login with valid credentials
  Given I am on the login page
  When I enter valid email "user@example.com"
  And I enter valid password "Password123!"
  And I click the submit button
  Then I should be redirected to the dashboard
  And I should see a welcome message

Scenario Outline: Login with invalid credentials
  Given I am on the login page
  When I enter email "<email>"
  And I enter password "<password>"
  And I click the submit button
  Then I should see an error message "<error>"

  Examples:
    | email              | password    | error                    |
    | invalid            | Password1!  | Invalid email format     |
    | user@example.com   | wrong       | Invalid credentials      |
    | user@example.com   |             | Password is required     |
```

### Traditional Format (Alternative)

| Step | Action                 | Test Data        | Expected Result         |
| ---- | ---------------------- | ---------------- | ----------------------- |
| 1    | Navigate to login page | -                | Login form is displayed |
| 2    | Enter email            | user@example.com | Email field populated   |
| 3    | Enter password         | Password123!     | Password field masked   |
| 4    | Click submit           | -                | Redirect to dashboard   |

---

## Tools Required

| Tool                                               | Purpose                 |
| -------------------------------------------------- | ----------------------- |
| `mcp__atlassian__createJiraIssue`                  | Create Test issues      |
| `mcp__atlassian__getJiraProjectIssueTypesMetadata` | Get Test issue schema   |
| `mcp__atlassian__addCommentToJiraIssue`            | Link to related stories |

---

## Output

- Test cases created in Jira as "Test" issue type
- Tests linked to related User Stories
- Tests classified (automation candidate vs manual)
- Ready for automation (Fase 12) or manual regression

---

## Next Phase

For tests marked as **automation candidates**:
- Proceed to **Fase 12: Test Automation**
- Implement ATCs following KATA architecture

---

## Related Documentation

- **QA Workflow:** `.prompts/us-qa-workflow.md`
- **KATA Guidelines:** `.context/guidelines/tae/`
- **TMS Integration:** `.context/guidelines/tae/tms-integration.md`
