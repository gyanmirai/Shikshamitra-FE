---
module: student
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-09-21
owner: frontend-team
audience: humans-and-agents
---

# Find Student Admissions routes

TL;DR: use this page to map the implemented Admissions and Student Onboarding routes to their screens and visible Student menu entries.

## Admissions route map

| Area                                                 | Route                                             | Screen                                                            | Frontend permission                                                    |
| ---------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Admissions → Settings → Admission Periods            | `/student/admissions/settings/cycles`             | `src/screens/student/admissions/admission-cycles.tsx`             | `Students.Admissions.View`; commands use only `Add` or `Delete`        |
| Admissions → Settings → Admission Form                | `/student/admissions/settings/forms`              | `src/screens/student/admissions/admission-forms.tsx`              | `Students.Admissions.Forms`; Inquiry and Registration forms only |
| Admissions → Settings → Admission Stage               | `/student/admissions/settings/workflows`          | `src/screens/student/admissions/admission-workflows.tsx`          | `Students.Admissions.Workflows`                                        |
| Workflow definition builder                          | `/student/admissions/settings/workflows/[id]`     | `src/screens/student/admissions/admission-workflow-builder.tsx`   | granular Workflow View, Edit, Validate, and Publish permissions        |
| Form preview                                         | `/student/admissions/settings/forms/[id]/preview` | `src/screens/student/admissions/admission-form-preview.tsx`       | inherited from Forms                                                   |
| Admissions → Settings → Intake & Assignment           | `/student/admissions/settings/intake-assignment`  | `src/screens/student/admissions/admission-intake-assignment.tsx`  | `Students.Admissions.Offerings.View`                             |
| Admissions → Settings → Admission Offering            | `/student/admissions/settings/offerings`          | `src/screens/student/admissions/admission-offerings.tsx`          | `View`; additive commands use `Add`, destructive commands use `Delete` |
| Admissions → Inquiries                               | `/student/admissions/inquiries`                   | `src/screens/student/admissions/admission-inquiries.tsx`          | `Students.Admissions.Inquiries`                                        |
| Admissions → Pipeline                                | `/student/admissions/pipeline`                    | `src/screens/student/admissions/admission-inquiry-pipeline.tsx`   | `Students.Admissions.Inquiries`                                        |
| Admissions → Applicant 360                           | `/student/admissions/applicants/[id]`             | `src/screens/student/admissions/admission-applicant-360.tsx`      | inherited from Admissions                                              |
| Admissions → Assessments                             | `/student/admissions/assessments`                 | `src/screens/student/admissions/admission-assessments.tsx`        | `Students.Admissions.Assessments.View`                                 |
| Admissions → Applications                            | `/student/admissions/applications`                | `src/screens/student/admissions/admission-applications.tsx`       | `Students.Admissions.Applications`                                     |
| Admissions → Application detail                      | `/student/admissions/applications/[id]`           | `src/screens/student/admissions/admission-application-detail.tsx` | inherited from Applications                                            |

## Student Onboarding route map

| Area                                              | Route                                                      | Screen                                                                         | Frontend permission                                    |
| ------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Student Onboarding → Student Setup                | `/student/onboarding/setup`                                | `src/screens/student/onboarding/student-setup/index.tsx`                       | `Students.Onboarding.View`; commands use `Add`         |
| Student Onboarding → Readiness                    | `/student/onboarding/setup/readiness`                      | Student Setup task view                                                        | `Students.Onboarding.View`                             |
| Student Onboarding → GR Number                    | `/student/onboarding/setup/gr-number`                      | Student Setup task view                                                        | `Students.Onboarding.View`                             |
| Student Onboarding → Roll Number                  | `/student/onboarding/setup/roll-number`                    | Student Setup task view                                                        | `Students.Onboarding.View`                             |
| Student Onboarding → Division                     | `/student/onboarding/setup/division`                       | Student Setup task view                                                        | `Students.Onboarding.View`                             |
| Student Onboarding → Settings                     | `/student/onboarding/settings`                             | `src/screens/student/onboarding/setting/onboarding-settings-page.tsx`          | `Students.Onboarding.Add`                              |
| Legacy Operational Policies redirect              | `/student/onboarding/settings/operational-policies`        | Redirects to Readiness & Access                                              | `Students.Onboarding.Add`                              |
| Settings → Readiness & Access                     | `/student/onboarding/settings/readiness-access`            | `src/screens/student/onboarding/setting/onboarding-policy-settings.tsx`        | `Students.Onboarding.Add`                              |
| Settings → Numbering & Placement                  | `/student/onboarding/settings/numbering-placement`         | `src/screens/student/onboarding/setting/onboarding-number-settings.tsx`        | `Students.Onboarding.Add`                              |

