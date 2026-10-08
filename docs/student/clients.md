---
module: student
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-10-08
owner: frontend-team
audience: humans-and-agents
---

# Find Student Enrollment Admissions clients

TL;DR: the individual Enrollment Admissions CRM project uses focused RTK Query clients under `src/redux/student/admissions` and invalidates the shared Student Admissions cache tags after mutations.

## Admission Cycle client

`src/redux/student/admissions/admission-cycles-api.ts` owns the Admission Cycle RTK Query contract.
It provides server-paged list/detail reads, impact/history reads, Draft create/edit, readiness validation, publish, close, reopen, archive, unused-Draft delete, clone, window revision, and schedule commands.
Every mutation invalidates `studentAdmissionsCrmType.admissionCycle`; impact/history reads are loaded only when their dialogs open.
The backend owns lifecycle, dependency, permission, institution-timezone, and concurrency enforcement.

## Client map

| Client                          | Responsibilities                                                                                                                                                                                                                             | Main screens                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `admission-cycles-api.ts`       | Admission cycle list and lifecycle commands                                                                                                                                                                                                  | Cycles and cycle selectors                                  |
| `admission-offerings-api.ts`    | Offering list, detail, CRUD, explicit state commands, clone, readiness, availability, and bulk preview or commit                                                                                                                             | Offerings, inquiry selection, Applicant 360                 |
| `admission-workflows-api.ts`    | Workflow CRUD, server-searchable published-option paging, graph save, metadata, validation, lifecycle, versions, and usage                                                                                                                   | Workflow list, builder, and Offering setup                  |
| `admission-forms-api.ts`        | Form definitions, server-searchable published-option paging, detail reads for school-form reuse, sections, fields, lifecycle, validation, and preview                                                                                        | Form builder, template library, preview, and Offering setup |
| `admission-inquiries-api.ts`    | Server-paged/sorted owner and operational queues, URL-backed filters, detail update with concurrency, timeline, filtered CSV export, duplicate resolution, scoped single/bulk assignment, and inquiry-linked Communication campaign creation | Inquiry CRM, management drawer, and inquiry dialog          |
| `admission-applicants-api.ts`   | Applicant 360 identity/family context, application and stage progress with stage timestamps, bounded recent activity, and notes                                                                                                              | Applicant 360                                               |
| `admission-applications-api.ts` | Start application, list, frozen workflow, form values, draft save, submit, stage advance, and transition history                                                                                                                             | Application list and detail                                 |

### Student Onboarding

`src/redux/student/onboarding/student-onboarding-api.ts` owns the durable post-admission worklist contract. It covers server-paged cases, filter options, analytics, detail, live placement capacity, identifier series, readiness refresh, owner and step updates, placement reservation, identifier preparation, activation preview and activation, cancellation, service handoffs and consent confirmation, policies, identifier-series settings, historical reconciliation, and onboarding documents. The client unwraps the shared `Result<T>` response at the API boundary and invalidates case, list, analytics, and related operational tags after commands.

`student-onboarding-types.ts` mirrors the backend numeric lifecycle enums and DTOs. Do not reuse the generic Student Records lookup as the onboarding source of truth: admission finalization returns `onboardingCaseId`, while the onboarding case owns preparation until activation creates the operational enrollment.

`persisted-onboarding-settings-provider.tsx` loads and saves versioned configuration through `/api/student/onboarding/settings/configurations`, preserving school/year scope and concurrency stamps. Load or schema failures block editing with Retry; they do not silently substitute defaults. The backend resolves the matching readiness and numbering rules. The obsolete operational editor has been removed.

The case client also owns GET/POST portal-account links. Finance assignment reuses the canonical assignment drawer for the exact student and academic year. Collection navigation carries `studentId`, `academicYearId`, `boardId` and `mediumId`; the Finance summary query filters by Student ID and waits for the matching year. Readiness refresh reads Finance evidence and portal links without creating duplicate dues, receipts or identities.

