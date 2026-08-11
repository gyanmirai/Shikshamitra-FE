---
module: student
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-08-11
owner: frontend-team
audience: humans-and-agents
---

# Find Student frontend routes

TL;DR: `src/constants/student-menu.ts` owns visible Student navigation.
Student Enrollment uses school-facing canonical routes, while superseded URLs exist only as compatibility redirects.

## Student Enrollment navigation

The Student Enrollment menu is divided into daily work, process worklists, review, and settings.
Applicant, Add Inquiry, Finance status, parent inquiry, and parent status are contextual surfaces rather than menu items.

### Daily work

| Menu label | Canonical route                | Frontend permission                      |
| ---------- | ------------------------------ | ---------------------------------------- |
| My Work    | `/student/enrollment/my-work`  | `Students.Enrollment.AdmissionsCrm.View` |
| Pipeline   | `/student/enrollment/pipeline` | `Students.Enrollment.AdmissionsCrm.View` |

### Process worklists

| Menu label            | Canonical route                           | Frontend permission                                |
| --------------------- | ----------------------------------------- | -------------------------------------------------- |
| Assessments           | `/student/enrollment/entrance-exams`      | `Students.Enrollment.AdmissionsCrm.View`           |
| Visits & Events       | `/student/enrollment/visits-events`        | `Students.Enrollment.AdmissionsCrm.ViewEvents`     |
| Registration          | `/student/enrollment/registration`        | `Students.Enrollment.AdmissionsCrm.View`           |
| Class Placement       | `/student/enrollment/class-placement`     | `Students.Enrollment.AdmissionsCrm.ViewSeatPlans`  |
| Activation            | `/student/enrollment/activation`          | `Students.Enrollment.AdmissionsCrm.ViewActivation` |
| Follow-ups & Messages | `/student/enrollment/follow-ups-messages` | `Students.Enrollment.AdmissionsCrm.View`           |

### Review

| Menu label        | Canonical route               | Frontend permission                           |
| ----------------- | ----------------------------- | --------------------------------------------- |
| Admission Reports | `/student/enrollment/reports` | `Students.Enrollment.AdmissionsCrm.Analytics` |

### Settings

| Menu label               | Canonical route                                | Frontend permission                                     |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------- |
| Settings                 | `/student/enrollment/settings`                 | `Students.Enrollment.AdmissionsCrm.ManageConfiguration` |
| Admission Year Setup     | `/student/enrollment/settings/admission-year`  | `Students.Enrollment.AdmissionsCrm.ManageConfiguration` |
| Pipeline Settings        | `/student/enrollment/settings/pipeline`        | `Students.Enrollment.AdmissionsCrm.ManageConfiguration` |
| Assessment Settings      | `/student/enrollment/settings/entrance-exam`   | `Students.Enrollment.AdmissionsCrm.ManageConfiguration` |
| Registration Settings    | `/student/enrollment/settings/registration`    | `Students.Enrollment.AdmissionsCrm.ManageConfiguration` |
| Finance Handoff Settings | `/student/enrollment/settings/finance-handoff` | `Students.Enrollment.AdmissionsCrm.ManageConfiguration` |
| Class Placement Settings | `/student/enrollment/settings/class-placement` | `Students.Enrollment.AdmissionsCrm.ManageConfiguration` |
| Activation Settings      | `/student/enrollment/settings/activation`      | `Students.Enrollment.AdmissionsCrm.ManageConfiguration` |
| Communication Settings   | `/student/enrollment/settings/communication`   | `Students.Enrollment.AdmissionsCrm.ManageConfiguration` |

## Contextual routes

| Surface                  | Route                                                 |
| ------------------------ | ----------------------------------------------------- |
| Applicant workspace      | `/student/enrollment/applicants/{leadId}`             |
| Public inquiry form      | `/student/admissions/inquiry/{tenantId}/{templateId}` |
| Family enrollment center | `/student/admissions/status/{tenantId}/{token}`       |
| Family return sign-in    | `/student/admissions/family/{tenantId}`               |

The family enrollment center starts from an applicant-specific, unguessable link and verifies the
guardian contact by OTP. After verification, the same short-lived session may switch among active,
unexpired applications in that tenant that use the same verified primary contact, or applications
explicitly assigned to the same active, authority-verified guardian with portal access.
Single-application links remain valid and render without a switcher.
The family return route accepts the guardian's phone or email and always returns a generic challenge
message. A successful OTP verification establishes the same short-lived family session and redirects
without placing that session credential in the URL.
The same verified status route shows future published visits and events only when staff enabled family
self-scheduling for that event; reserve and cancel actions remain applicant-, tenant-, and session-scoped.
The public routes share safe tenant branding, admissions support details, office hours, and configured
language options. The verified status route also owns communication preferences and eligible
application withdrawal without exposing internal notes, staff scores, or Finance details.

