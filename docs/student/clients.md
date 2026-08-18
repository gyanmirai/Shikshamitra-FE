---
module: student
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-08-14
owner: frontend-team
audience: humans-and-agents
---

# Find Student Enrollment Admissions clients

TL;DR: the individual Enrollment Admissions CRM project uses focused RTK Query clients under `src/redux/student/admissions` and invalidates the shared Student Admissions cache tags after mutations.

## Client map

| Client                          | Responsibilities                                                                                                 | Main screens                                |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `admission-cycles-api.ts`       | Admission cycle list and lifecycle commands                                                                      | Cycles and cycle selectors                  |
| `admission-offerings-api.ts`    | Offering list, detail, CRUD, explicit state commands, clone, readiness, availability, and bulk preview or commit | Offerings, inquiry selection, Applicant 360 |
| `admission-workflows-api.ts`    | Workflow definitions, stages, transitions, clone, publish, validation                                            | Workflow builder                            |
| `admission-forms-api.ts`        | Form definitions, sections, fields, clone, publish, validation, preview                                          | Form builder and preview                    |
| `admission-inquiries-api.ts`    | Inquiry list, create, duplicate check, contacted action                                                          | Inquiry CRM and inquiry dialog              |
| `admission-applicants-api.ts`   | Applicant 360, notes, activities                                                                                 | Applicant 360                               |
| `admission-applications-api.ts` | Start application, list, workflow, form values, draft save, submit                                               | Application list and detail                 |

## Endpoint ownership

The clients use the Student Enrollment Admissions endpoint family under `/student/enrollment/admissions`.
Request and response contracts are owned by `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/Enrollments/Admissions/**`.
Product rules and persistence are owned by `../../../Shikshamitra-BE/src/ShikshaMitra.Application/Students/StudentEnrollments/Admissions/**`.

## Cache behavior

Admissions mutations invalidate the relevant `studentAdmissionsCrmType` tag so lists and detail screens reload configuration or runtime state after a successful change.
Bulk preview is read-like and does not invalidate the offering cache; successful bulk commit does.
Application form-value saves invalidate the application tag so the concurrency stamp and saved values remain current.
Inquiry creation invalidates inquiry and applicant tags because it creates the CRM record and its linked applicant context together.

## Client rule

Use the existing Admissions RTK Query client for a new screen or mutation instead of adding a direct fetch helper.
