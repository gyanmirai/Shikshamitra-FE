---
module: student
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-10-10
owner: frontend-team
audience: humans-and-agents
---

# Find Student Enrollment Admissions clients

TL;DR: the individual Enrollment Admissions CRM project uses focused RTK Query clients under `src/redux/student/admissions` and invalidates the shared Student Admissions cache tags after mutations.

## Finalized application summary reads

The finalized application summary reuses the application/workflow and decision-history reads, plus `getStudentOnboardingCase` only with the exact `Students.Onboarding.View` grant and a linked case. Case and fee-selection evidence use `currentData`, withhold failed or mismatched results, and refetch on mount. Decision history includes nullable `actorName` from the recorded actor; the assigned counsellor is never substituted for finalizing staff. No write, monetary calculation or new endpoint is introduced.

## Academic filter requests

`src/utils/student-academic-filter-query.ts` preserves scalar `standardId`/`divisionId` requests for a single selection and serializes multiple selections as repeated `standardIds`/`divisionIds` query keys. Admissions queues, Offering lists and Student Setup apply collections server-side before counting and paging. Board and Medium stay scalar; requests wait for their selection and an academic year. Assessments filters its authorized scopes by the same selected Board, Medium and classes before requesting a roster.

## Admission Cycle client

Offering writes retain the existing RTK Query client. The backend resolves the Application form from the selected workflow; new UI writes omit a separate Application form choice. Inquiry form selection remains explicit. Bulk input no longer needs a shared school-level ID: each selected class supplies its own academic path at the backend. Existing read DTOs retain historical track, entry-mode and form metadata.

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

`src/redux/student/onboarding/student-onboarding-api.ts` owns the durable post-admission worklist, detail, capacity, readiness, placement, identifiers, activation, accounts, documents and settings clients.
The client unwraps the shared `Result<T>` response and invalidates case/list/analytics or related operational tags after commands.
The list sends `enteredToday` and task filters to the server before pagination, including Fees and Credentials.
Activation also invalidates the Student Records directory tag so the newly activated student becomes discoverable without stale cached rows.

`student-onboarding-types.ts` mirrors the backend numeric lifecycle enums and DTOs. Do not reuse the generic Student Records lookup as the onboarding source of truth: admission finalization returns `onboardingCaseId`, while the onboarding case owns preparation until activation creates the operational enrollment.

`persisted-onboarding-settings-provider.tsx` loads and saves versioned configuration through `/api/student/onboarding/settings/configurations`, preserving school/year scope and concurrency stamps. Load or schema failures block editing with Retry; they do not silently substitute defaults. The backend resolves the matching readiness and numbering rules. The obsolete operational editor has been removed.

The provider keeps a route-specific shared breadcrumb/header visible during initial load, a year change, request failure or invalid saved configuration, while keeping editable child settings unmounted.
Identifier Unlock visibility additionally requires the filter-options response's server-derived `canUnlockIdentifiers` capability; absent/false capability or a failed scope lookup hides Unlock.
The backend computes this capability from the current administrator scope and Repair permission, and the frontend does not infer it from role names.

The case client owns GET/POST portal-account links and credential-email status/request operations.
`src/screens/student/onboarding/student-setup/student-onboarding-model.ts` projects backend locks, fee confirmation, credentials pending and requirement-review flags, and splits the legacy combined identifier check into independent GR/Roll tasks.
It excludes the system-owned final-readiness aggregate from staff task counts and uses the explicit `admissionConfirmed` server flag for an Offering case's Admission confirmed check, while preserving legacy imported-case identity projection.

| Client operation                                                                      | Screen wiring                                                                            | Concurrency and cache behavior                                                                                                            |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Available Offering GET at `/student/onboarding/settings/offerings?academicYearId=...` | `src/screens/student/onboarding/setting/onboarding-policy-settings.tsx`                  | Onboarding-owned read-only choices include academic year and workflow identity without requiring Admissions Offering configuration access |
| Separate case GR and Roll POSTs                                                       | `src/screens/student/onboarding/student-setup/student-onboarding-operation-dialog.tsx`   | Each task sends only its identifier inputs and current case stamp; assignment invalidates worklist/detail                                 |
| Identifier-lock POST                                                                  | `src/screens/student/onboarding/student-setup/student-identifier-lock-controls.tsx`      | Selected academic year, division and identifier type; refreshes case/list state                                                           |
| Fee-structure GET, candidate GET and confirmation PUT                                 | `src/screens/student/onboarding/student-setup/student-onboarding-fees.tsx`               | Reuses Admission fee DTOs; confirmation sends the case stamp and optional head IDs; no Finance mutation                                   |
| Workflow-document GET, upload, original recording and review                          | `src/screens/student/onboarding/student-setup/student-onboarding-workflow-documents.tsx` | Reuses Admission checklist/actions and application evidence stamps; refreshes documents and readiness                                     |
| Offering-requirement review POST                                                      | `src/screens/student/onboarding/student-setup/student-setup-drawer.tsx`                  | Explicitly reviews an existing unactivated case using its current stamp                                                                   |

