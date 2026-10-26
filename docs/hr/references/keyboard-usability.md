---
module: hr
domain: keyboard-usability
content_type: Reference
status: active
updated_on: 2026-10-25
owner: frontend-team
audience: humans-and-agents
---

# HR keyboard usability coverage

This inventory covers the 61 HR App Router page entries on base `f6043929a` and their owning screen families. It records source review separately from synthetic runtime evidence. It is not authenticated acceptance of every HR workflow.

## Interaction contract

Use native buttons, links, inputs and MUI widget keyboard behavior. Tab/Shift+Tab traverse actionable controls in DOM order; ordinary table cells remain outside the tab order. Arrows select options/radios and move within menus; Enter/Space activate the focused control. Preserve Home/End, selection, clipboard shortcuts and multiline Enter. A dropdown's Escape closes that dropdown first. Dialog Escape uses the same safe close owner as cancellation, restores focus, and never confirms a destructive decision. Busy confirmations block cancellation and action races.

## Changed and passed component cases

| Surface | Change / preserved behavior | Evidence and remaining limit |
| --- | --- | --- |
| `CustomSelect` | Search is a real list subheader rather than a fake option; initial focus enters search; arrows reach enabled options; Tab/Escape can leave; Enter in search cannot submit the parent; helper association and one accessible name; add-option action is a disabled-aware native button | Passed component regressions; desktop synthetic browser form flow. Native MUI option behavior retained. Description-info/chip variants retain existing patterns and need assistive-technology acceptance |
| `PaginatedSearchSelect` | Keyboard highlighting the last loaded option loads the next page; retry controls no longer swallow Escape/Tab | Passed keyboard pagination and existing stale-query/failure/retry hook tests; synthetic local choices only |
| `AdaptiveThreeDotsActions` | Forward MUI's autofocus/tabIndex to actual menu items; expose disabled state to MenuList; keep disabled tooltip wrappers out of arrow navigation | Passed first-disabled, intervening-disabled, arrow selection and focus-return regression; desktop browser found the original focus-prop defect |
| `ThreeDotsActions` | Tab/Shift+Tab dismiss an action menu through the same close owner and restore the trigger, matching native MUI menus | Passed regression and desktop/tablet browser check; the next Tab resumes normal document navigation |
| `TableBody` | Isolate legacy row click/key handlers from nested inputs, links and buttons; ignore held-key/composition row activation | Passed shared row-action tests; cells have no added tab stops. Ordinary rows retain table semantics |
| `ColumnFilterMenu` | Use a form popover rather than a Menu whose Tab handler dismisses form entry; give it a contextual dialog name | Desktop synthetic keyboard check: select Contains, Tab to value, type, Enter Apply; focus returns to filter trigger |
| `ConfirmDialog` | Named title/content, safe initial focus, idle Escape calls safe cancellation; busy locks retained | Passed safe-dismissal/busy component tests. Nested synthetic draft keeps multiline text and returns focus on Keep editing/Escape |
| Formik error focus | Follow rendered invalid-field order; skip disabled/hidden steps; resolve MUI hidden named input to visible combobox; scope to submitting form; run once after failed submission | Passed nested-array, DOM-order, MUI-select and duplicate-field-name regressions. Existing stepper and payroll form tests retained |
| ButtonBase theme | Visible keyboard focus ring shared by buttons, icon buttons, radios, checkboxes, tabs and menu items | Synthetic desktop focus inspection and responsive visual checks; input outlines remain owned by their existing MUI theme |
| Staff directory/profile forms | Real staff-name action, error focus for section saves, labeled/named reporting-manager input, remove PIN key filters that blocked modified editing shortcuts | Source review plus shared tests. No Add Staff photo schema/requiredness/serialization changes |
| Payroll component dialogs | Single native submit path; Select All uses Autocomplete option props and selection path once; decorative checkboxes have no independent tab stop | Passed actual-component keyboard select/deselect/submit regression. No payroll calculation/API changes |
| ESI staff and salary templates | Remove redundant row tab stops/legacy row key handlers; retain real details buttons and template links | Passed existing ESI/template suites. Template links preserve native modified-click navigation |
| Payroll policy | Native named radio group replaces hand-coded pseudo-button choices; native arrows/Space and selected state | Source reviewed; full policy drawer runtime remains unverified |
| Attendance dashboard/import | Native legend/status/summary buttons with names, pressed/expanded and actual disabled states | Source reviewed; import upload/save and real attendance writes deliberately unverified |
| I-card builder | Native preset buttons; keyboard X/Y position fields complement drag, respect locked state and canvas bounds | Source reviewed; card save/export and full designer runtime unverified |
| Policy audit | Named native disclosure button with expanded state; read-only changes table retained | Audit rendering regression uses keyboard Space; pagination remains covered |
| Leave request/report generation | One form-submit owner, native Enter for create/generate, multiline editing retained; validation focus; approval/status decisions keep explicit activation | Source and focused tests; authenticated creation, approvals and report jobs unverified |
| Empty-state actions | Existing HR attendance, holiday, PF and legacy statutory action text is a native button | Source reviewed; no visual toolbar redesign |

