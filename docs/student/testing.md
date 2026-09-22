---
module: student
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-09-18
owner: frontend-team
audience: humans-and-agents
---

# Validate Student Enrollment Admissions changes

TL;DR: run the documentation check first, then focused lint, formatting, type, unit, and browser checks for the Enrollment Admissions surface that changed.

## Admission Cycle checks

```bash
npx vitest run src/screens/student/admissions/admission-cycle-model.test.ts
npx eslint "src/screens/student/admissions/admission-cycle*.ts" "src/screens/student/admissions/admission-cycle*.tsx" "src/redux/student/admissions/admission-cycles-api.ts" --quiet
```

The focused rules cover code normalization and lifecycle-specific edit, publish, close, reopen, archive, and unused-Draft delete availability.
Browser acceptance must cover future Academic Year selection, date errors, dirty-close protection, readiness feedback, close dependencies and acknowledgement, reopen extension, archive denial, clone, schedule, window dialogs, server paging, search, filters, history, and View-only/Add/Delete permission combinations.
Verify at 390 × 844, 768 × 1024, and 1440 × 900 with no horizontal overflow and reachable dialog actions.
An older running backend cannot prove these commands until migration `20260915103120_ImplementAdmissionCycleGovernance` is applied and the current Host is restarted.

## Documentation and hygiene

Run from `Shikshamitra-FE`:

```bash
npm run docs:check
git diff --check
```

## Focused frontend checks

```bash
.\node_modules\.bin\eslint.cmd src/screens/student/admissions src/redux/student/admissions
npx prettier --check src/screens/student/admissions src/redux/student/admissions docs/student
npm run ts
```

Run the smallest relevant Vitest or Playwright command when a test exists for the changed screen or client.
For browser validation, use the Codex in-app browser after automated checks when the environment has an authenticated tenant.

## Coverage map

| Change area             | First checks                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cycles or offerings     | `admission-cycles-api.ts`, `admission-offerings-api.ts`, offering model tests, cycles and offerings screens, route/menu review                                                             |
| Workflow builder        | `admission-workflows-api.ts`, list and builder screens, graph utilities, publish, validation, preview, versions, and usage                                                                 |
| Dynamic form builder    | `admission-forms-api.ts`, shared Formik wizard, stage validation, responsive builder panels/tabs, review, draft recovery, preview rules, and runtime validation                            |
| Form builder or preview | `admission-forms-api.ts`, form screen, preview and field visibility checks                                                                                                                 |
| Inquiry CRM             | `admission-inquiries-api.ts`, inquiry screen, duplicate and contacted workflows                                                                                                            |
| Applicant 360           | `admission-applicants-api.ts`, purpose/header states, profile completeness, Inquiry readiness blockers, current/empty application journey, stage timestamps, formatted activity, and notes |
| Application runtime     | `admission-applications-api.ts`, application detail, draft, concurrency, field validation, and submit flow                                                                                 |

## Student Onboarding configuration checks