The applicant workspace owns the six-stage command journey and one active stage operation.
Pipeline, My Work, and focused worklists open the same applicant record rather than creating area-specific copies.
Pipeline rows, applicant names, generic applicant actions, and newly created inquiries use `tab=inquiry`.
Focused worklists use explicit `exam`, `registration`, `finance`, `offer`, `activation`, or `governance` stage values.
Explicit stage links remain on that historical or focused stage while the header continues to show current work.
Legacy `tab=overview` and `tab=activity` both become `tab=next`.
Activity and audit are rendered inline below Inquiry follow-up; there is no drawer URL state.
Targeted exam handoffs use `/student/enrollment/entrance-exams?cycle={academicYearId}&applicant={leadId}&examAction={record-result|review-eligibility|review-absence}`.
The `applicantReturn` value carries the session-backed Pipeline return token through an exam handoff.
The internal return token is versioned and restores the originating URL, scroll position, applicant focus target, and Pipeline view after data readiness.
The `cycle` query key carries the selected Institute Setup academic year between Enrollment pages.

## Compatibility redirects

Compatibility routes are not visible navigation and must not appear in new links, tests, or documentation examples.
Redirects preserve existing query parameters, including repeated values.

| Superseded route                                                                | Canonical destination                                                |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `/student/enrollment`                                                           | `/student/enrollment/my-work`                                        |
| `/student/enrollment/overview`                                                  | `/student/enrollment/my-work`                                        |
| `/student/enrollment/exams`                                                     | `/student/enrollment/entrance-exams`                                 |
| `/student/enrollment/registrations`                                             | `/student/enrollment/registration`                                   |
| `/student/enrollment/offers-seats`                                              | `/student/enrollment/class-placement`                                |
| `/student/enrollment/operations`                                                | `/student/enrollment/follow-ups-messages`                            |
| `/student/enrollment/analytics`                                                 | `/student/enrollment/reports`                                        |
| `/student/enrollment/settings/admission-cycles`                                 | `/student/enrollment/settings/admission-year`                        |
| `/student/enrollment/settings/admission-cycles/{academicYearId}`                | `/student/enrollment/settings/admission-year?cycle={academicYearId}` |
| `/student/enrollment/settings/admission-cycles/{academicYearId}/{workspaceTab}` | `/student/enrollment/settings/admission-year?cycle={academicYearId}` |
| `/student/enrollment/settings/journey`                                          | `/student/enrollment/settings/pipeline`                              |
| `/student/enrollment/settings/inquiry-capture`                                  | `/student/enrollment/settings/pipeline`                              |
| `/student/enrollment/settings/routing-scoring`                                  | `/student/enrollment/settings/pipeline`                              |
| `/student/enrollment/settings/entrance-exams`                                   | `/student/enrollment/settings/entrance-exam`                         |
| `/student/enrollment/settings/registration-documents`                           | `/student/enrollment/settings/registration`                          |
| `/student/enrollment/settings/offers-seats`                                     | `/student/enrollment/settings/class-placement`                       |
| `/student/enrollment/settings/communications`                                   | `/student/enrollment/settings/communication`                         |
| `/student/enrollment/settings/automation`                                       | `/student/enrollment/settings/communication`                         |
| `/student/enrollment/settings/governance`                                       | `/student/enrollment/settings`                                       |

## Route ownership rules

`/student/enrollment` is a redirect and never renders a second My Work implementation.
Admission Year Setup extends an academic year from Institute Setup and never creates a parallel academic-year record.
New frontend links must use canonical properties from `studentPaths.enrollment`.
Legacy property aliases may remain temporarily for source compatibility, but they resolve to canonical URLs.
Frontend permission checks control visibility and interaction only.
Backend permissions remain the security boundary.

## Other Student navigation

| Menu label          | Route                                 | Frontend permission                     |
| ------------------- | ------------------------------------- | --------------------------------------- |
| Dashboard           | `/student/dashboard`                  | `ShikshaMitra.Module.Students`          |
| Student Management  | `/student/management`                 | `Students.Records.StudentManagement`    |
| Student List        | `/student/profile`                    | `Students.Records.StudentList`          |
| Student I-Card      | `/student/student-i-card`             | `Students.Records.StudentICard`         |
| Certificates        | `/student/certificates`               | `Students.Records.Certificates`         |
| Records Reports     | `/student/reports`                    | `Students.Records.Reports`              |
| Records Settings    | `/student/studentRecords/setting`     | `Students.Records.Settings`             |
| Mark Attendance     | `/student/attendance/take-attendance` | `Students.Attendance.MarkAttendance`    |
| Leave and Absent    | `/student/attendance/leave-absent`    | `Students.Attendance.LeaveAndAbsent`    |
| Attendance Reports  | `/student/attendance/reports`         | `Students.Attendance.Reports`           |
| Attendance Settings | `/student/attendance/setting`         | `Students.Attendance.Setting.LeaveType` |
| Notification        | `/student/attendance/notification`    | `Students.Notification`                 |

Confirm backend authorization in [Student backend APIs](../../../Shikshamitra-BE/docs/modules/student/api.md) before changing server behavior.