Student Setup reads the durable onboarding worklist. Placement, identifiers, readiness refresh, ownership, activation, cancellation, documents and supported handoff rechecks use live commands. Cancellation additionally requires `Students.Onboarding.Delete`. Readiness & Access and Numbering & Placement persist scoped rules through `/api/student/onboarding/settings/configurations`; the selected header year opens its override or inherited school rules. Saved Defaults and Saved GR & Seat Settings are removed. The case drawer reuses the unchanged Finance assignment drawer, links to the standard Finance collections page, and offers permission-gated student/guardian account creation. Finance does not preselect the onboarding student; staff must select the year and confirm the student there. Backend services remain authoritative for all state changes.

## Menu ownership

The Assessment workspace is available at `/student/admissions/assessments`, owned by `src/screens/student/admissions/admission-assessments.tsx` and guarded by `Students.Admissions.Assessments.View`.
It appears directly under Admissions as Assessments.
The corresponding App Router entry is `src/app/(auth-route)/student/admissions/assessments/page.tsx`.
Session and applicant assessment actions use granular assessment permissions; backend authorization and offering scope remain authoritative.

The application-review workspace remains available at `/student/admissions/reviews`, owned by `src/screens/student/admissions/admission-reviews.tsx`, with the App Router entry `src/app/(auth-route)/student/admissions/reviews/page.tsx`. It is intentionally not a separate sidebar item. `Students.Admissions.Reviews.View` remains exposed in the permission editor as **Application Reviews** under Applications, and the existing deep link and embedded review actions remain protected. Assigned-to-me and overdue filters use server pagination; rows open the existing application detail route.

The Admissions menu and route constants are defined in `src/constants/student-menu.ts`.
The Admissions menu exposes Inquiries, Pipeline, Assessments, Applications, and Settings. Settings follows the school setup order: Admission Periods, Admission Form, Admission Stage, Intake & Assignment, and Admission Offering. There are no numbered labels, and the Admissions root redirects to Inquiries.
Pipeline keeps its existing name and Inquiry View access. It lists inquiries already handed to linked applications and opens the existing application detail route when the user has Applications View. Applications retains its existing independent list and route.
The Inquiry list stores its search, filters, and selected `inquiryId` in query parameters. Applicant 360 also accepts `inquiryId` when opened from the management drawer so application start uses the exact inquiry selected by the counselor.
Applicant 360 is the applicant-level admissions workspace: it explains the family context, surfaces missing identity data, shows the current application stage, exposes the next action, and keeps applications, inquiry activity, and internal notes together.

The Admission Cycle screen uses exactly three assignable permissions.
`View` enables the list, details, impact, and history; `Add` enables create, draft edit, publish, reopen, clone, window revision, and scheduling; `Delete` enables close, archive, and unused-Draft deletion.

The Offering screen checks `Create`, `Edit`, `Clone`, `Activate`, `Deactivate`, `Delete`, and `BulkCreate` permissions for visible controls.
The Workflow screens check granular `View`, `Create`, `Edit`, `Delete`, `Clone`, `Validate`, `Publish`, `Archive`, and `ViewUsage` permissions.
These checks improve UX; matching backend authorization remains mandatory.

During local development only, `src/utils/permissions.ts` temporarily treats `Students.Admissions` and its descendants as granted so the Admissions menu and screens remain available while permissions are being wired. Production builds continue to enforce every permission. Remove the marked development bypass before permission rollout is signed off.

## Route rule

Managed eligibility is embedded in `/student/admissions/applications/[id]` and adds no separate navigation item.
The `eligibility/` workspace uses `Students.Admissions.Eligibility.View`, `Evaluate`, `RequestException`, and `ReviewException` permissions together with server action flags.
The existing application-advance permission remains required for continuation.

Managed Review is embedded in `/student/admissions/applications/[id]` through `review/application-reviews.tsx`. Server-advertised `reviewEnabled` controls mounting. Review action permissions and server capabilities govern recommendations, assignment and correction. Final admission decisions continue through the existing decision card, including an explicit reaffirmation action when changed evidence requires another review after an offer has been accepted. Backend decision and scope enforcement remains authoritative.

Managed document verification is embedded in `/student/admissions/applications/[id]`; it has no separate navigation item. The application workspace gates checklist reads and commands with `Students.Admissions.Documents` action permissions. Completed-stage evidence loads only when its history is expanded.

Retained admission evidence appears in the existing `/student/profile` **Documents** tab through `src/screens/student/studentProfile/document.tsx`. Viewing requires `Students.Records.StudentList.View` and `Students.Admissions.Documents.View`; downloading also requires `Students.Admissions.Documents.Download`. Student-scoped backend authorization remains mandatory.

The existing `/student/profile?student={id}` entry resolves the protected record profile through `student-profile-data-boundary.tsx` before rendering `student-profile-view.tsx`. Loading, failure with Retry, and invalid identity responses are handled before tabs mount. This adds no navigation route; the Documents tab uses the canonical Student GUID returned by the profile read.

Do not describe an Admissions page as visible navigation unless its route and permission are present in `src/constants/student-menu.ts`.
The Applicant 360 and application detail pages are deep-linked detail surfaces and should be reached from the corresponding Applicant or Application list.