## Endpoint ownership

Assessment sessions and offering/stage choices use `src/redux/student/admissions/admission-assessment-sessions-api.ts`.
Applicant bookings, attendance, results, review, cancellation, retakes, and waivers use `src/redux/student/admissions/admission-assessments-api.ts`.
The shared response types are in `src/redux/student/admissions/admission-assessment-types.ts`.
Assessment stage configuration uses `src/redux/student/admissions/admission-assessment-policy.ts`, preserving unrelated stage configuration and keeping legacy workflows opted out by default.
Document stage configuration uses `admission-document-policy.ts`, `admission-document-policy-validation.ts`, and `admission-condition-rule.ts`. The editor preserves unrelated settings and rejects unsupported policy versions. `admission-document-settings-api.ts` loads optional student document categories and class options using workflow-view access.
Document requirements retain selected class IDs in `standardIds`; omitted/null means All classes, while an empty selection is invalid.
`collectionFormStageCode` links early uploads to a Form stage; `documentCollectionAvailable` and `canCollectDuringForm` are server-owned runtime flags.
Document action guards match the canonical backend bundles: `Students.Admissions.Documents.View` permits viewing/downloading, `.Add` permits upload/original/review actions, and `.Delete` permits waiver. Server capabilities still restrict each action by stage and evidence state; retired granular permission names are not accepted as grants.
Both clients use the existing global RTK Query API and refresh assessment/application data after mutations; workflow or offering changes also invalidate assessment scope choices.
Server-provided assessment capabilities determine available applicant actions, while the existing workflow-advance client remains responsible for progression.

Eligibility summaries, explicit evaluation, exception requests and review, and lazy evaluation history use `admission-eligibility-api.ts` with `admission-eligibility-types.ts`.
The optional `eligibilityEnabled` workflow-stage flag mounts this runtime only when the backend enables it.
The client uses the existing authenticated RTK Query API and captures the application stamp and evaluation when an action dialog opens.
Every mutation invalidates the application tag, refreshing subscribed summaries and history after successful commands or concurrency rejection.
Evaluation is an explicit POST; summary and history reads never record a new check.

Review summary, draft, recommendation submission, assignment, correction, history and queue use `admission-review-api.ts` and `admission-review-types.ts`. The client targets `/student/enrollment/admissions/reviews` through the global authenticated API. All Review commands invalidate the application tag so subscribed summaries, existing decision capabilities, history and queues refresh, including after a rejected concurrent write. GET does not create review history. The stage editor shares `admission-review-policy.ts` and `admission-review-settings-api.ts` for versioned optional settings, role choices and bounded reviewer lookup; saved choices survive lookup errors or filtered results.

The existing application decision client continues to own approval, rejection, waitlist, offers and finalization. Optional `reviewDecision` capabilities on the main application response control these existing actions; absent managed-review metadata preserves legacy behavior. Detailed policy, source freshness, role rules and transition gates belong to the [backend student API](../../../Shikshamitra-BE/docs/modules/student/api.md).