The case's `hasDocumentRequirementsSnapshot` flag distinguishes a frozen empty Offering checklist from a legacy case without a snapshot.
An empty frozen checklist shows no required documents; only a legacy no-snapshot case falls back to the school-wide Student document panel when the workflow response is empty.
The current UI exposes no document-override or waiver action.
Endpoint contracts and domain enforcement remain owned by the [backend Student API](../../../Shikshamitra-BE/docs/modules/student/api.md).

## Endpoint ownership

Assessment sessions and offering/stage choices use `src/redux/student/admissions/admission-assessment-sessions-api.ts`.
Applicant bookings, attendance, results, cancellation, retakes, and waivers use `src/redux/student/admissions/admission-assessments-api.ts`.
The shared response types are in `src/redux/student/admissions/admission-assessment-types.ts`.
Assessment stage configuration uses `src/redux/student/admissions/admission-assessment-policy.ts`, preserving unrelated stage configuration and defaulting Assessment to managed result collection without independent review.
Document stage configuration uses `admission-document-policy.ts`, `admission-document-policy-validation.ts`, and `admission-condition-rule.ts`. The editor preserves unrelated settings and rejects unsupported policy versions. `admission-document-settings-api.ts` loads optional student document categories and class options using workflow-view access.
Document requirements retain selected class IDs in `standardIds`; omitted/null means All classes, while an empty selection is invalid.
Document settings normalize collection to uploads at the active stage; early Form collection, physical-original checks, independent review and waivers are unavailable. Documents View and Add retain existing backend permission identifiers for reads, uploads and acceptance/replacement decisions.

Eligibility, Review, and Offer are retired Admission Stage types. New drafts cannot select them, publication rejects them, application workspaces do not mount their working panels, and their direct admission operations reject unsupported stages. Existing enum numbers and stored audit records remain intact. Inquiry qualification, Student Records reviews, class capacity, and Finance ownership are separate contracts.

The application decision client owns Approve, Reject, Waitlist and Finalize. Actions require the active Admission decision stage and current server state; Waitlist remains pending. Offer mutations and the Application Reviews route are removed. Backend permissions, scope, evidence, concurrency and finalization rules remain authoritative.

Focused applicant identity and notes dialogs reuse `admission-applicants-api.ts`. Reads require exact Applicants View access and are lazy until their dialog opens; identity edits additionally require Applicants Add and remain locked for enrolled/finalized applications. Notes use the existing create/update mutations, with View-only access retaining a read-only history. Successful identity repair refreshes finalization readiness. Header counsellor assignment keeps the existing offering-scoped eligible-pool query and assignment mutation; opening the editor loads the pool rather than fetching it for every drawer view. These presentation changes introduce no endpoint or permission identifier.