```powershell
npx vitest run src/redux/student/onboarding/student-onboarding-api.test.ts src/screens/student/onboarding/student-setup/student-onboarding-model.test.ts src/screens/student/onboarding/setting/onboarding-academic-applicability.test.ts src/screens/student/onboarding/setting/onboarding-operational-settings.test.tsx src/screens/student/onboarding/student-setup/student-onboarding-settings.integration.test.ts src/screens/student/onboarding/onboarding-settings-context.test.tsx src/screens/student/onboarding/setting/onboarding-policy-settings.ui.test.tsx src/screens/student/onboarding/student-setup/student-assignment-dialog.ui.test.tsx src/screens/student/onboarding/student-setup/student-setup-drawer.ui.test.tsx
npx eslint src/redux/student/onboarding/student-onboarding-api.ts src/redux/student/onboarding/student-onboarding-types.ts src/screens/student/onboarding/onboarding-settings-model.ts src/screens/student/onboarding/onboarding-settings-context.tsx src/screens/student/onboarding/setting/onboarding-academic-applicability.tsx src/screens/student/onboarding/setting/onboarding-academic-applicability.test.ts src/screens/student/onboarding/setting/onboarding-number-settings.tsx src/screens/student/onboarding/setting/onboarding-operational-settings.tsx src/screens/student/onboarding/setting/onboarding-operational-settings.test.tsx src/screens/student/onboarding/setting/onboarding-policy-settings.tsx src/screens/student/onboarding/setting/onboarding-policy-settings.ui.test.tsx src/screens/student/onboarding/student-setup/index.tsx src/screens/student/onboarding/student-setup/student-onboarding-case-operations.tsx src/screens/student/onboarding/student-setup/student-onboarding-documents.tsx src/screens/student/onboarding/student-setup/student-onboarding-operation-dialog.tsx src/screens/student/onboarding/student-setup/student-assignment-dialog.tsx src/screens/student/onboarding/student-setup/student-setup-drawer.tsx src/screens/student/onboarding/student-setup/student-onboarding-model.ts src/screens/student/onboarding/student-setup/student-onboarding-preview-data.ts src/screens/student/onboarding/student-setup/student-onboarding-settings.integration.test.ts
npm run ts
```

Verify that the Settings menu and landing page expose only Readiness & Access and Numbering & Placement, and that the legacy Operational Policies URL redirects to Readiness & Access. Confirm Readiness & Access uses the common customizable table, has no configuration-scope cards, and allows a school to add a named rule with an admission route and academic applicability. Its Saved defaults drawer must round-trip backend requirements, handoffs, account preparation, SLA, active state, and concurrency stamp. Confirm Readiness rules retain independent All or Selected academic coverage. For GR, Roll, and Division settings, verify the coverage-mode fields are absent and Board, Medium, School Level, Class, and Division are separate required single-select fields with no All option. The Saved GR & seat settings drawer must round-trip seat-reservation duration and create/deactivate backend GR series. Every academic choice must show its qualified path; changing a parent clears invalid child selections; incomplete paths cannot be applied; two equally specific enabled rules cannot overlap; and the policy preview resolves the expected GR, Roll, Division, and Readiness rules. Also verify a GSEB selection filters the Medium options without automatically selecting Gujarati medium, a school level, or a class. Confirm unnecessary static helper text, the Numbering & Placement configuration-scope bar, GR onboarding-profile selector, GR/Roll header Assignment method selectors, and clickable Student Setup summary cards are absent.

The onboarding API contract and model suites cover `Result<T>` unwrapping, server worklist filters and paging parameters, route-owned identifiers, concurrency-safe command bodies, academic-year settings scope, exact lifecycle mapping, blockers, and audit events. The existing configuration suites cover option construction, single-path normalization, applicability specificity and conflicts, Readiness fallback/override resolution, context cloning, settings-drawer behavior, and local bulk-assignment previews. Backend tests remain authoritative for atomic allocation, capacity locking, permission enforcement, activation transactions, audit history, and concurrent administrator changes; frontend tests verify that the UI sends the backend contract without inventing operational state.

The 2026-09-21 focused implementation run passed 13 files and 78 tests across the admission handoff, onboarding API, lifecycle mapper, persisted operational settings, advanced configuration behavior, assignment preview, activation preview, menu and action permissions, and admission-decision workflow. Focused ESLint and repository-wide TypeScript also passed.
The matching backend onboarding run passed 30 focused tests: 10 domain lifecycle tests, 5 application/validator and admission-document handoff tests, and 15 HTTP API contract tests. The HTTP project still reports unrelated nullable-reference and analyzer warnings outside Student Onboarding.
The local in-app browser smoke test reached the application but redirected to `/login`; no authenticated browser session or alternate connected browser was available, so the live settings drawers remain browser-blocked rather than visually confirmed.