Historical Inquiry stage configuration uses `admission-inquiry-policy.ts`; Inquiry is no longer selectable in new Admission Stage workflows, while disabled or missing settings preserve the Basic inquiry process.
`admission-inquiry-settings-api.ts` loads offering-scoped active counsellors for workflow setup.
`admission-inquiry-management-api.ts` reads the safe management summary and records structured contacts, follow-ups, qualification with closure codes, and reopen actions.
Successful management commands invalidate the inquiry tag so the list and open drawer reload authoritative state.
Runtime counsellor search and assignment stay in `admission-inquiries-api.ts`; the detail workspace uses server `canReassign`, an offering-scoped eligible pool, and a required transfer reason. Lists display returned counsellor names without requesting the manager-only assignment endpoint. Counsellor and offering column-filter choices come from the loaded page; academic filters and global search still run on the server.
The same client sends `workQueue` for Overdue, Awaiting first contact, Awaiting qualification, and Open follow-ups. The backend filters these queues before paging and returns the row's cycle, offering, counsellor, management readiness, deadlines, and next follow-up in the list response.
Inquiries and Pipeline reuse the server-paged list with `isTransferred: false` and `isTransferred: true` respectively. Pipeline includes post-application records and opens the returned `applicationId`. Inquiry status is projected to Pending, Interested, or Not interested without removing legacy status/history. The Update client saves optional status/reason, academic context, and original raw form values with concurrency.
The Inquiry list and Pipeline also reuse `createAdmissionInquiryCommunication`. The compose dialog permits WhatsApp, SMS, and Email, supplies language-aware acknowledgement/follow-up/application templates, requires a subject for Email, hides immediate delivery without `Communication.Campaigns.Send`, and is visible only when the user has both Inquiry Manage and `Communication.Campaigns.Add`. Inquiry creation can invoke the same contract for an automatic acknowledgement; the backend remains authoritative for approval, providers, consent, delivery tracking, retries, and usage.

Managed Form stages use `admission-form-stage-api.ts` for the scoped stage summary, section verification, verification revocation, and correction requests. The client keeps application, stage, and section identifiers in the route and sends only command data plus the application concurrency stamp. Both mutations invalidate the stage-specific and application tags so blockers, attempts, form state, and workflow controls refresh together. `admission-form-stage-policy.ts` owns the versioned editor shape and preserves unrelated stage configuration. The stage editor uses the published-form list for selection, then reads the selected form detail when staff verification is enabled because list records contain section counts but omit section details.

Managed Payment stages use `admission-payment-policy.ts`, `admission-payment-types.ts`, and `admission-payment-api.ts`. The client sends application and transaction concurrency stamps plus one idempotency key per financial action. Mutations invalidate the application tag so balances, blockers, transaction stamps, and workflow state refresh together. Server capabilities decide which record, verify, reject, waive, reverse, and continue actions are shown.

Managed Offer stages use `admission-offer-policy.ts`, `admission-offer-types.ts`, and `admission-offer-api.ts`. Application and stage identifiers stay in scoped routes; every command sends the captured application stamp and a unique idempotency key. Mutations invalidate the application tag so status, blockers, capabilities, history, and workflow state refresh. The application detail mounts the managed card only when `offerStageEnabled` is present and hides the legacy offer actions for that stage; missing metadata preserves release compatibility.

Legacy managed Seat stages use `admission-seat-policy.ts`, `admission-seat-types.ts`, and `admission-seat-api.ts`. They remain supported for immutable published versions and applications already pinned to them, but Seat is not selectable in new workflow drafts. New capacity and waitlist setup requires a separate persisted Admission Offering contract and must not be represented by UI-only fields. Legacy commands continue to send pool and allocation concurrency stamps plus an idempotency key, and they invalidate the application tag so existing journeys remain operational.

The clients use the Student Enrollment Admissions endpoint family under `/student/enrollment/admissions`.
Request and response contracts are owned by `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/Enrollments/Admissions/**`.
Product rules and persistence are owned by `../../../Shikshamitra-BE/src/ShikshaMitra.Application/Students/StudentEnrollments/Admissions/**`.

## Cache behavior

The managed document checklist uses `admission-document-verification-api.ts` and `admission-document-types.ts`. Uploads send `FormData` through the global authenticated API, while original checks, reviewer decisions, and waivers use typed mutations. All document commands invalidate the application tag, including rejected stale writes, so the current checklist and concurrency stamp refresh. The application-level stamp is captured when the action dialog opens.

`admission-document-download-api.ts` downloads authorized attachments through the global API, keeps file bytes outside the Redux cache, and revokes temporary browser URLs after initiating the download. `student-admission-evidence-api.ts` reads retained evidence for the student Documents tab; its downloads use the student-scoped endpoint. No public storage URL is exposed by these clients.

