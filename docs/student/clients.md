---
module: student
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-07-28
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
| Admissions Pipeline, Admission Year Setup, Applicant Stepper, exam, registration, communication, placement, and activation | `src/redux/student/admissions-crm/admissions-crm-api.ts` |
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
| Admission Year Setup mutation | Refresh setup, Pipeline options, applicant steppers, registration eligibility, exam eligibility, and activation previews |
| Applicant Stepper projection | Refresh applicant workspace, My Work, Pipeline row state, and parent status where applicable |
| Pipeline lead mutation | Refresh Pipeline, My Work, applicant workspace, tasks, timeline, Admission Reports, and owner state |
| Owner or follow-up mutation | Refresh My Work and applicant timeline |
| Exam scheduling or result mutation | Refresh Pipeline, Entrance Exams, applicant workspace, registration eligibility, and Admission Reports |
| Registration mutation | Refresh Registration, applicant workspace, document checklist, activation preview, and My Work |
| Finance handoff status | Refresh applicant workspace, activation preview, and operational counts |
| Placement mutation | Refresh placement options, capacity signals, activation preview, and Class Placement views |
| Activation mutation | Refresh activation workspace, applicant state, records handoff visibility, and My Work |
| Communication mutation | Refresh Follow-ups & Messages, delivery logs, applicant timeline, opt-out state, reminder state, and message action state |
| Admission Reports query | Send applicant-creation dates and optional target standard, then render the server-grouped lifecycle, source, standard, or outcome view |
| Provider settings mutation | Strip read-only stored-value flags and send blank existing credential values to preserve secrets without returning them to the browser |
| Records mutation | Refresh student lists, profile data, and assignment projections |
| Attendance mutation | Refresh attendance day, dashboard, leave, and report assumptions |
| Settings mutation | Keep inactive historical values readable where backend allows them |

## Contract rule

Do not infer backend behavior from a client helper alone.
Confirm request and response behavior in `../../../Shikshamitra-BE/docs/modules/student/api.md` and backend `Application.Contracts/Students/**`.
Provider header values, parameter values, and callback secrets must never be placed back into frontend state after storage.
The stored-value flags indicate only that a protected value exists.