The 2026-09-21 Student Onboarding implementation pass reached `/student/onboarding/setup` in the Codex in-app browser but was redirected to the sign-in screen. No authenticated external browser was connected. The live worklist, operational dialog, document upload, and activation confirmation therefore remain browser-blocked; focused contract, model, settings, permission, lint, and TypeScript checks are the recorded evidence for this pass.

## Managed assessment checks

Run the admissions regression suite, including policy and request contracts, stage configuration, outcome routes, scheduling, history, local dialog guards, and legacy compatibility:

```bash
npm run test:admissions
```

This command uses the existing Windows Vite startup helper to bypass local network-drive discovery and limits the runner to two workers.
The assessment editor, route, and dirty-dialog interaction suites use a bounded 15-second per-test allowance for real MUI transitions and keyboard input; they await popup removal and asynchronous validation.

Verify basic Assessment completion stays available for stages without an enabled policy. For an enabled stage, verify result-only and scheduled setup, dirty-close confirmation, readable failed-result routing, booking and result errors, separate reviewer approval, allowed retakes, and advancement only after the backend confirms completion readiness. Check that failed or absent attempts cannot follow the default success route. Run the backend assessment domain, scope, API, mapping, and workflow integration tests for authoritative enforcement.

The new assessment dialogs opt into `CustomDialog.hasUnsavedChanges`; they preserve the parent application's global dirty flag and protect browser refresh. Existing dialog callers retain their previous behavior. Verify both modes when changing this shared component.

For an isolated browser fixture, clearly report that requests were mocked and that browser evidence does not replace backend integration tests. Do not create test bookings in a live tenant to verify UI behavior.

Assessment delivery validation on 2026-09-10: the command above passed 30 files and 156 tests. TypeScript, focused ESLint, the student documentation validator, and diff checks passed. An isolated browser fixture exercised stage setup, session creation, booking, attendance, recorded results, review, retakes, and completion. The main scheduling-to-completion smoke was also performed in the Codex in-app browser. Its final native discard-confirmation check stalled the browser controls; six automated dialog regressions cover local dirty-state preservation, legacy behavior, and the browser-refresh guard. Browser fixtures used simulated API responses and did not write tenant data. See the [backend testing notes](../../../Shikshamitra-BE/docs/modules/student/testing.md) for domain, integration, migration, and pre-existing suite limitations.

## Managed document verification checks

Stage editor coverage is in `workflow-document-editor.test.tsx`, with transition presets in `workflow-document-route.test.tsx`. Policy tests cover existing workflows, future-version protection, preserved metadata, null optional values, unique requirement codes, file limits, and conditional rules. `managed-document-compatibility.test.ts` verifies that managed stages use the checklist while existing stages retain their completion controls.

Browser setup checks should include adding a standard and custom document, invalid conditional input, cancellation with unsaved changes, independent review, a waiver transition, and reopening a published workflow read-only.

Managed document runtime regressions are included in `npm run test:admissions`.
They exercise actual RTK Query requests with network fixtures: multipart boundaries, application concurrency stamps, cache refresh after conflicts, authorized private downloads and URL cleanup, checklist completion gating, replacement reasons, local dirty-dialog recovery, file restrictions, and lazy history without mutation controls.

Also run the retained student-evidence panel regression when changing the document handoff:

```bash
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/student/studentProfile/student-admission-evidence-panel.test.tsx --pool=threads --maxWorkers=2
```

The final document browser smoke should cover file selection and failed-upload recovery, original checks, reviewer decisions and replacement history, an authorized waiver, completion blockers, and the read-only student Documents handoff at the three supported viewports.
A network-fixture test proves frontend behavior; backend tests remain responsible for private storage, authorization, tenant scope, file validation, immutable evidence, and finalization.

