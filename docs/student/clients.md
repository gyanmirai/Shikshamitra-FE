---
module: student
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-09-11
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
| `admission-workflows-api.ts`    | Workflow CRUD, graph save, stage metadata, validation, publish, archive, clone, versions, and usage              | Workflow list and dedicated builder         |
| `admission-forms-api.ts`        | Form definitions, sections, fields, clone, publish, validation, preview                                          | Form builder and preview                    |
| `admission-inquiries-api.ts`    | Server-paged inquiry list, create, duplicate check, and basic contacted action                                   | Inquiry CRM and inquiry dialog              |
| `admission-applicants-api.ts`   | Applicant 360, notes, activities                                                                                 | Applicant 360                               |
| `admission-applications-api.ts` | Start application, list, frozen workflow, form values, draft save, submit, stage advance, and transition history | Application list and detail                 |

## Endpoint ownership

Assessment sessions and offering/stage choices use `src/redux/student/admissions/admission-assessment-sessions-api.ts`.
Applicant bookings, attendance, results, review, cancellation, retakes, and waivers use `src/redux/student/admissions/admission-assessments-api.ts`.
The shared response types are in `src/redux/student/admissions/admission-assessment-types.ts`.
Assessment stage configuration uses `src/redux/student/admissions/admission-assessment-policy.ts`, preserving unrelated stage configuration and keeping legacy workflows opted out by default.
Document stage configuration uses `admission-document-policy.ts`, `admission-document-policy-validation.ts`, and `admission-condition-rule.ts`. The editor preserves unrelated settings and rejects unsupported policy versions. `admission-document-settings-api.ts` loads optional student document categories using workflow-view access.
Both clients use the existing global RTK Query API and refresh assessment/application data after mutations; workflow or offering changes also invalidate assessment scope choices.
Server-provided assessment capabilities determine available applicant actions, while the existing workflow-advance client remains responsible for progression.

Eligibility summaries, explicit evaluation, exception requests and review, and lazy evaluation history use `admission-eligibility-api.ts` with `admission-eligibility-types.ts`.
The optional `eligibilityEnabled` workflow-stage flag mounts this runtime only when the backend enables it.
The client uses the existing authenticated RTK Query API and captures the application stamp and evaluation when an action dialog opens.
Every mutation invalidates the application tag, refreshing subscribed summaries and history after successful commands or concurrency rejection.
Evaluation is an explicit POST; summary and history reads never record a new check.

Review summary, draft, recommendation submission, assignment, correction, history and queue use `admission-review-api.ts` and `admission-review-types.ts`. The client targets `/student/enrollment/admissions/reviews` through the global authenticated API. All Review commands invalidate the application tag so subscribed summaries, existing decision capabilities, history and queues refresh, including after a rejected concurrent write. GET does not create review history. The stage editor shares `admission-review-policy.ts` and `admission-review-settings-api.ts` for versioned optional settings, role choices and bounded reviewer lookup; saved choices survive lookup errors or filtered results.

The existing application decision client continues to own approval, rejection, waitlist, offers and finalization. Optional `reviewDecision` capabilities on the main application response control these existing actions; absent managed-review metadata preserves legacy behavior. Detailed policy, source freshness, role rules and transition gates belong to the [backend student API](../../../Shikshamitra-BE/docs/modules/student/api.md).

Inquiry stage configuration uses `admission-inquiry-policy.ts`; disabled or missing settings preserve the Basic process.
`admission-inquiry-settings-api.ts` loads offering-scoped active counsellors for workflow setup.
`admission-inquiry-management-api.ts` reads the safe management summary and records contacts, follow-ups, qualification, and reopen actions.
Successful management commands invalidate the inquiry tag so the list and open drawer reload authoritative state.

Managed Form stages use `admission-form-stage-api.ts` for the scoped stage summary, section verification, verification revocation, and correction requests. The client keeps application, stage, and section identifiers in the route and sends only command data plus the application concurrency stamp. Both mutations invalidate the stage-specific and application tags so blockers, attempts, form state, and workflow controls refresh together. `admission-form-stage-policy.ts` owns the versioned editor shape and preserves unrelated stage configuration.

Managed Payment stages use `admission-payment-policy.ts`, `admission-payment-types.ts`, and `admission-payment-api.ts`. The client sends application and transaction concurrency stamps plus one idempotency key per financial action. Mutations invalidate the application tag so balances, blockers, transaction stamps, and workflow state refresh together. Server capabilities decide which record, verify, reject, waive, reverse, and continue actions are shown.

Managed Offer stages use `admission-offer-policy.ts`, `admission-offer-types.ts`, and `admission-offer-api.ts`. Application and stage identifiers stay in scoped routes; every command sends the captured application stamp and a unique idempotency key. Mutations invalidate the application tag so status, blockers, capabilities, history, and workflow state refresh. The application detail mounts the managed card only when `offerStageEnabled` is present and hides the legacy offer actions for that stage; missing metadata preserves release compatibility.

Managed Seat stages use `admission-seat-policy.ts`, `admission-seat-types.ts`, and `admission-seat-api.ts`. Commands send application, pool, and allocation concurrency stamps when applicable, plus one idempotency key per user action. Every mutation invalidates the application tag so shared capacity, expiry, waitlist position, blockers, history, and workflow state reload together. The application detail mounts the Seat card only when `seatStageEnabled` is present; missing metadata preserves the basic workflow step.

The clients use the Student Enrollment Admissions endpoint family under `/student/enrollment/admissions`.
Request and response contracts are owned by `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/Enrollments/Admissions/**`.
Product rules and persistence are owned by `../../../Shikshamitra-BE/src/ShikshaMitra.Application/Students/StudentEnrollments/Admissions/**`.

## Cache behavior

The managed document checklist uses `admission-document-verification-api.ts` and `admission-document-types.ts`. Uploads send `FormData` through the global authenticated API, while original checks, reviewer decisions, and waivers use typed mutations. All document commands invalidate the application tag, including rejected stale writes, so the current checklist and concurrency stamp refresh. The application-level stamp is captured when the action dialog opens.

`admission-document-download-api.ts` downloads authorized attachments through the global API, keeps file bytes outside the Redux cache, and revokes temporary browser URLs after initiating the download. `student-admission-evidence-api.ts` reads retained evidence for the student Documents tab; its downloads use the student-scoped endpoint. No public storage URL is exposed by these clients.

The existing `getStudentById` query in `src/redux/student/index.ts` reads `/students/records/{studentId}/profile` through the global API. `student-profile-types.ts` unwraps the response and validates the canonical Student GUID. The profile data boundary mounts tabs only when the returned identity matches the requested student; failed reads show an alert and Retry. Document and admission-evidence queries therefore receive the resolved Student ID. The protected endpoint and direct-record scope rules are owned by the [backend student module](../../../Shikshamitra-BE/docs/modules/student/README.md).

Admissions mutations invalidate the relevant `studentAdmissionsCrmType` tag so lists and detail screens reload configuration or runtime state after a successful change.
Bulk preview is read-like and does not invalidate the offering cache; successful bulk commit does.
Application form-value saves invalidate the application tag so the concurrency stamp and saved values remain current.
Inquiry creation invalidates inquiry and applicant tags because it creates the CRM record and its linked applicant context together.

## Client rule

Use the existing Admissions RTK Query client for a new screen or mutation instead of adding a direct fetch helper.
