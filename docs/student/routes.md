---
module: student
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-10-09
owner: frontend-team
audience: humans-and-agents
---

# Find Student Admissions routes

TL;DR: use this page to map the implemented Admissions and Onboarding routes to their screens and visible Student menu entries.

## Attendance settings route

| Area                  | Route                         | Screen                                             | Frontend permission                                                             |
| --------------------- | ----------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| Attendance → Settings | `/student/attendance/setting` | `src/screens/student/attendance/setting/index.tsx` | `Students.Attendance.Setting.LeaveType.View`; Add and Delete govern row actions |

The settings page contains only student leave types. Former `task`, `view`, and policy scope query parameters do not select configuration panels.

## Admissions route map

| Area                                        | Route                                             | Screen                                                                                 | Frontend permission                                                        |
| ------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Admissions → Settings → Admission Periods   | `/student/admissions/settings/cycles`             | `src/screens/student/admissions/admission-cycles.tsx`                                  | `Students.Admissions.View`; commands use only `Add` or `Delete`            |
| Admissions → Settings → Admission Form      | `/student/admissions/settings/forms`              | `src/screens/student/admissions/admission-forms.tsx`                                   | `Students.Admissions.Forms`; Inquiry and Registration forms only           |
| Admissions → Settings → Admission Stage     | `/student/admissions/settings/workflows`          | `src/screens/student/admissions/admission-workflows.tsx`                               | `Students.Admissions.Workflows`                                            |
| Workflow definition builder                 | `/student/admissions/settings/workflows/[id]`     | `src/screens/student/admissions/admission-workflow-builder.tsx`                        | granular Workflow View, Edit, Validate, and Publish permissions            |
| Form preview                                | `/student/admissions/settings/forms/[id]/preview` | `src/screens/student/admissions/admission-form-preview.tsx`                            | inherited from Forms                                                       |
| Admissions → Settings → Intake & Assignment | `/student/admissions/settings/intake-assignment`  | `src/screens/student/admissions/admission-intake-assignment.tsx`                       | `Students.Admissions.Offerings.View`                                       |
| Admissions → Settings → Admission Offering  | `/student/admissions/settings/offerings`          | `src/screens/student/admissions/admission-offerings.tsx`                               | `View`; additive commands use `Add`, destructive commands use `Delete`     |
| Admissions → Inquiries                      | `/student/admissions/inquiries`                   | `src/screens/student/admissions/admission-inquiries.tsx`                               | `Students.Admissions.Inquiries`                                            |
| Admissions → Pipeline                       | `/student/admissions/pipeline`                    | `src/screens/student/admissions/admission-inquiry-pipeline.tsx`                        | `Students.Admissions.Applications.View`                                    |
| Legacy applicant bookmark                   | `/student/admissions/applicants/[id]`             | `src/screens/student/admissions/admission-applicant-360.tsx`                           | `Students.Admissions.Applicants.View`; application access remains separate |
| Admissions → Assessments                    | `/student/admissions/assessments`                 | `src/screens/student/admissions/admission-assessments.tsx`                             | `Students.Admissions.Assessments.View`                                     |
| Admissions → Applications                   | `/student/admissions/applications`                | `src/screens/student/admissions/admission-applications.tsx`                            | `Students.Admissions.Applications`                                         |
| Admissions → Applicant 360                  | `/student/admissions/pipeline/applications/[id]`  | `src/screens/student/admissions/admission-application-detail.tsx`                      | `Students.Admissions.Applications.View`                                    |
| Admissions → Decision Applicant 360         | `/student/admissions/applications/[id]`           | `src/screens/student/admissions/admission-application-detail.tsx`                      | `Students.Admissions.Applications.View`                                    |

## Onboarding route map