Document verification evidence recorded on 2026-09-10: the Admissions document suite, TypeScript, focused ESLint, and the student documentation validator passed. The Codex in-app browser exercised the real components with isolated network fixtures: basic-to-managed configuration, a conditional custom requirement, independent-review and waiver settings, original-only and upload-plus-original acceptance, required replacement and waiver reasons, progress and completion gates, and retained history. Existing live Assessments still displayed its normal setup state. The local database migration was applied and verified; authenticated verification was then awaiting an API restart. The external restart and subsequent live reads are recorded in the 11 September follow-up below.

## Managed eligibility checks

The focused runtime suite uses the real RTK Query and Formik components with network fixtures:

```bash
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/student/admissions/eligibility src/redux/student/admissions/admission-eligibility-api.test.ts src/redux/student/admissions/admission-eligibility-concurrency.test.ts src/screens/student/admissions/application-detail/managed-eligibility-compatibility.test.ts --pool=threads --maxWorkers=2
```

Coverage includes explicit evaluation, expected/actual/source display, completion and permission gates, configured review routing without an implicit admission decision, reason validation, exception review controls, retained values after failure, application-stamp conflicts, lazy history, and permitted rechecks of stale visited stages.
Legacy stages without the opt-in flag retain their existing completion flow.
The first focused runtime run passed six files and 13 tests; focused ESLint passed.
Full integration, backend enforcement, migration, and authenticated browser checks remain separate delivery evidence.

Configuration tests cover basic/managed compatibility, unsupported settings, age limits and cutoff dates, actual published answer selection, exception roles, published read-only views, and dirty-dialog preservation.
Transition tests cover eligibility presets, source changes, and exact preservation of complex or unsupported saved rule JSON.
Run these together with existing Admissions regressions using `npm run test:admissions`.
On 2026-09-10, the consolidated suite passed 61 files and 272 tests; a subsequent numeric-list selection regression passed with its 3-test answer-editor file.
Global TypeScript and focused ESLint passed after correcting test-fixture type errors.
The final Codex browser review used real components with isolated local API fixtures: editing age/answer/assessment/document criteria, required exception reasons, retained input after failure, independent review, explicit continuation, missing-information guidance, stale rechecks, and earlier evaluation history passed.
The result cards were inspected in 390 × 844, 768 × 1024, and 1440 × 900 iframe viewports; the measured document overflow was zero at each width.
These responsive previews used the actual component media queries; they do not establish mobile-device or authenticated backend execution.
The local Eligibility migration was applied and verified after the final backend regression run passed. The API restart blocker recorded on 10 September was resolved by an external restart on 11 September. Authenticated setup and existing-application reads now pass; the current tenant offerings still use legacy workflows, so this does not establish a managed applicant mutation journey. See the [backend testing notes](../../../Shikshamitra-BE/docs/modules/student/testing.md) for authoritative backend and rollout evidence.

In the final browser check, confirm the summary and long rule explanations fit at 390, 768, and 1440 pixels, action dialogs retain reasons after a failed request, and permission-restricted users see only server-permitted actions.
Verify that checking eligibility does not automatically advance the workflow and that the user can inspect the decision history before continuing.

## Managed Review checks

Run `npm run test:admissions` for the combined Admissions, RTK Query and shared-dialog regressions, followed by `npm run ts`. Review coverage lives in `src/screens/student/admissions/review`, the workflow builder's `workflow-review-*` and `review-*` tests, and `src/redux/student/admissions/admission-review-*.test.ts`.

| Surface                  | Required checks                                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Optional setup           | Basic completion preserves legacy behavior; managed settings retain unrelated configuration, reject unsupported versions, and prevent duplicate managed Review stages.               |
| Responsibility           | Role/reviewer search uses the real client; Enter searches without saving the parent form. Changing the role clears an incompatible selection.                                        |
| Prerequisites and routes | Only earlier managed stages are selectable. Removed sources show actionable validation. Decision routes preserve complex conditions.                                                 |
| Review workspace         | Required checklist items and a reason gate submission; incomplete drafts remain available. Submitting a recommendation does not record an admission decision.                        |
| Recovery                 | Draft, assignment, correction and final-decision requests retain input after errors. Reloading current data requires explicit confirmation before discarding unsaved input.          |
| Queue                    | Server pagination and assigned/overdue filters retain the expected page convention, reset on filter changes, and link to the existing application. Permission denial skips the read. |
| Decisions                | Existing Approve/Reject/Waitlist controls follow server capabilities. Stale evidence blocks progression, offer and finalization; historical re-review supports reaffirming approval. |

