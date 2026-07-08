---
module: student
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-07-08
owner: frontend-team
audience: humans-and-agents
---

# Find Student frontend clients

TL;DR: Student clients live under `src/redux/student/**`.
Backend endpoint behavior is canonical in [Student backend APIs](../../../Shikshamitra-BE/docs/modules/student/api.md).

## Client map

Use this table to find the first integration file.

| Surface | Client source |
|---|---|
| Shared student records, dashboard, lookup, photo, and attendance history | `src/redux/student/index.ts` |
| Inquiry | `src/redux/student/inquiry/inquiry-api.ts` |
| Follow-up | `src/redux/student/follow-up/follow-up-api.ts` |
| Registration form issue | `src/redux/student/registration-form/registration-form-api.ts` |
| Registration sections | `src/redux/student/registration/registration-api.ts` |
| Admission | `src/redux/student/admission/admission-api.ts` |
| Entrance exam | `src/redux/student/entrance-exam/entrance-exam-api.ts` |
| Enrollment reports | `src/redux/student/student-enrollment-report/student-enrollemt-report.ts` |
| Inquiry Preference | `src/redux/student/inquiry-preference/inquiry-preference-api.ts` |
| Document Type | `src/redux/student/document-type/document-type-api.ts` |
| Entrance Exam Slots | `src/redux/student/entrance-exam-slot/entrance-exam-slot-api.ts` |
| Student group and pending assignment | `src/redux/student/student-group/student-group.ts`, `src/redux/student/pending-assignment/pending-assignment-api.ts` |
| Student records reports | `src/redux/student/student-report/student-report-api.ts` |
| Bulk student upload | `src/redux/student/buik-student/bulk-student-api.ts` |
| Roll number and GR number | `src/redux/student/roll-number/roll-number-api.ts`, `src/redux/student/studentGrNumber/student-gr-number-api.ts` |
| Class or division changes | `src/redux/student/student-change-class/student-change-class-api.ts` |
| Student attendance | `src/redux/student/take-attendance/take-attendace-api.ts` |
| Student leave | `src/redux/student/student-leave/student-leave-api.ts` |
| Attendance settings | `src/redux/student/attendance-type/attendance-type-api.ts`, `src/redux/student/attendance-rule/attendance-rule-api.ts` |
| Certificates | `src/redux/student/certificate/certificate.ts` |

## Cache and contract rules

Use these expectations when reviewing client behavior.

| Change | Rule |
|---|---|
| Enrollment mutations | Refresh the affected inquiry, registration, admission, and dashboard state |
| Records mutations | Refresh student lists, profile data, and assignment projections |
| Attendance mutations | Refresh attendance day, dashboard, leave, and report assumptions |
| Settings mutations | Keep inactive historical values readable where backend allows them |
| Report changes | Confirm request and response shape against backend contracts |

## Contract rule

Do not infer backend behavior from a client helper alone.
Confirm request and response behavior in `../../../Shikshamitra-BE/docs/modules/student/api.md` and backend `Application.Contracts/Students/**`.
