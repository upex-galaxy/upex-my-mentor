# MYM-135: TC2: Validar selección de canal durante reserva

**Jira:** [MYM-135](https://upexgalaxy64.atlassian.net/browse/MYM-135)
**Status:** CANDIDATE
**Type:** E2E
**Related Story:** MYM-30
**ROI Score:** Critical (Flujo core de negocio)

---

## Diseño del Test

Feature: Booking Communication Agreement

@critical @regression @automation-candidate
Scenario: Mentee selects a communication channel during booking flow
  Given a mentee is logged into the application
  And a mentor has configured "Google Meet" and "WhatsApp"
  And the mentee is in the booking flow for that mentor
  When they reach the "Communication Channel" selection step
  Then they should see the mentor's configured channels
  And they can select their preferred channel
  And upon completing the booking, the selection is saved in the session details
