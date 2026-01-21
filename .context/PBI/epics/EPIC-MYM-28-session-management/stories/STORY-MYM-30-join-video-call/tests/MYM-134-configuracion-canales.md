# MYM-134: TC1: Validar configuración exitosa de múltiples canales

**Jira:** [MYM-134](https://upexgalaxy64.atlassian.net/browse/MYM-134)
**Status:** CANDIDATE
**Type:** Functional
**Related Story:** MYM-30
**ROI Score:** High (Regresión recurrente de bug MYM-121)

---

## Diseño del Test

Feature: Mentor Communication Channels

@critical @regression @automation-candidate
Scenario: Mentor successfully configures multiple communication channels
  Given a mentor is logged into the application
  And they are on the "Communication Preferences" settings page
  When they select "Google Meet", "WhatsApp" and "Slack"
  And they provide valid handles/links for each
  And they click "Save Preferences"
  Then they should see a "Preferences saved successfully" message
  And the channels should be persisted in their profile
