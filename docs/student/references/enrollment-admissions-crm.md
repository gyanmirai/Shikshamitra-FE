---
module: student
domain: enrollment-admissions-crm
content_type: Reference
status: canonical
updated_on: 2026-08-18
owner: frontend-team
audience: humans-and-agents
---

# Individual project: Enrollment Admissions CRM

TL;DR: this individual project delivers the Phase 1 configurable Admissions CRM from administrator setup through inquiry, Applicant 360, and application submission.

Open the editable [Enrollment Admissions flow design](./enrollment-admissions-flow.excalidraw) in Excalidraw.

## Project scope implemented

| Capability                     | Implemented surface                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Admission cycles and offerings | Cycle setup plus scoped offering CRUD, inherited or override dates, readiness, availability, concurrency, clone, state commands, and bulk preview or commit                          |
| Workflow configuration         | Graph-based immutable versions with explicit entry and terminal stages, controlled conditional or default transitions, validation, preview, usage, clone, archive, and publish       |
| Dynamic form runtime           | Published form versions are pinned to applications; controlled Applicant, Guardian, and Address bindings prefill canonical data, while custom values remain in form-instance storage |
| Form configuration             | Versioned sections and fields with system bindings, defaults, validation, visibility rules, preview, and publish                                                                     |
| Inquiry CRM                    | Inquiry creation, duplicate check, family and applicant linking, search, filters, contacted state, and source tracking                                                               |
| Applicant 360                  | Applicant and family context, identity completeness, explainable next action, frozen application-stage progress, unified activity timeline, and staff notes                          |
| Application runtime            | Start, prefill, draft save, concurrency handling, authoritative submit validation, condition-based advancement, stage handlers, idempotency, and transition history                  |

## Demo path

1. Open `/student/admissions/settings/cycles` and create an admission cycle.
2. Open `/student/admissions/settings/workflows`, create a draft, use the dedicated builder to mark one entry stage and at least one terminal stage, connect every non-terminal stage, validate, preview, and publish.
3. Open `/student/admissions/settings/forms` and publish an inquiry or application form.
4. Open `/student/admissions/settings/offerings`, select scoped academic hierarchy, choose inherited or override dates, associate the published definitions, and save or activate the offering.
5. Use Bulk create when several Standards share one workflow, forms, and admission window; commit only after every preview row is ready.
6. Create an inquiry under `/student/admissions/inquiries` and use duplicate detection when matching contact data exists.
7. Open the linked Applicant 360 page, confirm the family and identity context, resolve any explained Inquiry blocker, review the current journey stage, and add a staff note when useful.
8. Start an application, edit the prefilled form, save a draft, submit it, and follow the application through its configured journey and immutable transition history.

## Frontend source map

| Concern                         | Source                                                |
| ------------------------------- | ----------------------------------------------------- |
| Routes                          | `src/app/(auth-route)/student/admissions/**/page.tsx` |
| Screens                         | `src/screens/student/admissions/**`                   |
| RTK Query clients               | `src/redux/student/admissions/**`                     |
| Navigation and permission names | `src/constants/student-menu.ts`                       |

## Backend ownership

The backend owns tenant isolation, authorization, domain invariants, duplicate rules, published-version immutability, form validation, workflow transitions, persistence, and audit activities.
Use `../../../Shikshamitra-BE/src/ShikshaMitra.Application/Students/StudentEnrollments/Admissions/**` and `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/Enrollments/Admissions/**` as the source paths for those rules.

## Explicit Phase 1 boundary

Exams, payments, document collection, seat allocation, enrollment conversion, approvals, and public-family portals are outside this individual project until separately implemented and documented.