Historical Inquiry stage configuration uses `admission-inquiry-policy.ts`; Inquiry is no longer selectable in new Admission Stage workflows, while disabled or missing settings preserve the Basic inquiry process.
`admission-inquiry-settings-api.ts` loads offering-scoped active counsellors for workflow setup.
`admission-inquiry-management-api.ts` reads the safe management summary and records structured contacts, follow-ups, qualification with closure codes, and reopen actions. The compact Inquiry Follow-up dialog uses one atomic `follow-up-notes` command with both management and inquiry concurrency stamps to save the note, business status, and replacement reminder; Not interested clears open reminders. Its history cards use the returned note snapshots. Edit uses the original configured form and form activity history independently.
Successful management commands invalidate the inquiry tag so the list and open drawer reload authoritative state.
Runtime counsellor search and assignment stay in `admission-inquiries-api.ts`; the detail workspace uses server `canReassign`, an offering-scoped eligible pool, and a required transfer reason. Lists display returned counsellor names without requesting the manager-only assignment endpoint. Counsellor and offering column-filter choices come from the loaded page; academic filters and global search still run on the server.
The same client sends `workQueue` for Overdue, Awaiting first contact, Awaiting qualification, and Open follow-ups. The backend filters these queues before paging and returns the row's cycle, offering, counsellor, management readiness, deadlines, and next follow-up in the list response.
Inquiries uses the server-paged inquiry list with `isTransferred: false`.
Pipeline uses `src/redux/student/admissions/admission-pipeline-api.ts` for pre-decision application progress and full scoped filter options, with URL-owned search, filters, sort and pagination.
Applications uses `admission-applications-api.ts` with `decisionWorkspaceOnly=true`, academic scope, server search/sorting and `skipCount`/`maxResultCount`; the returned `totalCount` drives pagination.
Its identity column uses the real application number; no separate applicant number is invented.
The list reads `standardName`, `contactPhone`, `contactEmail`, `decisionEnteredAt` and `hasReachedDecision`; the shared generic list remains available to application-history consumers without decision-only filtering.
Both application and inquiry tags refresh the Pipeline projection after mutations; returning from detail refetches the worklist.
The full-page application workspace reuses these clients. Its route owns the application identity and safe return context; stage selection is local presentation state. Selected Form policy reads use the selected stage, while future Documents/Assessment/Fee preparation uses returned server capabilities. Historical evidence remains read-only. List queries are skipped during legacy-link recovery and the worklist refreshes when the user returns.
`admission-applications-api.ts` adds `endAdmissionApplicationJourney`: POST `/student/enrollment/admissions/applications/{id}/end-journey` with required reason and concurrency stamp. The UI combines existing Applications Add access with server `canEndJourney`. Successful closure refreshes applications/Pipeline, applicant/inquiry history, offering capacity, follow-ups and assessment session occupancy; failed closure preserves cache and entered reason. The [backend Student API](../../../Shikshamitra-BE/docs/modules/student/api.md) owns lifecycle/cleanup rules.
The identity editor lazily reuses applicant 360 reads/profile updates with exact Applicants View/Add access and finalized-record locks. Finalization repair returns to the same dialog and readiness preview. Header counsellor assignment keeps its existing mutation/concurrency contract. The vertical journey stepper selects a workspace; actual continuation still uses the current-stage runtime command.
The table exporter explicitly labels its loaded-row scope as **Export current page**.
Inquiry status remains projected to Pending, Interested, or Not interested without removing legacy status/history.
The Update client saves optional status/reason, academic context, and original raw form values with concurrency.
Application follow-ups use `src/redux/student/admissions/admission-application-follow-ups-api.ts` and the shared inquiry follow-up panel, with backend capabilities controlling writes.
The Inquiry list reuses `createAdmissionInquiryCommunication`.
The compose dialog permits WhatsApp, SMS, and Email, supplies language-aware acknowledgement/follow-up/application templates, requires a subject for Email, hides immediate delivery without `Communication.Campaigns.Send`, and is visible only when the user has both Inquiry Manage and `Communication.Campaigns.Add`.
Inquiry creation can invoke the same contract for an automatic acknowledgement; the backend remains authoritative for approval, providers, consent, delivery tracking, retries, and usage.

Managed Form stages use `admission-form-stage-api.ts` for the scoped stage summary, section verification, verification revocation, and correction requests. The client keeps application, stage, and section identifiers in the route and sends only command data plus the application concurrency stamp. Both mutations invalidate the stage-specific and application tags so blockers, attempts, form state, and workflow controls refresh together. `admission-form-stage-policy.ts` owns the versioned editor shape and preserves unrelated stage configuration. The stage editor uses the published-form list for selection, then reads the selected form detail when staff verification is enabled because list records contain section counts but omit section details.

Payment uses the existing `admission-fee-selection-api.ts` and shared FeeSelectionPanel. Candidate reads enforce the Offering class/year/Board/Medium scope; saved snapshots include the selected structure version and chosen optional heads. Confirm fee structure uses the existing save mutation and application concurrency stamp, invalidates application/selection state, and remains separate from the workflow advance command. Payment summary reports feeStructureRequired or feeStructureConfirmed; no admission money-recording actions are mounted.

Eligibility, Review, and Offer are retired Admission Stage types. New drafts cannot select them, publication rejects them, application workspaces do not mount their working panels, and their direct admission operations reject unsupported stages. Existing enum numbers and stored audit records remain intact. Inquiry qualification, Student Records reviews, class capacity, and Finance ownership are separate contracts.

Legacy managed Seat stages use `admission-seat-policy.ts`, `admission-seat-types.ts`, and `admission-seat-api.ts`. They remain supported for immutable published versions and applications already pinned to them, but Seat is not selectable in new workflow drafts. New capacity and waitlist setup requires a separate persisted Admission Offering contract and must not be represented by UI-only fields. Legacy commands continue to send pool and allocation concurrency stamps plus an idempotency key, and they invalidate the application tag so existing journeys remain operational.

The clients use the Student Enrollment Admissions endpoint family under `/student/enrollment/admissions`.
Request and response contracts are owned by `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/Enrollments/Admissions/**`.
Product rules and persistence are owned by `../../../Shikshamitra-BE/src/ShikshaMitra.Application/Students/StudentEnrollments/Admissions/**`.

## Cache behavior

The managed document checklist uses `admission-document-verification-api.ts` and `admission-document-types.ts`. Uploads send `FormData` through the global authenticated API, while acceptance and replacement decisions use typed mutations. Original-check and waiver actions are not exposed in the supported checklist. All document commands invalidate the application tag, including rejected stale writes, so the current checklist and concurrency stamp refresh. The application-level stamp is captured when the action dialog opens.

