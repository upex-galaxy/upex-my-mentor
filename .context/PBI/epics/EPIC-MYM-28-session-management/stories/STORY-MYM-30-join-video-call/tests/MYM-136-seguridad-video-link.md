# MYM-136: TC3: Validar restricción de acceso a video-link antes de tiempo

**Jira:** [MYM-136](https://upexgalaxy64.atlassian.net/browse/MYM-136)
**Status:** CANDIDATE
**Type:** Security / API
**Related Story:** MYM-30
**ROI Score:** High (Prevención de fuga de acceso)

---

## Diseño del Test

Feature: Session Security

@high @regression @automation-candidate
Scenario: Restrict access to video link before session start time
  Given a user has an upcoming session scheduled for 3:00 PM
  And the current time is 2:40 PM (more than 15 mins before)
  When the user attempts to access the session video link via API
  Then the API should return a "403 Forbidden" error
  And the message should indicate it is too early to join
