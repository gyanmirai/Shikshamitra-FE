# Student Enrollment UI Consistency UAT

## Scope

This UAT validates the Student Enrollment staff workspaces, settings, and parent-facing admissions journey after the UI consistency polish.

The test does not validate Finance posting, government connectivity, communication-vendor delivery, or optional-service fulfillment.

## Environment

- Use the local seeded DDVS `FullDemo` environment.
- Use a desktop or laptop browser for staff workflows.
- Repeat the parent journey at a 390 by 844 mobile viewport.
- Record the role, browser, viewport, task duration, assistance required, clarity score, and any issue identifier.

## Operator session

The operator must be a receptionist or admissions counselor who did not implement the feature.

| Task                              | Expected outcome                                                                                        | Status                | Clarity   | Evidence or issue |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------- | --------- | ----------------- |
| Create a quick inquiry            | The lead is created from contact and admission intent and appears in Pipeline                           | Pending staff session | Not rated | Pending           |
| Review a likely duplicate         | The operator can compare the match and continue only with a reason when applicable                      | Pending staff session | Not rated | Pending           |
| Assign an owner                   | Staff search shows names and contact context without exposing raw identifiers                           | Pending staff session | Not rated | Pending           |
| Process an entrance exam          | The operator can review attendance, marks, result, and eligibility from the shared table action pattern | Pending staff session | Not rated | Pending           |
| Request a registration correction | The applicant receives a clear pending action without losing prior responses                            | Pending staff session | Not rated | Pending           |
| Review a document                 | The operator can verify or reject with a reason and the applicant sees the resulting action             | Pending staff session | Not rated | Pending           |

## Approver session

The approver must be a principal, admissions approver, or delegated school leader who did not implement the feature.

| Task                           | Expected outcome                                                              | Status                | Clarity   | Evidence or issue |
| ------------------------------ | ----------------------------------------------------------------------------- | --------------------- | --------- | ----------------- |
| Review eligibility             | The approver can identify pending decisions and inspect the applicant history | Pending staff session | Not rated | Pending           |
| Issue or review an offer       | Offer terms, validity, seat context, and permitted actions are clear          | Pending staff session | Not rated | Pending           |
| Decide a waitlist movement     | The approver can understand the seat consequence before confirming            | Pending staff session | Not rated | Pending           |
| Approve admission readiness    | Blocking requirements and any override reason are visible before approval     | Pending staff session | Not rated | Pending           |
| Repair an activation exception | The failure state, retry action, and resulting status are unambiguous         | Pending staff session | Not rated | Pending           |
| Perform an audited override    | The reason is mandatory and the action cannot be submitted twice              | Pending staff session | Not rated | Pending           |

## Parent review

Both staff participants review inquiry, OTP, registration, documents, exam scheduling, and offer response in English, Gujarati, and Hindi.

| Language | Mobile completion | Copy clarity | Overflow or accessibility issue | Status                |
| -------- | ----------------- | ------------ | ------------------------------- | --------------------- |
| English  | Pending           | Not rated    | Pending                         | Pending staff session |
| Gujarati | Pending           | Not rated    | Pending                         | Pending staff session |
| Hindi    | Pending           | Not rated    | Pending                         | Pending staff session |

## Acceptance

- Every critical task must be completed without assistance.
- Every task must receive a clarity score of at least 4 out of 5.
- No P0, P1, or P2 Student Enrollment defect may remain open.
- Every material P3 finding must have an owner and a follow-up decision.
- Automated scale, accessibility, responsive, permission, and regression checks must pass before the staff sessions begin.

## Evidence status

Automated validation completed against the local seeded DDVS environment on July 14, 2026.

- TypeScript validation passed.
- The production Next.js build passed and generated all Enrollment settings and public admissions routes.
- The focused Enrollment, public admissions, and CRM Redux suite passed 122 tests across 16 files.
- The Student menu permission suite passed 3 tests.
- The read-only CRM preflight passed 1 test.
- The full CRM Playwright suite passed all 16 scenarios.
- Accessibility validation found no serious or critical violations across the seven staff workspaces and ten settings routes.
- Responsive validation passed for all staff workspaces at 1440 by 900, 1280 by 720, 768 by 1024, and 390 by 844.
- The deterministic 25,000-lead fixture confirmed 50-row list pages, 25-lead board pages, and staff-search results bounded to 25 options.
- Public inquiry and status journeys passed mobile overflow, accessibility, consent, OTP, registration, document correction, and readiness-handoff checks.

The connected-Chrome visual spot-check remains pending because the Chrome extension connection was unavailable during the final validation run.

Real staff UAT remains pending until one operator and one approver complete the sessions above.