| Area                                 | Route                                               | Screen                                                                  | Frontend permission                            |
| ------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| Onboarding → Student Setup           | `/student/onboarding/setup`                         | `src/screens/student/onboarding/student-setup/index.tsx`                | `Students.Onboarding.View`; commands use `Add` |
| Student Setup → Readiness            | `/student/onboarding/setup?view=readiness`          | Student Setup task view                                                 | `Students.Onboarding.View`                     |
| Student Setup → GR Number            | `/student/onboarding/setup?view=gr-number`          | Student Setup task view                                                 | `Students.Onboarding.View`                     |
| Student Setup → Roll Number          | `/student/onboarding/setup?view=roll-number`        | Student Setup task view                                                 | `Students.Onboarding.View`                     |
| Student Setup → Division             | `/student/onboarding/setup?view=division`           | Student Setup task view                                                 | `Students.Onboarding.View`                     |
| Student Setup → Fees                 | `/student/onboarding/setup?view=fees`               | Student Setup task view                                                 | `Students.Onboarding.View`                     |
| Student Setup → Credentials          | `/student/onboarding/setup?view=credentials`        | Student Setup task view                                                 | `Students.Onboarding.View`                     |
| Onboarding → Settings                | `/student/onboarding/settings`                      | `src/screens/student/onboarding/setting/onboarding-settings-page.tsx`   | `Students.Onboarding.Add`                      |
| Legacy Operational Policies redirect | `/student/onboarding/settings/operational-policies` | Redirects to Readiness & Access                                         | `Students.Onboarding.Add`                      |
| Settings → Readiness & Access        | `/student/onboarding/settings/readiness-access`     | `src/screens/student/onboarding/setting/onboarding-policy-settings.tsx` | `Students.Onboarding.Add`                      |
| Settings → Numbering & Placement     | `/student/onboarding/settings/numbering-placement`  | `src/screens/student/onboarding/setting/onboarding-number-settings.tsx` | `Students.Onboarding.Add`                      |

Student Setup reads the durable onboarding worklist, with `view` selecting a tab and `case` opening that case's task drawer.
Readiness's `today=true` filter selects cases that entered Onboarding today; a pending-task link keeps academic filters, opens the destination tab and case, and removes readiness-only filters.
An off-page focused case is fetched with the current academic scope; an already loaded row is reused.
Placement, separate GR/Roll preparation, identifier locks, fee-structure confirmation, documents, readiness refresh, ownership, activation and supported handoff rechecks use live commands.
Cancellation additionally requires `Students.Onboarding.Delete`; identifier unlock uses the existing Repair capability and server authorization.
Readiness & Access and Numbering & Placement persist scoped rules through `/api/student/onboarding/settings/configurations`; the selected header year opens its override or inherited school rules.
Numbering & Placement exposes only GR Number and Roll Number tabs, and Division Changes is removed from the menu.
Fees stays inside Onboarding and exposes structure selection/confirmation only; Credentials exposes account and email actions.
Backend services remain authoritative for state changes and permissions.

## Student Records route map

The Student Records menu has five submodules. Existing Records workflow URLs remain available for actions linked from a record, but are not separate menu entries.

| Submodule          | Route                             | Screen                                                                         | Permission                                |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| Student List       | `/student/profile`                | `src/screens/student/studentProfile/index.tsx`                                 | `Students.Records.StudentList.View`       |
| Student I-Card     | `/student/student-i-card`         | `src/screens/student/records/student-icard-templates.tsx`                      | `Students.Records.StudentICard.View`      |
| Certificates       | `/student/certificates`           | `src/screens/student/records/student-record-documents.tsx` in certificate mode | `Students.Records.Certificates.View`      |
| Reports            | `/student/reports`                | `src/screens/student/reports/index.tsx`                                        | `Students.Records.Reports.View`           |
| Settings           | `/student/studentRecords/setting` | `src/screens/student/recordsSetting/index.tsx`                                 | `Students.Records.Settings.View`          |

I-Card and Certificates use the persisted document APIs rather than the sample rows in the earlier screens. Server permissions and school Records policy still control issuance and record changes.
The Student I-Card page lists saved designs with View, Edit, and Delete actions. Create and Edit open a five-step builder (Template, Designer, Students, Review, Export) using the shared HR-style stepper. The Students step uses multiple Board, Medium, Class and Division selections for the selected global year and retains up to 100 selected students across directory pages. Export downloads a bulk A4 PDF; Issue writes numbered cards to history.

## Menu ownership

The Assessment workspace is available at `/student/admissions/assessments`, owned by `src/screens/student/admissions/admission-assessments.tsx` and guarded by `Students.Admissions.Assessments.View`.
It appears directly under Admissions as Assessments.
The corresponding App Router entry is `src/app/(auth-route)/student/admissions/assessments/page.tsx`.
Session and applicant assessment actions use granular assessment permissions; backend authorization and offering scope remain authoritative.

