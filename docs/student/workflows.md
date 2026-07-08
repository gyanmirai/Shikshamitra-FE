---
module: student
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-07-08
owner: frontend-team
audience: humans-and-agents
---

# Trace Student frontend workflows

TL;DR: trace Student workflows from the visible menu route to the App Router page, screen folder, client, and backend contract.
Backend workflow rules are canonical in [Student backend workflows](../../../Shikshamitra-BE/docs/modules/student/workflows.md).

## Core workflows

Use this map to find the first screen and client.

| Workflow | Screen entry | Main client |
|---|---|---|
| Dashboard | `/student/dashboard` | `src/redux/student/index.ts` |
| Inquiry | `/student/enrollment/inquiry` | `src/redux/student/inquiry/inquiry-api.ts` |
| Registration form issue | `/student/enrollment/registration-form` | `src/redux/student/registration-form/registration-form-api.ts` |
| Registration | `/student/enrollment/registration` | `src/redux/student/registration/registration-api.ts` |
| Entrance exam | `/student/enrollment/entrance-exam` | `src/redux/student/entrance-exam/entrance-exam-api.ts` |
| Admission | `/student/enrollment/admission` | `src/redux/student/admission/admission-api.ts` |
| Student management | `/student/management` | `src/redux/student/index.ts` and records-specific clients |
| Student list and profile | `/student/profile` | `src/redux/student/index.ts` |
| Certificates | `/student/certificates` | `src/redux/student/certificate/certificate.ts` |
| Student attendance | `/student/attendance/take-attendance` | `src/redux/student/take-attendance/take-attendace-api.ts` |
| Student leave | `/student/attendance/leave-absent` | `src/redux/student/student-leave/student-leave-api.ts` |
| Reports | `/student/enrollment/reports`, `/student/reports`, `/student/attendance/reports` | Report clients under `src/redux/student/**` |
| Settings | Enrollment, records, and attendance setting routes | Setting clients under `src/redux/student/**` |
| Notification | `/student/attendance/notification` | Student notification screens under `src/screens/student/**` |

## Integration rules

Frontend workflows must respect backend data ownership.

| Integration | Rule |
|---|---|
| Inquiry Source label | Product copy may say Inquiry Source while the compatibility route still says Inquiry Preference |
| Enrollment to records | Admission and registration changes must keep academic scope and identity data consistent |
| Records to Finance and reports | Student scope, roll number, GR number, and division changes affect downstream reports |
| Attendance to reporting | Attendance saves must refresh day, dashboard, leave, and report assumptions |
| Documents and photos | Upload flows must preserve backend access and audit rules |

## Partial workflow rule

Do not add a route to docs as active navigation until `src/constants/student-menu.ts` exposes it.
If a page exists but menu access is commented or unclear, mark the workflow as partial.
