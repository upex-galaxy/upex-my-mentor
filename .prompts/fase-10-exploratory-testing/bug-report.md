# Bug Report

> AI-guided bug identification, retest, and complete Jira reporting with Custom Fields.

---

## Purpose

Identify, validate, and report defects found during exploratory testing. This prompt helps the AI:

1. **Retest the bug** to confirm it's reproducible
2. **Document the defect** with proper evidence
3. **Create the bug in Jira** with ALL required custom fields
4. **Attach evidence files** (screenshots, logs, etc.)

**Prerequisites:**

- Bug identified during exploratory testing
- Access to Playwright MCP tools (`mcp__playwright__*`)
- Access to Atlassian MCP tools (`mcp__atlassian__*`)

**Important:** This prompt is configured for the **UPEX Galaxy Jira Workspace**. The custom field IDs below are shared across all projects in this workspace. Do NOT attempt to discover or query custom fields - use the IDs provided directly.

---

## Custom Fields Schema (UPEX Galaxy Workspace)

> **CRITICAL:** Use these exact field IDs when creating bugs. Do not query for custom fields.

### Required Fields

| Field ID            | Jira Field Name                   | Type     | What to Fill                                                                                                              |
| ------------------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `customfield_10109` | 🐞 Actual Result (Comportamiento) | Textarea | Describe exactly what happened (the bug behavior). Include error messages, unexpected UI states, or incorrect data shown. |
| `customfield_10110` | ✅ Expected Result (Output)       | Textarea | Describe what SHOULD have happened according to requirements or standard UX patterns.                                     |
| `customfield_10112` | Error Type                        | Dropdown | Select ONE option: `Functional`, `UI/Visual`, `Performance`, `Data`, `Integration`, or `Security`                         |
| `customfield_10041` | Severity                          | Dropdown | Select ONE option: `Critical`, `High`, `Medium`, or `Low`                                                                 |
| `customfield_12210` | Test Environment                  | Dropdown | Select ONE option: `Development`, `Staging`, or `Production`                                                              |
| `customfield_10049` | Root Cause Text                   | Textarea | Technical analysis: file path, function name, API endpoint, or "Investigation needed" if unknown                          |

### Optional Fields

| Field ID            | Jira Field Name | Type     | When to Use                                                                                                                    |
| ------------------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `customfield_10111` | 🚩 Workaround   | Textarea | Only if a temporary solution exists. Otherwise, omit or set to `null`                                                          |
| `customfield_10607` | 🧫 EVIDENCE     | Textarea | Additional notes about evidence (e.g., "See attached screenshot", "Video in attachments"). Omit if using attachments parameter |
| `customfield_12212` | Fix             | Radio    | Always set to `{"value": "Bugfix"}` for bug reports                                                                            |

### Dropdown Values Reference

**`customfield_10112` (Error Type) - Use exact string:**

```
"Functional"   → Feature doesn't work as specified
"UI/Visual"    → Layout, styling, display issues
"Performance"  → Slow loading, timeouts, memory issues
"Data"         → Wrong data displayed, calculation errors
"Integration"  → Third-party API/service failures
"Security"     → Auth bypass, data exposure, permissions
```

**`customfield_10041` (Severity) - Use exact string:**

```
"Critical" → Core functionality blocked, no workaround, data loss
"High"     → Major feature broken, workaround is difficult
"Medium"   → Feature issue with easy workaround
"Low"      → Cosmetic issue, doesn't affect functionality
```

**`customfield_12210` (Test Environment) - Use exact string:**

```
"Development" → localhost or local dev environment
"Staging"     → staging.*, *-staging.*, preview URLs
"Production"  → Live production domain
```

---

## Error Handling for Custom Fields

### If a Custom Field Fails

When Jira returns an error about a custom field (e.g., "Field customfield_XXXXX does not exist"), the AI must:

1. **DO NOT** attempt to discover or query for alternative field IDs
2. **Inform the user** with this message:

```
⚠️ Custom Field Error

The custom field `customfield_XXXXX` ([Field Name]) returned an error.
This may indicate the field was disabled or renamed in Jira.

Action Required:
Please notify the Jira Workspace Admin to verify:
1. Is the field `[Field Name]` still active in the Bug issue type?
2. What is the current custom field ID?

Once confirmed, update this prompt file:
.prompts/fase-10-exploratory-testing/bug-report.md

I will proceed to create the bug WITHOUT this field for now.
```

3. **Create the bug anyway** with the fields that DO work
4. **Add a comment** to the created bug noting which field failed

### If Dropdown Value Fails

If a dropdown value is rejected (e.g., "Option 'X' is not valid"):

```
⚠️ Dropdown Value Error

The value "[Value]" for field `[Field Name]` is not valid.
Available options may have changed in Jira.

Action Required:
Please ask the Jira Admin for current valid options for the field "[Field Name]".

Using fallback: I will set this field to the most generic option or omit it.
```

---

## Workflow

### Phase 1: Bug Confirmation

**Before reporting, confirm the bug is real.**

**Ask the user:**

```
I found a potential issue during exploration:

[Brief description of the issue]

Would you like me to:
1. Retest the bug to confirm it's reproducible
2. Skip retest and proceed to documentation
3. Dismiss this as not a bug
```

---

### Phase 2: Retest (If Requested)

**Determine retest approach based on bug type:**

| Bug Type     | Retest Method                         |
| ------------ | ------------------------------------- |
| **UI Bug**   | Use Playwright MCP to reproduce steps |
| **API Bug**  | Use API calls or network observation  |
| **Data Bug** | Query database or verify via API      |

**For UI Retest:**

```
Tools:
- mcp__playwright__browser_navigate
- mcp__playwright__browser_snapshot
- mcp__playwright__browser_click
- mcp__playwright__browser_type
- mcp__playwright__browser_take_screenshot
```

**Document retest results:**

```markdown
## Retest Results

**Attempt 1:**

- Steps executed: [1, 2, 3...]
- Result: [Reproduced / Not Reproduced]
- Evidence: [Screenshot path if captured]

**Attempt 2 (if needed):**

- Result: [Reproduced / Not Reproduced]

**Conclusion:** [Bug confirmed / Could not reproduce]
```

---

### Phase 3: Bug Documentation

**Gather ALL required information. If any data is missing, the AI must:**

1. Search for the answer in the conversation context
2. Infer from available information (e.g., test environment from URL)
3. Ask the user explicitly if cannot determine

**Required Data Checklist:**

```markdown
## Bug Details

**Title:** [Formato estándar: <EPICNAME>: <COMPONENT>: <ISSUE_SUMMARY>]
Ejemplo: "CheckoutFlow: Payment: No se muestra error al ingresar contraseña incorrecta"

**Error Type:** [Functional/UI-Visual/Performance/Data/Integration/Security]

**Severity:** [Critical/High/Medium/Low]

**Test Environment:** [Development/Staging/Production]

**Steps to Reproduce:**

1. [Precondition - user state, login, etc.]
2. [Navigation step]
3. [Action that triggers bug]
4. [Observe the bug]

**Expected Result:**
[What should happen according to requirements or common UX patterns]

**Actual Result:**
[What actually happens - be specific about error messages, behaviors]

**Root Cause Analysis:**
[Technical analysis if available - file, function, API endpoint involved]

**Evidence Files:** (Optional)

- [Path to screenshot if user provides]
- [Path to video recording if available]
- [Path to log file if relevant]

**Workaround:** (Optional)
[If there's a temporary way to achieve the goal]
```

---

### Phase 4: Human Confirmation

**CRITICAL: Always confirm with the user before creating in Jira.**

