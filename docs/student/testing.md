---
module: student
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-09-11
owner: frontend-team
audience: humans-and-agents
---

# Validate Student Enrollment Admissions changes

TL;DR: run the documentation check first, then focused lint, formatting, type, unit, and browser checks for the Enrollment Admissions surface that changed.

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

| Change area             | First checks                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Cycles or offerings     | `admission-cycles-api.ts`, `admission-offerings-api.ts`, offering model tests, cycles and offerings screens, route/menu review |
| Workflow builder        | `admission-workflows-api.ts`, list and builder screens, graph utilities, publish, validation, preview, versions, and usage     |
| Dynamic form builder    | `admission-forms-api.ts`, shared Formik wizard, stage validation, responsive builder panels/tabs, review, draft recovery, preview rules, and runtime validation |
| Form builder or preview | `admission-forms-api.ts`, form screen, preview and field visibility checks                                                     |
| Inquiry CRM             | `admission-inquiries-api.ts`, inquiry screen, duplicate and contacted workflows                                                |
| Applicant 360           | `admission-applicants-api.ts`, Applicant 360 screen, notes and activity states                                                 |
| Application runtime     | `admission-applications-api.ts`, application detail, draft, concurrency, field validation, and submit flow                     |

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

`src/screens/student/onboarding/onboarding-documents.test.tsx` covers multipart case uploads, checklist and readiness invalidation, accepted admission evidence, read-only access, and retaining the selected file after a failed request. `npm run test:admissions` includes these onboarding checks.

Managed document runtime regressions are included in `npm run test:admissions`.
They exercise actual RTK Query requests with network fixtures: multipart boundaries, application concurrency stamps, cache refresh after conflicts, authorized private downloads and URL cleanup, checklist completion gating, replacement reasons, local dirty-dialog recovery, file restrictions, and lazy history without mutation controls.

Also run the retained student-evidence panel regression when changing the document handoff:

```bash
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/student/studentProfile/student-admission-evidence-panel.test.tsx --pool=threads --maxWorkers=2
```

The final document browser smoke should cover file selection and failed-upload recovery, original checks, reviewer decisions and replacement history, an authorized waiver, completion blockers, and the read-only student Documents handoff at the three supported viewports.
A network-fixture test proves frontend behavior; backend tests remain responsible for private storage, authorization, tenant scope, file validation, immutable evidence, and finalization.

Document verification evidence recorded on 2026-09-10: the consolidated admissions/onboarding run passed 48 files and 214 tests. One subsequently added custom conditional original-document creation regression also passed with the requirement-editor file (3 tests). TypeScript, focused ESLint, and the student documentation validator passed. The Codex in-app browser exercised the real components with isolated network fixtures: basic-to-managed configuration, a conditional custom requirement, independent-review and waiver settings, original-only and upload-plus-original acceptance, required replacement/waiver reasons, progress and completion gates, retained history, and onboarding upload limits. Actual multipart uploads and failed-upload recovery were covered by automated network-fixture tests; they were not manually uploaded in that browser run. Existing live Assessments still displayed its normal setup state. The local database migration was applied and verified; authenticated verification was then awaiting an API restart. The external restart and subsequent live reads are recorded in the 11 September follow-up below.

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
Run these together with existing admission and onboarding regressions using `npm run test:admissions`.
On 2026-09-10, the consolidated suite passed 61 files and 272 tests; a subsequent numeric-list selection regression passed with its 3-test answer-editor file.
Global TypeScript and focused ESLint passed after correcting test-fixture type errors.
The final Codex browser review used real components with isolated local API fixtures: editing age/answer/assessment/document criteria, required exception reasons, retained input after failure, independent review, explicit continuation, missing-information guidance, stale rechecks, and earlier evaluation history passed.
The result cards were inspected in 390 × 844, 768 × 1024, and 1440 × 900 iframe viewports; the measured document overflow was zero at each width.
These responsive previews used the actual component media queries; they do not establish mobile-device or authenticated backend execution.
The local Eligibility migration was applied and verified after the final backend regression run passed. The API restart blocker recorded on 10 September was resolved by an external restart on 11 September. Authenticated setup and existing-application reads now pass; the current tenant offerings still use legacy workflows, so this does not establish a managed applicant mutation journey. See the [backend testing notes](../../../Shikshamitra-BE/docs/modules/student/testing.md) for authoritative backend and rollout evidence.

In the final browser check, confirm the summary and long rule explanations fit at 390, 768, and 1440 pixels, action dialogs retain reasons after a failed request, and permission-restricted users see only server-permitted actions.
Verify that checking eligibility does not automatically advance the workflow and that the user can inspect the decision history before continuing.

## Managed Review checks

Run `npm run test:admissions` for the combined admissions, onboarding, RTK Query and shared-dialog regressions, followed by `npm run ts`. Review coverage lives in `src/screens/student/admissions/review`, the workflow builder's `workflow-review-*` and `review-*` tests, and `src/redux/student/admissions/admission-review-*.test.ts`.