The existing `getStudentById` query in `src/redux/student/index.ts` reads `/students/records/{studentId}/profile` through the global API. `student-profile-types.ts` unwraps the response and validates the canonical Student GUID. The profile data boundary mounts tabs only when the returned identity matches the requested student; failed reads show an alert and Retry. Document and admission-evidence queries therefore receive the resolved Student ID. The protected endpoint and direct-record scope rules are owned by the [backend student module](../../../Shikshamitra-BE/docs/modules/student/README.md).

Admissions mutations invalidate the relevant `studentAdmissionsCrmType` tag so lists and detail screens reload configuration or runtime state after a successful change.
`admission-intake-profiles-api.ts` reads `/student/enrollment/admissions/public-inquiry-links/options?admissionCycleId=...` for compatible setup/form pairs. That query uses Offering, Form, and Cycle cache tags and refreshes when the creation drawer opens or its period changes. The drawer uses `currentData` to avoid submitting cached choices from a previous period.
Bulk preview is read-like and does not invalidate the offering cache; successful bulk commit does.
Application form-value saves invalidate the application tag so the concurrency stamp and saved values remain current.
Inquiry creation invalidates inquiry and applicant tags because it creates the CRM record and its linked applicant context together.

## Client rule

Use the existing Admissions RTK Query client for a new screen or mutation instead of adding a direct fetch helper.

## Onboarding credential emails and document overrides

`student-onboarding-api.ts` owns credential-email status/request and document override endpoints under the existing onboarding case boundary. Email request mutations invalidate that case's detail and handoff tags; document overrides additionally invalidate its document requirements. No credential/password is returned to the staff interface.

The readiness profile persists separate student/guardian email switches (default OFF), activation/completion timing, manual/automatic provisioning, and the selected guardian relationship for automatic provisioning. Legacy configurations receive safe email-OFF defaults without changing their account requirements.
## Student dashboard client

| Source | Responsibility |
|---|---|
| `src/redux/student/dashboard/student-module-dashboard-api.ts` | Context and section GETs; raw or `{data}` response adaptation |
| `src/redux/student/dashboard/student-module-dashboard-types.ts` | Modes, links, metrics, bounded class strength and query inputs |
| `src/screens/student/dashboard/hooks/use-student-dashboard.ts` | Session/grant initialization, permission guard, year and refresh |
| `src/screens/student/dashboard/hooks/use-student-dashboard-sections.ts` | One subscription per permitted section, shared by metrics, priorities and graphs |
| `src/screens/student/dashboard/dashboard-insights.ts` and `dashboard-graph-data.ts` | Permission-filtered presentation of existing scoped totals; no independent data fetch |

Context reads `/api/students/dashboard/context`; sections read `/api/students/dashboard/sections/{section}?academicYearId={guid}`, with section `records`, `admissions` or `attendance`. Permitted sections load independently after context resolves. Cache arguments include subject, tenant and granted permission names; section arguments also include year. Identity keys partition cache entries and are not sent as API authority. `currentData` clears previous identity/year results, errors withhold data, and unused dashboard entries expire immediately. The `Student/MODULE-DASHBOARD` tag supports manual GET refresh. There is no polling, Reporting preview refresh mutation or snapshot job. Destination mutations remain owned by their clients; returning to the dashboard refetches sections.

See [backend dashboard API](../../../Shikshamitra-BE/docs/modules/student/api.md#student-dashboard-live-reads). Existing Reporting preview APIs remain available to their existing consumers.

Population and saved-register doughnuts, class-strength bars and admissions workload bars reuse the same section responses. Chart code is dynamically loaded through the shared chart component when a non-empty graph approaches the viewport; no analytics endpoint, polling or additional query is introduced. Accessible value links remain available before the graph mounts. Failed/skipped reads contribute no graph or priority data, and each chart respects the section's server-confirmed availability and exact metric grants.