The former `/student/admissions/reviews` App Router entry and Application Reviews permission-editor exposure are removed. Review working panels do not mount in Application detail. Backend permission identifiers remain unchanged; retired admission operations reject unsupported types.

The Admissions menu and route constants are defined in `src/constants/student-menu.ts`.
The Admissions menu exposes Inquiries, Pipeline, Assessments, Applications, and Settings. Settings follows the school setup order: Admission Periods, Admission Form, Admission Stage, Intake & Assignment, and Admission Offering. There are no numbered labels, and the Admissions root redirects to Inquiries.
Pipeline keeps its existing name and Applications View access. It lists active inquiry-linked cases before Admission Decision with server paging and scoped owner/stage filters.
Applications requests decision-workspace cases and archived Withdrawn cases and uses the same View authority; its list and detail routes are guarded.
Continue opens the shared Applicant 360 under Pipeline before Decision and under Applications after Decision.
The server's `hasReachedDecision` flag drives canonical navigation; Withdrawn cases also route to Applications history without changing decision-entry evidence. After either handoff, Pipeline-only return filters are removed and Back returns to Applications.
Assessment return context and same-phase list filters remain intact, and canonical navigation waits for settled queries, matching stage data and no busy/unsaved editor.
Application reference and applicant-name links share that full-page destination, including modifier-click/new-tab behavior. Legacy `?application=<id>`, `/applications/[id]` and `/applicants/[id]` bookmarks recover into the authoritative phase without losing safe compatible list context. Multiple applicant applications still require explicit selection; no-application cases recover through Inquiries. `editIdentity=1` retains the existing identity editor.
Applicant 360 shows a clickable shared vertical journey stepper, a horizontal form stepper, header counsellor assignment and adjacent compact End journey/Continue admission actions. Future stages can be prepared through server-authorized actions; navigation never advances the workflow. Completed evidence stays read-only. Identity editing requires exact Applicants View/Add access and remains locked after finalization.

The Admission Cycle screen uses exactly three assignable permissions.
`View` enables the list, details, impact, and history; `Add` enables create, draft edit, publish, reopen, clone, window revision, and scheduling; `Delete` enables close, archive, and unused-Draft deletion.

The Offering screen checks `Create`, `Edit`, `Clone`, `Activate`, `Deactivate`, `Delete`, and `BulkCreate` permissions for visible controls.
The Workflow screens check granular `View`, `Create`, `Edit`, `Delete`, `Clone`, `Validate`, `Publish`, `Archive`, and `ViewUsage` permissions.
These checks improve UX; matching backend authorization remains mandatory.

During local development only, `src/utils/permissions.ts` temporarily treats `Students.Admissions` and its descendants as granted so the Admissions menu and screens remain available while permissions are being wired. Production builds continue to enforce every permission. Remove the marked development bypass before permission rollout is signed off.

## Route rule

Eligibility operations are retired from the Admission application workspace.
Eligibility and Offer working panels are retired from the supported application journey. Inquiry qualification and Student Records reviews retain their existing navigation and permissions.

Admission decision is embedded in Application detail. Approve, Waitlist and Reject follow the active-stage gate; Approved plus a completed journey enables Finalize. Payment uses Finance fee-structure confirmation, not admission money collection.

Managed document verification is embedded in the Applicant 360 page; it has no separate navigation item. Existing Documents action permissions gate checklist reads/commands. Pending stages allow preparation through returned capabilities; completed evidence loads lazily when selected and stays read-only.

Retained admission evidence appears in the existing `/student/profile` **Documents** tab through `src/screens/student/studentProfile/document.tsx`. Viewing requires `Students.Records.StudentList.View` and `Students.Admissions.Documents.View`; downloading also requires `Students.Admissions.Documents.Download`. Student-scoped backend authorization remains mandatory.

The existing `/student/profile?student={id}` entry resolves the protected record profile through `student-profile-data-boundary.tsx` before rendering `student-profile-view.tsx`. Loading, failure with Retry, and invalid identity responses are handled before tabs mount. This adds no navigation route; the Documents tab uses the canonical Student GUID returned by the profile read.

Do not describe an Admissions page as visible navigation unless its route and permission are present in `src/constants/student-menu.ts`.
The Applicant 360 and application detail pages are deep-linked detail surfaces and should be reached from the corresponding Applicant or Application list.