Perform the final visual smoke in the Codex browser after automated checks. Inspect a 30-item checklist at 390 pixels, including wrapped labels, scrollable content and reachable footer actions. Check Basic/managed setup, source selection, discard, reload recovery, recommendation history and the queue. An isolated fixture harness proves component interactions only; it must not be described as authenticated backend execution.

On 11 September 2026 the combined admissions run passed 77 files / 336 tests. A subsequent assignment-reason correction passed all seven affected tests in three files, and final global TypeScript and focused ESLint passed. Assignment history now opens a blank recommendation with unconfirmed checklist items; saved draft/submitted reviewer content is retained when reopened. The signed-in backend still requires the prepared Review build to be restarted before live Review API verification; the additive local migration is already applied. Backend test and migration evidence belongs in the [backend testing guide](../../../Shikshamitra-BE/docs/modules/student/testing.md).

Final Codex browser checks passed against real components with simulated responses: optional setup and save, assignment conflict/reload/retry, fresh recommendation after assignment, submission followed by the existing approval action, changed-evidence blocking and retained history. Supporting 390×844 and 1280×720 checks confirmed a 30-item checklist scrolls internally with visible header/actions and no horizontal page overflow. Native Codex screenshots confirmed the settled layout before and after focusing the final notes field. The isolated preview uses the actual app global CSS, including SimpleBar; screenshots must be taken after dialog transitions settle.

## Profile handoff and live follow-up — 11 September 2026

The signed-in Codex browser loaded current reviewer roles, published form fields, document settings, workflow lists, and an existing legacy application. Temporary editor changes were discarded; no student, applicant, or configuration records were saved.

Repeated field labels found during that review now include step/section context with a field-code fallback. Four focused files passed 14 tests, including six new choice/selection regressions. The actual published form picker was checked again in the Codex browser; Father, Mother, and Guardian name choices were distinct and stored keys were preserved.

The Student Profile previously requested an absent legacy endpoint and hid the query error, preventing document evidence from mounting. The client now uses the protected record profile and a typed identity boundary. Two focused files passed six tests using the actual RTK Query, profile boundary, and Documents/evidence components. Coverage includes correct Student GUID propagation, lazy document reads, error/retry recovery, and rejecting malformed or mismatched identities. Global TypeScript and focused zero-warning ESLint passed on the final frontend source.

```bash
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/student/studentProfile/student-profile-data-boundary.test.tsx src/screens/student/studentProfile/student-admission-evidence-panel.test.tsx --pool=threads --maxWorkers=2
```

The backend was restarted externally at 08:23 IST and its final profile and scope-guard source checksums were verified. The signed-in Codex browser then displayed the populated student identity and placement, loaded Documents, and showed the expected **No admission evidence is linked to this student** result. Refresh succeeded. The earlier error/Retry state and this successful read were both observed; no student or evidence records were changed. This establishes the live read handoff, not a live upload/finalization/download journey. The existing Academic `bulkUpdateAssessment` endpoint-name collision remains a separate baseline warning. Do not describe reflection metadata or fixture tests as authenticated HTTP execution.

## Dynamic form builder checks