| Surface | Required checks |
| --- | --- |
| Optional setup | Basic completion preserves legacy behavior; managed settings retain unrelated configuration, reject unsupported versions, and prevent duplicate managed Review stages. |
| Responsibility | Role/reviewer search uses the real client; Enter searches without saving the parent form. Changing the role clears an incompatible selection. |
| Prerequisites and routes | Only earlier managed stages are selectable. Removed sources show actionable validation. Decision routes preserve complex conditions. |
| Review workspace | Required checklist items and a reason gate submission; incomplete drafts remain available. Submitting a recommendation does not record an admission decision. |
| Recovery | Draft, assignment, correction and final-decision requests retain input after errors. Reloading current data requires explicit confirmation before discarding unsaved input. |
| Queue | Server pagination and assigned/overdue filters retain the expected page convention, reset on filter changes, and link to the existing application. Permission denial skips the read. |
| Decisions | Existing Approve/Reject/Waitlist controls follow server capabilities. Stale evidence blocks progression, offer and finalization; historical re-review supports reaffirming approval. |

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
npx vitest run src/screens/student/admissions/form-dialog/form-dialog-model.test.ts src/screens/student/admissions/form-dialog/form-wizard-model.test.ts src/screens/student/admissions/form-dialog/form-step-groups.test.ts src/screens/student/admissions/form-dialog/form-validation-panel.test.ts src/screens/student/admissions/admission-form-validation.test.ts --pool=threads
npx eslint src/screens/student/admissions/admission-form-dialog.tsx src/screens/student/admissions/form-dialog src/screens/student/admissions/form-list/use-form-list-actions.ts --max-warnings 0
```

Run automated checks first, then perform the final smoke test in the Codex in-app browser when an authenticated tenant is available.
Validate at 390 × 844, 768 × 1024, and 1440 × 900; confirm the footer actions remain reachable and the editor does not create horizontal page overflow.

| Surface | Browser acceptance checks |
| --- | --- |
| Wizard navigation | **Form details**, **Build form**, and **Review & save** use the shared stepper's single Formik state; **Back** and review edit links retain values, and **Next** never sends a save request. |
| Stage validation | Invalid name/code blocks leaving details without validating unfinished fields; invalid section/field schema blocks leaving the builder; final **Save draft** validates the complete draft. |
| Form details | The registration template is available for new forms in the first stage; moving forward retains identity, layout, description, and template content. |
| Workspace | The second stage provides all builder controls; desktop shows three panels and narrow-screen tabs preserve field selection and entered values. |
| Field editing | Add a field to the displayed section, edit its label and required state, and reopen optional settings without losing defaults, data connections, or rules. |
| Form structure | Reorder fields and sections, confirm deletion, and verify step membership and the selected field remain correct. |
| Draft protection | Reject discard and template-replacement confirmations and verify entered values remain; accept replacement and verify the template appears. |
| Review | The final stage displays identity, layout, counts, and ordered structure; publishing checks are advisory and do not block a schema-valid draft save. |
| Save recovery | A failed request retains the editor and values; retry saves the same draft successfully and closes the editor. |

Supporting browser automation does not replace the final in-app browser check; record an unavailable session or tool as a validation limitation.

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
npx vitest run src/screens/student/admissions/admission-inquiry-model.test.ts src/redux/student/admissions/admission-inquiry-policy.test.ts src/redux/student/admissions/admission-inquiry-management-api.test.ts src/screens/student/admissions/workflow-builder/inquiry-stage-prerequisites.test.ts
npx eslint --quiet src/screens/student/admissions/admission-inquiries.tsx src/screens/student/admissions/inquiry-management src/screens/student/admissions/workflow-builder/components/inquiry-*.tsx src/screens/student/admissions/workflow-builder/components/workflow-inquiry-settings.tsx
npm run ts
```

The 2026-09-11 focused run passed 18 model, policy, prerequisite, and RTK Query tests, TypeScript, focused ESLint, and the live Inquiry list render in the Codex browser.
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
npx vitest run src/utils/dateConvertor.test.ts src/screens/student/admissions/admission-offering-model.test.ts --pool=threads
npx playwright test e2e/student/admission-offerings.spec.ts --project=chromium --no-deps
npx eslint src/screens/student/admissions src/redux/student/admissions
npm run ts
```

The focused Playwright flow covers cascading academic selectors, inherited cycle dates, published workflow and form assignment, activation, the create payload, and duplicate-offering feedback.

Dynamic choice fields use the approved form data-source metadata/options endpoints.
Static option arrays remain supported; source descriptors are resolved at runtime and are never treated as arbitrary URLs.
In the applicant runtime, **Next** and **Save & Continue** validate the active visible section, while **Submit** validates the complete form.

Permission unit tests must prove that the temporary Admissions bypass applies only in development, is disabled in production, and never grants an unrelated module permission.

The latest `npm run ts` run on 2026-09-10 passed; compare any later failure paths before attributing them to an Admission Offering change.
