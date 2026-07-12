---
module: student
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-07-12
owner: frontend-team
audience: humans-and-agents
---

# Find Student frontend routes

TL;DR: Student visible navigation is owned by `src/constants/student-menu.ts`.
Use the menu source before treating a route as active navigation.

## Active menu routes

Use this table for visible Student navigation.

| Menu label               | Route                                  | Frontend permission                                           |
| ------------------------ | -------------------------------------- | ------------------------------------------------------------- |
| Dashboard                | `/student/dashboard`                   | `ShikshaMitra.Module.Students`                                |
| Pipeline                 | `/student/enrollment/pipeline`         | `Students.Enrollment.AdmissionsCrm.View`                      |
| Entrance Exams           | `/student/enrollment/exams`            | `Students.Enrollment.AdmissionsCrm.View`                      |
| Registrations & Documents | `/student/enrollment/registrations`   | `Students.Enrollment.AdmissionsCrm.View`                      |
| Offers & Seats           | `/student/enrollment/offers-seats`     | `Students.Enrollment.AdmissionsCrm.ViewSeatPlans`             |
| Activation               | `/student/enrollment/activation`       | `Students.Enrollment.AdmissionsCrm.ViewActivation`            |
| Operations               | `/student/enrollment/operations`       | `Students.Enrollment.AdmissionsCrm.View`                      |
| Analytics                | `/student/enrollment/analytics`        | `Students.Enrollment.AdmissionsCrm.Analytics`                 |
| Admissions CRM Settings  | `/student/enrollment/settings`         | `Students.Enrollment.AdmissionsCrm.ManageConfiguration`       |
| Student Management       | `/student/management`                                        | `Students.Records.StudentManagement`                                 |
| Student List             | `/student/profile`                                           | `Students.Records.StudentList`                                       |
| Student I-Card           | `/student/student-i-card`                                    | `Students.Records.StudentICard`                                      |
| Certificates             | `/student/certificates`                                      | `Students.Records.Certificates`                                      |
| Records Reports          | `/student/reports`                                           | `Students.Records.Reports`                                           |
| Records Settings         | `/student/studentRecords/setting`                            | `Students.Records.Settings`                                          |
| Mark Attendance          | `/student/attendance/take-attendance`                        | `Students.Attendance.MarkAttendance`                                 |
| Leave & Absent           | `/student/attendance/leave-absent`                           | `Students.Attendance.LeaveAndAbsent`                                 |
| Attendance Reports       | `/student/attendance/reports`                                | `Students.Attendance.Reports`                                        |
| Attendance Settings      | `/student/attendance/setting`                                | `Students.Attendance.Setting.LeaveType`                              |
| Notification             | `/student/attendance/notification`                           | `Students.Notification`                                              |

## Partial or source-verified routes

These routes or folders exist but should not be treated as active menu navigation without checking source and product status.

| Surface                                          | Status                                             |
| ------------------------------------------------ | -------------------------------------------------- |
| `/student/overview`                              | Page folder exists outside the active Student menu |
| `/student/enrollment/dashboard`                  | Page folder exists outside the active Student menu |
| `/student/enrollment/enroll`                     | Page folder exists outside the active Student menu |
| `/student/enrollment/enrollment-status-tracking` | Page folder exists outside the active Student menu |
| `/student/management/bulk-data-update`           | Page folder exists outside the active Student menu |
| Registration Form Amount and Form Number Series  | Commented in `src/constants/student-menu.ts`       |

## Public admissions routes

These routes are intentionally outside authenticated Student navigation.
They are used by generated or shared admissions CRM links.

| Surface | Route |
| --- | --- |
| Public inquiry form | `/student/admissions/inquiry/{tenantId}/{templateId}` |
| Applicant status | `/student/admissions/status/{tenantId}/{token}` |

## Permission rule

Frontend permission names are gates for navigation and actions.
Backend permission constants remain canonical for security.
Confirm backend permission behavior in [Student backend APIs](../../../Shikshamitra-BE/docs/modules/student/api.md) before changing server authorization.
