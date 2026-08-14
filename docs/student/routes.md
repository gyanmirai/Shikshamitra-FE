---
module: student
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-08-14
owner: frontend-team
audience: humans-and-agents
---

# Find Student and Enrollment Admissions routes

TL;DR: use this page to map the implemented Enrollment Admissions CRM routes to their screens and visible Student menu entries.

## Enrollment Admissions route map

| Area                                     | Route                                             | Screen                                                            | Frontend permission                |
| ---------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------- |
| Enrollment → Settings → Admission cycle  | `/student/admissions/settings/cycles`             | `src/screens/student/admissions/admission-cycles.tsx`             | `Students.Admissions`              |
| Enrollment → Settings → Offerings        | `/student/admissions/settings/offerings`          | `src/screens/student/admissions/admission-offerings.tsx`          | `Students.Admissions.Offerings`    |
| Enrollment → Settings → Workflow builder | `/student/admissions/settings/workflows`          | `src/screens/student/admissions/admission-workflows.tsx`          | `Students.Admissions.Workflows`    |
| Enrollment → Settings → Form builder     | `/student/admissions/settings/forms`              | `src/screens/student/admissions/admission-forms.tsx`              | `Students.Admissions.Forms`        |
| Form preview                             | `/student/admissions/settings/forms/[id]/preview` | `src/screens/student/admissions/admission-form-preview.tsx`       | inherited from Forms               |
| Enrollment → Inquiries                   | `/student/admissions/inquiries`                   | `src/screens/student/admissions/admission-inquiries.tsx`          | `Students.Admissions.Inquiries`    |
| Enrollment → Applicant 360               | `/student/admissions/applicants/[id]`             | `src/screens/student/admissions/admission-applicant-360.tsx`      | inherited from Enrollment          |
| Enrollment → Applications                | `/student/admissions/applications`                | `src/screens/student/admissions/admission-applications.tsx`       | `Students.Admissions.Applications` |
| Enrollment → Application detail          | `/student/admissions/applications/[id]`           | `src/screens/student/admissions/admission-application-detail.tsx` | inherited from Applications        |

## Menu ownership

The Enrollment menu and route constants are defined in `src/constants/student-menu.ts`.
The menu exposes inquiries and applications directly under Enrollment, with admission cycle, offerings, workflow builder, and form builder nested under Enrollment → Settings.

## Route rule

Do not describe an Enrollment Admissions page as visible navigation unless its route and permission are present in `src/constants/student-menu.ts`.
The Applicant 360 and application detail pages are deep-linked detail surfaces and should be reached from the corresponding Applicant or Application list.