## Route inventory

Owners are relative to `src/screens/hr/`. “Shared coverage” means the route's native/MUI/shared interaction patterns were inspected; it does not assert that all data-dependent states passed. All authenticated route workflows remain unverified unless expressly stated above.

| Route | Owning screen / redirect | Source result | Authenticated runtime |
| --- | --- | --- | --- |
| `/hr/attendance-dashboard` | `attendance-dashboard` | Changed + shared coverage | Unverified |
| `/hr/attendance-notification` | `attendance-notification` | Shared coverage | Unverified |
| `/hr/attendance-setting/shiftManagement` | `attendance-setting/shift-management` | Shared coverage | Unverified |
| `/hr/attendance-tracking` | `attendance-tracking` | Shared coverage | Unverified |
| `/hr/biometric-attendance` | `biometricAttendance` | Changed + shared coverage | Unverified |
| `/hr/biometric-integration` | `biometric-integration` | Shared coverage | Unverified |
| `/hr/manual-attendance` | `attendance/manual-attendance` | Shared coverage | Unverified |
| `/hr/employee/onboarding` | `employee-onboarding` | Shared coverage | Unverified |
| `/hr/employee` | `employee/employee` | Changed + shared coverage | Unverified |
| `/hr/i-card` | `i-card` | Changed + shared coverage | Unverified |
| `/hr/events-holidays` | `events-holidays` | Changed + shared coverage | Unverified |
| `/hr/events-holidays/request` | `events-holidays/request` | Shared coverage | Unverified |
| `/hr/apply-leave` | `Redirect /hr/leave-center` | Passed source: redirect retained | Unverified |
| `/hr/leave-approvals` | `Redirect /hr/leave-center?tab=approvals` | Passed source: redirect retained | Unverified |
| `/hr/leave-balance` | `Redirect /hr/leave-center?tab=balance` | Passed source: redirect retained | Unverified |
| `/hr/leave-center` | `leave-request/leave-center` | Changed + shared coverage | Unverified |
| `/hr/payroll/dashboard` | `payroll/dashboard` | Shared coverage | Unverified |
| `/hr/payroll` | `payroll/payroll-home/payroll-home` | Shared coverage | Unverified |
| `/hr/payroll/payslip-generation` | `payroll/payslip-generation` | Shared coverage | Unverified |
| `/hr/payroll/run-payroll` | `payroll/run-payroll/runPayroll` | Shared coverage | Unverified |
| `/hr/payroll/setting/deduction-component` | `payroll/setting/deduction-component` | Shared coverage | Unverified |
| `/hr/payroll/setting/earning-component` | `payroll/setting/earning-component` | Shared coverage | Unverified |
| `/hr/payroll/setting` | `Redirect /hr/payroll/setting/earning-component` | Passed source: redirect retained | Unverified |
| `/hr/payroll/setting/payslip-statement-settings` | `payroll/setting/payslip-statement-settings` | Shared coverage | Unverified |
| `/hr/payroll/setting/pf` | `payroll/setting/pf` | Changed + shared coverage | Unverified |
| `/hr/payroll/setting/professional-tax` | `payroll/setting/professional-tax` | Shared coverage | Unverified |
| `/hr/payroll/setting/salary-templates/[templateId]` | `payroll/setting/salary-template-editor` | Shared coverage | Unverified |
| `/hr/payroll/setting/salary-templates/new` | `payroll/setting/salary-template-editor` | Shared coverage | Unverified |
| `/hr/payroll/setting/salary-templates` | `payroll/setting/salary-templates` | Changed + shared coverage | Unverified |
| `/hr/payroll/setting/statutory-schemes` | `payroll/setting/esi-policies, payroll/setting/esi-statutory-settings` | Changed + shared coverage | Unverified |
| `/hr/payroll/setting/tds` | `payroll/setting/tds` | Shared coverage | Unverified |
| `/hr/payroll/structure/[employeeId]/edit` | `payroll/structure/salary-editor-screen` | Shared coverage | Unverified |
| `/hr/payroll/structure` | `payroll/structure` | Shared coverage | Unverified |
| `/hr/assignments` | `policies/workspaces/AssignmentsWorkspace` | Shared coverage | Unverified |
| `/hr/attendance` | `policies/workspaces/AttendancePoliciesWorkspace` | Shared coverage | Unverified |
| `/hr/calendars` | `policies/workspaces/WorkCalendarPoliciesWorkspace` | Shared coverage | Unverified |
| `/hr/holiday` | `policies/HRPolicyWorkspace` | Shared coverage | Unverified |
| `/hr/leave-policies` | `policies/workspaces/LeavePoliciesWorkspace` | Shared coverage | Unverified |
| `/hr/payrollPolicies` | `policies/workspaces/PayrollPoliciesWorkspace` | Changed + shared coverage | Unverified |
| `/hr/dashboard` | `hr-dashboard` | Shared coverage | Unverified |
| `/hr/hr-notification` | `hrNotification` | Shared coverage | Unverified |
| `/hr/performance` | `Inline text-only placeholder` | Passed source: no interactive content | Unverified |
| `/hr/professional-management/cycles` | `professional-management` | Shared coverage | Unverified |
| `/hr/professional-management/outcomes` | `professional-management` | Shared coverage | Unverified |
| `/hr/professional-management/overview` | `professional-management` | Shared coverage | Unverified |
| `/hr/professional-management` | `professional-management` | Shared coverage | Unverified |
| `/hr/professional-management/reports` | `professional-management` | Shared coverage | Unverified |
| `/hr/professional-management/reviews` | `professional-management` | Shared coverage | Unverified |
| `/hr/professional-management/settings` | `professional-management` | Shared coverage | Unverified |
| `/hr/professional-management/settings/setup` | `professional-management` | Shared coverage | Unverified |
| `/hr/professional-management/setup` | `Redirect /hr/professional-management/settings/setup` | Passed source: redirect retained | Unverified |
| `/hr/profile` | `profile` | Changed + shared coverage | Unverified |
| `/hr/reports/generate/[templateId]` | `reports` | Changed + shared coverage | Unverified |
| `/hr/reports/generate` | `reports` | Changed + shared coverage | Unverified |
| `/hr/reports` | `reports` | Changed + shared coverage | Unverified |
| `/hr/reports/runs/[runId]` | `reports` | Changed + shared coverage | Unverified |
| `/hr/reports/templates/[templateId]/edit` | `reports` | Changed + shared coverage | Unverified |
| `/hr/reports/templates/new` | `reports` | Changed + shared coverage | Unverified |
| `/hr/reports/templates` | `reports` | Changed + shared coverage | Unverified |
| `/hr/setting` | `setting` | Shared coverage | Unverified |
| `/hr/training` | `Inline text-only placeholder` | Passed source: no interactive content | Unverified |

