---
module: hr
domain: reference
content_type: Reference
status: active
updated_on: 2026-10-31
owner: frontend-team
audience: humans-and-agents
---

# HR validation and setup recovery

## Audit and decision

HR mutations use the shared RTK Query `api`, but screens mixed nested ABP errors, Problem Details, field dictionaries, generic toasts and console-only catches. `useQueryAndMutation` can announce an error separately from a screen's catch. Salary activation can fail because of salary **or statutory** readiness: `HR:Employee:010201` does not prove salary alone is missing. Forms use Formik, the shared stepper and local state. A common persisted draft store would copy bank, identity and attachment data and require per-form schema/concurrency rules.

| Brainstormed option | Decision |
| --- | --- |
| Same-tab redirects with localStorage drafts | Rejected: sensitive plaintext retention, cleanup and schema migration risk. |
| In-memory draft registry and same-tab restore | Possible later, but every Formik/stepper/local-state form and file input needs an explicit snapshot/restore contract; partial adoption silently loses edits. |
| Keep the source form mounted; open authorized setup in another tab | Chosen: uses existing form state and file inputs, makes no draft copy and avoids redirect/return URL loops across different form implementations. Requires the original tab to stay open. |

## Implementation contract

- `src/redux/hr/hr-recovery-middleware.ts` observes failed `api` mutations initiated under `/hr/`. Pending metadata contains only request ID, endpoint, route and actor/tenant/session scope. It never retains arguments, changes payloads, replays commands or retries requests. Aborted, superseded and different-route/account outcomes are ignored.
- `src/screens/hr/recovery/hr-failure.ts` preserves safe business reasons and field-validation shapes. Verified backend codes provide fallback guidance and fixed setup categories. Unknown failures say the server supplied no specific reason. Raw exception details and diagnostic/credential-like strings are excluded. Network, parsing, timeout and 5xx outcomes are unconfirmed: inspect saved history before retrying.
- `HrRecoveryProvider` reuses `CustomDialog` and `DialogScrollContent`. The summary remains visible until explicitly closed. Keep editing/dismissal, matching mutation success, route/scope changes or unmount clear it; it cannot carry into another record dialog. MUI owns focus containment/restoration; Keep editing receives initial focus. The toast wrapper suppresses duplicate legacy error toasts while this dialog is open and filters diagnostic text in HR.
- `HrSetupLink` uses fixed `hrPaths`, existing ancestor route guards and exact action grants. It adds no permission or server bypass. Links explicitly say new tab and use `noopener noreferrer`. No server-provided URL, form value or return token enters navigation. Missing access asks the user to contact an administrator.
- `HrSetupRefresh` prevents overlapping refresh clicks and reports retryable refresh failures. The owner supplies option-only queries; it never submits the original form or treats opening setup as a successful change.

Salary refreshes templates, PF rules and ESIC policy options and clears its old preview without resetting amount, month, enrollment or customization. Removed templates no longer silently select another template. Existing signature, idempotency and revision checks remain authoritative; option refresh does not advance the expected saved compensation revision.

Leave refreshes the effective policy for current staff/date/year. Missing assignment points to Policy Assignments; unavailable policy buckets point to Leave Policies. A removed selected leave type remains in form state with an error and cannot be submitted; other reason/date/attachment values remain mounted.

Run Payroll also normalizes FAILED preview-job messages and status/result-query failures through the same safe HR contract. The persistent alert and an explicitly requested preview's failure toast show the safe reason. Known codes offer the existing authorized setup action; unknown, forbidden and unconfirmed failures never invent a setup destination. The status API's generic job message falls back to the known business-code explanation when available. Existing context, freshness, request locks and explicit retry behavior are retained; setup links never start a calculation or submit an adjustment.

The staff drawer's registration action and the registration-review table open the selected staff member's payroll step in a new tab. They require the directory ancestors, directory View/Edit access and a PF/ESIC read or manage grant; server scheme and staff-scope checks remain authoritative. The readiness drawer's attendance prerequisite also opens in a new tab with its existing route/View access. These links preserve the mounted payroll screen, selection and unsaved adjustment fields without copying draft values into storage or navigation.

## Lifetime and return behavior

No HR draft is written to localStorage, sessionStorage, IndexedDB, cookies, URLs or a server draft endpoint. Files and form values are not copied to a recovery cache. Existing form state is isolated by tab/record; HR layout remounts on actor/tenant/session-initialization identity changes. Recovery notices clear on route/scope changes. Success/reset, cancel/discard and existing unsaved-navigation guards remain owned by each form.

Return means returning to the original tab. Back/Forward in setup does not navigate the original form. Cancel, successful setup, denied setup, closing setup and repeated setup visits never submit or reset that form. Refresh explicitly, review changed choices/previews and resubmit. Generic failures never get a guessed destination.

**Limits:** this does not recover after reload, crash, tab closure or arbitrary same-tab navigation away. Reloading or closing the original tab can lose unsaved work and attachments; existing browser/form guards still apply. Session expiry can require sign-in and lose edits. No cross-tab authentication synchronization or security setting is added.

## Route and form coverage audit

