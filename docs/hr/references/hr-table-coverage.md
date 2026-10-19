---
module: hr
domain: reference
content_type: Reference
status: active
updated_on: 2026-10-19
owner: frontend-team
audience: humans-and-agents
---

# HR table coverage

This checklist follows active HR App Router imports, including employee drawers and reporting subroutes.
Minimals and the attendance register define the shared structure in [DESIGN.md](../../../DESIGN.md).
All read-only HR tables use `CustomizableTable`, either directly or through the existing domain adapters.

## Routes and embedded tables

| Route | Table surfaces | Export source | Verification |
|---|---|---|---|
| `/hr/attendance-notification` | `hr-attendance-notification` | Legacy route, unchanged | Excluded from active redesign |
| `/hr/attendance-setting/shiftManagement` | `hr-attendance-shift-management` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/attendance-tracking` | `{`hr-attendance-register-days-${group.employeeId // group.employeeCode}`}`, `hr-attendance-register` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/biometric-attendance` | `biometric-attendance-history-table`, `import-detail-preview-table` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/biometric-integration` | `biometric-integration-table` | Legacy route, unchanged | Excluded from active redesign |
| `/hr/manual-attendance` | `hr-manual-attendance` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/employee/onboarding` | `employee-onboarding-table`, `{`${name}-components-table`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-employee-documents` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/employee` | `employee-table`, `earning-section`, `deduction-section`, `{tableId}`, `{`${name}-components-table`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-employee-documents`, `employee-borrowed-books-table`, `employee-reserved-books-table`, `employee-fines-charges-table`, `employee-issued-books-table`, `hr-leave-bucket-ledger`, `leave-balance-history`, `employee-attendance-history` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/i-card` | `employee-icard-table`, `employee-icard-selection-table` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/events-holidays` | `events-holidays-table` | Legacy route, unchanged | Excluded from active redesign |
| `/hr/events-holidays/request` | `event-holiday-request` | Legacy route, unchanged | Excluded from active redesign |
| `/hr/leave-center` | `hr-leave-bucket-ledger`, `leave-balance-history`, `apply-leave-table`, `leave-approvals-table` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payroll/payslip-generation` | `hr-payslip-correction-comparison`, `HrReportPreviewTable`, `hr-report-preview` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payroll/run-payroll` | `payroll-monthly-workbench-table`, `{tableId // `hr-policy-section-${instance}`}`, `payroll-registration-review` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payroll/setting/deduction-component` | `hr-deduction-components`, `{`${name}-components-table`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-employee-documents` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payroll/setting/earning-component` | `hr-earning-components`, `{`${name}-components-table`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-employee-documents` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payroll/setting/pf` | `pf-table` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payroll/setting/professional-tax` | `professional-table` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payroll/setting/salary-templates/new` | `{`${name}-components-table`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-employee-documents` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payroll/setting/salary-templates` | `salary-template-table` | Complete collections; configuration exceptions below | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payroll/setting/salary-templates/[templateId]` | `{`${name}-components-table`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-employee-documents` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payroll/setting/statutory-schemes` | `esi-employee-impact`, `{`${name}-components-table`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-employee-documents` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/assignments` | `{`hr-${type}-policies`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-work-calendars`, `hr-policy-assignments`, `{`hr-audit-changes-${event.id // index}`}`, `SectionTable`, `hr-leave-policies-workspace`, `hr-leave-year-end-items`, `hr-policy-versions`, `SectionTable`, `SectionTable` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/attendance` | `{`hr-${type}-policies`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-work-calendars`, `hr-policy-assignments`, `{`hr-audit-changes-${event.id // index}`}`, `SectionTable`, `hr-leave-policies-workspace`, `hr-leave-year-end-items`, `hr-policy-versions`, `SectionTable`, `SectionTable` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/calendars` | `{`hr-${type}-policies`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-work-calendars`, `hr-policy-assignments`, `{`hr-audit-changes-${event.id // index}`}`, `SectionTable`, `hr-leave-policies-workspace`, `hr-leave-year-end-items`, `hr-policy-versions`, `SectionTable`, `SectionTable` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/holiday` | `{`hr-${type}-policies`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-work-calendars`, `hr-policy-assignments`, `{`hr-audit-changes-${event.id // index}`}`, `SectionTable`, `hr-leave-policies-workspace`, `hr-leave-year-end-items`, `hr-policy-versions`, `SectionTable`, `SectionTable` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/leave-policies` | `{`hr-${type}-policies`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-work-calendars`, `hr-policy-assignments`, `{`hr-audit-changes-${event.id // index}`}`, `SectionTable`, `hr-leave-policies-workspace`, `hr-leave-year-end-items`, `hr-policy-versions`, `SectionTable`, `SectionTable` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/payrollPolicies` | `{`hr-${type}-policies`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-work-calendars`, `hr-policy-assignments`, `{`hr-audit-changes-${event.id // index}`}`, `SectionTable`, `hr-leave-policies-workspace`, `hr-leave-year-end-items`, `hr-policy-versions`, `SectionTable`, `SectionTable` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/professional-management/cycles` | `CustomizableTable`, `performance-sqaaf-evidence-setup`, `ReviewTable`, `performance-templates`, `performance-cycles`, `performance-development-plans`, `performance-report-sqaaf-evidence`, `performance-report-pending-actions`, `performance-report-sqaaf-audit-pack-domains`, `performance-report-sqaaf-audit-pack-missing-evidence`, `performance-reviews` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/professional-management/outcomes` | `CustomizableTable`, `performance-sqaaf-evidence-setup`, `ReviewTable`, `performance-templates`, `performance-cycles`, `performance-development-plans`, `performance-report-sqaaf-evidence`, `performance-report-pending-actions`, `performance-report-sqaaf-audit-pack-domains`, `performance-report-sqaaf-audit-pack-missing-evidence`, `performance-reviews` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/professional-management/overview` | `CustomizableTable`, `performance-sqaaf-evidence-setup`, `ReviewTable`, `performance-templates`, `performance-cycles`, `performance-development-plans`, `performance-report-sqaaf-evidence`, `performance-report-pending-actions`, `performance-report-sqaaf-audit-pack-domains`, `performance-report-sqaaf-audit-pack-missing-evidence`, `performance-reviews` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/professional-management` | `CustomizableTable`, `performance-sqaaf-evidence-setup`, `ReviewTable`, `performance-templates`, `performance-cycles`, `performance-development-plans`, `performance-report-sqaaf-evidence`, `performance-report-pending-actions`, `performance-report-sqaaf-audit-pack-domains`, `performance-report-sqaaf-audit-pack-missing-evidence`, `performance-reviews` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/professional-management/reports` | `CustomizableTable`, `performance-sqaaf-evidence-setup`, `ReviewTable`, `performance-templates`, `performance-cycles`, `performance-development-plans`, `performance-report-sqaaf-evidence`, `performance-report-pending-actions`, `performance-report-sqaaf-audit-pack-domains`, `performance-report-sqaaf-audit-pack-missing-evidence`, `performance-reviews` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/professional-management/reviews` | `CustomizableTable`, `performance-sqaaf-evidence-setup`, `ReviewTable`, `performance-templates`, `performance-cycles`, `performance-development-plans`, `performance-report-sqaaf-evidence`, `performance-report-pending-actions`, `performance-report-sqaaf-audit-pack-domains`, `performance-report-sqaaf-audit-pack-missing-evidence`, `performance-reviews` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/professional-management/settings` | `CustomizableTable`, `performance-sqaaf-evidence-setup`, `ReviewTable`, `performance-templates`, `performance-cycles`, `performance-development-plans`, `performance-report-sqaaf-evidence`, `performance-report-pending-actions`, `performance-report-sqaaf-audit-pack-domains`, `performance-report-sqaaf-audit-pack-missing-evidence`, `performance-reviews` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/professional-management/settings/setup` | `CustomizableTable`, `performance-sqaaf-evidence-setup`, `ReviewTable`, `performance-templates`, `performance-cycles`, `performance-development-plans`, `performance-report-sqaaf-evidence`, `performance-report-pending-actions`, `performance-report-sqaaf-audit-pack-domains`, `performance-report-sqaaf-audit-pack-missing-evidence`, `performance-reviews` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/profile` | `earning-section`, `deduction-section`, `{tableId}`, `{`${name}-components-table`}`, `{tableId // `hr-policy-section-${instance}`}`, `hr-employee-documents`, `employee-borrowed-books-table`, `employee-reserved-books-table`, `employee-fines-charges-table`, `employee-issued-books-table`, `hr-leave-bucket-ledger`, `leave-balance-history`, `employee-attendance-history` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/reports` | `hr-report-template-library`, `ReportResultTable`, `hr-generated-report`, `hr-generated-report-history`, `ReportResultTable` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |
| `/hr/setting` | `hr-document-settings` | Server captures and complete collections | Static route/import audit; focused component tests; browser matrix in testing guide |

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

## Explicit exceptions and partial surfaces

Editable salary component grids, attendance import review while unlocked, I-card staff selection, calendar holiday editors and payroll basis editors are configuration controls.
They do not offer table export while editing.
Calendar views, charts and official payslip or document previews retain their purpose-specific presentation.
Policy impact, version comparisons, audit changes, leave bucket ledgers, settlement details and saved salary component lists use the compact embedded shared table.
The employee Library tab still uses existing placeholder library endpoints; this work does not introduce a live library integration.
Cross-module access editors, course progress and substitution candidate selectors keep their owning module contracts.
Unused legacy reporting screens are not restored.
The unlinked legacy attendance-notification, biometric-integration and events-holidays routes are unchanged; active device integration and calendar policies use the current menu routes.

## Verification record

The route audit identifies coverage; it does not substitute for signed-in browser evidence.
Run the checks in [testing.md](../testing.md) and record the actual result before release.
Verify complete export counts, hidden/action columns, masking, dates, money, cancellation, error recovery, current-access revocation and seven-day expiry.
Verify keyboard access, both themes and widths of 390, 768 and 1440 pixels.
Inspect newly generated Excel and PDF files after automated checks.

The salary structure route now uses the saved salary summary cards introduced on main.
Its configuration editor remains an editable-grid exception.