```
I've documented the following bug:

**Title:** [Title]
**Error Type:** [Error Type]
**Severity:** [Severity]
**Environment:** [Environment]

**Summary:** [Brief description]

**Custom Fields to populate:**
- 🐞 Actual Result: ✅ Ready
- ✅ Expected Result: ✅ Ready
- Error Type: ✅ Ready
- Severity: ✅ Ready
- Test Environment: ✅ Ready
- Root Cause: ✅ Ready
- Workaround: [Ready/N/A]
- Evidence: [Ready/N/A]

**Attachments:** [List files to attach or "None"]

Do you want me to:
1. Create this bug in Jira (Complete with all fields)
2. Show me the full bug report first
3. I need to provide more information
4. Don't create, just save the documentation
```

---

### Phase 5: Create in Jira

**Step 1: Create the issue with all custom fields**

Use the EXACT JSON structure below. Replace only the values in `[brackets]`:

```json
Tool: mcp__atlassian__jira_create_issue

{
  "project_key": "[PROJECT_KEY]",  // e.g., "MYM", "UPEX", "QA", etc.
  "summary": "[Formato: <EPICNAME>: <COMPONENT>: <ISSUE_SUMMARY>]",
  "issue_type": "Bug",
  "description": "[See Jira Description Template below]",
  "additional_fields": {
    "priority": {"name": "[Highest|High|Medium|Low]"},
    "labels": ["bug", "exploratory-testing"],

    "customfield_10109": "[ACTUAL RESULT: What happened - the bug behavior]",
    "customfield_10110": "[EXPECTED RESULT: What should have happened]",
    "customfield_10112": {"value": "[Functional|UI/Visual|Performance|Data|Integration|Security]"},
    "customfield_10041": {"value": "[Critical|High|Medium|Low]"},
    "customfield_12210": {"value": "[Development|Staging|Production]"},
    "customfield_10049": "[ROOT CAUSE: Technical analysis or 'Investigation needed']",

    "customfield_10111": "[WORKAROUND: Temporary solution or null if none]",
    "customfield_10607": "[EVIDENCE: Notes about attachments or null]",
    "customfield_12212": {"value": "Bugfix"}
  }
}
```

**Field Format Rules:**