| Family | Shared coverage / inspected behavior | Tested versus unverified |
| --- | --- | --- |
| Employee directory, onboarding/finalize, staff profile/payroll editors | Shared mutation rejection, safe field/reason summary and activation setup link; existing Formik/stepper/dirty guards retained | Normalizer/middleware contract tested. Authenticated employee/finalize cycle unverified. Finalize salary ordering belongs to concurrent task. |
| Payroll structure/salary editor | Template/PF prerequisite actions, option refresh, removed template selection and preview invalidation; existing idempotency/conflict checks retained | Salary component/editor regressions and shared synthetic fixture. Authenticated compensation save unverified. |
| Apply leave, leave requests/center, approvals | Shared mutation failures; request form adds policy/assignment links and effective policy refresh | Leave utilities and shared recovery controls tested. Authenticated policy detour/leave application unverified. |
| Attendance, imports, shifts, calendars/events | All shared `api` mutation rejections initiated under HR receive durable feedback, including console-only catches | Source audit and shared middleware test. Individual import/file/attendance workflows unverified. |
| HR policies/assignments, statutory/payroll settings | Shared mutation feedback with exact permission gates; owning inline validation and impact/conflict reviews retained | Permission matrix and middleware tests. Individual authenticated configuration lifecycles unverified. |
| Run payroll | Shared mutation failures plus safe FAILED preview-job and status/result-query feedback; authorized new-tab prerequisites retain adjustments | Focused hook/screen/recovery tests cover reasons, diagnostics, permissions and mounted draft values. Authenticated setup and payroll transitions remain unverified. |
| Salary documents, professional management, reports and notifications | Shared mutation failures; unconfirmed results never auto-replayed; existing state-machine guards retained | Shared boundary tests. Domain-specific jobs, row-level errors and full server transitions unverified. |
| Other query failures, HTTP-200 per-row/job errors, direct non-RTK requests and self-service outside `/hr/` | Existing owning-region error handling retained; outside mutation interception | Explicitly unverified; do not claim every possible HR failure is newly covered. |

## Verification and integration

Salary Template preview handles `SalaryTemplateSampleBlocked` inline when its issue evidence identifies missing ESIC wage classification. One concise alert opens the existing ESIC treatment dialog for the selected preview month, subject to Statutory Schemes View; the dialog retains its existing edit permissions and school-wide scope check. Cancelling or saving treatment preserves the mounted salary draft. A treatment save clears the old preview and requires an explicit new server preview before template saving. Later-month classifications do not repair earlier-month previews. Missing access gives an HR-administrator action; unknown or mixed blockers retain global recovery rather than guessing a classification fix. Drafts are never persisted for this recovery.

Regression coverage: `salary-preview-error.test.ts`, `salary-preview-recovery.integration.test.ts`, `salary-template-editor.test.tsx`, `earning-esi-treatment-dialog.test.tsx`, and `e2e/hr/salary-esic-preview-recovery.spec.ts`. Run the browser regression with `npx playwright test --config e2e/hr/salary-components.config.ts salary-esic-preview-recovery.spec.ts`; its APIs and earnings are synthetic and it does not validate live statutory calculations.

See [testing](../testing.md#validation-recovery-checks) for commands and the isolated synthetic fixture. It uses production recovery components and real RTK mutation actions, with no authentication/backend writes. It proves shared behavior, not every authenticated route.

Recorded on 26 October against main `f6043929a`: 34 salary-builder tests passed, including refresh failure/retry preserving amount, month and PF edits without a save. The other focused tests cover recovery, salary editor/return links, leave utilities, unsaved navigation, optional Directory photo and mandatory onboarding photo. The added encoded-search case proves that `%20` versus `+` query serialization cannot hide the current page's error. All 172 focused tests, scoped lint, type checking, HR documentation validation and the isolated production build passed. The build succeeded after retrying outside the filesystem sandbox following an EPERM directory-creation failure. The complete documentation validator still reports 27 pre-existing issues under `docs/testing`; no unrelated documentation restructuring is included.

The desktop Codex in-app browser exercised the real recovery dialog, field summary, new-tab setup, return with retained synthetic note, refresh failure/retry, permission denial without a setup bypass, missing setup grants, unconfirmed request guidance, successful mutation cleanup, and both Keep editing/Discard choices in the existing unsaved guard. Initial focus landed on Keep editing. No real staff data or backend mutation was used. Actual viewport was 1280 x 720: the runtime accepted viewport override calls but retained that size, so mobile/tablet and dark-theme visual checks are **unverified**. Attachment persistence follows the unchanged mounted input; native file selection and full authenticated setup cycles are **unverified**.

Shared integration files: HR layout, Redux store, toast wrapper, `SalaryStructureBuilder.tsx`, `leave-requst.tsx` and this module's docs. No employee-photo, reporting-manager selection, keyboard-shortcut, table or onboarding/finalize-order changes are included. The salary task may embed the builder: retain refresh controls, combine scoped diffs and rerun salary/finalize tests. Keyboard/navigation work must retain dialog focus restoration and permit new-tab links through dirty guards. No backend change is required.
