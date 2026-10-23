---
module: hr
domain: reference
content_type: Reference
status: active
updated_on: 2026-10-23
owner: frontend-team
audience: humans-and-agents
---

# HR table coverage

The 23 October pass is based on frontend main `22981b1a3` and the repository UI consistency and frontend patterns skills.
The canonical record table is `src/components/customizabaleTable/index.tsx`.
The intentionally misspelled directory is the established public import.

## Scope and reproducible audit

Run `node scripts/hr/check-ui-consistency.mjs` from the frontend root.
Use `--json` for the complete route-to-source table inventory, props, exception reasons and unreachable demo tables.
The checker follows static and dynamic local imports from every HR App Router page, including legacy routes and hidden panels.
Import closure is an upper bound: a shared workspace may import tables for several conditional tabs or route views.
It does not prove that every imported table renders on every route.

All 61 HR route entries are accounted for below.
The 74 table/adaptor instances include nested adapter implementations; they are not a count of simultaneously rendered tables.
Two raw tables remain as editable configuration controls.
All reachable read-only tables use CustomizableTable, directly or through the established SectionTable, PerformanceDataTable and report adapters.

## Route checklist

Source checked means the entry point, its imports and table ownership were inspected.
Runtime checks and their limits are recorded separately; source coverage is not signed-in browser acceptance.