`admission-document-download-api.ts` downloads authorized attachments through the global API, keeps file bytes outside the Redux cache, and revokes temporary browser URLs after initiating the download. `student-admission-evidence-api.ts` reads retained evidence for the student Documents tab; its downloads use the student-scoped endpoint. No public storage URL is exposed by these clients.

The existing `getStudentById` query in `src/redux/student/index.ts` reads `/students/records/{studentId}/profile` through the global API. `student-profile-types.ts` unwraps the response and validates the canonical Student GUID. The profile data boundary mounts tabs only when the returned identity matches the requested student; failed reads show an alert and Retry. Document and admission-evidence queries therefore receive the resolved Student ID. The protected endpoint and direct-record scope rules are owned by the [backend student module](../../../Shikshamitra-BE/docs/modules/student/README.md).

Admissions mutations invalidate the relevant `studentAdmissionsCrmType` tag so lists and detail screens reload configuration or runtime state after a successful change.
The inline setup editor shares one `/student/enrollment/admissions/intake-profiles/counsellors?counsellorOnly=true` read between pool and fallback choices; other lookup consumers retain the default unfiltered request.
`admission-intake-profiles-api.ts` reads `/student/enrollment/admissions/public-inquiry-links/options?admissionCycleId=...` for compatible setup/form pairs, including null-profile options for manual assignment. The link DTO accepts a nullable assignment profile; an empty optional setup sends null and leaves captured inquiries Unassigned. That query uses Offering, Form, and Cycle cache tags and refreshes when the creation drawer opens or its period changes. The drawer uses `currentData` to avoid submitting cached choices from a previous period. A setup lookup failure does not prevent a compatible manual link from being created.
Bulk preview is read-like and does not invalidate the offering cache; successful bulk commit does.
Application form-value saves invalidate the application tag so the concurrency stamp and saved values remain current.
Inquiry creation invalidates inquiry and applicant tags because it creates the CRM record and its linked applicant context together.

## Client rule

Use the existing Admissions RTK Query client for a new screen or mutation instead of adding a direct fetch helper.

## Onboarding credentials and requirement evidence

Credential-email request mutations invalidate case detail and handoff tags.
The Credentials pending state uses the backend `credentialsPending` flag, including missing required account links and enabled email recipients whose delivery request is not Sent.
No credential/password is returned to the staff interface.

Readiness profiles link Offering IDs and persist student/guardian login-email choices and automatic/manual provisioning; the simplified rule editor fixes release timing to activation.
Existing active/completed cases retain their historical requirement snapshot, and existing unactivated cases requiring migration expose explicit requirement review.

## Student dashboard client

| Source                                                                              | Responsibility                                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/redux/student/dashboard/student-module-dashboard-api.ts`                       | Context and section GETs; raw or `{data}` response adaptation                         |
| `src/redux/student/dashboard/student-module-dashboard-types.ts`                     | Modes, links, metrics, bounded class strength and query inputs                        |
| `src/screens/student/dashboard/hooks/use-student-dashboard.ts`                      | Session/grant initialization, permission guard, year and refresh                      |
| `src/screens/student/dashboard/hooks/use-student-dashboard-sections.ts`             | One subscription per permitted section, shared by metrics, priorities and graphs      |
| `src/screens/student/dashboard/dashboard-insights.ts` and `dashboard-graph-data.ts` | Permission-filtered presentation of existing scoped totals; no independent data fetch |

Context reads `/api/students/dashboard/context`; sections read `/api/students/dashboard/sections/{section}?academicYearId={guid}`, with section `records`, `admissions` or `attendance`. Permitted sections load independently after context resolves. Cache arguments include subject, tenant and granted permission names; section arguments also include year. Identity keys partition cache entries and are not sent as API authority. `currentData` clears previous identity/year results, errors withhold data, and unused dashboard entries expire immediately. The `Student/MODULE-DASHBOARD` tag supports manual GET refresh. There is no polling, Reporting preview refresh mutation or snapshot job. Destination mutations remain owned by their clients; returning to the dashboard refetches sections.

See [backend dashboard API](../../../Shikshamitra-BE/docs/modules/student/api.md#student-dashboard-live-reads). Existing Reporting preview APIs remain available to their existing consumers.

Population and saved-register doughnuts, class-strength bars and admissions workload bars reuse the same section responses. Chart code is dynamically loaded through the shared chart component when a non-empty graph approaches the viewport; no analytics endpoint, polling or additional query is introduced. Accessible value links remain available before the graph mounts. Failed/skipped reads contribute no graph or priority data, and each chart respects the section's server-confirmed availability and exact metric grants.