```bash
npx vitest run src/screens/student/admissions/form-dialog/admission-form-template-catalog.test.ts src/screens/student/admissions/form-dialog/registration-form-template.test.ts src/screens/student/admissions/form-dialog/components/form-template-chooser.test.tsx src/screens/student/admissions/form-dialog/form-dialog-model.test.ts src/screens/student/admissions/form-dialog/form-wizard-model.test.ts src/screens/student/admissions/form-dialog/form-step-groups.test.ts src/screens/student/admissions/form-dialog/field-choice-options.test.ts src/screens/student/admissions/form-dialog/field-visibility-rules.test.ts src/screens/student/admissions/form-dialog/form-validation-panel.test.ts src/screens/student/admissions/admission-form-validation.test.ts --pool=threads
npx eslint src/screens/student/admissions/admission-form-dialog.tsx src/screens/student/admissions/form-dialog src/screens/student/admissions/form-list/use-form-list-actions.ts --max-warnings 0
```

Run automated checks first, then perform the final smoke test in the Codex in-app browser when an authenticated tenant is available.
Validate at 390 × 844, 768 × 1024, and 1440 × 900; confirm the footer actions remain reachable and the editor does not create horizontal page overflow.

| Surface            | Browser acceptance checks                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wizard navigation  | **Form details**, **Build form**, and **Review & save** use the shared stepper's single Formik state; **Back** and review edit links retain values, and **Next** never sends a save request.    |
| Stage validation   | Invalid name/code blocks leaving details without validating unfinished fields; invalid section/field schema blocks leaving the builder; final **Save draft** validates the complete draft.      |
| Form details       | **Blank form**, **Admission application**, and **Student registration** are visible quick starts. The complete library supports search, category filtering, preview, and school-form reuse.     |
| Template catalogue | Every system template passes the admission-form schema, reports accurate section and field counts, creates fresh IDs, and avoids duplicate system bindings.                                     |
| Starter choice     | Replacing dirty content requires confirmation, while every selected template remains editable. Reusing a school form creates a new copy without mutating the source.                            |
| Workspace          | Desktop shows the outline, focused section canvas, and field settings; narrow-screen tabs preserve section/field selection and entered values.                                                  |
| Field editing      | Open **Add field** above the full-screen builder, confirm its destination, add a field, and verify the drawer closes with the new field selected for editing.                                   |
| Choice editing     | Add, rename, reorder, delete, and paste choices without entering JSON; reopen the field and verify stable stored values. Confirm incompatible legacy data is warned about rather than replaced. |
| Form structure     | Open **Manage structure**, add blank or ready-made sections, reorder fields and sections, confirm deletion, and verify step membership and selection remain correct.                            |
| Section packs      | Search and add a pack into the selected step; verify new IDs/codes, duplicate custom-code suffixing, and linked student-field deduplication.                                                    |
| Draft protection   | Reject discard and template-replacement confirmations and verify entered values remain; accept replacement and verify the template appears.                                                     |
| Review             | The final stage displays identity, layout, counts, and ordered structure; publishing checks are advisory and do not block a schema-valid draft save.                                            |
| Save recovery      | A failed request retains the editor and values; retry saves the same draft successfully and closes the editor.                                                                                  |

Supporting browser automation does not replace the final in-app browser check; record an unavailable session or tool as a validation limitation.

The 2026-09-18 focused Form Builder run passed 11 files and 62 tests covering the system-template catalogue, school-form cloning, duplicate-safe section packs, registration template, chooser interactions, models, wizard, step grouping, visual choices, visibility rules, validation panel, and admission-form validation; focused ESLint also passed. The signed-in in-app browser verified the three quick starts, template search/category/preview, real tenant school-form loading and unsaved copying, section-pack search/addition, one-group single-page outline, reachable footer actions, and no horizontal page overflow at 390 × 844, 768 × 1024, and 1440 × 900. No draft was saved to the backend, and the existing recovery candidate was not discarded. The repository-wide TypeScript run remains blocked only by the existing `AdmissionCycle.status` fixture type error in `admission-cycle-dialog.test.tsx`. The docs validator reaches pre-existing missing/broken Student and testing-document artifacts outside this Form Builder change. The development console also reports an unrelated Workflow Builder import failure for `workflow-template`; the Form Builder route continued to render and interact normally.

