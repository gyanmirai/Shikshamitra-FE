---
module: hr
domain: reference
content_type: Reference
status: active
updated_on: 2026-10-26
owner: frontend-team
audience: humans-and-agents
---

# HR route and table coverage

This route/import inventory is paired with the [per-column capability matrix](hr-column-capabilities.md). The earlier 61-route / 74-instance pass did not prove every column could sort/filter and missed visually tabular salary cards. Current source enumeration includes 61 HR entries and 80 table definitions/call sites, including nested tables, adapters, dialogs and conditional permission branches. Import closure is an upper bound, not proof every imported table renders in every route or role.

Run `node scripts/hr/check-ui-consistency.mjs --json` for the reproducible route-to-source closure, props and exception inventory. Run `node scripts/hr/check-column-capabilities.mjs --json` for every resolved data column, schema-parametric wrapper, authorized source and control exception. Runtime checks and their limits are recorded in [HR testing](../testing.md).

## Route checklist

| Route | Reachable table definitions/call sites | Kind |
| --- | --- | --- |
| `/hr/attendance-dashboard` | 0 | page |
| `/hr/attendance-notification` | 1 | page |
| `/hr/attendance-setting/shiftManagement` | 1 | page |
| `/hr/attendance-tracking` | 2 | page |
| `/hr/biometric-attendance` | 2 | page |
| `/hr/biometric-integration` | 1 | page |
| `/hr/manual-attendance` | 1 | page |
| `/hr/employee/onboarding` | 1 | page |
| `/hr/employee` | 15 | page |
| `/hr/i-card` | 2 | page |
| `/hr/events-holidays` | 1 | page |
| `/hr/events-holidays/request` | 1 | page |
| `/hr/apply-leave` | 0 | redirect |
| `/hr/leave-approvals` | 0 | redirect |
| `/hr/leave-balance` | 0 | redirect |
| `/hr/leave-center` | 2 | page |
| `/hr/payroll/dashboard` | 0 | page |
| `/hr/payroll` | 0 | page |
| `/hr/payroll/payslip-generation` | 3 | page |
| `/hr/payroll/run-payroll` | 7 | page |
| `/hr/payroll/setting/deduction-component` | 1 | page |
| `/hr/payroll/setting/earning-component` | 1 | page |
| `/hr/payroll/setting` | 0 | redirect |
| `/hr/payroll/setting/payslip-statement-settings` | 0 | page |
| `/hr/payroll/setting/pf` | 1 | page |
| `/hr/payroll/setting/professional-tax` | 1 | page |
| `/hr/payroll/setting/salary-templates/[templateId]` | 0 | page |
| `/hr/payroll/setting/salary-templates/new` | 0 | page |
| `/hr/payroll/setting/salary-templates` | 1 | page |
| `/hr/payroll/setting/statutory-schemes` | 2 | page |
| `/hr/payroll/setting/tds` | 0 | page |
| `/hr/payroll/structure/[employeeId]/edit` | 0 | page |
| `/hr/payroll/structure` | 0 | page |
| `/hr/assignments` | 13 | page |
| `/hr/attendance` | 13 | page |
| `/hr/calendars` | 13 | page |
| `/hr/holiday` | 13 | page |
| `/hr/leave-policies` | 13 | page |
| `/hr/payrollPolicies` | 13 | page |
| `/hr/dashboard` | 0 | page |
| `/hr/hr-notification` | 0 | page |
| `/hr/performance` | 0 | page |
| `/hr/professional-management/cycles` | 16 | page |
| `/hr/professional-management/outcomes` | 16 | page |
| `/hr/professional-management/overview` | 16 | page |
| `/hr/professional-management` | 16 | page |
| `/hr/professional-management/reports` | 16 | page |
| `/hr/professional-management/reviews` | 16 | page |
| `/hr/professional-management/settings` | 16 | page |
| `/hr/professional-management/settings/setup` | 16 | page |
| `/hr/professional-management/setup` | 0 | redirect |
| `/hr/profile` | 14 | page |
| `/hr/reports/generate/[templateId]` | 5 | page |
| `/hr/reports/generate` | 5 | page |
| `/hr/reports` | 5 | page |
| `/hr/reports/runs/[runId]` | 5 | page |
| `/hr/reports/templates/[templateId]/edit` | 5 | page |
| `/hr/reports/templates/new` | 5 | page |
| `/hr/reports/templates` | 5 | page |
| `/hr/setting` | 1 | page |
| `/hr/training` | 0 | page |

## Data and editing rules