## Validation record

The final source passed 155 tests across 22 focused Vitest suites. These cover shared selects, asynchronous search/races, dialogs, menus, table rows/headers, Formik focus, payroll component entry, salary templates, ESI staff, policy audit/navigation, reporting and leave helpers. They use the repository Windows preload and `--pool=threads --maxWorkers=2`.

| Check | Result |
| --- | --- |
| ESLint for all changed application source and component tests | Passed, zero errors; an ignored generated `next-env.d.ts` warning was excluded from delivery |
| ESLint for synthetic fixture source | Passed after using explicit `window.history` |
| `npm run ts` | Passed separately; the build configuration skips TypeScript error checking |
| `npm run build` | Passed with webpack on final application code |
| `npm run docs:hr:check` | Passed |
| `git diff --check` | Passed |

The local browser fixture runs the real shared components and `useUnsavedNavigation` with local-only records:

```sh
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/hr-keyboard/vite.config.mts
```

Open `http://127.0.0.1:4212/` on the desktop. It is isolated from authentication and backend mutations. Its synthetic save counter must change once per valid native submit. Fixture option retrieval returns local arrays; it does not prove an API contract or authorization.

| Desktop browser check | Evidence |
| --- | --- |
| 1440 x 900, light | Tab/Shift+Tab, Enter and Space; search typing and arrows; nested Escape; multiline newline; failed-submit focus; native single submit; filter type/value/Enter Apply; paging; row-menu focus/arrow skip/Escape/Tab return |
| 390 x 844, light and dark | Readable contained dialog; searchable choice and Escape; field-to-footer traversal; visible Cancel focus; safe default confirmation; Keep editing preserves values/focus; explicit discard; no document overflow |
| 768 x 1024, dark | Contained table; named row menu; initial focus, End/arrow selection skipping disabled action; Tab/Escape return; keyboard option pagination loads a second page |
| Interrupted/repeated flows | Cancel then reopen; Escape from nested dropdown; Keep editing then close again; shared navigation hook intercepts history Back; safe cancellation preserves draft/focus; explicit discard permits traversal and closes local draft |

