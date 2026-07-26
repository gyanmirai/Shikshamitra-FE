---
module: student
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-07-25
owner: frontend-team
audience: humans-and-agents
---

# Validate Student frontend changes

TL;DR: run docs validation for documentation changes and targeted Student tests for route, client, attendance, records, or browser changes.
Do not claim Student behavior is validated unless the relevant tests or a stronger suite ran.
Use the [Student Enrollment UI Consistency UAT script](../../e2e/student/STUDENT_ENROLLMENT_UI_UAT.md) for the current operator, approver, and multilingual parent acceptance sessions.

## Documentation checks

Run these commands after editing Student frontend docs.

```powershell
node scripts/docs/validate-docs.mjs --module student
npm run docs:check
git diff --check
```

## Focused frontend checks

Use these commands as the first validation set.

| Risk area                                      | Command                                                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Student route and permission gates             | `npm run test -- src/constants/student-menu.permissions.test.ts`                                                   |
| Admissions CRM client, multilingual registration, inquiry-form duplication and preview, QR download, result import, granular action permissions, configuration safety, workspace utilities, and public status | `npm run test -- src/screens/public/admissions-crm src/redux/student/admissions-crm src/screens/student/enrollment/admissions-crm src/screens/student/enrollment/setting` |
| Production API contracts and mock guardrails   | `npm run test -- src/redux/student/student-api.production.test.ts src/screens/student/no-production-mocks.test.ts` |
| Enrollment settings                            | `npm run test -- src/screens/student/enrollment/setting`                                                           |
| Student management tabs and roll projections   | `npm run test -- src/screens/student/management`                                                                   |
| Student attendance dashboard and lock behavior | `npm run test -- src/screens/student/attendance`                                                                   |
| Browser role access                            | `npx playwright test student/student-module-role-access.spec.ts --project=chromium --reporter=list`                |
| Admissions CRM live preflight | `npm run test:e2e:student-crm:preflight -- --use-default-credentials` |
| Admissions CRM browser, public form, exam, registration and document readiness, anonymous denial, and opt-in restricted-user denial smoke | `npm run test:e2e:student-crm -- --use-default-credentials` |
| TypeScript impact                              | `npm run ts`                                                                                                       |

## Admissions CRM browser runner

Use `node scripts/e2e/run-student-crm-playwright.mjs --dry-run` before live CRM browser execution.
The runner reads `E2E_API_URL`, `NEXT_PUBLIC_API_URL`, `.env.local`, or `.env` for the backend URL.
The runner sets `E2E_STUDENT_CRM=1` only after preflight checks pass.
Pass `--browser-executable=<absolute-path>` to run the Chromium project against a compatible installed browser such as Vivaldi.
Pass `--headed` when an installed browser does not support Playwright's headless launch flags.
The runner forwards that value as `E2E_BROWSER_EXECUTABLE_PATH` and reports the selected executable before the suite starts.
When the selected executable is Vivaldi, Playwright adds Vivaldi's supported `--disable-vivaldi` automation switch so the Vivaldi binary can use Chromium's DevTools automation surface without its browser UI process exiting before test page creation.
The runner allows localhost self-signed HTTPS only for local API URLs so seeded development certificates do not block CRM validation.
Run final mutating CRM browser validation against a local seeded DDVS backend and frontend stack.
Start the backend with `DevAutoAuth__Enabled=false` for the full CRM smoke so anonymous-denial coverage is not bypassed by local development auto-auth.
Use `npm run test:e2e:student-crm:preflight -- --use-default-credentials` to validate login, seeded academic-year availability, CRM configuration reads, lead-list reads, analytics reads, and workspace access without creating CRM test data.
Run the full mutating CRM smoke only after the preflight passes.
If the preflight exits with `fetch failed`, start or point the runner at a reachable frontend and API stack before treating browser validation as complete.
The full CRM runner refuses remote Gyanmirai API hosts unless `--allow-stage-mutation` is passed.
The companion registration scenario starts a local webhook receiver inside the Playwright worker so the real OTP flow can be tested without exposing or bypassing OTP secrets.
The companion registration scenario covers partial save, submission, document rejection and replacement, original confirmation, readiness confirmation, and admission handoff.
The suite also covers receptionist, counselor, approver, restricted, and anonymous permission boundaries, serious and critical WCAG checks, release viewports, URL-state history, invalid query cleanup, and PII exclusion from workspace URLs.
Use `--allow-stage-mutation` only for an approved disposable seeded tenant because the CRM spec creates inquiry leads, registration forms, exam schedules, results, and eligibility records.
Set explicit `E2E_TENANT`, `E2E_PRINCIPAL_EMAIL`, and `E2E_PASSWORD` for normal runs.
Use `--use-default-credentials` only for the seeded local/DDVS environment already expected by the CRM spec.
Restricted-user denial coverage runs only when `E2E_STUDENT_CRM_DENIED_EMAIL` is provided.

## Add coverage when needed

Add or update tests when a change affects these areas.

| Change                                       | Expected coverage                                |
| -------------------------------------------- | ------------------------------------------------ |
| Active route or menu status                  | Menu permission test                             |
| Client endpoint shape                        | Student API contract test                        |
| Admissions CRM board, filters, bulk actions, bulk messaging, opt-out controls, opt-out register, dynamic form template contracts, inquiry channel defaults, condition-aware journey settings, pipeline stage metadata settings, configured board stage colors, configured stage-transition enforcement, stage-specific SLA automation, applicant DOB capture, applicant-profile duplicate-preview payloads, duplicate confidence and matched-field evidence, conversion and first-response SLA analytics KPIs, registration-form issue, delivery-log provider ID review and search, message template preview, stage movement, notes, owner, priority, applicant checklist progress, task, score, automation runs, automation failures, exam states, eligibility handoff missing-field review, browser-driven exam entry, protected role denial, public campaign and staff-shared owner tracking, and public status OTP states | Admissions CRM utility, settings, client contract, public status tests, and gated Playwright CRM flow |
| Inquiry Source, CRM owner selectors, CRM public link behavior, and structured CRM provider settings helpers | Enrollment setting utility or wiring test, including CRM channel default source selectors, owner selectors, unknown historical ID preservation, public inquiry, campaign, or staff-shared link builders, provider callback URL builders, provider response message ID path updates, callback secret, and callback mapping path updates |
| Registration-template localization and public fallback | `src/screens/student/enrollment/setting/admissions-registration-configuration-utils.test.ts`, `src/screens/public/admissions-crm/registration-localization.test.ts`, and public registration component tests |
| Inquiry-form duplication, language and device preview, and QR generation | `src/screens/student/enrollment/setting/inquiry-form-template-utils.test.ts`, `src/screens/student/enrollment/setting/inquiry-form-template-preview.test.tsx`, and `src/screens/student/enrollment/setting/inquiry-form-qr.test.ts` |
| Inline, bulk, CSV, Excel, or OMR-export result entry and correction UI | `src/screens/student/enrollment/admissions-crm/exam-result-import.test.ts` plus the Admissions CRM client contract and browser exam flow |
| Granular action visibility | `src/screens/student/enrollment/admissions-crm/admission-action-permissions.test.ts` plus restricted-role browser coverage |
| Configuration references, impact preview, and preview-confirm clone wiring | `src/redux/student/admissions-crm/admissions-crm-api.contract.test.ts` and Enrollment settings tests |
| Roll number or GR number behavior            | Management projection test                       |
| Attendance save or lock behavior             | Attendance screen or query test                  |
| Role visibility                              | Playwright role access test                      |