- The shared record table is `src/components/customizabaleTable/index.tsx`; its established import spelling is retained. Primary tables fill their workspace, while embedded task/history/comparison tables retain a bounded region. Header sort icons are visible before selection and do not require hover.
- Server-paged data uses full authorized criteria before pagination and matching counts/export. The original owning reader remains the unfiltered fast path. Actions, selection and navigation controls are excluded from sorting/filtering/export. Hidden sensitive fields cannot be selected through the query allowlist or added to exports.
- Local tables operate on their complete authorized returned collection. Report designer controls explicitly refine a first-50-row preview sample; preview export applies criteria to all captured output. Captured result tables provide full-result server criteria and pagination.
- Attendance import/manual editing guards and Register adjustment/save guards preserve row/draft context. I-card selected IDs and selected-row cache survive criteria/page changes; the table does not gain unrestricted export.
- Salary totals retain the complete payroll component meaning while the embedded table can filter its rows; filtering never recomputes an official salary.
- Permission, actor/tenant boundaries, manager identity, keyboard focus, salary atomic finalization and recovery workflows remain owned by their existing contracts. No grants, migrations, real staff mutations, merge or deployment are part of this follow-up.

## Specialized exceptions

| Surface | Reason and retained behavior |
| --- | --- |
| CalendarPolicyDrawer holiday grid | Editable inclusion/manual edit/removal draft, stable original indices and holiday-specific scope controls. |
| PayrollPolicyDrawer month grid | Chronological twelve-month basis calculation, manual-day editing and validation. |
| Editable salary components / I-card staff selection | Shared per-column controls remain; existing configuration/selected-card export restrictions remain. |
| Charts, calendars and official documents | Purpose-specific presentation remains; read-only chart data disclosures use typed shared tables. |

The two raw editing grids are enumerated column-by-column in the capability matrix. They are not silently counted as ordinary sortable record tables. Unreachable demo raw-table owners are: `src/screens/hr/attendance-dashboard/components/AttendanceProblemDetection.tsx`, `src/screens/hr/dashboard/app-new-invoice.tsx`, `src/screens/hr/hr-dashboard/components/HREmployeeDirectory.tsx`. They are not activated. Legacy routes remain explicitly labelled where their data is demonstration-only.

## Export ownership and access

| Surface | Source | Access |
|---|---|---|
| Staff directory and onboarding | `employee-table`, `employee-onboarding-table` | Owning staff or onboarding view permission and current staff scope |
| Attendance register and manual day | `hr-attendance-register`, `hr-manual-attendance` | Owning attendance view permission, calendar and staff scope |
| Import history and locked import detail | `hr-attendance-imports`, `hr-attendance-import-rows` | Biometric or manual-attendance view permission; detail rows restricted to current staff scope |
| Leave lists, approvals and employee history | `hr-leave-requests`, `hr-self-leave-history` | HR actor rules or strict own-employee identity and current scope |
| Payroll, statutory readiness and ESI | `payroll-monthly-workbench-table`, `hr-payroll-registration-readiness`, `esi-employee-impact` | Exact owning view permission and payroll scope |
| Salary documents | `hr-salary-documents` | Existing salary reader permissions, saved payroll evidence and current scope |
| Policies, assignments and versions | `hr-policy-*` | Existing policy view permission and source rules |
| Performance cycle and template libraries | `hr-performance-cycles`, `hr-performance-templates` | Existing performance view permission |
| Staff document checklist and card templates | `hr-employee-documents`, `hr-icard-templates` | Existing staff access or card-template permission |
| Shifts, PF, PT, components and document settings | Allowlisted settings source | Exact owning settings view permission |
| Generated history and captured result | `hr-generated-report-history`, `hr-generated-report` | Creator ownership, Reports View, source permission and current captured scope |
| Unsaved designer preview | Build-only capture, then `hr-generated-report` | Build plus dataset permission and scope; no template mutation |
| Other complete collections | Direct shared Excel/PDF writer | Rows already returned by the owning authorized reader; active local search/filter/sort and visible data columns |

I-card staff selection uses `employee-icard-selection-table` with the same existing employee search reader/view permission and a narrow fullName/designation/readiness allowlist. Its table export remains disabled; selected-card export retains the owning document workflow.

## Acceptance limits

Static route/table/column coverage is separate from functional tests and browser acceptance. The current matrix documents the import-status projection subset blocked by automatic approval review; do not describe it as completed. Exact final test, lint, type, build and browser results must accompany the PR heads. Main-only CI policy is unchanged; absent feature-branch runs do not mean CI passed. Authenticated tenant runtime/deployment identity is not established by synthetic browser tests or by the screenshot alone.