Screenshots of phone light/dark and tablet dark were captured in the local task artifacts. No staff record was created or modified. Supplied table, form-dialog, confirmation and dropdown references were inspected for anatomy; the synthetic fixture is not a full HR screen image-match claim.

## Remaining acceptance limits

- Authenticated HR route acceptance is pending. No dedicated signed-in test tenant/session was used, no exposed credentials were used, and no real staff, attendance, policy, payroll or report mutation was attempted.
- Route-specific permission/tenant combinations, real loading/error responses, full date/calendar widgets, uploads, rich text, I-card save/export and all data-dependent dialog states remain unverified in the authenticated application. Shared fixes are not a claim that all these workflows passed.
- The synthetic history exercise verifies safe cancellation and explicit discard through the production hook. Repeated browser Back/Forward in the authenticated Next.js router still needs acceptance; a repeated synthetic traversal changed the URL while keeping the draft mounted. It did not lose or save data, but is not evidence of a complete router round trip.
- No screen-reader or real touch/virtual-keyboard run was performed. The responsive evidence is a desktop browser with explicit viewport overrides.
- No backend contract change is required for the implemented fixes. Any server-side authorization, validation or data issue found during the remaining acceptance work belongs to a separate backend task.

## Integration boundaries

The branch was rebased onto latest fetched `origin/main` at `f6043929a` after the separate photo-optionality and payroll-route PRs merged. Those main changes are inherited intact; this PR diff does not modify `employee-form.tsx` or photo schemas/requiredness/payloads. The separate HR table-consistency work is not included.

Shared files requiring integration review with the table task:

- `src/components/customizabaleTable/components/TableBody.tsx` — isolate row activation from nested controls.
- `src/components/customizabaleTable/components/ColumnFilterMenu.tsx` — keyboard form popover, no filter capability changes.
- `src/components/three-dots-actions/index.tsx` and `src/components/adaptive-three-dots-actions/index.tsx` — focus props and menu dismissal.
- `src/components/custom-select/index.tsx`, `src/components/paginated-search-select/paginated-search-select.tsx` — dropdown keyboard behavior.
- `src/components/confirm-dialog/confirm-dialog.tsx`, `src/components/custom-stepper/formik-validation.ts`, `src/hooks/use-formik-error-focus.ts` — safe dismissal and validation focus.
- `src/theme/core/components/button.tsx` — visible keyboard focus only.

No toolbar visual redesign, backend changes, workflow-trigger changes, merge or deployment is included.
