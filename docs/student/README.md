---
module: student
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-10-24
owner: frontend-team
audience: humans-and-agents
---

# Understand Student frontend integration

TL;DR: use this page as the entrypoint for Student routes, screens, clients, workflows, and frontend validation.
General admissions start from qualified inquiries; RTE, Management and Staff can start through their configured special Registration offerings.
Pipeline owns active Inquiry-linked cases and started special registrations before Admission Decision; Applications owns cases that have entered Decision, including later correction work.
Both open the shared full-page Applicant 360 workspace with phase-aware menu ancestry and safe return context.
Applications uses the common searchable table, server paging and sorting, applicant/reference identity, contact/class context, status labels and permission-aware actions.
Finalization preserves workflow rules, permission checks and Finance/Onboarding ownership.
Finalization creates an Onboarding case; Onboarding owns enrollment activation.
The finalized decision panel shows the saved admission summary, live Onboarding handover, fee/stage evidence and decision history; guidance is disclosed through its information icon.
Student Onboarding uses a persisted Student Setup worklist with Readiness, Division, GR Number, Roll Number, Fees, and Credentials tabs.
Onboarding Settings combines App Login, GR Number and Roll Number in three URL-backed tabs; the existing `portal-access` route key remains compatible.
App Login offers Not needed, Optional and Required separately for students and parents/guardians. New schools default to Student Not needed, Parent/Guardian Required and staff sending manually; existing saved choices remain intact. Automatic sending exposes its stage selector, and optional accounts never hold onboarding open.
Pending cases inherit admission requirements automatically; activated and completed cases preserve their saved snapshots.
Fees selects and confirms an existing published fee structure through Onboarding. An explicit Collect Fees action opens the reused Finance collection form without navigating to Finance; fee settlement is not required for activation. Admissions Payment also allows Collect later in Onboarding with a mandatory reason and no structure or payment.
Activation creates the operational enrollment and refreshes Student Records; pending account or email work remains visible in Credentials after activation.
Credentials selects the account type and saved email, then uses one manual Send Credentials command for safe account preparation and durable delivery.
Staff can add or update the selected Student/Father/Mother email in a compact dialog; existing login changes require owner verification and preserve the password and sibling links.
Student List uses the selected header year, four visible academic selectors and Active/Former inside Filters, with a compact server-backed table and preserved profile navigation context.
Student Profile has Overview, Details, Documents and History. Details renders the retained offering Registration form with inline edits; immediate saves update current values and create an audit entry while preserving submitted originals. Inquiry remains in Admissions.
Division-wide GR and Roll locks protect those identifiers without locking placement, and task drawers display only the selected task.
See [workflows.md](./workflows.md) and [testing.md](./testing.md) for the current flow and verification limits.

Assessments uses one applicant table with optional Offering/stage filters and contextual session setup and management drawers.
Shared school exams and individual/group interviews use Institute rooms, searchable staff, booking preview and explicit attendance/result/Continue actions.
Online assessments remain outside the current flow.
See [workflows.md](./workflows.md) for the staff journey and [testing.md](./testing.md) for current verification limits.

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
