---
module: student
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-08-09
owner: frontend-team
audience: humans-and-agents
---

# Validate Student frontend changes

TL;DR: run docs validation for documentation changes and targeted Student tests for route, client, workflow, and browser changes.
Do not claim Enrollment behavior is validated unless the relevant tests or a stronger suite ran.

## Documentation checks

Run these commands after editing Student frontend docs.

```powershell
node scripts/docs/validate-docs.mjs --module student
npm run docs:check
git diff --check
```

## Focused frontend checks

Use these commands as the first validation set.

| Risk area                                                                                                                                           | Command                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student route and permission gates                                                                                                                  | `npm run test -- src/constants/student-menu.permissions.test.ts`                                                                                                          |
| Enrollment route contracts, Admission Year Setup, Applicant Stepper, Pipeline, settings, registration, exam, communication, and activation surfaces | `npm run test -- src/screens/public/admissions-crm src/redux/student/admissions-crm src/screens/student/enrollment/admissions-crm src/screens/student/enrollment/setting` |
| Production API contracts and mock guardrails                                                                                                        | `npm run test -- src/redux/student/student-api.production.test.ts src/screens/student/no-production-mocks.test.ts`                                                        |
| Enrollment settings                                                                                                                                 | `npm run test -- src/screens/student/enrollment/setting`                                                                                                                  |
| Student management tabs and roll projections                                                                                                        | `npm run test -- src/screens/student/management`                                                                                                                          |
| Student attendance dashboard and lock behavior                                                                                                      | `npm run test -- src/screens/student/attendance`                                                                                                                          |
| Browser role access                                                                                                                                 | `npx playwright test student/student-module-role-access.spec.ts --project=chromium --reporter=list`                                                                       |
| Admissions CRM live preflight                                                                                                                       | `npm run test:e2e:student-crm:preflight -- --use-default-credentials`                                                                                                     |
| Admissions CRM browser smoke                                                                                                                        | `npm run test:e2e:student-crm -- --use-default-credentials`                                                                                                               |
| TypeScript impact                                                                                                                                   | `npm run ts`                                                                                                                                                              |

## Browser validation rule

When a Student Enrollment refinement affects visible behavior, run automated checks first and then perform the final browser-facing confirmation in the Codex browser.
Use the existing Playwright runner for deeper CRM evidence when a local seeded stack is available.
Do not run mutating browser tests against a remote tenant unless explicitly approved for a disposable staging tenant.

## Enrollment UI consistency checks

Enrollment layout tests must verify rendered behavior rather than only checking source text for component names or style fragments.
Use canonical routes rather than compatibility redirects in new browser tests.
Use semantic readiness assertions rather than `networkidle` when polling or background requests can remain active.
Keep the deterministic UI consistency suite read-only and separate it from record-creating workflow tests.

Validate these viewports for every table-first route and representative document, setup, drawer, and dialog surfaces:

| Viewport    | Required evidence                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| 390 by 844  | Filters, table rows, pagination, dialogs, and primary actions remain reachable without document-level horizontal overflow |
| 768 by 1024 | Tabs, filter grids, mixed workspaces, and table scrolling remain usable                                                   |
| 1440 by 900 | The primary table fills the remaining content height and keeps pagination visible                                         |

Simulate a slow lazy route and a slow first request to prove that the known page shell remains stable.
Simulate a background refetch to prove that safe rows remain visible with one contained progress treatment.
Verify loading, blocking error, empty result, and content as mutually exclusive states.
Verify URL round trips for tabs, report views, paging, sorting, meaningful filters, and the selected admission year.
Verify visible focus, keyboard applicant navigation, specific icon-button names, sort direction, expansion state, and tab relationships.
For Pipeline-to-applicant navigation, verify `tab=inquiry`, native modified-click behavior, data prefetch on hover and focus, directional and reduced-motion transitions, and restoration of Pipeline URL state, scroll, and focus after data readiness.
Verify that an expired, malformed, external, or applicant-detail return location falls back safely.

## Add coverage when needed

Add or update tests when a change affects these areas.

| Change                                                                                               | Expected coverage                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Active route or menu status                                                                          | Menu permission test and route contract test                                                      |
| Accepted Enrollment labels or menu grouping                                                          | Menu permission, route contract, and visible-copy tests                                           |
| Admission Year Setup                                                                                 | Academic-year attachment, publish readiness, version display, settings, and client contract tests |
| Applicant Stepper state, blocker, skip, and next action display                                      | Applicant workspace, Pipeline row, My Work, and public status tests                               |
| Pipeline capture, duplicate detection, continue reason, owner, inquiry type, source, or quick action | Admissions CRM workspace and client contract tests                                                |
| Assessment applicability, scheduling, result, or retest                                              | Assessment workspace, client contract, and browser flow tests                                     |
| Registration section, document, verification, or correction behavior                                 | Registration settings and applicant registration tests                                            |
| Finance handoff status                                                                               | Applicant workspace, activation preview, and client contract tests                                |
| Placement timing or capacity display                                                                 | Class Placement, activation preview, and capacity-state tests                                     |
| Activation gate or approval behavior                                                                 | Activation workspace and permission tests                                                         |
| Message template, reminder, quiet-hour, duplicate-suppression, or delivery-log behavior              | Communication settings, Follow-ups & Messages, applicant action, and public status tests          |
| Delayed reminder event behavior                                                                      | `communication-reminder-settings.test.ts` and Communication Settings component tests              |
| Provider credential redaction or update behavior                                                     | `provider-settings-utils.test.ts`, provider settings component tests, and backend HTTP assertions |
| Admission Reports grouping, date range, standard filter, or scope display                            | Admission Reports workspace, RTK Query contract, backend projection, and permission tests         |
| Public parent status                                                                                 | Public admissions status tests                                                                    |
| Role visibility                                                                                      | Playwright role access test                                                                       |

## Pull request release gate

Keep release evidence in the pull request instead of committing dated QA reports or generated execution matrices.
The pull request must record the exact frontend and backend test counts, build and documentation results,
migration evidence when the schema changes, and any repository-wide baseline failures unrelated to Enrollment.
For visible changes, include authenticated desktop and mobile browser evidence from an Enrollment-authorized tenant.
