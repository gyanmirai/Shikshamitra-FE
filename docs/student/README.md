---
module: student
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-10-09
owner: frontend-team
audience: humans-and-agents
---

# Understand Student frontend integration

TL;DR: use this page as the entrypoint for Student routes, screens, clients, workflows, and frontend validation.
Admissions starts from qualified inquiries, and Pipeline projects active application progress from the existing workflow.
Pipeline and Applications open the shared Applicant 360 drawer, with compact text-only stage tabs, counsellor assignment in the header, horizontal form sections and a document verification table. The former applicant overview page is replaced by compatibility navigation; identity repair reuses the existing editor. Finalization presents real admission context and compact readiness checks with title help, while preserving workflow rules, permission checks and Finance/Onboarding ownership.
Finalization creates an Onboarding case; Onboarding owns enrollment activation.
Student Onboarding uses a persisted Student Setup worklist with Readiness, GR Number, Roll Number, Division, Fees, and Credentials tabs.
Readiness & Access links Admission Offerings to activation requirements and login-email choices; Numbering & Placement contains GR and Roll settings.
Fees selects and confirms an existing published fee structure through Onboarding without assigning dues, collecting money, or requiring payment settlement.
Activation creates the operational enrollment and refreshes Student Records; pending account or email work remains visible in Credentials after activation.
Division-wide GR and Roll locks protect those identifiers without locking placement, and task drawers display only the selected task.
See [workflows.md](./workflows.md) and [testing.md](./testing.md) for the current flow and verification limits.

Assessments provides scoped Sessions and Applicants workspaces with explicit booking, attendance, result, review and workflow continuation actions. See [workflows.md](./workflows.md) for the staff journey and [testing.md](./testing.md) for acceptance evidence.

## Read order

Follow this order when changing Student frontend behavior:

| Step | File                                                                                         | Use it to                                                              |
| ---- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1    | [routes.md](./routes.md)                                                                     | Confirm visible routes, menu status, and permission gates              |
| 2    | [workflows.md](./workflows.md)                                                               | Trace Enrollment, records, attendance, reports, and notification flows |
| 3    | [clients.md](./clients.md)                                                                   | Find Redux Toolkit Query clients and backend contract ownership        |
| 4    | [testing.md](./testing.md)                                                                   | Pick frontend docs, unit, contract, and browser checks                 |
| 5    | [Backend Enrollment product rules](../../../Shikshamitra-BE/docs/modules/student/product.md) | Confirm Enrollment boundaries, capabilities, and integrity rules       |

## Ownership boundary

Frontend Student docs own visible navigation, App Router pages, screen folders, client integration, cache behavior, and browser workflows.
Backend Student docs own product rules, endpoint contracts, permissions, errors, domain invariants, and data integrity.
Finance owns payment posting, receipts, reconciliation, settlement, concessions, and refunds.
Institute Setup and Class Management own academic structure and capacity truth that Enrollment consumes for placement.
Student Records owns the active student lifecycle after activation.

## Source of truth

Use these paths before searching broadly:

| Need                              | Source                                                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Visible navigation                | `src/constants/student-menu.ts`                                                                                                                |
| App Router pages                  | `src/app/(auth-route)/student/**`                                                                                                              |
| Screens and components            | `src/screens/student/**`                                                                                                                       |
| Student Onboarding shell          | `src/app/(auth-route)/student/onboarding/**`, `src/screens/student/onboarding/**`                                                              |
| Onboarding settings projection    | `src/screens/student/onboarding/onboarding-settings-model.ts`, `src/screens/student/onboarding/onboarding-settings-context.tsx`                |
| Student API clients               | `src/redux/student/**`                                                                                                                         |
| Admissions and Onboarding clients | `src/redux/student/admissions/**`, `src/redux/student/onboarding/**`                                                                           |
| Student tests                     | `src/constants/student-menu.test.ts`, `src/redux/student/student-api.production.test.ts`, `src/screens/student/**/*.test.ts`, `e2e/student/**` |
| Backend docs                      | `../../../Shikshamitra-BE/docs/modules/student/README.md`                                                                                      |
| Backend Enrollment product rules  | `../../../Shikshamitra-BE/docs/modules/student/product.md` and `../../../Shikshamitra-BE/docs/modules/student/workflows.md`                    |
| Backend contracts                 | `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/**`                                                                  |

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

## Student dashboard

The shared `/student/dashboard` follows academic section-card spacing, server-confirmed role priorities, permitted shortcuts and independently loaded year summaries. Use [workflows.md](./workflows.md#student-dashboard), [clients.md](./clients.md#student-dashboard-client) and [testing.md](./testing.md#student-dashboard-validation). Metric definitions remain in the [backend product rules](../../../Shikshamitra-BE/docs/modules/student/product.md#student-dashboard).
