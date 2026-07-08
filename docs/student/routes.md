---
module: student
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-07-08
owner: frontend-team
audience: humans-and-agents
---

# Find Student frontend routes

TL;DR: Student visible navigation is owned by `src/constants/student-menu.ts`.
Use the menu source before treating a route as active navigation.

## Active menu routes

Use this table for visible Student navigation.

| Menu label | Route | Frontend permission |
|---|---|---|
| Dashboard | `/student/dashboard` | `ShikshaMitra.Module.Students.Dashboard` |
| Inquiry | `/student/enrollment/inquiry` | `Students.Enrollment.Inquiry` |
| Registration Form Issued | `/student/enrollment/registration-form` | `Students.Enrollment.RegistrationFormIssued` |
| Registration | `/student/enrollment/registration` | `Students.Enrollment.RegistrationFormIssued` |
| Entrance Exam | `/student/enrollment/entrance-exam` | `Students.Enrollment.EntranceExam` |
| Admission | `/student/enrollment/admission` | `Students.Enrollment.Admission` |
| Enrollment Reports | `/student/enrollment/reports` | `Students.Enrollment.Reports` |
| Document Types | `/student/enrollment/setting/documentTypes` | `Students.Enrollment.Settings.DocumentTypes` |
| Inquiry Preference | `/student/enrollment/setting/inquiryPrefrence` | `Students.Enrollment.Settings.InquiryPreference` |
| Entrance Exam Slots | `/student/enrollment/setting/entranceExamSlots` | `Students.Enrollment.Settings.EntranceExamSlots` |
| Student Management | `/student/management` | `Students.Records.StudentManagement` |
| Student List | `/student/profile` | `Students.Records.StudentList` |
| Student I-Card | `/student/student-i-card` | `Students.Records.StudentICard` |
| Certificates | `/student/certificates` | `Students.Records.Certificates` |
| Records Reports | `/student/reports` | `Students.Records.Reports` |
| Records Settings | `/student/studentRecords/setting` | `Students.Records.Settings` |
| Mark Attendance | `/student/attendance/take-attendance` | `Students.Attendance.MarkAttendance` |
| Leave & Absent | `/student/attendance/leave-absent` | `Students.Attendance.LeaveAndAbsent` |
| Attendance Reports | `/student/attendance/reports` | `Students.Attendance.Reports` |
| Attendance Settings | `/student/attendance/setting` | `Students.Attendance.Setting.LeaveType` |
| Notification | `/student/attendance/notification` | `ShikshaMitra.Module.Students.Notification` |

## Partial or source-verified routes

These routes or folders exist but should not be treated as active menu navigation without checking source and product status.

| Surface | Status |
|---|---|
| `/student/overview` | Page folder exists outside the active Student menu |
| `/student/enrollment/dashboard` | Page folder exists outside the active Student menu |
| `/student/enrollment/enroll` | Page folder exists outside the active Student menu |
| `/student/enrollment/enrollment-status-tracking` | Page folder exists outside the active Student menu |
| `/student/management/bulk-data-update` | Page folder exists outside the active Student menu |
| Registration Form Amount and Form Number Series | Commented in `src/constants/student-menu.ts` |

## Permission rule

Frontend permission names are gates for navigation and actions.
Backend permission constants remain canonical for security.
Confirm backend permission behavior in [Student backend APIs](../../../Shikshamitra-BE/docs/modules/student/api.md) before changing server authorization.