- **Textarea fields** (`customfield_10109`, `10110`, `10049`, `10111`, `10607`): Plain string
- **Dropdown fields** (`customfield_10112`, `10041`, `12210`): Object with `{"value": "Option"}`
- **Radio fields** (`customfield_12212`): Object with `{"value": "Bugfix"}`
- **Omit optional fields** by not including them (don't set to `null`)

**Step 2: Attach evidence files (if user provided)**

```json
Tool: mcp__atlassian__jira_update_issue

{
  "issue_key": "[PROJ-XXX]",  // Use the issue key returned from create
  "fields": {},
  "attachments": "/absolute/path/to/file1.png,/absolute/path/to/file2.mp4"
}
```

**Attachment Rules:**

- Use **absolute paths** only (e.g., `/home/user/screenshots/bug.png`)
- Comma-separated for multiple files
- Supported formats: `.png`, `.jpg`, `.gif`, `.mp4`, `.log`, `.txt`, `.pdf`
- If user says "attach this file" or provides a path, use it here

**Priority Mapping (Severity → Jira Priority):**

| Severity | priority.name |
| -------- | ------------- |
| Critical | Highest       |
| High     | High          |
| Medium   | Medium        |
| Low      | Low           |

---

### Phase 6: Post-Creation

**After creating the bug:**

1. **Confirm creation** with user:

   ```
   Bug created successfully!

   Issue Key: [PROJ-XXX]
   URL: https://upexgalaxy62.atlassian.net/browse/[PROJ-XXX]

   ✅ All custom fields populated
   ✅ Attachments uploaded (if any)
   ✅ Ready for QA triage
   ```

2. **Link to related story** (if applicable):

   ```
   Tool: mcp__atlassian__jira_add_comment

   Add comment to the original story:
   "Bug encontrado durante exploratory testing: [PROJ-XXX] - [Title]"
   ```

3. **Assign to team member** (if specified):

   ```
   Tool: mcp__atlassian__jira_update_issue

   Parameters:
   - issue_key: "[PROJ-XXX]"
   - fields: {"assignee": "email@example.com"}
   ```

---

## Bug Report Template (Jira Description)

Use this format for the `description` field:

```
_RESUMEN_
[One-paragraph summary of the bug and its impact]

----

_STEPS TO REPRODUCE_

h4. [Step 1 - Precondition]

h4. [Step 2 - Navigation]

h4. [Step 3 - Action]

h4. [Step 4 - Observe bug]

----

_TECHNICAL ANALYSIS_

* _Archivo:_ [File path if known]
* _Función:_ [Function/Component name]
* _Network:_ [API call info if relevant]
* _Console:_ [Error messages if any]

----

_IMPACTO_

* [Who is affected]
* [What functionality is blocked]
* [Business impact if applicable]

----

_RELATED STORIES_

* Relacionado: [STORY-XXX if applicable]
* Bloquea: [Other issues blocked by this bug]
```

---

## Nomenclatura de Bugs

**Formato estándar para títulos de Bug/Defect:**

```
<EPICNAME>: <COMPONENT>: <ISSUE_SUMMARY>
```

| Componente      | Descripción                        |
| --------------- | ---------------------------------- |
| `EPICNAME`      | Nombre de la épica o sistema (SUT) |
| `COMPONENT`     | Módulo donde ocurre el error       |
| `ISSUE_SUMMARY` | Breve descripción de la falla      |

**Ejemplos:**

```
CheckoutFlow: Payment: No se muestra error al ingresar contraseña incorrecta
UserAuth: Login: Sesión expira sin mensaje de advertencia
Dashboard: Charts: Gráfico de ventas muestra datos incorrectos
API: Users: PUT /users/settings retorna 500 al guardar
```

**Referencia completa:** `.context/guidelines/QA/jira-test-management.md` → Sección "Nomenclatura de Tickets en Jira"

---

## Severity Guidelines

| Severity     | Criteria                                             | Examples                                          |
| ------------ | ---------------------------------------------------- | ------------------------------------------------- |
| **Critical** | Core functionality blocked, no workaround, data loss | Login broken, checkout fails, data corruption     |
| **High**     | Major feature broken, workaround is difficult        | Search returns wrong results, form doesn't submit |
| **Medium**   | Feature issue with easy workaround                   | Sorting doesn't work, but filtering does          |
| **Low**      | Cosmetic, doesn't affect functionality               | Typo, alignment issue, minor UI glitch            |

---

## Error Type Guidelines

| Error Type      | When to Use                                   |
| --------------- | --------------------------------------------- |
| **Functional**  | Feature doesn't work as specified             |
| **UI/Visual**   | Layout, styling, responsive design issues     |
| **Performance** | Slow loading, timeouts, memory issues         |
| **Data**        | Wrong data displayed, calculation errors      |
| **Integration** | Third-party API failures, webhook issues      |
| **Security**    | Auth bypass, data exposure, permission issues |

---

## Handling Missing Information

**If the AI cannot determine a required field:**

1. **Error Type**: Infer from bug behavior:
   - 500 errors → likely `Functional` or `Integration`
   - Display issues → `UI/Visual`
   - Slow responses → `Performance`

2. **Test Environment**: Infer from URL:
   - `localhost` → Development
   - `staging.` or `-staging.` → Staging
   - Production domain → Production

3. **Severity**: Infer from impact:
   - Blocks user flow completely → Critical/High
   - Has workaround → Medium
   - Visual only → Low

4. **Root Cause**: If unknown, document what IS known:
   - "API endpoint returns 500 - server-side investigation needed"
   - "Component fails to render - React error in console"

5. **If truly cannot determine**: Ask the user explicitly:
   ```
   I need clarification on the following:
   - [Field]: [Why it's unclear and options to choose from]
   ```

---

## Best Practices

1. **One bug per report** - Don't combine multiple issues
2. **Be specific** - Exact steps, exact data used
3. **Include evidence** - Screenshots are worth 1000 words
4. **Check for duplicates** - Search Jira before creating
5. **Confirm severity** - Don't over/under-estimate impact
6. **Always confirm with human** - Avoid false positives
7. **Fill ALL custom fields** - Incomplete reports slow down triage
8. **Attach files when available** - Use the attachments parameter

---

## Quick Reference: MCP Tools

| Action                | Tool                                       |
| --------------------- | ------------------------------------------ |
| Create bug            | `mcp__atlassian__jira_create_issue`        |
| Update/attach files   | `mcp__atlassian__jira_update_issue`        |
| Add comment           | `mcp__atlassian__jira_add_comment`         |
| Search for duplicates | `mcp__atlassian__jira_search`              |
| Get issue details     | `mcp__atlassian__jira_get_issue`           |
| Transition status     | `mcp__atlassian__jira_transition_issue`    |
| Take screenshot       | `mcp__playwright__browser_take_screenshot` |

---

## Complete Example

Here's a real example of creating a bug with all fields:

```json
// Step 1: Create the bug
mcp__atlassian__jira_create_issue({
  "project_key": "PROJ",  // Replace with actual project key
  "summary": "[API] PUT /api/users/settings returns 500 error",
  "issue_type": "Bug",
  "description": "_RESUMEN_\nEl endpoint PUT para guardar configuración falla con error 500.\n\n----\n\n_STEPS TO REPRODUCE_\n\nh4. Login como usuario\n\nh4. Navegar a /dashboard/settings\n\nh4. Modificar cualquier campo\n\nh4. Click en 'Guardar'\n\nh4. Observar error 500 en Network tab\n\n----\n\n_TECHNICAL ANALYSIS_\n\n* _Archivo:_ src/app/api/settings/route.ts\n* _Línea:_ 45-52\n* _Problema:_ Validation error en payload\n\n----\n\n_IMPACTO_\n\n* Usuarios no pueden guardar configuración\n* Bloquea flujo principal",
  "additional_fields": {
    "priority": {"name": "Highest"},
    "labels": ["bug", "exploratory-testing", "api", "blocking"],
    "customfield_10109": "Al hacer click en 'Guardar', la API retorna error 500. El toast muestra 'Error al guardar'. En Network tab se ve PUT /api/settings con status 500.",
    "customfield_10110": "La API debería retornar 200 OK y guardar los cambios. El usuario debería ver un toast de éxito.",
    "customfield_10112": {"value": "Functional"},
    "customfield_10041": {"value": "Critical"},
    "customfield_12210": {"value": "Staging"},
    "customfield_10049": "Validación de Zod falla porque el campo 'id' es undefined en lugar de omitirse del payload.",
    "customfield_12212": {"value": "Bugfix"}
  }
})

// Step 2: Attach screenshot (if user provided one)
mcp__atlassian__jira_update_issue({
  "issue_key": "PROJ-123",  // Use the actual issue key returned from step 1
  "fields": {},
  "attachments": "/home/user/screenshots/api-500-error.png"
})
```

---

## Output

- Bug documented with ALL required custom fields
- Bug created in Jira with complete information
- Evidence files attached (if provided)
- Related story updated with bug reference
- Issue assigned (if specified)

---

## Troubleshooting

| Issue                                    | Solution                                                          |
| ---------------------------------------- | ----------------------------------------------------------------- |
| "Field customfield_XXXXX does not exist" | Notify user to contact Jira Admin. Create bug without that field. |
| "Option 'X' is not valid for field"      | Check Dropdown Values Reference section. Use exact string.        |
| "Attachment file not found"              | Verify absolute path. Ask user to confirm file location.          |
| Bug created but some fields empty        | Check if field format is correct (string vs object).              |
| Cannot transition to next status         | Some transitions require specific fields filled. Check workflow.  |
