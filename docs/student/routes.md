---
module: student
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-09-11
owner: frontend-team
audience: humans-and-agents
---

# Find Student Admissions routes

TL;DR: use this page to map the implemented Admissions CRM routes to their screens and visible Student menu entries.

## Admissions route map

| Area                                         | Route                                             | Screen                                                            | Frontend permission                                                    |
| -------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Admissions → Settings → Admission Cycles     | `/student/admissions/settings/cycles`             | `src/screens/student/admissions/admission-cycles.tsx`             | `Students.Admissions`                                                  |
| Admissions → Settings → Admission Offerings  | `/student/admissions/settings/offerings`          | `src/screens/student/admissions/admission-offerings.tsx`          | `Students.Admissions.Offerings.View` with granular command permissions |
| Admissions → Settings → Workflow Builder     | `/student/admissions/settings/workflows`          | `src/screens/student/admissions/admission-workflows.tsx`          | `Students.Admissions.Workflows`                                        |
| Workflow definition builder                  | `/student/admissions/settings/workflows/[id]`     | `src/screens/student/admissions/admission-workflow-builder.tsx`   | granular Workflow View, Edit, Validate, and Publish permissions        |
| Admissions → Settings → Form Builder         | `/student/admissions/settings/forms`              | `src/screens/student/admissions/admission-forms.tsx`              | `Students.Admissions.Forms`                                            |
| Form preview                                 | `/student/admissions/settings/forms/[id]/preview` | `src/screens/student/admissions/admission-form-preview.tsx`       | inherited from Forms                                                   |
| Admissions → CRM → Inquiries                 | `/student/admissions/inquiries`                   | `src/screens/student/admissions/admission-inquiries.tsx`          | `Students.Admissions.Inquiries`                                        |
| Admissions → CRM → Pipeline                  | `/student/admissions/pipeline`                    | `src/screens/student/admissions/admission-applications.tsx`       | `Students.Admissions.Applications`                                     |
| Admissions → Applicant 360                   | `/student/admissions/applicants/[id]`             | `src/screens/student/admissions/admission-applicant-360.tsx`      | inherited from Admissions                                              |
| Admissions → Applications → All Applications | `/student/admissions/applications`                | `src/screens/student/admissions/admission-applications.tsx`       | `Students.Admissions.Applications`                                     |
| Admissions → Application detail              | `/student/admissions/applications/[id]`           | `src/screens/student/admissions/admission-application-detail.tsx` | inherited from Applications                                            |

## Menu ownership

The Assessment workspace is available at `/student/admissions/assessments`, owned by `src/screens/student/admissions/admission-assessments.tsx` and guarded by `Students.Admissions.Assessments.View`.
It appears under Admissions → Applications → Assessments.
The corresponding App Router entry is `src/app/(auth-route)/student/admissions/assessments/page.tsx`.
Session and applicant assessment actions use granular assessment permissions; backend authorization and offering scope remain authoritative.

The Review queue is available at `/student/admissions/reviews`, owned by `src/screens/student/admissions/admission-reviews.tsx`, with the App Router entry `src/app/(auth-route)/student/admissions/reviews/page.tsx`. It appears under Admissions → Applications → Review queue and requires `Students.Admissions.Reviews.View`. Assigned-to-me and overdue filters use server pagination; rows open the existing application detail route.

The Admissions menu and route constants are defined in `src/constants/student-menu.ts`.
The menu exposes Dashboard, CRM (Inquiries and Pipeline), Applications (All Applications, Assessments, and Review queue), and Settings (Admission Cycles, Admission Offerings, Workflow Builder, and Form Builder).

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
