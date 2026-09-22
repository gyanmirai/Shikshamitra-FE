---
module: student
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-09-15
owner: frontend-team
audience: humans-and-agents
---

# Understand Student frontend integration

TL;DR: use this page as the entrypoint for Student routes, screens, clients, workflows, and frontend validation.
Student Enrollment uses Admission Year Setup and a six-step Applicant Stepper, with Pipeline as the source of truth before activation.
Student Onboarding now includes URL-backed Readiness, GR Number, Roll Number, and Division task views over one Student Setup worklist, plus academic filters, focused assignment tables, local bulk-action previews, and a student drawer covering the admission handoff, placement, identifiers, documents, accounts/access, readiness, ownership, service handoffs, and audit activity. The worklist does not place clickable summary cards above the table. Settings are consolidated into Readiness & Access and Numbering & Placement; the legacy Operational Policies URL redirects to Readiness & Access. Readiness & Access persists the current academic year's school-default requirements, service handoffs, account preparation, SLA, and active state. Numbering & Placement persists the seat-reservation duration and GR identifier series. Applied advanced settings drive Setup previews through a feature-owned frontend provider for the current client session. Readiness & Access is a table-first rule workspace without configuration-scope cards. A school can create its own named readiness rule, choose its admission route, and define progressively narrower academic overrides. Each rule independently supports All or Selected coverage for Board, Medium, School Level, Class, and Division and can record whether future structures should inherit it. Numbering & Placement does not expose a configuration-scope selector. Each GR series, Roll rule, and Division rule requires one explicit Board, Medium, School Level, Class, and Division selection; the editor does not provide All fallbacks. Qualified option labels keep similarly named classes and divisions distinguishable across boards and media, and selecting GSEB limits the next choices without automatically selecting Gujarati medium or a school level. The resolver compares the complete academic path and applies the matching rule. Identifier Series applies to all onboarding profiles internally and provides editable active series with format tokens, sequence/reset scope, range limits, effective dates, and manual-entry controls. Roll rules add class or class-and-Division numbering scope, assignment timing, mid-year handling, ordered tie-breakers, preservation, individual locks, reason, and approval controls. Division rules add automatic placement strategies, tolerance and capacity safeguards, dated approval behavior, Roll-number recalculation policy, teacher notification, and effective dates. The GR and Roll workspaces no longer expose a separate assignment-method selector beside Add configuration; assignment behavior remains part of the applicable rule controls. Setup resolves the applicable policy into eligible, blocked, approval-required, changing, and preserved preview outcomes. Live mode loads durable onboarding cases from `/api/student/onboarding`, uses server paging, search, class, overdue, and owner-assignment filters, and persists single-student owner assignment, placement, identifier preparation, documents, readiness refresh, activation, cancellation, and failed service-handoff retry. Activation obtains a fresh backend preview and concurrency stamp before confirmation. Workflow preview remains explicitly separate and non-persistent. Advanced editor fields without an equivalent backend policy contract remain session-local and are labelled as that boundary.

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