## Workflow builder checks

```bash
npx vitest run src/utils/permissions.test.ts src/screens/student/admissions/workflow-builder-utils.test.ts src/screens/student/admissions/admission-visibility-rules.test.ts src/screens/student/admissions/admission-form-validation.test.ts --pool=threads
npx playwright test e2e/student/admission-workflows.spec.ts --project=chromium --no-deps
npx eslint "src/screens/student/admissions/admission-workflow*.tsx" src/screens/student/admissions/workflow-builder-utils.ts src/redux/student/admissions/admission-workflows-api.ts
```

The workflow Playwright flow covers the empty list, draft creation, stage add/remove/edit,
transition conditions, stale concurrency recovery, validation feedback, publish, and read-only state.

## Backend coordination

When a frontend contract changes, verify the matching backend contracts under `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/Enrollments/Admissions/**` and run the backend focused Admissions tests.

## Managed Inquiry checks

```powershell
npx vitest run src/constants/student-menu.test.ts src/screens/student/admissions/admission-inquiry-model.test.ts src/screens/student/admissions/inquiry-management/admission-inquiry-columns.test.ts src/screens/student/admissions/inquiry-management/admission-inquiry-communication-dialog.test.ts src/screens/student/admissions/inquiry-management/inquiry-communication-templates.test.ts src/redux/student/admissions/admission-inquiries-api.test.ts src/redux/student/admissions/admission-inquiry-policy.test.ts src/redux/student/admissions/admission-inquiry-management-api.test.ts src/screens/student/admissions/workflow-builder/inquiry-stage-prerequisites.test.ts
npx eslint --quiet src/screens/student/admissions/admission-inquiries.tsx src/screens/student/admissions/inquiry-management src/screens/student/admissions/workflow-builder/components/inquiry-*.tsx src/screens/student/admissions/workflow-builder/components/workflow-inquiry-settings.tsx
npm run ts
```

The 2026-09-11 focused run passed 18 model, policy, prerequisite, and RTK Query tests, TypeScript, focused ESLint, and the live Inquiry list render in the Codex browser.

Operational-queue coverage verifies that the list request serializes the work-queue filter and that next-action presentation prioritizes overdue follow-ups, still identifies first-contact work when no SLA deadline is configured, and stops showing qualification work after an outcome is recorded.
Communication coverage verifies the inquiry-scoped POST payload, language-aware template fallback, and channel validation, including the required Email subject and at least one supported family channel. Inquiry API coverage also verifies concurrency-safe edit, timeline, atomic bulk assignment, and filtered CSV contracts. Backend tests separately verify campaign creation and the route/permission contract.
Navigation coverage verifies the flat Admissions menu, the dependency-ordered Settings group, the hidden Review Queue sidebar entry, and the preserved Application Reviews permission entry. It also verifies that Pipeline is guarded by Inquiry View rather than Applications View. Its responsive smoke test should cover both pipeline groups, horizontal lane scrolling, filters, empty/error/loading lanes, Manage and Assign actions, and card readability at 390×844, 768×1024, and 1440×900.
The browser showed real server-paged controls and the management drawer's recoverable error state against the still-running older API build.
Managed lifecycle and API behavior are covered by backend service and contract tests until the new migration and Host are loaded into that external process.

## Managed Form checks

```powershell
npx vitest run src/redux/student/admissions/admission-form-stage-policy.test.ts src/redux/student/admissions/admission-form-stage-api.test.ts
npx eslint --quiet src/redux/student/admissions/admission-form-stage-api.ts src/redux/student/admissions/admission-form-stage-api.test.ts src/redux/student/admissions/admission-form-stage-policy.ts src/screens/student/admissions/form-stage src/screens/student/admissions/workflow-builder/components/form-stage-*.tsx src/screens/student/admissions/workflow-builder/components/workflow-form-settings.tsx
npm run ts
```

