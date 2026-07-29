---
module: student
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-07-28
owner: frontend-team
audience: humans-and-agents
---

# Understand Student frontend integration

TL;DR: use this page as the entrypoint for Student routes, screens, clients, workflows, and frontend validation.
Student Enrollment uses Admission Year Setup and a six-step Applicant Stepper, with Pipeline as the source of truth before activation.

## Read order

Follow this order when changing Student frontend behavior:

| Step | File | Use it to |
|---|---|---|
| 1 | [routes.md](./routes.md) | Confirm visible routes, menu status, and permission gates |
| 2 | [workflows.md](./workflows.md) | Trace Enrollment, records, attendance, reports, and notification flows |
| 3 | [clients.md](./clients.md) | Find Redux Toolkit Query clients and backend contract ownership |
| 4 | [testing.md](./testing.md) | Pick frontend docs, unit, contract, and browser checks |
| 5 | [Backend Enrollment PRD](../../../Shikshamitra-BE/docs/modules/student/prd-student-enrollment.md) | Confirm the Admission Year Setup and Applicant Stepper requirement |

## Ownership boundary

Frontend Student docs own visible navigation, App Router pages, screen folders, client integration, cache behavior, and browser workflows.
Backend Student docs own product rules, endpoint contracts, permissions, errors, domain invariants, and data integrity.
Finance owns payment posting, receipts, reconciliation, settlement, concessions, and refunds.
Institute Setup and Class Management own academic structure and capacity truth that Enrollment consumes for placement.
Student Records owns the active student lifecycle after activation.

## Source of truth

Use these paths before searching broadly:

| Need | Source |
|---|---|
| Visible navigation | `src/constants/student-menu.ts` |
| App Router pages | `src/app/(auth-route)/student/**` |
| Screens and components | `src/screens/student/**` |
| Student API clients | `src/redux/student/**` |
| Admissions CRM client | `src/redux/student/admissions-crm/admissions-crm-api.ts` |
| Student tests | `src/constants/student-menu.permissions.test.ts`, `src/redux/student/student-api.production.test.ts`, `src/screens/student/**/*.test.ts`, `e2e/student/**` |
| Backend docs | `../../../Shikshamitra-BE/docs/modules/student/README.md` |
| Backend Enrollment PRD | `../../../Shikshamitra-BE/docs/modules/student/prd-student-enrollment.md` |
| Backend contracts | `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/**` |

## For agents

Use this table before code search:

| Question | First file |
|---|---|
| Which Student route or menu item is active? | [routes.md](./routes.md) |
| Which Enrollment workflow should I test? | [workflows.md](./workflows.md) |
| Which API client owns a call? | [clients.md](./clients.md) |
| Which command should I run? | [testing.md](./testing.md) |
| Which backend API behavior is canonical? | `../../../Shikshamitra-BE/docs/modules/student/api.md` |
| Which product requirement is current? | `../../../Shikshamitra-BE/docs/modules/student/prd-student-enrollment.md` |

## Validation

Run these commands from the `Shikshamitra-FE` repo root:

```bash
node scripts/docs/validate-docs.mjs --module student
npm run docs:check
git diff --check
```

## Source inspection rule

Use the files listed above and current source paths for Student frontend behavior.
Do not restore old plans, generated notes, or phase docs under `docs/`.
