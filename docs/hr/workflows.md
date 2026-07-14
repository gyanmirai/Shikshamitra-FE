---
module: hr
domain: workflows
content_type: Reference
status: canonical
updated_on: 2026-07-06
owner: frontend-team
audience: humans-and-agents
---

# Trace HR frontend workflows

TL;DR: use this page to connect HR screens, clients, and browser tests.
Backend workflow rules are canonical in `../../../Shikshamitra-BE/docs/modules/hr/workflows.md`.

## Core workflows

Use this map to find the first screen and client:

| Workflow | Screen entry | Main client |
|---|---|---|
| Employee onboarding | `/hr/employee` | `employeeApi.ts` |
| Employee profile update | Employee list and profile tabs | `employeeApi.ts` |
| Employee documents | Employee profile documents tab | `employeeApi.ts` |
| I-card generation | `/hr/i-card` | `employee-icard-template-api.ts` |
| Payroll component setup | `/hr/payroll/setting/*` | `employee-payroll-api.ts` |
| Salary structure | `/hr/payroll/structure` | `employee-salary-structure-api.ts` |
| Payroll run | `/hr/payroll/run-payroll` | `runPayrollApi.ts` |
| Payslips | `/hr/payroll/payslip-generation` | `runPayrollApi.ts` |
| Manual attendance | `/hr/manual-attendance` | `attendanceApi.ts` |
| Attendance tracking | `/hr/attendance-tracking` | `attendanceApi.ts` |
| Attendance import | Device or file import screens | `attendanceApi.ts`, `attendanceImportApi.ts` |
| Leave policy setup | `/hr/leave-policies` | `leaveApi.ts` |
| Leave request and approval | `/hr/apply-leave`, `/hr/leave-approvals`, `/hr/leave-center` | `leaveApi.ts` |
| Policy management | `/hr/calendars`, `/hr/payrollPolicies`, `/hr/attendance`, `/hr/assignments` | `hr-policy-api.ts` |
| Professional management | `/hr/professional-management/**` | `professional-management-api.ts` |
| HR reports | `/hr/reports` | `hrReportsApi.ts` |

## Integration rules

Frontend workflows must respect backend data ownership:

| Integration | Rule |
|---|---|
| Attendance to payroll | Attendance mutations must refresh payroll preview assumptions |
| Leave to payroll | Paid and unpaid leave state must be visible in payroll impact paths |
| Policy to attendance and payroll | Effective policy preview must explain the source policy and date |
| Payroll lock to payslip | Locked payroll snapshot is the source for slip totals |
| Employee status to module behavior | Inactive, left, and retired employees must not behave as active candidates without explicit backend support |
| Calendar to HR | Event and holiday audience selection may involve Calendar module ownership |

## Partial workflow rule

Do not add a route to docs as active navigation until `src/constants/hr-menus.ts` exposes it.
If a page exists but menu access is commented or unclear, mark the workflow as partial.