| Route | Surface | Static ownership |
| --- | --- | --- |
| `/hr/attendance-dashboard` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/attendance-notification` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/attendance-setting/shiftManagement` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/attendance-tracking` | Shared table import closure; 2 table/adaptor instances | Source checked |
| `/hr/biometric-attendance` | Shared table import closure; 2 table/adaptor instances | Source checked |
| `/hr/biometric-integration` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/manual-attendance` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/employee/onboarding` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/employee` | Shared table import closure; 13 table/adaptor instances | Source checked |
| `/hr/i-card` | Shared table import closure; 2 table/adaptor instances | Source checked |
| `/hr/events-holidays` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/events-holidays/request` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/apply-leave` | Redirect; retains existing destination | Source checked |
| `/hr/leave-approvals` | Redirect; retains existing destination | Source checked |
| `/hr/leave-balance` | Redirect; retains existing destination | Source checked |
| `/hr/leave-center` | Shared table import closure; 2 table/adaptor instances | Source checked |
| `/hr/payroll/dashboard` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/payroll` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/payroll/payslip-generation` | Shared table import closure; 3 table/adaptor instances | Source checked |
| `/hr/payroll/run-payroll` | Shared table import closure; 3 table/adaptor instances | Source checked |
| `/hr/payroll/setting/deduction-component` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/payroll/setting/earning-component` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/payroll/setting` | Redirect; retains existing destination | Source checked |
| `/hr/payroll/setting/payroll-documents` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/payroll/setting/pf` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/payroll/setting/professional-tax` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/payroll/setting/salary-templates/[templateId]` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/payroll/setting/salary-templates/new` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/payroll/setting/salary-templates` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/payroll/setting/statutory-schemes` | Shared table import closure; 2 table/adaptor instances | Source checked |
| `/hr/payroll/setting/tds` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/payroll/structure/[employeeId]/edit` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/payroll/structure` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/assignments` | Shared table import closure; 13 table/adaptor instances | Source checked |
| `/hr/attendance` | Shared table import closure; 13 table/adaptor instances | Source checked |
| `/hr/calendars` | Shared table import closure; 13 table/adaptor instances | Source checked |
| `/hr/holiday` | Shared table import closure; 13 table/adaptor instances | Source checked |
| `/hr/leave-policies` | Shared table import closure; 13 table/adaptor instances | Source checked |
| `/hr/payrollPolicies` | Shared table import closure; 13 table/adaptor instances | Source checked |
| `/hr/dashboard` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/hr-notification` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/performance` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |
| `/hr/professional-management/cycles` | Shared table import closure; 16 table/adaptor instances | Source checked |
| `/hr/professional-management/outcomes` | Shared table import closure; 16 table/adaptor instances | Source checked |
| `/hr/professional-management/overview` | Shared table import closure; 16 table/adaptor instances | Source checked |
| `/hr/professional-management` | Shared table import closure; 16 table/adaptor instances | Source checked |
| `/hr/professional-management/reports` | Shared table import closure; 16 table/adaptor instances | Source checked |
| `/hr/professional-management/reviews` | Shared table import closure; 16 table/adaptor instances | Source checked |
| `/hr/professional-management/settings` | Shared table import closure; 16 table/adaptor instances | Source checked |
| `/hr/professional-management/settings/setup` | Shared table import closure; 16 table/adaptor instances | Source checked |
| `/hr/professional-management/setup` | Redirect; retains existing destination | Source checked |
| `/hr/profile` | Shared table import closure; 12 table/adaptor instances | Source checked |
| `/hr/reports/generate/[templateId]` | Shared table import closure; 5 table/adaptor instances | Source checked |
| `/hr/reports/generate` | Shared table import closure; 5 table/adaptor instances | Source checked |
| `/hr/reports` | Shared table import closure; 5 table/adaptor instances | Source checked |
| `/hr/reports/runs/[runId]` | Shared table import closure; 5 table/adaptor instances | Source checked |
| `/hr/reports/templates/[templateId]/edit` | Shared table import closure; 5 table/adaptor instances | Source checked |
| `/hr/reports/templates/new` | Shared table import closure; 5 table/adaptor instances | Source checked |
| `/hr/reports/templates` | Shared table import closure; 5 table/adaptor instances | Source checked |
| `/hr/setting` | Shared table import closure; 1 table/adaptor instances | Source checked |
| `/hr/training` | Dashboard, form, calendar, settings, or partial page; no record table | Source checked |

## Table configuration checklist

The source link identifies the owning component; line numbers describe the audited revision.
Primary tables retain workspace flex and scroll ownership.
Embedded salary, attendance, policy, audit and report previews retain their compact shared variant and bounded height.
Sorting/filtering capabilities remain constrained by the owning endpoint.
Server-paged endpoints without an exposed column-filter or sort contract keep those controls unavailable instead of filtering only a loaded page.
Domain filters and existing search, pagination, export callbacks, selections, action gates and calculations remain owned by their feature.

| Source | Implementation | Table identity | Ownership |
| --- | --- | --- | --- |
| [attendance-notification/index.tsx:32](../../../src/screens/hr/attendance-notification/index.tsx) | CustomizableTable | "hr-attendance-notification" | Shared component |
| [attendance-setting/shift-management.tsx:125](../../../src/screens/hr/attendance-setting/shift-management.tsx) | CustomizableTable | "hr-attendance-shift-management" | Shared component |
| [attendance-tracking/index.tsx:815](../../../src/screens/hr/attendance-tracking/index.tsx) | CustomizableTable | {hr-attendance-register-days-${group.employeeId // group.employeeCode}} | Shared component |
| [attendance-tracking/index.tsx:1621](../../../src/screens/hr/attendance-tracking/index.tsx) | CustomizableTable | "hr-attendance-register" | Shared component |
| [biometricAttendance/index.tsx:909](../../../src/screens/hr/biometricAttendance/index.tsx) | CustomizableTable | "biometric-attendance-history-table" | Shared component |
| [biometricAttendance/index.tsx:1631](../../../src/screens/hr/biometricAttendance/index.tsx) | CustomizableTable | "import-detail-preview-table" | Shared component |
| [biometric-integration/index.tsx:327](../../../src/screens/hr/biometric-integration/index.tsx) | CustomizableTable | "biometric-integration-table" | Shared component |
| [attendance/manual-attendance/index.tsx:1507](../../../src/screens/hr/attendance/manual-attendance/index.tsx) | CustomizableTable | "hr-manual-attendance" | Shared component |
| [employee-onboarding/index.tsx:3197](../../../src/screens/hr/employee-onboarding/index.tsx) | CustomizableTable | "employee-onboarding-table" | Shared component |
| [employee/employee.tsx:612](../../../src/screens/hr/employee/employee.tsx) | CustomizableTable | "employee-table" | Shared component |
| [employee/profileDashboardComponent/EmployeeAttendanceTrendChart.tsx:63](../../../src/screens/hr/employee/profileDashboardComponent/EmployeeAttendanceTrendChart.tsx) | CustomizableTable | "hr-monthly-attendance-data" | Shared component |
| [employee/payroll-summary.tsx:278](../../../src/screens/hr/employee/payroll-summary.tsx) | CustomizableTable | {tableId} | Shared component |
| [employee/employee-form-fields/PayrollFields.tsx:188](../../../src/screens/hr/employee/employee-form-fields/PayrollFields.tsx) | CustomizableTable | {${name}-components-table} | Shared component |
| [policies/components/HRPolicySharedUI.tsx:562](../../../src/screens/hr/policies/components/HRPolicySharedUI.tsx) | CustomizableTable | {tableId // hr-policy-section-${instance}} | Shared component |
| [employee/employee-form-fields/RenderDocuments.tsx:180](../../../src/screens/hr/employee/employee-form-fields/RenderDocuments.tsx) | CustomizableTable | "hr-employee-documents" | Shared component |
| [employee/EmployeeLibrary.tsx:98](../../../src/screens/hr/employee/EmployeeLibrary.tsx) | CustomizableTable | "employee-borrowed-books-table" | Shared component |
| [employee/EmployeeLibrary.tsx:124](../../../src/screens/hr/employee/EmployeeLibrary.tsx) | CustomizableTable | "employee-reserved-books-table" | Shared component |
| [employee/EmployeeLibrary.tsx:149](../../../src/screens/hr/employee/EmployeeLibrary.tsx) | CustomizableTable | "employee-fines-charges-table" | Shared component |
| [employee/EmployeeLibrary.tsx:212](../../../src/screens/hr/employee/EmployeeLibrary.tsx) | CustomizableTable | "employee-issued-books-table" | Shared component |
| [leave-balance/leave-balance.tsx:74](../../../src/screens/hr/leave-balance/leave-balance.tsx) | CustomizableTable | "hr-leave-bucket-ledger" | Shared component |
| [leave-balance/leave-balance.tsx:363](../../../src/screens/hr/leave-balance/leave-balance.tsx) | CustomizableTable | "leave-balance-history" | Shared component |
| [employee/employee-attendance-history.tsx:161](../../../src/screens/hr/employee/employee-attendance-history.tsx) | CustomizableTable | "employee-attendance-history" | Shared component |
| [i-card/index.tsx:567](../../../src/screens/hr/i-card/index.tsx) | CustomizableTable | "employee-icard-table" | Shared component |
| [i-card/index.tsx:1704](../../../src/screens/hr/i-card/index.tsx) | CustomizableTable | "employee-icard-selection-table" | Shared component |
| [events-holidays/index.tsx:163](../../../src/screens/hr/events-holidays/index.tsx) | CustomizableTable | "events-holidays-table" | Shared component |
| [events-holidays/request.tsx:25](../../../src/screens/hr/events-holidays/request.tsx) | CustomizableTable | "event-holiday-request" | Shared component |
| [leave-request/apply-leave.tsx:487](../../../src/screens/hr/leave-request/apply-leave.tsx) | CustomizableTable | "apply-leave-table" | Shared component |
| [leave-request/leave-approvals.tsx:352](../../../src/screens/hr/leave-request/leave-approvals.tsx) | CustomizableTable | "leave-approvals-table" | Shared component |
| [payroll/salarySlip-generate/payslip-correction-dialog.tsx:454](../../../src/screens/hr/payroll/salarySlip-generate/payslip-correction-dialog.tsx) | CustomizableTable | "hr-payslip-correction-comparison" | Shared component |
| [payroll/salarySlip-generate/salary-documents-workspace.tsx:338](../../../src/screens/hr/payroll/salarySlip-generate/salary-documents-workspace.tsx) | HrReportPreviewTable | Forwarded by adapter | Shared adapter |
| [reports/components/HrReportPreviewTable.tsx:89](../../../src/screens/hr/reports/components/HrReportPreviewTable.tsx) | CustomizableTable | "hr-report-preview" | Shared component |
| [payroll/run-payroll/runPayroll.tsx:1319](../../../src/screens/hr/payroll/run-payroll/runPayroll.tsx) | CustomizableTable | "payroll-monthly-workbench-table" | Shared component |
| [payroll/run-payroll/payroll-registration-readiness.tsx:68](../../../src/screens/hr/payroll/run-payroll/payroll-registration-readiness.tsx) | CustomizableTable | "payroll-registration-review" | Shared component |
| [payroll/setting/deduction-component.tsx:258](../../../src/screens/hr/payroll/setting/deduction-component.tsx) | CustomizableTable | "hr-deduction-components" | Shared component |
| [payroll/setting/earning-component.tsx:280](../../../src/screens/hr/payroll/setting/earning-component.tsx) | CustomizableTable | "hr-earning-components" | Shared component |
| [payroll/setting/pf.tsx:195](../../../src/screens/hr/payroll/setting/pf.tsx) | CustomizableTable | "pf-table" | Shared component |
| [payroll/setting/professional-tax.tsx:123](../../../src/screens/hr/payroll/setting/professional-tax.tsx) | CustomizableTable | "professional-table" | Shared component |
| [payroll/setting/salary-templates.tsx:373](../../../src/screens/hr/payroll/setting/salary-templates.tsx) | CustomizableTable | "salary-template-table" | Shared component |
| [payroll/setting/esi-policies.tsx:183](../../../src/screens/hr/payroll/setting/esi-policies.tsx) | CustomizableTable | "esi-policy-table" | Shared component |
| [payroll/setting/esi-statutory-employees.tsx:293](../../../src/screens/hr/payroll/setting/esi-statutory-employees.tsx) | CustomizableTable | "esi-employee-impact" | Shared component |
| [policies/components/PolicyTable.tsx:381](../../../src/screens/hr/policies/components/PolicyTable.tsx) | CustomizableTable | {hr-${type}-policies} | Shared component |
| [policies/components/CalendarsTab.tsx:305](../../../src/screens/hr/policies/components/CalendarsTab.tsx) | CustomizableTable | "hr-work-calendars" | Shared component |
| [policies/components/AssignmentsTab.tsx:582](../../../src/screens/hr/policies/components/AssignmentsTab.tsx) | CustomizableTable | "hr-policy-assignments" | Shared component |
| [policies/components/PolicyAuditDrawer.tsx:156](../../../src/screens/hr/policies/components/PolicyAuditDrawer.tsx) | CustomizableTable | {hr-audit-changes-${event.id // index}} | Shared component |
| [policies/components/PolicyImpactDrawer.tsx:323](../../../src/screens/hr/policies/components/PolicyImpactDrawer.tsx) | SectionTable | Forwarded by adapter | Shared adapter |
| [policies/components/LeavePoliciesPanel.tsx:505](../../../src/screens/hr/policies/components/LeavePoliciesPanel.tsx) | CustomizableTable | "hr-leave-policies-workspace" | Shared component |
| [policies/components/LeaveYearEndSettlementsPanel.tsx:256](../../../src/screens/hr/policies/components/LeaveYearEndSettlementsPanel.tsx) | CustomizableTable | "hr-leave-year-end-items" | Shared component |
| [policies/components/PolicyVersionDrawer.tsx:124](../../../src/screens/hr/policies/components/PolicyVersionDrawer.tsx) | SectionTable | "hr-policy-versions" | Shared adapter |
| [policies/components/PolicyVersionDrawer.tsx:230](../../../src/screens/hr/policies/components/PolicyVersionDrawer.tsx) | SectionTable | Forwarded by adapter | Shared adapter |
| [policies/components/PayrollPolicyDrawer.tsx:403](../../../src/screens/hr/policies/components/PayrollPolicyDrawer.tsx) | Table | Forwarded by adapter | Editable exception |
| [policies/components/CalendarPolicyDrawer.tsx:521](../../../src/screens/hr/policies/components/CalendarPolicyDrawer.tsx) | Table | Forwarded by adapter | Editable exception |
| [policies/components/AssignmentPolicyDrawer.tsx:157](../../../src/screens/hr/policies/components/AssignmentPolicyDrawer.tsx) | SectionTable | Forwarded by adapter | Shared adapter |
| [professional-management/index.tsx:157](../../../src/screens/hr/professional-management/index.tsx) | CustomizableTable | Forwarded by adapter | Shared component |
| [professional-management/index.tsx:852](../../../src/screens/hr/professional-management/index.tsx) | PerformanceDataTable | "performance-sqaaf-evidence-setup" | Shared adapter |
| [professional-management/index.tsx:1214](../../../src/screens/hr/professional-management/index.tsx) | ReviewTable | Forwarded by adapter | Shared adapter |
| [professional-management/index.tsx:1301](../../../src/screens/hr/professional-management/index.tsx) | PerformanceDataTable | "performance-templates" | Shared adapter |
| [professional-management/index.tsx:1858](../../../src/screens/hr/professional-management/index.tsx) | PerformanceDataTable | "performance-cycles" | Shared adapter |
| [professional-management/index.tsx:2109](../../../src/screens/hr/professional-management/index.tsx) | ReviewTable | Forwarded by adapter | Shared adapter |
| [professional-management/index.tsx:2136](../../../src/screens/hr/professional-management/index.tsx) | ReviewTable | Forwarded by adapter | Shared adapter |
| [professional-management/index.tsx:2171](../../../src/screens/hr/professional-management/index.tsx) | ReviewTable | Forwarded by adapter | Shared adapter |
| [professional-management/index.tsx:2224](../../../src/screens/hr/professional-management/index.tsx) | ReviewTable | Forwarded by adapter | Shared adapter |
| [professional-management/index.tsx:2243](../../../src/screens/hr/professional-management/index.tsx) | PerformanceDataTable | "performance-development-plans" | Shared adapter |
| [professional-management/index.tsx:2294](../../../src/screens/hr/professional-management/index.tsx) | ReviewTable | Forwarded by adapter | Shared adapter |
| [professional-management/index.tsx:2350](../../../src/screens/hr/professional-management/index.tsx) | PerformanceDataTable | "performance-report-sqaaf-evidence" | Shared adapter |
| [professional-management/index.tsx:2386](../../../src/screens/hr/professional-management/index.tsx) | PerformanceDataTable | "performance-report-pending-actions" | Shared adapter |
| [professional-management/index.tsx:2575](../../../src/screens/hr/professional-management/index.tsx) | PerformanceDataTable | "performance-report-sqaaf-audit-pack-domains" | Shared adapter |
| [professional-management/index.tsx:2625](../../../src/screens/hr/professional-management/index.tsx) | PerformanceDataTable | "performance-report-sqaaf-audit-pack-missing-evidence" | Shared adapter |
| [professional-management/index.tsx:2691](../../../src/screens/hr/professional-management/index.tsx) | PerformanceDataTable | "performance-reviews" | Shared adapter |
| [reports/workspace/ReportLibrary.tsx:246](../../../src/screens/hr/reports/workspace/ReportLibrary.tsx) | CustomizableTable | {choosing ? 'hr-report-template-chooser' : 'hr-report-template-library'} | Shared component |
| [reports/workspace/ReportDesigner.tsx:379](../../../src/screens/hr/reports/workspace/ReportDesigner.tsx) | ReportResultTable | Forwarded by adapter | Shared adapter |
| [reports/workspace/ReportResultTable.tsx:59](../../../src/screens/hr/reports/workspace/ReportResultTable.tsx) | CustomizableTable | "hr-generated-report" | Shared component |
| [reports/workspace/ReportHistory.tsx:116](../../../src/screens/hr/reports/workspace/ReportHistory.tsx) | CustomizableTable | "hr-generated-report-history" | Shared component |
| [reports/workspace/ReportRunResult.tsx:186](../../../src/screens/hr/reports/workspace/ReportRunResult.tsx) | ReportResultTable | Forwarded by adapter | Shared adapter |
| [setting/index.tsx:228](../../../src/screens/hr/setting/index.tsx) | CustomizableTable | "hr-document-settings" | Shared component |

## Explicit exceptions

- CalendarPolicyDrawer uses an editable holiday grid with inclusion, manual edit and removal controls.
- PayrollPolicyDrawer uses an editable monthly payroll-basis grid, including manual-day inputs and existing validation/calculations.
- Editable salary component grids, unlocked attendance import review and I-card selection retain their configuration controls and existing export restrictions.
- Charts, calendars, forms and official payslip/document previews retain their purpose-specific presentation.
- EmployeeAttendanceTrendChart retains the chart and native details disclosure; its read-only monthly data now uses the embedded shared table.
- SectionTable preserves existing policy comparison cells and selected rows; it disables operations that cannot meaningfully sort/filter rendered React content.
- Native row links, salary-editor prefetch handlers and custom policy/approval menus retain the established ThreeDotsActions primitive where its richer event/link contract is required.
It is the same primitive used internally by AdaptiveThreeDotsActions; contextual labels and action-column metadata are applied without replacing existing callbacks or permission gates.

Unused demo components below contain raw tables but have no HR route import path.
They are not activated or rewritten by this pass.

- `src/screens/hr/attendance-dashboard/components/AttendanceProblemDetection.tsx`.
- `src/screens/hr/dashboard/app-new-invoice.tsx`.
- `src/screens/hr/hr-dashboard/components/HREmployeeDirectory.tsx`.

Legacy attendance-notification, biometric-integration, events-holidays and request routes are included in source coverage.
Their placeholders/integration maturity remain unchanged.
Training, performance and TDS partial routes are accounted for without adding product behavior.
The employee Library tab retains its existing integration and reader scope.
No backend contract, employee record, payroll result, document issuance, security gate or CI setting is changed.

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


## Validation evidence

The source checker verifies route checklist coverage, named record tables and the two editable raw-table exceptions.
Shared table regression tests cover left-aligned headings independently of numeric cells, named refresh progress with retained rows, existing sorting/filtering, pagination, full screen and export scope.
HR regression results, browser viewport/theme coverage, build status and remaining environment blockers must be recorded in the task handoff.
Missing page-header, confirmation and dedicated detail-page reference images remain visually unverified.
The supplied table and adaptive-action images were inspected for hierarchy, spacing and action placement.

## 23 October local validation

Validation used fresh package-lock dependencies: Next 16.3.5, Vitest 4.1.12 and Playwright 1.64.1.
The original checkout dependency directory was left unchanged.

| Check | Status | Actual evidence |
| --- | --- | --- |
| HR route and shared-table ownership | Consistent | `node scripts/hr/check-ui-consistency.mjs`: 61 routes, 74 table/adaptor instances, two approved editable raw grids, five unreachable demo raw tables |
| HR and shared-table regression | Consistent | `vitest run src/components/customizabaleTable src/screens/hr --pool=threads --maxWorkers=3`: 139 files and 958 tests passed |
| Final mobile-layout/navigation regression | Consistent | `vitest run src/screens/hr/policies/HRPolicyWorkspace.navigation.test.tsx src/components/customizabaleTable --pool=threads --maxWorkers=3`: 13 files and 68 tests passed |
| TypeScript and production build | Consistent | `npm run ts` and `NEXT_DIST_DIR=build-hr-consistency npm run build`: exit 0; build skips its own type validation, so the separate type check is required |
| Changed source and new browser test lint | Consistent | Focused ESLint with `--quiet`: exit 0 |
| Complete HR/shared-table lint | Inconsistent, baseline | Three errors in unchanged files: restricted loop in `src/components/customizabaleTable/hooks/table-row-filter.test.ts` line 27; unstable effect dependencies in `src/screens/hr/employee/employeeAcademic/subjectPerformance.tsx` lines 31 and 61 |
| HR docs and whitespace | Consistent | `npm run docs:hr:check` and `git diff --check`: exit 0 |
| Synthetic responsive/state checks | Consistent | Eight Playwright scenarios passed: four representative routes at 390, 768 and 1440 pixels in both themes; calendar error/retry, search clearing, keyboard full screen and return |
| Mobile policy prerequisites | Consistent | Additional light/dark 390-pixel checks passed with all three setup warnings, a visible record and reachable pagination; mobile-only bounded content height and vertical scrolling preserve desktop flex behavior |
| Visual inspection | Consistent for sampled states | 24 synthetic page screenshots; representative light/dark desktop and mobile captures inspected for hierarchy, clipping, sticky actions, wrapping and empty states |
| Authenticated in-app HR smoke | Unverified | Codex in-app browser navigation to `/hr/calendars` reached the normal `/login` gate; no credentials, auth bypass or live HR writes used; the final post-check navigation was denied by Browser Use URL policy on a generated connection-refused error page and was not retried |

Synthetic browser scenarios intercept every API reader and block mutation requests.
They do not prove live backend authorization, real tenant records, financial calculations or document issuance.
Existing financial, permission, selection and workflow regression tests remain part of the 958-test run.
The UI pass changes no permission identifiers, endpoints, payroll calculations, CI or security settings.
The shared header alignment correction applies to every CustomizableTable consumer; body-cell alignment is preserved and the explicit headerAlign option supports specialized controls.