Policy tests cover safe defaults, unrelated-key preservation, section requirements, correction-attempt compatibility, and unsupported versions. The RTK Query test proves the nested routes and safe command bodies. Browser validation should inspect the managed editor and its recovery state when the running API predates Form-stage capability metadata.

## Payment validation

Run the Payment policy test, TypeScript, and focused ESLint for `admission-payment-*`, the workflow Payment settings, and the application Payment components. Verify Basic compatibility, unrelated configuration preservation, money/deadline/installment limits, the online-gateway publishing guard, staff method selection, dirty-close protection, responsive action dialogs, balance progress, independent verification, reasoned exceptions, and automatic continuation after a successful mutation. Backend lifecycle and HTTP tests remain authoritative for concurrency, idempotency, permissions, tenant scope, financial state, and workflow completion.

## Managed Offer validation

Run `admission-offer-policy.test.ts` and `admission-offer-api.test.ts`, TypeScript, and focused ESLint for `admission-offer-*`, the Offer editor, and the application Offer card. Verify basic-stage compatibility, unrelated configuration preservation, conditional content and confirmation rules, validity/extension/reissue limits, scoped URLs, safe command bodies, responsive dialogs, permanent history, and server-driven actions. The 2026-09-11 focused run passed all six Offer frontend tests, TypeScript, and focused ESLint.

## Managed Seat validation

Run `admission-seat-policy.test.ts`, `admission-seat-api.test.ts`, and `managed-seat-compatibility.test.ts`, then TypeScript and focused ESLint for the Seat policy, client, editor, application card, and application-detail integration. Verify basic-stage compatibility, unrelated configuration preservation, duration and completion constraints, scoped URLs, concurrency and idempotency inputs, capacity and waitlist rendering, post-advance confirmed allocation visibility, server-driven actions, and automatic continuation.

The 2026-09-11 focused run passed all eight Seat frontend tests and TypeScript. Focused ESLint passed after correcting one test import-order warning. Browser validation is limited to route and console health until the additive Seat migration and current API build are loaded into the externally managed backend process.

## Admission Offering checks

```bash
npx vitest run src/utils/permissions.test.ts src/components/paginated-search-select/paginated-search-select.accessibility.test.tsx src/screens/student/admissions/admission-offering-model.test.ts src/screens/student/admissions/admission-offering-action-impact.test.tsx src/screens/student/admissions/admission-definition-select.test.ts src/screens/student/admissions/admission-filter-navigation.test.tsx
npx playwright test e2e/student/admission-offerings.spec.ts --project=chromium --no-deps
npx eslint src/screens/student/admissions src/redux/student/admissions
npm run ts
```

The focused Playwright flow covers the three standard viewports, serious and critical WCAG A/AA
checks for the list and settled form dialog, keyboard close protection for unsaved values, temporary
validation failure and retry, cascading academic selectors, campus-optional creation, campus-specific
cross-cycle cloning, inherited cycle dates, published workflow and form assignment, duplicate
feedback, and atomic five-standard bulk creation. The campus and cycle variants exercise small and
larger-school configuration shapes; they do not replace authenticated pilot-school validation.

Dynamic choice fields use the approved form data-source metadata/options endpoints.
Static option arrays remain supported; source descriptors are resolved at runtime and are never treated as arbitrary URLs.
In the applicant runtime, **Next** and **Save & Continue** validate the active visible section, while **Submit** validates the complete form.

Permission unit tests must prove that the temporary Admissions bypass applies only in development, is disabled in production, and never grants an unrelated module permission.

The 2026-09-15 focused Offering run passed 23 unit tests, both Playwright scenarios, focused ESLint,
Prettier, and diff checks. The full TypeScript run reaches ten unrelated Admission dialog call sites
that still pass the removed `hasUnsavedChanges` prop instead of `guardUnsavedChanges`; no Offering
error is reported.
