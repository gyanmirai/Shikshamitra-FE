---
module: student
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-09-03
owner: frontend-team
audience: humans-and-agents
---

# Understand Student frontend integration

TL;DR: use this page as the entrypoint for Student routes, screens, clients, workflows, and frontend validation.
Student Enrollment uses Admission Year Setup and a six-step Applicant Stepper, with Pipeline as the source of truth before activation.
Student Onboarding now includes URL-backed Readiness, GR Number, Roll Number, and Division task views over one Student Setup worklist, plus academic filters, readiness KPIs, focused assignment tables, local bulk-action previews, and a student drawer covering the admission handoff, placement, identifiers, documents, accounts/access, readiness, and audit activity. Settings are consolidated into Readiness & Access and Numbering & Placement, with legacy settings URLs retained as redirects. Applied settings now drive Setup behavior through a feature-owned frontend provider for the current client session. The provider separates current-school defaults from optional academic-year overrides and shows whether the selected scope is inherited or customized. Board is rule applicability inside GR, Roll, and Division configuration rather than a second settings scope; Roll and Division also support Class-specific overrides. Readiness & Access presents the route-specific onboarding profiles in a compact applied-state worklist and opens the selected profile's required/blocking/owner matrix, approval policy, and account-access controls in a focused drawer. Identifier Series provides editable active series with Board and profile applicability, format tokens, sequence/reset scope, range limits, effective dates, and manual-entry controls. Roll rules add Board/Class applicability, class or class-and-Division numbering scope, assignment timing, mid-year handling, ordered tie-breakers, preservation, individual locks, reason, and approval controls. Division rules add Board/Class applicability, automatic placement strategies, tolerance and capacity safeguards, dated approval behavior, Roll-number recalculation policy, teacher notification, and effective dates. Setup resolves the most specific applicable policy into eligible, blocked, approval-required, changing, and preserved preview outcomes. Connected mode still uses the existing Student Records Board/Medium scope lookup to load operational students, and settings reset to frontend defaults after a full reload until the owning Onboarding APIs are connected.

## Read order

Follow this order when changing Student frontend behavior:

| Step | File                                                                                                             | Use it to                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1    | [routes.md](./routes.md)                                                                                         | Confirm visible routes, menu status, and permission gates                                   |
| 2    | [workflows.md](./workflows.md)                                                                                   | Trace Enrollment, records, attendance, reports, and notification flows                      |
| 3    | [clients.md](./clients.md)                                                                                       | Find Redux Toolkit Query clients and backend contract ownership                             |
| 4    | [testing.md](./testing.md)                                                                                       | Pick frontend docs, unit, contract, and browser checks                                      |
| 5    | [Student Onboarding configuration specification](./references/student-onboarding-configuration-specification.md) | Define Board, Medium, Level, GR, Roll, Division, Readiness, and Activation fields and flows |
| 6    | [Student Onboarding multi-school readiness](./references/student-onboarding-multi-school-readiness.md)           | Review verified readiness, risks, release gates, and roadmap                                |
| 7    | [Backend Enrollment product rules](../../../Shikshamitra-BE/docs/modules/student/product.md)                     | Confirm Enrollment boundaries, capabilities, and integrity rules                            |

## Ownership boundary

Frontend Student docs own visible navigation, App Router pages, screen folders, client integration, cache behavior, and browser workflows.
Backend Student docs own product rules, endpoint contracts, permissions, errors, domain invariants, and data integrity.
Finance owns payment posting, receipts, reconciliation, settlement, concessions, and refunds.
Institute Setup and Class Management own academic structure and capacity truth that Enrollment consumes for placement.
Student Records owns the active student lifecycle after activation.

## Source of truth

Use these paths before searching broadly:

| Need                                   | Source                                                                                                                                                                                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visible navigation                     | `src/constants/student-menu.ts`                                                                                                                                                                                                                                      |
| App Router pages                       | `src/app/(auth-route)/student/**`                                                                                                                                                                                                                                    |
| Screens and components                 | `src/screens/student/**`                                                                                                                                                                                                                                             |
| Student Onboarding shell               | `src/app/(auth-route)/student/onboarding/**`, `src/screens/student/onboarding/**`                                                                                                                                                                                    |
| Onboarding settings projection         | `src/screens/student/onboarding/onboarding-settings-model.ts`, `src/screens/student/onboarding/onboarding-settings-context.tsx`                                                                                                                                      |
| Onboarding configuration specification | `docs/student/references/student-onboarding-configuration-specification.md`                                                                                                                                                                                          |
| Student API clients                    | `src/redux/student/**`                                                                                                                                                                                                                                               |
| Admissions CRM clients                 | `src/redux/student/admissions-crm/core-leads-api.ts`, `setup-playbooks-api.ts`, `registration-documents-api.ts`, `communication-exams-events-api.ts`, `final-admission-api.ts`, `operations-governance-api.ts`, and `public-admissions-api.ts` in the same directory |
| Student tests                          | `src/constants/student-menu.permissions.test.ts`, `src/redux/student/student-api.production.test.ts`, `src/screens/student/**/*.test.ts`, `e2e/student/**`                                                                                                           |
| Onboarding readiness audit             | `docs/student/references/student-onboarding-multi-school-readiness.md`                                                                                                                                                                                               |
| Backend docs                           | `../../../Shikshamitra-BE/docs/modules/student/README.md`                                                                                                                                                                                                            |
| Backend Enrollment product rules       | `../../../Shikshamitra-BE/docs/modules/student/product.md` and `../../../Shikshamitra-BE/docs/modules/student/workflows.md`                                                                                                                                          |
| Backend contracts                      | `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/**`                                                                                                                                                                                        |

## For agents

Use this table before code search:

| Question                                      | First file                                                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Which Student route or menu item is active?   | [routes.md](./routes.md)                                                                                                    |
| Which Enrollment workflow should I test?      | [workflows.md](./workflows.md)                                                                                              |
| Which API client owns a call?                 | [clients.md](./clients.md)                                                                                                  |
| Which command should I run?                   | [testing.md](./testing.md)                                                                                                  |
| Which backend API behavior is canonical?      | `../../../Shikshamitra-BE/docs/modules/student/api.md`                                                                      |
| Which Enrollment product behavior is current? | `../../../Shikshamitra-BE/docs/modules/student/product.md` and `../../../Shikshamitra-BE/docs/modules/student/workflows.md` |

## Validation

Run these commands from the `Shikshamitra-FE` repository root:

```bash
npm run docs:check
git diff --check
```

Frontend docs own route, screen, client, cache, and browser behavior.
Backend Admissions rules, contracts, permissions, errors, and data integrity remain owned by the backend source paths linked above.
