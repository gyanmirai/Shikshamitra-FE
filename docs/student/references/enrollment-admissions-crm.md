---
module: student
domain: enrollment-admissions-crm
content_type: Reference
status: canonical
updated_on: 2026-08-14
owner: frontend-team
audience: humans-and-agents
---

# Individual project: Enrollment Admissions CRM

TL;DR: this individual project delivers the Phase 1 configurable Admissions CRM from administrator setup through inquiry, Applicant 360, and application submission.

Open the editable [Enrollment Admissions flow design](./enrollment-admissions-flow.excalidraw) in Excalidraw.

## Project scope implemented

| Capability                     | Implemented surface                                                                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admission cycles and offerings | Cycle setup plus scoped offering CRUD, inherited or override dates, readiness, availability, concurrency, clone, state commands, and bulk preview or commit |
| Workflow configuration         | Versioned workflow definitions with stages, transitions, validation, clone, and publish                                                                     |
| Form configuration             | Versioned sections and fields with system bindings, defaults, validation, visibility rules, preview, and publish                                            |
| Inquiry CRM                    | Inquiry creation, duplicate check, family and applicant linking, search, filters, contacted state, and source tracking                                      |
| Applicant 360                  | Applicant context, application progress, activity timeline, and notes                                                                                       |
| Application runtime            | Start, prefill, draft save, concurrency handling, runtime field rendering, authoritative submit validation, and progress                                    |

## Demo path

1. Open `/student/admissions/settings/cycles` and create an admission cycle.
2. Open `/student/admissions/settings/workflows` and publish a workflow with stages and transitions.
3. Open `/student/admissions/settings/forms` and publish an inquiry or application form.
4. Open `/student/admissions/settings/offerings`, select scoped academic hierarchy, choose inherited or override dates, associate the published definitions, and save or activate the offering.
5. Use Bulk create when several Standards share one workflow, forms, and admission window; commit only after every preview row is ready.
6. Create an inquiry under `/student/admissions/inquiries` and use duplicate detection when matching contact data exists.
7. Open the linked Applicant 360 page, review the timeline, and add a note.
8. Start an application, edit the prefilled form, save a draft, and submit it to see field validation and workflow progress.

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
