---
module: student
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-07-23
owner: frontend-team
audience: humans-and-agents
---

# Find Student frontend clients

TL;DR: Student clients live under `src/redux/student/**`.
Backend endpoint behavior is canonical in [Student backend APIs](../../../Shikshamitra-BE/docs/modules/student/api.md).

## Client map

Use this table to find the first integration file.

| Surface                                                                  | Client source                                                                                                          |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Shared student records, dashboard, lookup, photo, and attendance history | `src/redux/student/index.ts`                                                                                           |
| Admissions CRM from inquiry through activation                          | `src/redux/student/admissions-crm/admissions-crm-api.ts`                                                               |
| Student group and pending assignment                                     | `src/redux/student/student-group/student-group.ts`, `src/redux/student/pending-assignment/pending-assignment-api.ts`   |
| Student records reports                                                  | `src/redux/student/student-report/student-report-api.ts`                                                               |
| Bulk student upload                                                      | `src/redux/student/buik-student/bulk-student-api.ts`                                                                   |
| Roll number and GR number                                                | `src/redux/student/roll-number/roll-number-api.ts`, `src/redux/student/studentGrNumber/student-gr-number-api.ts`       |
| Class or division changes                                                | `src/redux/student/student-change-class/student-change-class-api.ts`                                                   |
| Student attendance                                                       | `src/redux/student/take-attendance/take-attendace-api.ts`                                                              |
| Student leave                                                            | `src/redux/student/student-leave/student-leave-api.ts`                                                                 |
| Attendance settings                                                      | `src/redux/student/attendance-type/attendance-type-api.ts`, `src/redux/student/attendance-rule/attendance-rule-api.ts` |
| Certificates                                                             | `src/redux/student/certificate/certificate.ts`                                                                         |

## Cache and contract rules

Use these expectations when reviewing client behavior.

| Change                   | Rule                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Enrollment mutations     | Refresh the affected CRM workspace, applicant timeline, analytics, and readiness state                              |
| Records mutations        | Refresh student lists, profile data, and assignment projections                                                     |
| Attendance mutations     | Refresh attendance day, dashboard, leave, and report assumptions                                                    |
| Settings mutations       | Keep inactive historical values readable where backend allows them                                                  |
| Admissions CRM mutations | Refresh CRM leads, applicant DOB, branch and preferred-language lead fields, manual priority, registration form status, tasks, timeline, lead-level applicant checklist progress, lead-level conversion and stage-configured SLA analytics, school default cycle settings, cycle readiness, inquiry channel defaults, applicant checklist guidance, rejection reasons, expiry reminder windows, financial policies, dynamic form template fields, scoring, routing and condition-aware journey configuration, public forms, CRM exam records, exam outcome breakdowns, campaign performance, daily trends, automation runs, automation failures, communication providers, opt-out records, delivery logs, and delivery callbacks through `studentAdmissionsCrmType` tags |
| Report changes           | Confirm request and response shape against backend contracts                                                        |

## Contract rule

Do not infer backend behavior from a client helper alone.
Confirm request and response behavior in `../../../Shikshamitra-BE/docs/modules/student/api.md` and backend `Application.Contracts/Students/**`.
