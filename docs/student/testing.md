---
module: student
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-11
owner: frontend-team
audience: humans-and-agents
---

# Validate Student Enrollment Admissions changes

TL;DR: run the documentation check first, then focused lint, formatting, type, unit, and browser checks for the Enrollment Admissions surface that changed.

## Admission offering cycle-date inheritance (2026-10-11)

Offering create, clone and bulk forms no longer expose Admission window or custom open/close controls. Focused regressions verify that preview/create/update/bulk serializers send `useCycleDates: true` with null override dates even when legacy or stale form values contain custom dates. Edit preserves hidden code, Campus, routing and active state while switching to cycle-date inheritance on save. Removed custom-date schema rules cannot block the form, and server date-range feedback is attached to the visible Admission cycle field.

The current focused frontend run passed 78 tests across 11 suites, including single-form surfaces, edit preview/save, bulk cycle navigation, configuration feedback and safe create defaults. Scoped TypeScript checked 16 related source/test files with zero diagnostics; changed-file ESLint, formatting, Student documentation validation and whitespace checks passed. These supersede the earlier custom-date control behavior documented in historical entries below. A full repository build and staging acceptance are separate gates.

Authenticated browser verification was not completed: the current in-app tab was unavailable, and the user reported `AUTH_FAILED` while trying to sign in. Read-only local checks confirmed the API OpenID discovery endpoint responds HTTP 200 and recent token attempts log `invalid_scope`. The frontend requests the application scope `ShikshaMitra`, which is absent from the local API's advertised standard scopes. C: had only about 7 MB free during validation. No files were cleaned, credentials changed, local database migrated or running API restarted. Backend clone coverage is recorded separately in [Student backend testing](../../../Shikshamitra-BE/docs/modules/student/testing.md).

## Special admission offerings and derived entry (2026-10-11)

Routing coverage verifies the single required Admission type selector, no Starts with dropdown, new General Inquiry-first and special Registration-first defaults, saved routing preservation and used-identity locks. Bulk regressions verify track-specific class identity checks, class selection clearing on type changes, null Inquiry configuration for direct registration, retained counsellor setup and bounded type-specific codes. Field feedback attaches routing errors to Admission type and incompatible workflow checks to Published workflow.

Runtime regressions cover permission-gated special entry, explicit cycle selection, paginated special offerings, General/Inquiry-first exclusion, historical Management/Staff Both support, family-link verification, stable retry IDs, failure recovery and unsaved changes. The final focused frontend run passed 119 tests across 14 suites, including the 31 runtime cases. Scoped TypeScript checked 27 source/test files with zero diagnostics; changed-file ESLint, formatting, Student documentation validation and whitespace checks passed. These scoped checks do not certify a full repository build or staging acceptance.

Authenticated localhost UI checks verified all General classes disabled with Offering already exists, the same classes selectable for RTE, and Inquiry selection disappearing on special entry. Starts with is absent in both Bulk Create and a used Offering's Edit drawer; used identity stays disabled. Desktop (1440×900), tablet (768×1024) and mobile (390×844) had no document horizontal overflow and reachable footer actions. Only one eligible cycle was available locally. No offering, cycle or registration was saved; the running API was not restarted, so this does not prove live special creation/save/reload. The desktop screenshot is `.artifacts/special-admission/no-starts-with.jpg`.

The isolated current backend gate passed 43 tests, including special registration, family selection, retry safety, scope/tenant checks, type-specific offering uniqueness and common Decision → Finalize → Onboarding handoff. It reused the unchanged compiled EF assembly; this is not a fresh full backend build. A separate broader run exposed legacy fixtures using retired workflow stages; those unrelated tests were not changed. Exact commands and results are recorded in [Student backend testing](../../../Shikshamitra-BE/docs/modules/student/testing.md).

## Bulk configured-class selection (2026-10-11)

Focused coverage includes `src/redux/student/admissions/admission-offering-class-identities-api.test.tsx`, the bulk hierarchy/model tests and the bulk dialog navigation tests.
The real client tests exercise plain/enveloped responses, all-page reads, inactive Offerings, exact cycle/Board/Medium/Campus/track scope, empty results, later-page failures, stale-cycle data and Offering-tag refreshes.
UI tests exercise disabled labels, remaining-class selection, all-configured feedback, loading/error/Retry, and pruning unavailable classes on cycle changes while preserving other configuration.
Keep backend duplicate preview/commit checks as the concurrent-write safeguard; these tests do not replace that server rule.
The focused bulk regression run passed 57 tests across 11 files; affected-file TypeScript and ESLint checks cover the eight changed source/test files.
Authenticated localhost checks verified all 15 General Admission / CBSE / English classes disabled, and a remaining GSEB / Gujarati Class 1 selectable without creating an Offering.
Desktop (1440×900), tablet (768×1024) and mobile (390×844) dropdown labels and reachable controls were checked, with no document horizontal overflow on tablet/mobile.
Only one published/open cycle was available locally, so cross-cycle pruning is covered by automated tests rather than a live multi-cycle walkthrough; no create, activation, deletion or deployment was performed.

## Applicant overview removal and finalization refinement (2026-10-09)

The obsolete applicant overview is replaced with saved-bookmark recovery into the application drawer. Identity repair and internal notes retain focused dialogs and their existing permissions. Journey tabs are text-only, and counsellor assignment sits in the drawer header. Finalize Admission uses real application context, semantic status colors, compact readiness rows and heading help; its identity, guardian, profile-review and workflow gates remain intact.

Focused runs passed 98 unique tests across ten files: 49 route/link/identity/notes/return-context cases, 14 stage-tab/counsellor cases, 16 drawer cases and 19 finalization/decision-card cases. The final application-link and finalization rerun passed all 20 cases in those two suites. Coverage includes exact denied permissions, lazy reads, read-only notes, dirty close, failed-save value retention, loading/error/empty recovery, expired identity editing, explicit duplicate selection, guardian verification, successful repair refreshing readiness, and finalization closing only after success. Affected-file TypeScript and typed ESLint cover 24 files; formatting, Student documentation validation and scoped diff checks pass.

Authenticated in-app browser checks used the existing synthetic `APP-2026-000003` at 1440 × 900, 768 × 1024 and 390 × 844. The legacy applicant bookmark resolves into the Applications drawer, both name/reference links open the same application, notes remain accessible from the header menu, and the header counsellor editor loads eligible choices. Stage tabs contain no icons; the desktop form still expands from 840 to 1200 px. No document horizontal overflow was observed, and mobile finalization footer actions remain reachable at the theme's 30 px height. Heading help describes the Admissions/Onboarding boundary. Identity repair opens the existing focused editor; Cancel retains guardian confirmation, while the actual missing-gender gate keeps Finalize disabled. Browser checks made no profile, note, counsellor or finalization writes. Multiple/no-application recovery, denied grants and successful mutation paths are covered by focused tests; full-project, staging and production acceptance are separate gates.

## Applicant 360 drawer and compact stage panels (2026-10-09)

Applications and Pipeline open the application inside a right-side drawer while retaining their list context. Configured journey stages use one horizontal tab row; completed stages are readable and future stages are disabled. Application form sections use horizontal navigation with one Formik owner and optional desktop drawer expansion. Document verification uses the shared embedded table with separate Upload, View and Download controls and permission-gated row actions. Standard labelled buttons retain the theme's small size.

The final drawer/table rerun passed 28 tests across `admission-application-detail.test.tsx` and `document-requirement-table.test.tsx`. Companion focused runs passed 13 form/runtime tests, 22 counsellor/decision/follow-up tests, 13 managed-stage/current-task/Pipeline-state tests, and four document-history/authenticated-download tests. Coverage includes failed saves retaining the active form section, view-only and completed-stage write protection, coordinated mutation locks, dirty-close confirmation, future-stage navigation, table search/pagination, loading/error recovery, and document action permissions. Scoped TypeScript checking of 69 affected files reported zero diagnostics. These focused checks are separate from full-project or deployment acceptance.

Authenticated local browser verification used the existing synthetic `APP-2026-000003` record at 1440 × 900, 768 × 1024 and 390 × 844. Checks covered compact controls, contained horizontal scrolling, completed-stage review, 840 px desktop drawer/1200 px form expansion, drawer close, browser Back/Forward, retained Pipeline search, and an actual authenticated evidence download. Browser checks reviewed existing saved data; writable stage operations are covered by the focused tests and the earlier five-stage acceptance below, rather than a new complete write journey through this drawer.

The legacy card-layout permission test still expects a Waive requirement button removed by separate stage-retirement work. That existing expectation remains outside this drawer/table change. A live account without effective Applications.View and staging/production acceptance remain outstanding; Admin DDVS has feature access.

## Five-stage admission simplification (2026-10-08)

Current application workflows expose Form, Assessment, Payment, Document verification, and Admission Decision. Eligibility, Review, and Offer are retired. Stage settings use one continuous form; earlier Basics/Settings wizard notes below describe historical iterations. Payment confirms a published scoped Finance fee structure; it never creates an admission receipt or Paid state.

Focused builder/configuration verification passed 192 tests across 49 files; application/Applicant 360 verification passed 96 tests across 19 files. Subsequent affected Form copy, fee-panel hook, editor validation, and current-task reruns passed. A scoped TypeScript check of 113 changed Admission files had zero diagnostics; typed ESLint on those files had zero errors or warnings. These checks do not certify the full repository TypeScript or E2E suites.

Authenticated local DDVS acceptance used persisted synthetic application `APP-2026-000001`, applicant **QA FiveStage Journey**, and a published five-stage workflow. Actual UI actions covered invalid Form submission, draft save/reload, required section verification, Assessment attendance, invalid marks and persisted passing result, Finance fee confirmation/reload, missing/rejected document guards, replacement upload/download/acceptance/reload, Waitlist remaining pending, Approval, and completion of all five stages. Backend requests independently verified incomplete-stage and early-decision guards. Actual UI finalization created Student `3a242eb1-43e9-34f6-8b9e-ac328c6a9c19` and Onboarding case `3a242ecd-7c87-f241-29a4-e0bfedee099f`; two repeated finalization requests returned the same identities.

Onboarding refreshed real profile/document checks, confirmed the Admission fee snapshot, reserved Class 1 / A, prepared GR `QA5-000001` and roll `4`, and activated enrollment `3a242ed1-a50a-4d98-e012-3c34d14ae88a` through the normal UI. Activation persisted and Student Records profile became readable with the existing Provisioning access policy. The existing Finance API then assigned the exact selected published structure through its signed preview, and recorded the synthetic local QA first installment of ₹291 (₹83 + ₹208) as Cash receipt `FIN-2026-000001`. Replaying the same idempotent command returned the same receipt and left the two first-installment dues at zero. Finance handoff retry moved Onboarding to Completed; Directory returned the student with `CompletedOnboarding` entry and full profile access. This was persisted test ledger data, with no real money or external transaction. No Paid flag, account provisioning, waiver, or readiness override was fabricated. Applicant 360 showed five completed stages and the finalized application without retired workspaces.

A separate saved QA draft covered optional Assessment scheduling, the five-type chooser, backend-generated custom document codes, retained Student document category, dirty-close protection and category lookup retry. Desktop, 768px tablet, and 390px mobile settings had no horizontal overflow; the custom document editor used the existing desktop popover/mobile dialog pattern. The completed application also had a 390px document and dialog at the 390px mobile viewport, with no horizontal overflow. Decision settings and custom information tooltip behavior were inspected; removal of unrelated Form-version tooltip copy passed the final affected 12-test rerun. The category catalog was empty locally, so actual uploaded QA evidence was uncategorized; category selection/handoff coverage is automated rather than a populated live-category walkthrough.

QA setup created a separate published Finance structure using existing fee heads/terms, a QA collection policy, and a Class1/year-scoped GR series through ordinary APIs. The first active collection policy became the year's default through existing Finance behavior; no existing Finance configuration was overwritten. A pre-existing incorrect local-clock-as-UTC write was fixed for future fee confirmations and covered with UTC/Local/Unspecified clock regressions; the earlier saved QA snapshot was not rewritten. The later Onboarding confirmation persisted true UTC. One transient authentication refresh failure after local API restart recovered on a warm direct navigation; repeated later reloads passed. Directory was verified in the browser using unique GR `QA5-000001`; its existing search matches individual name fields or GR, so the concatenated full-name query did not match. Student Profile showed the active Class1/A enrollment and identifiers. The package's optional enrollment-modularity check could not run because its referenced script is absent. No deployment or complete production acceptance is claimed.

## Admission Stage builder simplification (2026-10-07)

Build journey opens the ordered stages directly. Configure/Journey map tabs, Template/Preview/Validate buttons, and the builder overflow menu are removed. Undo/Redo sit beside Add stage. The shared Scrollbar owns the stage body; journey status and permission-gated Save draft/Publish and approval actions stay in the bottom footer. Stage action menus and publish-time server validation remain unchanged.

Focused checks passed 25 tests across five files covering the header, canvas, same-draft saves, draft refresh, and route preservation; the route suite passed all eight cases on an isolated rerun after a loaded-machine timeout. The final header/canvas rerun passed all eight tests. Changed-file lint, formatting, a focused TypeScript check of six changed files, Student docs validation, and diff checks passed. Full-project TypeScript was stopped after prolonged resource pressure and remains unverified.

Authenticated in-app browser checks covered 1440 × 900, 768 × 1024, and 390 × 844: footer reachability, custom stage scrolling, compact themed buttons, and no horizontal document overflow. A temporary unsaved duplicate exercised Undo/Redo (4 → 5 → 4 → 5 → 4 stages); the original journey was restored and the temporary tab closed. No workflow was saved or published. Full E2E and final publication were not performed.

## Shared stepper restoration (2026-10-05)

The shared `custom-stepper/index.tsx` was restored to HEAD. Workflow consumers no longer pass the removed modern/clickable-progress, native-validation, validation-preservation, or footer-alignment options. Setup progress is read-only, with no separate Back-to-details button, as requested; a replacement details control is deferred.

The focused run passed 42 tests across seven files, covering shared validation, loading locks, Back/Next value retention, stage validation, workflow creation/update/retry, and Intake compatibility. After the final Back-button cleanup, the two affected suites passed all 19 tests again. A focused TypeScript check of the restored component and all its screen consumers passed with zero diagnostics across 38 files. Changed-file lint, formatting, Student documentation validation, and diff checks passed.

Authenticated desktop browser checks verified required-field feedback, stage Basics/Settings navigation, retained values through Back, dirty-close protection, and the final read-only progress without a details Back button or document overflow. Browser edits were discarded; no workflow was saved or published. Mobile checks and full-project acceptance were not performed for this restoration.

Full-project TypeScript remains blocked by unrelated Academic upload `primaryText` props and Intake-assignment test selector typing errors. Its later incremental retry was stopped under memory pressure; the focused check above is separate evidence. Earlier clickable-progress descriptions below record previous UI iterations and no longer describe the current setup progress.

## Workflow background cards (2026-10-05)

Create/edit parity now uses the same details workspace, template selector and journey preview. Edit opens with the real current journey, retaining stages/routes until an explicit template replacement is confirmed. Registration changes use the shared Form-stage writer; inquiry defaults are retained. Both breadcrumb Back controls reuse the owning dirty-close guard. The focused command covered four test files with 26 passing cases, including same-draft PUT, fresh template IDs, form-only changes, replacement confirmation/cancel, save failure preservation, nullable descriptions and busy navigation. Changed-file lint and formatting passed. Authenticated in-app browser checks covered the edit layout at 1440 × 900, 768 × 1024 and 390 × 844, prefilled registration, replacement confirmation and create/edit dirty Back guards; browser checks did not persist or publish a workflow. Full repository type-check was not completed: the default heap exhausted memory and the larger-heap retry was stopped after prolonged resource pressure.

The compact-header follow-up removes the inline edit title/information row, duplicate step-count text, and separate Back to details button. The completed Workflow details step still opens the same draft editor, and Close/Cancel retain their guards. Three focused test files passed all 15 tests; changed-file lint, formatting, and Student docs validation passed. Authenticated in-app browser checks covered details and journey at 1440 × 900, 768 × 1024, and 390 × 844 with no document horizontal overflow. Browser checks did not save, publish, or delete workflows; save/retry contracts were checked in focused tests.

Create details, inline edit details, and Build journey reuse the existing themed Card and stepper components. The create desktop layout places Workflow details on the left and Journey preview on the right; tablet and mobile layouts stack them. The journey workspace groups progress, tools, and the canvas in one background card without changing graph state or lifecycle actions.

The focused run passed 20 tests, including workspace containment, details-before-preview order, existing validation and dirty-close handling, and same-draft updates. Changed-file lint passed. Repository-wide TypeScript still reports seven existing errors outside this layout change (Academic upload props and Admissions test selector options).

Authenticated browser checks verified the create card, required-field feedback, footer reachability, and absence of document horizontal overflow at 1440 × 900, 768 × 1024, and 390 × 844. The newly grouped second-step card and inline edit card still require refreshed browser checks: the prior session displayed an older builder bundle, and the resumed browser encountered a localhost connection/error-page failure. The local frontend was restarted successfully, but its session refresh could not reach the local API and the server redirected to login. No saved workflow, publication, or database changes were made during these UI checks. The complete E2E suite was not rerun.

## Workflow setup workspace UI (2026-10-04)

The create-details and edit-details forms now render inside the Admission Stage workspace with the desktop navigation retained, rather than a fullscreen modal. The two-step progress uses aligned icons and a compact secondary Back action. Existing clone drawers, permissions, payloads, stage/route ownership, and lifecycle actions remain unchanged.

The focused run passed 18 tests across workflow details, setup progress, shared Formik navigation, and shared stepper button props. Cases include required name/form validation, one-create submission locking, failed-save retry, unsaved close confirmation, edit-details update callbacks, nullable optional descriptions, and updating the same draft while preserving unsaved graph changes. The existing workflow E2E selectors were updated from modal dialogs to named workspace regions; the complete Playwright suite was not rerun.

Authenticated local browser checks covered create/edit layout at 1440 × 900, 768 × 1024, and 390 × 844, plus the two-column create layout on a wider desktop. Required-field errors remain visible, compact form actions stay reachable, no document horizontal overflow occurs, and both journey-step icons have the same vertical position. Browser checks used unsaved edits only: no workflow was published, deleted, or changed in persistent storage. Repository-wide TypeScript still reports unrelated Academic upload props and pre-existing test selector typing errors; none are in the files changed for this UI work.

## Student Records return screen verification

The 2026-10-03 authenticated in-app browser check used the existing school Admin account. Persisted Transitions grants were absent, explaining the denial independently of missing Student data. After explicit approval, temporary View/Create/Approve/Apply grants were saved through the existing grouped Security UI. The Transitions and Annual renewals lists rendered their zero-row empty states; Returning students displayed the permanent-profile notice, target year, school return route, date and reason fields, with submission disabled until an eligible student is chosen. The Student chooser returned no eligible matches. Prepare batch displayed its preview requirement and disabled preview/submit actions without a student.

All four temporary Transitions grants were restored to their original absent state afterward. The original denial returned after refresh. Backend read-only verification confirmed all other 9,431 grant rows retained the same digest. No live Student, return, policy or enrollment mutations were performed. This check covers authorized desktop empty/form states; populated return journeys, latest closure behavior in the shared host, and tablet/mobile acceptance remain unverified. Backend behavior and automated closure evidence are in [Student testing](../../../Shikshamitra-BE/docs/modules/student/testing.md).

A follow-up on 2026-10-03 searched the signed-in DDVS Student Directory with Former students and All enrollment years, no academic-path or search filters. The settled table showed zero records without an error, so the absence of a return verification candidate is not explained solely by the current-year filter. The shared API process and its Application binary still predate the closure changes; the new behavior must be verified after an external backend refresh with an eligible test student. Read-only permission verification again confirmed the restored original grants and unchanged remaining rows.

## Onboarding integration checks

Run focused task-drawer, operation, model and API tests with one worker, then TypeScript and changed-file lint.
Browser acceptance for the current flow must verify six tabs, Offering-linked rule save/reload, Today filtering, pending-task navigation, focused drawers, independent GR/Roll operations, group identifier locks, fee-structure confirmation and postactivation Credentials.
Check desktop/tablet/mobile layouts, the active student's Student Records visibility after reload, and appropriate View/Edit/Repair behavior.
Unit tests do not replace those browser checks.

The 2026-10-09 current-flow focused run passed 134 Onboarding/API/GR-helper tests across 21 files. The seven Student menu checks also passed after correcting two stale expectations to the existing `Onboarding` label; menu permissions were unchanged. Coverage includes Offering-linked rules, Draft/Publish numbering, legacy history preservation, empty-school draft defaults, focused task drawers, pending-task navigation, fee-structure confirmation, required-document evidence and credential retry states.
The final credential suite passed 10/10 cases, including linked accounts with a failed email: account-creation fields stay hidden while email retry remains available. A missing required guardian account still exposes its creation form.
Full-project `npm run ts`, affected-source ESLint, Student documentation validation and whitespace checks passed after the final changes. Temporary isolated Next output references were removed, preserving the pre-existing generated declaration paths and unrelated configuration changes.

Authenticated localhost QA passed the fictional `QA Onboarding09Oct Flow` student through Admissions, finalization, Onboarding and activation into Student Records. Staff accepted the required document, confirmed an existing fee structure, reserved Class 1-A, assigned `QA09-001001` and Roll 5 through separate dialogs, and recorded approval. All eight readiness checks passed. Student Directory showed Active, and Directory/profile reload preserved the GR, Roll and placement after renewing the existing QA sign-in. No Finance mutation, payment or external email was performed. Mobile/tablet readiness drawers and the desktop workspace had no document-level horizontal overflow at 390×844, 768×1024 and 1440×900; Today filtering, click-accessible pending details and reachable drawer footers were checked. Identifier-lock/new-entrant behavior and credential failure recovery have automated service/UI coverage; live credential inbox delivery and staging acceptance remain unverified.

Historical pre-redesign local QA is recorded in `C:\Repo\2026\ONBOARDING_QA_2026-09-29.md`: fictional Jay completed the former flow after two partial receipts settled the first installment.
That historical check does not validate the current fee-structure-only activation flow, and no production payment or external email was tested.

## Admission Cycle checks

```bash
npx vitest run src/screens/student/admissions/admission-cycle-model.test.ts
npx eslint "src/screens/student/admissions/admission-cycle*.ts" "src/screens/student/admissions/admission-cycle*.tsx" "src/redux/student/admissions/admission-cycles-api.ts" --quiet
```

The focused rules cover code normalization and lifecycle-specific edit, publish, close, reopen, archive, and unused-Draft delete availability.
Browser acceptance must cover future Academic Year selection, date errors, dirty-close protection, readiness feedback, simple Close confirmation with dependency loading/error guards and the existing API acknowledgement, reopen extension, archive denial, clone, hidden scheduling actions, unchanged existing schedules, window dialogs, server paging, search, filters, history, and View-only/Add/Delete permission combinations.
Verify at 390 × 844, 768 × 1024, and 1440 × 900 with no horizontal overflow and reachable dialog actions.
An older running backend cannot prove these commands until migration `20260915103120_ImplementAdmissionCycleGovernance` is applied and the current Host is restarted.

## Configure stage and next-step checks

Run the focused workflow editor checks with the repository Windows runner:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/student/admissions/workflow-builder/workflow-route-improvements.test.ts src/screens/student/admissions/workflow-builder/workflow-route-simulator.test.ts src/screens/student/admissions/workflow-builder/workflow-transition-safety.test.tsx src/screens/student/admissions/workflow-builder/workflow-outcome-route.test.tsx src/screens/student/admissions/workflow-builder/workflow-stage-type-select.test.tsx src/screens/student/admissions/workflow-builder/workflow-form-stage-drawer.test.tsx --pool=threads --maxWorkers=1
```

Coverage includes ancestor form fields, numeric and list comparisons, duplicate conditions, managed outcome gates, automatic paths only for simple new journeys, configured-type-change cancellation/confirmation, and custom-copy preservation. Configure stage uses the shared two-step wizard: Stage details validates identity and published-form selection; Completion rules contains process rules, stage behavior and next steps. Check draft retention through Back/Next, Apply changes validation, read-only navigation, dirty-close confirmation, form-detail failure/retry, rounded section cards, meaningful information tooltips that do not toggle their associated inputs, accessible journey Edit/View icons, and small right-aligned Back/Apply controls. Stage codes are internal and the Advanced details editor is absent; existing codes, instructions and entry/ending flags must survive ordinary edits and Apply changes. Entry stage and End of journey controls remain in Advanced settings without information icons: verify entry capability restrictions, terminal editing for Form and Assessment, and read-only locking. Per-type advanced policy accordions remain available and reveal invalid policy settings. Straightforward labels omit redundant information icons; disabled reasons remain accessible and active validation and retry feedback stays visible. Next-step edits must wait for applying dirty stage values. Icon rendering is mocked locally in editor tests to avoid third-party icon requests during teardown.

2026-10-08 presentation checks: 13 Form drawer tests and 12 journey/lifecycle/Offer-validity tests passed. Scoped type-aware ESLint passed for 58 changed builder files. Authenticated in-app browser checks covered desktop and 390px mobile layouts, 30px right-aligned Back/Apply controls, readable mobile stage names, information clicks preserving switches, existing route-editor navigation, dirty-path protection, Apply/Undo, and discard protection. Screenshot-only changes were discarded and the original saved workflow reopened clean; no workflow was saved or published. Broader document-requirement tests timed out on the busy Windows host, and the focused TypeScript check was interrupted under low memory. Full acceptance across all stage types remains unverified.

Browser acceptance remains required at 390 × 844, 768 × 1024, and 1440 × 900. Verify class lookup failure/retry, class-specific document visibility, linked Form uploads reused in Document verification, dirty-answer upload blocking, replacement requiring fresh review, type-change cancellation, readable Offer fields, typed condition choices, missing/overlapping paths, and disabled outcomes. Unit tests do not prove a complete live admission journey or Student/Onboarding handoff.

The 25 September signed-in browser pass loaded the school class catalogue, selected Class 10 with its academic-year/board/medium context, and saved that requirement inside the temporary stage editor. It exposed and fixed an RFC UUID validation mismatch: ABP sequential GUIDs are valid references, while empty GUIDs and duplicate classes remain invalid. Cancelling a stage-type change preserved the configured requirement. Offer validity labels, stage tabs, outcome-route choices, and the completion/next-step summary were inspected; the stage editor had no document overflow and a reachable 44 px footer at 390 × 844, 768 × 1024, and 1440 × 900. These were unsaved editor checks, not a published workflow or live applicant finalization.

Class-ID and Document/Assessment/Eligibility/Review editor regressions passed 35 tests across seven files after updating the tests to navigate the new tabs. The focused Offer-validity regression also passed. The latest repository-wide type check reports three existing Academic errors in `SubmitDiaryModal.presentation.test.tsx` and `viewSubjectComponent.tsx`; it reports no Admissions errors. Live acceptance coverage is recorded separately below.

The matching backend run executed 24 passing document integration tests and nine passing Document HTTP contract tests. It covers early Form collection, denied early review, shared evidence identity, class scope, replacement re-review, and finalization/handoff rollback; see the [backend testing notes](../../../Shikshamitra-BE/docs/modules/student/testing.md) for the correct method-based filter.

A subsequent local browser pass published `QA Document Reuse 2509`, activated its Class 1 QA offering, and saved synthetic application `APP-2026-000002` through the eight-page form. The linked checklist correctly required the Class 1 evidence and showed the Class 10 report as not applicable. Upload controls initially disappeared because the frontend checked retired action names; the guard now matches the backend's canonical document `View`/`Add`/`Delete` capabilities without changing grants. After reload, the upload dialog was reachable.

The user then uploaded a PNG and accepted its Version 1 after overriding from Form to Documents. History showed a draft save and an override, with no form submission: the application correctly remained Draft and document completion stayed blocked. Submitting through Application form changed it to Submitted without replacing the accepted evidence. The browser then completed Documents, Review, the authorized admission decision, and all four workflow stages. An optional offer was issued and accepted for this synthetic direct-registration application. This path does not establish early Form-stage upload reuse or replacement review in the browser; those remain covered by the automated integration checks above.

After fixing optional-offer finalization compatibility and synchronizing the local schema as recorded in the backend notes, the browser showed `Admission finalized` and opened exactly one matching live Student Onboarding case through Continue onboarding.
A scoped read-only database check confirmed the same PNG, Version 1, and accepted review were linked to the newly created Student.
The custom QA requirement has no Student document category mapping, and the onboarding drawer correctly reported no configured onboarding document requirements; this run does not claim that an unrelated onboarding requirement was satisfied or that Student activation occurred.
The finalization regression selection passed both direct-approval and accepted-optional-offer cases.
Student documentation validation passed; the repository-wide documentation check still reports 27 issues in the separate `docs/testing` area.

The document UI suite passed 19 tests across seven files, including canonical allowed/denied permission cases and rejection of retired grant names. Four retained Student-evidence tests also passed: download follows both canonical View grants and the server capability, mutation controls stay absent, and either missing View grant prevents the query. Three draft-refresh regressions passed: a save response survives the unchanged cached query, an actual stage/route change invalidates old validation, and validation's own governance-status/stamp update preserves its result. Published workflows cannot reopen or apply the setup template dialog. The current repository-wide type check still reports only the three Academic errors described above.

An isolated `QA Route Fields 2509` clone verified the published Category field and its actual choice values, duplicate-destination rejection, condition save/reload, and the corrected first validation response (`No validation issues found`). This unused clone was restored to Draft and deleted after the check; no offering or applicant referenced it. The published QA workflow also stayed read-only with no template dialog when reopened through its old `setup=standard` link. These checks do not establish live conditional applicant progression.

## Documentation and hygiene

Run from `Shikshamitra-FE`:

```bash
npm run docs:check
git diff --check
```

## Focused frontend checks

```bash
npx vitest run src/redux/student/admissions/admission-class-capacity-cache.test.ts
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
npx vitest run src/redux/student/onboarding/student-onboarding-api.test.ts src/screens/student/onboarding/setting/onboarding-academic-applicability.test.ts src/screens/student/onboarding/setting/onboarding-policy-settings.ui.test.tsx src/screens/student/onboarding/student-setup/student-onboarding-case-operations.ui.test.tsx src/screens/student/onboarding/student-setup/student-setup-drawer.ui.test.tsx
npx eslint src/redux/student/onboarding/student-onboarding-api.ts src/screens/student/onboarding/setting/onboarding-academic-applicability.tsx src/screens/student/onboarding/setting/onboarding-policy-settings.tsx src/screens/student/onboarding/student-setup/student-onboarding-case-operations.tsx
npm run ts
```

Verify that Settings exposes Readiness & Access and Numbering & Placement, with only GR/Roll tabs in Numbering and no Division Changes menu.
Readiness rules require selected Admission Offerings and show derived Board/Medium/Class and requirement summaries without School Level controls.
Check failed Offering lookup/retry, unavailable Offering IDs, duplicate linked rules, Onboarding permission-denied lookup and save/reload.
Verify an authorized Onboarding settings user can select available Offerings without an Admissions Offering configuration grant.
GR's CBSE form contains Board/Medium/Class; GSEB retains School Level, and Roll contains Board/Medium/Class.
Check Draft/Publish version handling, conditional manual-entry controls and the absence of removed scope/reset/format/effective-date controls.
Student Setup must use backend cases and fee confirmation without Finance assignment, collection or first-payment gating.
Browser acceptance covers 390 × 844, 768 × 1024 and 1440 × 900, plus a live case when suitable authorized school data exists.

The onboarding API contract and model suites cover `Result<T>` unwrapping, server worklist filters and paging parameters, route-owned identifiers, concurrency-safe command bodies, academic-year settings scope, exact lifecycle mapping, blockers, and audit events. The existing configuration suites cover option construction, single-path normalization, applicability specificity and conflicts, Readiness fallback/override resolution, context cloning, settings-drawer behavior, and local bulk-assignment previews. Backend tests remain authoritative for atomic allocation, capacity locking, permission enforcement, activation transactions, audit history, and concurrent administrator changes; frontend tests verify that the UI sends the backend contract without inventing operational state.

The 2026-09-21 focused implementation run passed 13 files and 78 tests across the admission handoff, onboarding API, lifecycle mapper, persisted operational settings, advanced configuration behavior, assignment preview, activation preview, menu and action permissions, and admission-decision workflow. Focused ESLint and repository-wide TypeScript also passed.
The matching backend onboarding run passed 30 focused tests: 10 domain lifecycle tests, 5 application/validator and admission-document handoff tests, and 15 HTTP API contract tests. The HTTP project still reports unrelated nullable-reference and analyzer warnings outside Student Onboarding.
The local in-app browser smoke test reached the application but redirected to `/login`; no authenticated browser session or alternate connected browser was available, so the live settings drawers remain browser-blocked rather than visually confirmed.

The 2026-09-21 Student Onboarding implementation pass reached `/student/onboarding/setup` in the Codex in-app browser but was redirected to the sign-in screen. No authenticated external browser was connected. The live worklist, operational dialog, document upload, and activation confirmation therefore remain browser-blocked; focused contract, model, settings, permission, lint, and TypeScript checks are the recorded evidence for this pass.

### Current Student Setup focused evidence

The 2026-10-09 Student Setup run passed **9 files / 60 tests** with `--maxWorkers=1` in 41.88 seconds.
The following command reproduces that focused scope from the frontend repository root:

```powershell
$onboardingTests = @(
  'src/screens/student/onboarding/student-setup/student-onboarding-operation-dialog.ui.test.tsx',
  'src/screens/student/onboarding/student-setup/student-onboarding-fees.ui.test.tsx',
  'src/screens/student/onboarding/student-setup/student-setup-view.test.ts',
  'src/screens/student/onboarding/student-setup/student-setup-drawer.ui.test.tsx',
  'src/screens/student/onboarding/student-setup/student-identifier-lock-controls.ui.test.tsx',
  'src/screens/student/onboarding/student-setup/student-pending-tasks.ui.test.tsx',
  'src/screens/student/onboarding/student-setup/student-onboarding-model.test.ts',
  'src/screens/student/onboarding/student-setup/student-onboarding-workflow-documents.ui.test.tsx',
  'src/redux/student/onboarding/student-onboarding-api.test.ts'
)
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run @onboardingTests --maxWorkers=1
```

These tests verify separate GR/Roll payloads and forms, reason validation, lock/unlock controls, locked-group automatic first assignment, six task tabs, pending-task URL destinations and focused drawers, fee confirmation, requirement review and canonical document adapters.
Model coverage includes separate GR/Roll readiness, required email work after account linking and activated students with pending credentials.
Focused source ESLint, formatting and scoped `git diff --check` passed in this implementation pass.
The subsequent header/authorization audit passed **2 files / 11 tests** across `src/screens/student/onboarding/persisted-onboarding-settings-provider.ui.test.tsx` and `src/screens/student/onboarding/student-setup/student-identifier-lock-controls.ui.test.tsx`.
Those checks verify retained route headings and breadcrumb links during loading/error, working Retry without mounting editable defaults, and available Lock with hidden Unlock when the server administrator capability is false.
The Offering document-snapshot follow-up passed **3 files / 26 tests** across workflow-document UI, the case mapper and the setup drawer.
It distinguishes a frozen Offering with no required documents from a legacy no-snapshot case, preventing the empty Offering checklist from introducing unrelated global requirements.
The readiness-count audit passed **16 model tests**, covering the excluded final-readiness aggregate, explicit server admission confirmation and preserved legacy imported-case checks.
The live-observation follow-up passed **2 files / 11 tests** across case operations and workflow-document UI, checking preserved owner selection during lookup loading and selected filename feedback before upload submission through shared Admission fields.
Final repository-wide TypeScript and authenticated live/browser acceptance for the redesigned flow are pending this documentation update.
The earlier local journeys and earlier TypeScript results elsewhere on this page are historical evidence, not verification of this redesign.
Required live cases include an off-page focused case after filtering, a new student entering a locked division, denied/non-admin unlock, document replacement/review, fee confirmation/reload, activation/Records reload and failed credential send/retry.
No current staging, production, actual inbox-delivery or deployment verification is claimed.

## Managed assessment checks

The workbench adds `assessment-workbench-model.test.ts`, `assessment-continue-dialog.test.tsx` and `admission-assessment-roster-api.test.ts`. These cover bounded URL state, historical/permission action guards, fresh stage/evidence checks before Continue, scoped request serialization and roster invalidation after booking. `application-return-url.test.ts` checks the approved Assessments return path alongside existing Pipeline navigation. Existing dialog dirty-state cases remain required because the workbench reuses those forms.

Authenticated acceptance must cover offering/stage and academic context changes, URL reload/back/forward, valid and invalid session filters, queue counts, search/sort/page changes, result-only scopes, session booking, attendance, result/review, retake from session A to B, explicit Continue and disabled historical actions. Confirm save/reload, stale-record conflicts, read-only permission states, empty/error retry and narrow-screen table/drawer behavior. Current-page export must not imply exporting the full applicant roster. Backend tests own scope isolation, independent-review and exact route readiness; backend docs record the current candidate-classification scaling boundary.

The 2026-10-07 workbench checks passed 64 focused frontend tests, strict affected-source TypeScript, changed-file ESLint and Student documentation validation. The isolated assessment release rerun passed 34 focused cases, strict affected-source TypeScript, changed-file ESLint and Student docs validation against the current remote frontend baseline. Backend checks passed 13 Application and 10 API contract tests, plus a rerun of the existing roster integration case with scope-label assertions. The full-project TypeScript check subsequently passed in the local working checkout after excluding ignored diagnostic artifacts and correcting two unsupported exact-name options in the existing local Inquiry tests. Those Inquiry tests passed 15 cases; their unpublished source changes are outside this assessment release. This local full-project result does not replace the merged release build and staging acceptance.

Authenticated localhost checks used the existing synthetic `InquiryQA Edited0710` application (`APP-2026-000003`) in `QA0710-CLASS-1`. Created `QA-Assessments-0710-1851` at QA Hall with capacity 5, booked the applicant, recorded Present attendance after the actual scheduled start, and saved 75/100 marks. Booking, attendance/result queue changes, persisted score after reload, bounded score validation, search empty/recovery states, invalid-session warning/clear, valid-session filtering, URL sort retention, attempt history and Open application/Close return navigation were verified. The independent-review policy correctly keeps the result in Review and hides approval/Continue from its recorder. The test session and pending-review attempt remain as local QA evidence; no admission was finalized and no parent communication was sent.

Desktop 1440×900, tablet 768×1024 and mobile 390×844 checks found no document horizontal overflow. Narrow-screen academic filters use an accessible expandable toggle so table rows remain reachable; desktop retains the shared filter row. The history drawer becomes full width on mobile and uses the shared Scrollbar. Independent approval with a second account followed by live Continue is deferred by the user. A restricted account is currently unavailable; the user moved that live check to staging. Multi-page real-data navigation and retakes remain release acceptance checks. Backend representative-volume evidence is recorded in the backend testing notes. Their focused guards/contracts have automated coverage; this change is not deployed. A final authenticated local reload reconfirmed the QA session, Present attendance, persisted 75/100 score and Review queue; the recorder still has no approval or Continue action.

Run the admissions regression suite, including policy and request contracts, stage configuration, outcome routes, scheduling, history, local dialog guards, and legacy compatibility:

```bash
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/redux/student/admissions src/screens/student/admissions --maxWorkers=2 --no-file-parallelism
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

| Surface            | Browser acceptance checks                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wizard navigation  | **Form details**, **Build form**, and **Review & save** use the shared stepper's single Formik state; **Back** and review edit links retain values, and **Next** never sends a save request.                              |
| Stage validation   | Invalid name/code blocks leaving details without validating unfinished fields; invalid section/field schema blocks leaving the builder; final **Save draft** validates the complete draft.                                |
| Form details       | **Blank form**, **Admission application**, and **Student registration** are visible quick starts. The complete library supports search, category filtering, preview, and school-form reuse.                               |
| Form purpose       | Inquiry and Registration views are URL-backed; new drafts inherit the active purpose and offering selectors reject the wrong published purpose. Correction and Consent are no longer offered as standalone form purposes. |
| Document rules     | Conditional requirements expose Admission type, Class, Category, RTE status, Transfer admission, Scholarship, and Assessment outcome and still save on the workflow Document stage.                                       |
| Parent messages    | The nine admission lifecycle messages create or update `Admissions lifecycle` Communication templates; channel, active state, variables, and permission failures remain Communication-owned.                              |
| Template catalogue | Every system template passes the admission-form schema, reports accurate section and field counts, creates fresh IDs, and avoids duplicate system bindings.                                                               |
| Starter choice     | Replacing dirty content requires confirmation, while every selected template remains editable. Reusing a school form creates a new copy without mutating the source.                                                      |
| Workspace          | Desktop shows the outline, focused section canvas, and field settings; narrow-screen tabs preserve section/field selection and entered values.                                                                            |
| Field editing      | Open **Add field** above the full-screen builder, confirm its destination, add a field, and verify the drawer closes with the new field selected for editing.                                                             |
| Choice editing     | Add, rename, reorder, delete, and paste choices without entering JSON; reopen the field and verify stable stored values. Confirm incompatible legacy data is warned about rather than replaced.                           |
| Form structure     | Open **Manage structure**, add blank or ready-made sections, reorder fields and sections, confirm deletion, and verify step membership and selection remain correct.                                                      |
| Section packs      | Search and add a pack into the selected step; verify new IDs/codes, duplicate custom-code suffixing, and linked student-field deduplication.                                                                              |
| Draft protection   | Reject discard and template-replacement confirmations and verify entered values remain; accept replacement and verify the template appears.                                                                               |
| Review             | The final stage displays identity, layout, counts, and ordered structure; publishing checks are advisory and do not block a schema-valid draft save.                                                                      |
| Save recovery      | A failed request retains the editor and values; retry saves the same draft successfully and closes the editor.                                                                                                            |

Supporting browser automation does not replace the final in-app browser check; record an unavailable session or tool as a validation limitation.

The 2026-10-02 signed-in custom-field walkthrough used an unsaved Inquiry draft and covered all 12 basic field types and all seven presets through Basic, Rules, and Data settings. Radio choice clearing/typing, rename, reorder, delete, paste, and reopen retained the labels; Select and Multi-select edits also retained choices. Preview verified defaults, Radio-driven visibility, India/Gujarat/Ahmedabad dependencies, and clearing dependent values when Country is cleared. Aadhaar/PAN now expose accessible input names and helper/error associations through the shared OTP field; its two focused tests passed. Builder/settings and preview had no document-level horizontal overflow at 390 × 844, 768 × 1024, and 1440 × 900. The temporary draft was discarded without saving or publishing; the existing published form was unchanged. This is not a backend submission/publish certification. A separate runtime-validation gap was observed: an empty Address group serialized as `{}` can satisfy required validation; address completeness semantics need a frontend/backend review before changing that rule.

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
npx vitest run src/constants/student-menu.test.ts src/screens/student/admissions/admission-inquiry-model.test.ts src/screens/student/admissions/admission-inquiry-duplicate-matches.test.tsx src/screens/student/admissions/inquiry-management/admission-inquiry-columns.test.ts src/screens/student/admissions/inquiry-management/admission-inquiry-communication-dialog.test.ts src/screens/student/admissions/inquiry-management/inquiry-communication-templates.test.ts src/redux/student/admissions/admission-inquiries-api.test.ts src/redux/student/admissions/admission-inquiry-policy.test.ts src/redux/student/admissions/admission-inquiry-management-api.test.ts src/screens/student/admissions/workflow-builder/workflow-inquiry-editor.test.tsx src/screens/student/admissions/workflow-builder/workflow-inquiry-retirement.test.ts
npx eslint --quiet src/screens/student/admissions/admission-inquiries.tsx src/screens/student/admissions/inquiry-management src/screens/student/admissions/workflow-builder/components/admission-condition-form-picker.tsx src/screens/student/admissions/workflow-builder/workflow-inquiry-retirement.ts
npm run ts
```

The 2026-09-11 focused run passed 18 model, policy, prerequisite, and RTK Query tests, TypeScript, focused ESLint, and the live Inquiry list render in the Codex browser.

Operational-queue coverage verifies that the list request serializes the work-queue filter and that next-action presentation prioritizes overdue follow-ups, still identifies first-contact work when no SLA deadline is configured, and stops showing qualification work after an outcome is recorded.
Communication coverage verifies the inquiry-scoped POST payload, language-aware template fallback, and channel validation, including the required Email subject and at least one supported family channel. Inquiry API coverage also verifies concurrency-safe edit, timeline, atomic bulk assignment, and filtered CSV contracts. Backend tests separately verify campaign creation and the route/permission contract.
Navigation coverage verifies the flat Admissions menu, the dependency-ordered Settings group, the hidden Review Queue sidebar entry, and the preserved Application Reviews permission entry.
Pipeline menu and route now require Applications View.
Focused Pipeline tests live in `src/screens/student/admissions/pipeline/`, with application follow-up and safe-return coverage in `src/screens/student/admissions/application-detail/` and the follow-up client contract test in `src/redux/student/admissions/admission-application-follow-ups-api.test.ts`.
Applicant workspace regressions cover full-page routing, clickable future stages, current-only continuation, completed-form read-only review, saved/dirty fee selection, loading/error recovery, action locks and retained safe list context. Closure tests verify required reasons, server eligibility, permission denial, concurrency payloads and queue/session cache refresh. Shared `use-unsaved-navigation.test.tsx` covers page-leave/browser guards. Document table tests retain download, missing evidence, review and history coverage.
Fee-selection readiness distinguishes an open inline editor from an in-flight operation: editing disables continuation without the workspace's `Updating application…` overlay. The fee panel regressions cover empty, available, loading and failed candidate reads; reachable Cancel/Retry controls; restored readiness after cancellation; and actual-save locks with error recovery. Browser verification must open Select fee structure on an application with no matching candidates and confirm the empty message, enabled Cancel, disabled confirmation/continuation, and successful reopening without a persistent overlay.
On 2026-10-10, the focused fee panel, managed-stage and Applicant 360 suites passed 65 tests. Authenticated in-app browser verification reproduced the persistent overlay on `APP-2026-000010` before the fix, then verified the empty-candidate message, enabled Cancel, disabled confirmation/continuation and cancellation/reopening on the updated localhost bundle. No fee selection, Finance configuration or application progression was written during this browser check.
Changed-file TypeScript diagnostics, focused ESLint/Prettier and Student documentation validation passed. The attempted full-project typecheck was stopped under local memory pressure; this fix does not claim a completed full-project typecheck.
Browser acceptance checks use 390×844, 768×1024 and 1440×900: open the normal page with Pipeline active and left navigation available, select current/future/completed stages, verify horizontal form navigation and compact adjacent End journey/Continue admission actions, preserve unsaved-change guards and list filters on Back/reload, and check assessment slot guidance/redirect. Exercise withdrawal only on a disposable local QA application and verify persisted reason/history; finalized cases must hide closure. Keep current and future save verification separate from completed read-only evidence checks.

The 2026-10-10 final workspace and closure rerun passed 35 frontend tests, including archived predecision withdrawal routing; the full-project TypeScript check and focused ESLint passed. Earlier focused routing, stage-panel, dialog and shared-stepper runs additionally cover current-only continuation, permission denial, loading/error states and assessment-slot guidance. One existing document permission test still expects a retired Waive action; that unrelated baseline expectation remains unchanged.

Authenticated localhost browser checks used disposable inquiry `INQ-2026-000012` and application `APP-2026-000011`: transfer opened the normal Pipeline workspace with the left working menu visible; all five journey stages and horizontal form sections were selectable; an assessment attempt saved in a future stage without advancing the current Form stage. Keep/discard protected unsaved form changes. Empty and whitespace-only closure reasons were rejected; a valid reason saved Withdrawn status and persisted after reload, retaining the cancelled assessment attempt and closure reason while removing editing actions. The transferred inquiry was absent from the operational inquiry queue and the withdrawn application was absent from active Pipeline. The closed detail correctly routes to Applications history and retains its working menu. At 390×844, 768×1024 and 1280×720 there was no document-level horizontal overflow, and adjacent footer buttons remained visible at the shared 30px small size. The live QA workflow did not require assessment booking, so enabled-slot guidance is covered by focused tests rather than this browser fixture. The source fixes removing a stale future-assessment blocker and including predecision withdrawals in Applications list queries require refreshing the already-running backend to appear there; the latter is covered by backend integration tests. The browser used that existing host. These checks do not establish staging or deployment acceptance.

Browser acceptance must cover active-only results, My/All defaults, complete scoped owner/stage filters, current counsellor, actual workflow guidance, retained original follow-ups, schedule/complete/cancel save-and-reload, URL/context return, permission denial and loading/empty/error states at 390×844, 768×1024 and 1440×900.
Entering Admission Decision must remove the case from Pipeline and add it to Applications before approve/reject/waitlist.
Sending it back for correction must retain Applications ownership, and later finalization must preserve the same Application and Onboarding handoff.
Failed mutations must preserve phase ownership and the current editor.

The final 2026-10-07 Pipeline run passed 42 focused frontend tests across seven files, affected-source TypeScript and typed ESLint. Authenticated localhost checks verified the manager's All default, My/All selection, owner/current-step/status controls, search, empty-result recovery, sorting, reload and Continue/close with the original Pipeline query retained. Finalized applications were absent while the active inquiry-linked application remained. The current workflow step and Pipeline showed the same entered time. A new near-future reminder saved as 7:25 pm, retained that time after a full reload, and appeared in Pipeline as one open follow-up without a false overdue warning. Complete and Cancel persisted their notes/history after reload; Pipeline then showed no open follow-ups. Synthetic QA reminders were completed or cancelled, with no real communication sent.

Desktop 1440×900, tablet 768×1024 and mobile 390×844 checks found no document-level horizontal overflow; the table retained its pinned 44px Continue action.
The final mobile check included Columns and Export current page.
Actual Excel and PDF downloads exposed a literal `false` from conditional column children; the Pipeline columns now return null for absent dates/warnings without changing the shared exporter.
The final seven column tests exercise the actual shared export formatter, including absent reminders, future deadlines and retained overdue warnings.
Both affected files passed typed ESLint, Prettier and affected-source TypeScript with zero diagnostics; repository-wide TypeScript was not rerun in this acceptance pass.
Fresh UI exports produced an eight-column workbook with one active row and a matching landscape PDF; both files excluded Actions and the finalized synthetic application, had no literal boolean text, and passed content checks and PDF render inspection.

The fresh synthetic `INQ-2026-000006` qualification persisted as Interested after reload, and explicit Move to next stage created `APP-2026-000004` while retaining its counsellor and original reminder.
Reminder completion persisted before the application journey continued.
The published five-stage workflow was exercised using an authorized assessment waiver with an explicit synthetic QA reason, saved application-form sections, automatic Form completion, configured manual Documents/Review completion and an auditable admission decision.
Blank offer expiry and missing core identity blocked progression; a future expiry and identity repair through Applicant 360 resolved those prerequisites.
The accepted offer finalized successfully, preserved all five completed stages and locked follow-up mutations.
Continue onboarding opened one searchable Student Setup case for the same application, with the counsellor retained and placement, GR/roll identifiers and activation pending.
A fresh Pipeline load retained the other active application and excluded this finalized case.
This is local synthetic handoff acceptance; recorded marks with an independent second reviewer, managed document/review checklists and enrollment activation were not exercised by this journey.
Qualification email was skipped because the synthetic family had no email; no campaign or dispatch was created.

Live limited-account browser checks verified the counsellor's My default, an empty scoped All queue, and unavailable access to the finalized synthetic application; the teacher's My queue was also empty.
Normal-trust HTTPS checks confirmed those account identities, empty scoped Pipeline/options responses, and not-found application/history/follow-up responses outside their academic access.
The checked counsellor, teacher and `student-crm-denied` accounts all currently receive effective Applications.View from the running API, so these checks establish academic-scope isolation rather than missing-feature-permission denial.
The denied-named account's effective grant disagrees with its current direct/current-role database rows; this permission-provenance discrepancy is unresolved and no grants, credentials, academic scopes, seeds or runtime caches were altered to force acceptance.
An existing account that actually lacks effective Applications.View is still needed for the live feature-denied browser check; focused permission tests do not substitute for that acceptance result.
The user's supplied `admin-ddvs` account was restored through normal sign-in and visibly opened Pipeline with the All default and the remaining active application; it has feature access and cannot provide the missing-permission fixture.

The backend acceptance follow-up verified the History scope guard in the actual running Host and repaired exactly five historical reminder scheduled instants from unambiguous offset-bearing activity evidence, preserving original notes, completion fields and history.
Read-only verification found no reminder/original-instant mismatches across the eight local tasks.
The narrow repair is not an automatic migration or production data rollout; see [backend Student testing](../../../Shikshamitra-BE/docs/modules/student/testing.md).

An earlier inquiry-management browser pass showed real server-paged controls and a recoverable management-drawer error against an older API build.
The running-Host and fresh synthetic acceptance evidence above supersedes that older Pipeline runtime limitation; it does not imply that every managed lifecycle configuration or deployment has been exercised.

The 2026-10-06 focused inquiry simplification checks cover the three status choices, required Not interested reason, separate Interested save and application handoff, Pending/Not interested/duplicate handoff blockers, repeat-transfer prevention, application navigation using the confirmed inquiry offering, full source-filter range, original API serialization, and pre-application status copy. Browser save/reload, availability denial, handoff/Pipeline and qualification email verification remain required integration checks.

### Separate Inquiry Edit and Follow-up

Focused suites cover the dedicated editor, row actions, form-history filtering, follow-up dialog, validation model, and management API contract. Verify the original configured form and its history in Edit; Follow-up must contain only note cards, Notes, Next reminder date, Status, and Cancel/Submit. Initial values must wait for both fresh detail and management responses, while failed submissions and later refreshes preserve the draft.

The final focused frontend checks passed 38 cases, scoped TypeScript, changed-file ESLint, and Student documentation validation. The matching backend checks passed 27 focused tests and verified PostgreSQL reminder binding/read-back across midnight in IST; these are separate from authenticated browser acceptance.

Local authenticated checks on 2026-10-07 used synthetic inquiry `INQ-2026-000005` with no email address. Its original form edit persisted after reload; form history retained only creation and form changes after four follow-up notes. Pending and Interested notes saved together with status and reminder, Interested enabled the explicit Move action without transferring automatically, and dirty Cancel used the shared confirmation. The dialog fitted 390 x 844, 768 x 1024, and 1440 x 900 without horizontal overflow. A new 10 October reminder survived full reload with the same selected date; read-only verification of the actual tenant database confirmed 9 October 18:30 UTC equals 10 October midnight IST. Not interested also survived full reload, cleared the date, disabled Move, and left zero scheduled reminders. A transient shared-API refresh error recovered through Retry without changing the saved record.

```powershell
npx vitest run src/screens/student/admissions/admission-inquiry-edit-page.test.tsx src/screens/student/admissions/inquiry-management/admission-inquiry-columns.test.ts src/screens/student/admissions/inquiry-management/inquiry-form-history.test.ts src/screens/student/admissions/inquiry-management/inquiry-follow-up-dialog.test.tsx src/screens/student/admissions/inquiry-management/inquiry-follow-up-model.test.ts src/redux/student/admissions/admission-inquiry-management-api.test.ts --maxWorkers=1 --no-file-parallelism
```

## Managed Form checks

The 2026-10-09 stage-editor cleanup passed 21 cases across `workflow-form-stage-drawer.test.tsx`, `workflow-document-requirement-editor.test.tsx`, `document-requirement-compatibility.test.tsx`, and `workflow-document-editor.test.tsx`. Tests cover hidden Completed by/Due after controls with saved responsibility/deadline preservation, standard/custom popover entry points, preset-code preservation, edit/remove cancellation, validation, category compatibility and read-only controls. Run these with `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run` followed by their paths and `--pool=threads --maxWorkers=1 --no-file-parallelism`.

Authenticated localhost browser checks verified Form-field removal, compact checklist cards, standard-document selection/save/edit, duplicate-preset disabling and dirty-stage discard. At 1440×900 and 768×1024, requirements use the anchored popover; 390×844 retains the shared mobile dialog with reachable small footer actions. No document-level horizontal overflow was observed. Browser QA checklist additions were discarded, preserving the saved test workflow. Changed-file ESLint, scoped TypeScript (five files) and the Student documentation gate passed; this is not a full-project build or deployment check.

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

The 2026-10-11 delete-confirmation simplification passed nine tests across the action-impact and existing Offering-action hook suites. Delete shows the record name (or code fallback) and an irreversible-action message without class/scope details, usage counts or an Alert, regardless of the displayed application count. Activate/deactivate guidance is retained. Signed-in localhost browser checks at 1440 × 900, 768 × 1024 and 390 × 844 verified the compact shared confirmation, readable text and reachable Cancel/Delete controls; Cancel was used and no Offering was deleted. Existing row eligibility and mutation handlers were not changed.

The 2026-10-11 bulk Preview/field-feedback refinement passed 44 tests across ten focused suites: bulk dialog, preview, configuration fields, hierarchy fields, validation mapping, model, bulk hook, definition selector, existing single-offering configuration fields, and the shared paginated-select accessibility suite. Coverage includes visible initial/manual setup selection, switching from combined or legacy profiles to null-profile manual assignment, required stars and inline activation validation, backend feedback under Inquiry/Workflow/Class, deduplicated shared checks, class-specific duplicates, unknown-code preservation, busy edit guards, Preview/Edit selection/Back retention, null serialization and unchanged inactive-only creation. Related hierarchy/profile changes are applied together so validation uses the final values, not an intermediate selection. Focused TypeScript checking reported zero diagnostics across 15 changed source/test files. Creation eligibility remains server-authoritative; missing activation configuration does not become a new inactive-save blocker.

The final configuration/hierarchy/dialog rerun passed all 13 tests after the preselected-setup regression and atomic value updates. Scoped ESLint passed without warnings for all 15 changed source/test files. Signed-in localhost browser checks at 1440 × 900, 768 × 1024 and 390 × 844 verified field-level feedback, cascading Medium validation, combined-to-manual selection, retained selections after Preview/Edit selection, grouped configuration checks, class-specific duplicate cards, disabled creation for the blocked batch, scrollable mobile content and reachable compact footer actions without horizontal overflow. Screenshots are saved under the ignored `.artifacts/bulk-offering-field-feedback/` directory. No offering was created or updated; this does not claim staging or deployment verification.

The subsequent 2026-10-11 code-visibility/layout refinement covered 42 tests across the existing eight Offering suites plus `admission-offering-configuration-fields.test.tsx`. Forty tests passed in the combined run; two workflow-ownership tests exceeded their unchanged five-second timeout while checks ran concurrently, then passed in an isolated rerun without altering assertions or timeouts. Edit Configure and Preview no longer render Offering code; tests verify its original value survives readiness and save together with campus/date overrides and activation state. The configuration fields use equal desktop/tablet columns and full-width mobile cells. Shared-field default tests retain the create/clone code field and layout, and direct registration continues to omit Inquiry form. Focused TypeScript checking reported zero diagnostics across the four changed source/test files; scoped ESLint passed without warnings. Formatting, Student documentation validation and diff checks passed.

Authenticated localhost verification confirmed equal two-column academic/configuration rows at 1440×900 and 768×1024, single-column stacking and reachable bottom fields/footer at 390×844, absence of Offering code in Configure and Preview, and unchanged selected values after Preview/Back. No horizontal page overflow was observed. Screenshots are under `.artifacts/offering-edit-two-column/`; no Offering was saved or activated. Code-preservation save evidence is automated, not a live save/reload or deployment.

The later 2026-10-11 two-step edit simplification passed 39 tests across the eight suites listed in the earlier edit-drawer refinement below. Configure now combines academic identity and operational fields; Preview is the only subsequent step. Tests verify the cycle card follows the stepper, Campus/admission-window controls and informational/warning banners are absent, the shared Continue icon is present, required-field validation precedes readiness, selected labels survive Preview/Back, hidden campus/date overrides and activation state survive Preview/Save, inactive preparation remains allowed, active invalid readiness blocks saving, option errors expose Retry and failed validation cannot advance. Focused TypeScript reported zero diagnostics across the three changed source/test files; scoped ESLint passed without warnings.

Authenticated localhost checks covered Configure and Preview at desktop, tablet and mobile widths (1440×900, 768×1024, 390×844). The cycle card appeared below the stepper, no Campus/window controls or informational/warning banners were shown, Preview contained readable academic values and Ready status, Back retained selected labels and both footer buttons stayed grouped on the right. Mobile/tablet drawer scroll width equalled viewport width. Screenshots are under `.artifacts/offering-edit-two-step/`. No Offering was saved or activated during browser verification; hidden-value/save evidence comes from automated tests, not live save/reload or deployment.

The 2026-10-11 Offering edit-drawer refinement passed 35 tests across eight suites: `use-admission-offering-actions.test.tsx`, `admission-offering-edit-drawer.test.tsx`, `admission-offering-dialog.test.tsx`, `admission-offerings-add-action.test.tsx`, `admission-offering-workflow-defaults.test.tsx`, `admission-offering-model.test.ts`, `bulk-admission-offering-dialog.test.tsx`, and `use-bulk-admission-offering.test.tsx`. Coverage includes immediate opening without a table loader, detail failure/Retry, ignored late responses, latest-detail concurrency, background/section cards, heading help, dismissible notices without unlocking identity or bypassing readiness, retained configuration labels after Review/Back, and required-field feedback. The bulk inactive-preparation fixture now supplies the cycle required by the earlier explicit-selection change. Happy DOM printed remote-fetch teardown AbortError warnings; the run exited successfully with all 35 tests passing. Focused TypeScript checking reported zero diagnostics across 14 source/test files; scoped ESLint passed without warnings.

Authenticated localhost browser checks covered all three edit steps at 1440×900, 768×1024 and 390×844. Edit immediately displayed its local loading shell while table rows remained visible. Shared cards, heading info controls, dismissible identity/application/window notices, Ready review, retained form/definition labels after Back and reachable footer actions were checked. Mobile/tablet drawer width matched its scroll width. Screenshots are under `.artifacts/offering-edit-ui/`. No Offering was saved or activated; concurrency/save assertions are automated evidence, not live save/reload or deployment proof.

The 2026-10-11 explicit bulk cycle-selection follow-up passed 24 tests across the same seven focused suites listed below. Added coverage verifies required selection (with no automatic first-cycle default), three eligible cycles with an explicit second/third choice, exclusion of unpublished/closed/wrong-year results, cycle-load error/Retry, clearing the required-field error after selection, selected-cycle IDs in both Preview and Create, invalid-selection command guards, display-label search normalization, and configuration retention after clearing/reselecting or Preview/Back. Focused TypeScript passed with zero diagnostics across 11 source/test files; scoped ESLint passed with no warnings. Happy DOM printed remote-fetch teardown AbortError warnings, but the final run exited successfully with all 24 tests passing.

Authenticated localhost browser checks passed at 1440×900, 768×1024 and 390×844. The local data has one eligible published/open cycle; the multiple-cycle case was verified by automated tests, not newly created local cycles. Explicit selection, reopening the dropdown, required-error clearing, selected-cycle Preview, Back retention, custom-date bounds and clearing/reselecting back to cycle dates were checked. Class/workflow/form labels remained selected. Tablet/mobile menus wrapped without horizontal overflow and the Preview action remained reachable. Screenshots are `.artifacts/bulk-offering-cycle/desktop.png`, `tablet.png` and `mobile.png`. No offerings or cycles were created, activated or edited; this is local selection/preview/navigation evidence, not authenticated creation/save/reload or staging/production deployment proof.

The 2026-10-11 bulk Preview cleanup has 20 tests across seven focused suites: `bulk-admission-offering-dialog.test.tsx`, `bulk-admission-offering-preview.test.tsx`, `use-bulk-admission-offering.test.tsx`, `use-admission-offerings-screen.test.tsx`, `bulk-admission-offering-model.test.ts`, `bulk-admission-hierarchy-fields.test.tsx`, and `admission-offerings-add-action.test.tsx`. Run them with `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run <suite paths> --pool=threads --maxWorkers=1`. Coverage includes the shared background card, inactive-only bulk creation, class-specific and deduplicated shared messages, missing previews, activation-only preparation, server refusal without false success/close, safe retry, exact selected-cycle context when three published/open cycles exist, and visible workflow/form label retention after Preview and Back. Focused TypeScript passed with zero diagnostics across eight changed source/test files; scoped ESLint passed.

The final focused run passed all 20 tests across seven files. The dialog regression stubs icon rendering to avoid unrelated remote-icon requests; it uses the actual stepper, Formik, configuration fields and definition selectors.

Authenticated localhost checks passed at 1440×900, 768×1024 and 390×844: Classes 1–3 previewed as blocked duplicates with a disabled Create action, readable wrapped messages, no document horizontal overflow and reachable footer actions. Back retained the class selections and visible published-workflow/inquiry-form names, and repeat Preview preserved their configuration. Setup fields remain mounted but hidden and unavailable to keyboard/assistive navigation during Preview. No offerings were created or activated; this is preview/navigation validation, not deployment or authenticated creation/save/reload proof. Ready-to-create, server-refusal and retry paths have automated coverage rather than live creation evidence.

Current special-offering regressions cover workflow-owned Registration forms, type-scoped class availability, automatic bounded type-specific codes, Inquiry selectors only for inquiry-enabled routes, and selection across school levels. Admission type derives the route; Starts with is absent. Edit and clone preserve saved routing, including unused historical offerings, while used identity stays locked. Applications exposes permission-gated Start special registration for RTE, Management and Staff, with explicit cycle/type selection and paginated offerings. Backend tests must prove General fresh-direct rejection and special registration, replay, family and tenant/scope safety. The historical 2026-10-07 General-only results below predate and do not verify this change. Authenticated special creation/save/reload still requires the updated local API.

Authenticated local verification on 2026-10-07 selected Class 1 without narrowing away Class 9, then previewed and saved Class 2 (Primary) and Class 9 (Secondary) together. Both reloaded as inactive and Ready with generated codes `ADM-CLASS-2` and `ADM-CLASS-9`. Edit retained the Inquiry form; Applications had no Direct registration action. The bulk drawer also fit a 390 x 844 viewport without document overflow. These two local inactive QA offerings remain available for review; no stage/live deployment was performed. The 12 changed production files passed focused TypeScript checking; full-project TypeScript exhausted its 6 GB heap.

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

Permission unit tests must prove exact canonical action checks in every environment, including denied actions; no development or role-name bypass is permitted.

The 2026-09-15 focused Offering run passed 23 unit tests, both Playwright scenarios, focused ESLint,
Prettier, and diff checks. The full TypeScript run reaches ten unrelated Admission dialog call sites
that still pass the removed `hasUnsavedChanges` prop instead of `guardUnsavedChanges`; no Offering
error is reported.

## Admission routes, capacity, and counsellor checks (2026-09-25)

The combined focused frontend run passed 19/19 tests across class-capacity caching, offering configuration, applicant start, counsellor filtering and assignment, and managed-offer actions. Focused ESLint and Student documentation validation passed. Class capacity is displayed at inquiry and direct-registration offering selection as a warning-only signal; its source is the room allocation for the class, not a counsellor-entered number. An authenticated browser smoke reached the Applications list, direct-registration dialog, and New Inquiry form after the local API became available. The direct-registration dialog correctly showed that no open direct-registration offering exists for the signed-in school; selecting an Inquiry offering showed the unconfigured-capacity warning. A legacy offering whose name includes `RTE` was present in Inquiry choices because its stored Track and Entry Mode are both General/Inquiry, not because the Inquiry filter ignored Direct Registration. No live capacity/counsellor selection, applicant submission, or live deployment was exercised by this review.

## Simplified inquiry intake and routing checks (2026-10-04)

The focused run passed 41 tests across inquiry policy, validation, form rendering, duplicate handling, and the two intake editors; focused ESLint and Student documentation validation passed.
`admission-intake-setup-editor.integration.test.tsx` exercises actual editor controls, normalized save payloads, API-selected pool/fallback IDs, and failed-lookup retry without losing the draft.
Authenticated localhost browser verification loaded eligible staff in both routing fields, created a temporary setup with QR code as an allowed source, and reopened it with the same source, counsellor, and fallback selections.
The removed selectors and hidden requirement switches were absent; the source-detail helper was optional.
Desktop, 768px tablet, and 390px mobile drawer checks found no document-level horizontal overflow.
Full-project TypeScript remains blocked by eight diagnostics in untouched homework and Admissions test files; this change's files reported no diagnostics.
The all-module documentation gate remains blocked by unrelated Finance and Testing documentation issues; the Student gate passed.
No production deployment or complete live applicant journey was performed.

## Public inquiry link compatibility checks (2026-10-07)

The focused public-link drawer suite passed 26 cases covering period-dependent setup/form pairs, excluded unlinked setups, loading/error/empty guards, refresh without losing link details, period-change clearing, the reported generic `OfferingRequired` response, successful creation, and existing link actions. Focused lint and formatting passed; Student documentation validation passed. The all-module documentation gate still reports unrelated Testing and Finance issues.

Strict affected-source TypeScript validation passed with the project's theme and test augmentations included. The check excludes generated Next route declarations; validation using `next-env.d.ts` remains blocked by syntax diagnostics TS1161/TS1128 in `build/dev/types/routes.d.ts`. Full-project TypeScript was stopped during resource contention and is not a passing release gate.

Authenticated localhost browser checks verified missing-Offering guidance and disabled creation, compatible form/setup selections, successful link creation, and Active status after reload. The temporary QA link was then revoked. The drawer was checked at 390×844, 768×1024, and 1440×900; mobile and tablet had no horizontal drawer overflow. Staging acceptance remains unverified because the browser has no signed-in staging session; this local change has not been deployed.

## Credential-email and document-evidence checks

Credential-email UI, settings and API suites cover safe legacy defaults, serialized school choices, email/account validation, readiness/permission-denied requests, pending duplicate prevention, retry/error/loading states and case invalidation.
The current document checklist tests verify Offering workflow evidence actions and legacy fallback; staff override and waiver actions are absent from the current UI.
Browser acceptance additionally checks saved school settings after reload, authorized account requests, actual mailbox sending, mobile login, sibling preservation, exit revocation and responsive drawer actions.

## Student dashboard validation

Run from the frontend repository:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/screens/student/dashboard
node node_modules/eslint/bin/eslint.js src/screens/student/dashboard/*.ts src/screens/student/dashboard/*.tsx src/screens/student/dashboard/components/*.tsx src/screens/student/dashboard/hooks/*.ts src/redux/student/dashboard/*.ts --max-warnings 0
npm run ts
npm run docs:check
```

Twelve network-backed tests exercise real RTK Query, Redux, session and components: teacher order and destination links; absent exact grant; denied context; independent failed-section retry; immediate year-result clearing including graphs; GET-only refresh with preserved strength expansion; shared read counts and graph order; a restricted default workspace; forbidden graph/priority values; an incomplete queue on failure; true zero/empty graphs; and a verified personal view without staff queries. Decorative Iconify components are stubbed to avoid third-party TLS requests; service hooks and dashboard data flow remain real.

Final browser smoke uses the Codex in-app browser with the authenticated local app for actual empty/scoped data and isolated HTTP sample responses for non-empty graphs and alternate role layouts. Check desktop/mobile, dark theme, teacher/common/admin order, linked-account context, missing permissions, independent failures and actual hrefs. Sample responses do not establish live acceptance for other signed-in roles. Backend authorization and population tests are documented [there](../../../Shikshamitra-BE/docs/modules/student/testing.md#student-dashboard-validation).

On 2026-10-08 the full typecheck reports four unrelated errors in `e2e/fixtures/concession-type-form/main.tsx`, `e2e/fixtures/fee-category-readonly/main.tsx` and `src/components/custom-select/descriptions.test.tsx`.

## Decision workspace handoff validation (2026-10-10)

The focused frontend run passed 99 tests across Applications table state/columns, permissions and stale-data guards, Pipeline, phase-aware detail navigation, safe return URLs, and existing finalization/closure behavior. The final table refinements passed a further 18-test rerun. Affected-source TypeScript validation reported zero diagnostics across 17 task files; this is not a full-project typecheck.

Focused ESLint passed with zero warnings; formatting, diff checks and the frontend Student documentation validator passed. The backend Student documentation validator still reports pre-existing mojibake in its untouched `testing.md`; that broader documentation gate is not passing.

The backend workspace integration suite passed 17 scenarios covering entry into Admission decision before approval, removal from Pipeline counts/options, correction remaining in Applications, transition-history recovery, historical compatibility, server search/sort/pagination, contact/class projection, and denied user scope. Application, HttpApi and Host builds passed with incremental references and resource-safe single-worker compiler flags.

Authenticated localhost browser checks loaded the actual local API, confirmed the pre-decision Pipeline queue and finalized QA cases in Applications, and verified toolbar search, empty-search recovery, sorting, page size, detail/back context, and canonical redirect from an old Pipeline detail URL. Desktop 1440×900, tablet 768×1024 and mobile 390×844 checks found no document-level horizontal overflow; mobile View controls provide 44×44 touch targets. No real applicant decision was changed by the browser smoke. Staging, deployment and a complete live applicant journey are not established by these checks.

## Connected Applicant 360 UI validation (2026-10-10)

The focused seven-file regression run passed 111 tests covering the workspace, runtime form, managed stages, assessment, fee confirmation, decision and finalization. The final workspace, decision and review-summary rerun passed 41 tests. Coverage includes validation before Save & Next, failed-save retention, final-section submission, permission/busy guards, canonical Finance data, duplicate identity resolution, inline finalization cancellation, and independent review navigation for future stages.

Full-project `npm run ts` passed. Focused ESLint passed with zero warnings, and Student documentation validation passed.

Authenticated localhost browser checks verified the connected surface, submitted-form section switching, future-decision mutation guards, completed assessment history, the missing published Finance structure empty state, inline finalization identity blockers, cancellation and navigation recovery. Form, journey and finalization actions measured 30px. Desktop 1440×900, tablet 768×1024 and mobile 390×844 had no document-level horizontal overflow. Mobile journey selection collapses after choosing a stage; finalization actions remain visible in a sticky footer.

The browser used the existing light theme and local records. Editable-form save/failure behavior and fee selection with populated Finance data were verified through focused component tests. No admission decision, finalization or Finance data was changed. Staging/deployment and a complete live journey are not established by this UI verification.

### Form alignment and follow-up popover refinement (2026-10-10)

The four-file workspace/form/verification/follow-up regression passed 60 tests. After the responsive picker correction, the three directly affected suites passed all 28 tests again. Coverage includes scheduling payloads and concurrency stamps, busy/permission guards, draft retention after cancellation or a scheduling failure, successful popover closure, existing verification/correction commands, and the shared form-step scrollbar. Changed-file TypeScript validation reported zero diagnostics across seven files; focused ESLint and formatting passed. These are scoped checks, not a full-project typecheck or deployment acceptance.

Authenticated localhost checks exercised the actual MUI calendar/time selection and unsaved scheduling draft, desktop/tablet/mobile popovers, and completed-form section navigation at 1440 x 900, 768 x 1024 and 390 x 844. The mobile picker uses the theme breakpoint to open its contained mobile dialog; its document width remained 390px. The form navigation uses the shared SimpleBar scrollbar without document overflow. The available form was already completed, so active-form verification actions were covered by component tests rather than a live mutation. No reminder, answer, verification, admission decision or Finance record was saved by this UI check.

## Inline intake setup validation (2026-10-10)

Focused tests cover Edit/Archive-only desktop and mobile row actions, inline create/edit mounting and list restoration, source/pool checkbox multi-selection, preserved values through review edits, update payload stamps, unavailable staff validation, lookup retry and discard cancellation.
Real RTK Query tests verify the optional `counsellorOnly=true` lookup parameter and preserve the existing unfiltered request for other consumers.
Public-link tests cover published-form skeletons during initial, refresh and compatibility loading, retained routing selections, blocked submission and error retry.
The setup editor requests the canonical Admissions Counselor role filter for both pool and fallback using one lookup; backend role and scope checks are covered in the backend test suite.

The combined focused frontend run passed 56 tests; the final editor rerun passed 10 tests.
Affected-source TypeScript validation reported zero diagnostics across nine task files; focused ESLint passed with zero warnings, and formatting, diff checks and Student documentation validation passed.
The full-project typecheck was stopped under measured RAM pressure; this is not a full-project typecheck pass.
The all-module frontend docs validator reports 27 pre-existing structural/frontmatter issues under untouched `docs/testing/`; Student docs pass.

Authenticated Codex in-app browser checks against the existing localhost API verified desktop/mobile Edit-and-Archive-only actions, inline create/edit entry, source multi-selection, selected gray staff chips, review section Edit actions with retained values, discard protection and actual published-form loading status.
The stable form layout has no document overflow at 390, 768 and 1440 pixel widths; responsive measurements excluded a transient help tooltip.
After the local API was rebuilt and restarted, authenticated browser checks confirmed that both pool and fallback contain only the eligible Admissions Counselor option. A synthetic setup was created, reopened with its two sources and routing values intact, updated, and reopened again with the saved name and routing preserved; it was then archived. No existing setup was edited and no inquiry link was created.
Selecting an admission period showed the localized published-form loading status and disabled Create link until the compatible-form read completed; the loaded form field then replaced the skeleton. The unsaved link draft was discarded.
Earlier automatic approval review rejected API restart/start attempts; the later running build removed that runtime verification blocker. These checks establish localhost behavior, not staging or deployment acceptance.
Backend verification passed three staff-lookup integration regressions and five intake HTTP contracts; the isolated Host build passed.

## Optional intake and public-link routing (2026-10-10)

Focused frontend validation passed 59 distinct tests across public inquiry links, Offering readiness/dialog/workflow defaults, bulk Offering model/hierarchy and intake API wiring. The final public-link rerun passed 32 tests. Affected-source TypeScript validation reported zero diagnostics across 16 files; focused ESLint, formatting, diff and Student documentation checks passed.

Authenticated localhost browser checks confirmed the optional setup label and manual-assignment choice in Add Offering's bulk form, and the optional setup/help text in Create inquiry link. No Offering was saved during this browser check. Screenshots are `.artifacts/offering-optional-intake.png` and `.artifacts/inquiry-link-prepared.png`.

The requested actual link draft is named **Inquiry Link**, uses **General Admission**, the compatible **Inquiry UI verification 08 Oct · v1** form, Website source, no setup and no expiry. It has not been saved: the existing localhost API still runs the earlier build. The updated isolated Host build and local nullable-column migration are ready; API restart and actual-link save/reload/public-page verification remain pending. Automatic approval review previously rejected API start/restart, so the user was asked to restart the latest local build. These are local checks, not staging or deployment evidence.

## Finalized admission summary UI (2026-10-10)

The focused three-file regression passed 49 tests for the finalized summary, decision card and Applicant 360 workspace. Coverage includes actual finalizing actor display, missing/denied/loading/failed/stale Onboarding data, fee selection versus confirmation, skipped document stages, activation while Credentials provisioning remains pending, inline finalization completion, guarded navigation and keyboard tooltip disclosure. Focused lint passed and the affected-source TypeScript check reported zero diagnostics across 25 files; this is not a full repository typecheck.

Authenticated localhost checks used the existing finalized QA FiveStage Journey record and actual APIs. The summary displayed its class/year, Board/Medium, finalizing staff, division, GR/Roll numbers and activation; Continue onboarding opened the matching Student Setup row. The green success banner and visible heading guidance are removed, with guidance available in the handoff information icon. Desktop 1440x900, tablet 768x1024 and mobile 390x844 had no document horizontal overflow; the mobile information button is 44x44. Error/permission states were verified with component tests. No admission decision, finalization, Finance data or credentials were changed during browser checks. Screenshots are `.artifacts/admission-finalized-desktop.png`, `.artifacts/admission-finalized-tablet.png` and `.artifacts/admission-finalized-mobile.png`. Staging/deployment is not established by these local checks.

## Applicant 360 verification and inline assessment UI (2026-10-10)

The focused ten-file regression passed 119 tests across the verification panel, assessment panel and command hook, assessment action validation/permissions/dialog drafts/API contracts, fee selection and Applicant 360 navigation. Coverage includes direct Present/Absent, decimal marks, configured mark limits, non-scoring outcomes, reviewed concurrency stamps, duplicate-write locks, retained drafts on save/read failures, changed-attempt discard, shared labels, completed rows, denied actions, audited Cancel/Waive dialogs and exact Finance navigation access.

Affected-source TypeScript validation reported zero diagnostics across 15 files; focused ESLint, formatting and diff checks passed. This is not a full-repository typecheck or deployment check.

Authenticated localhost browser verification used the existing APP-2026-000013 case to check the real fee empty state and Check again. Existing applicants' assessment marks and admission decisions were not changed. Their assessment stages were already completed, so pending verification and pending/completed assessment layouts were checked separately with the actual shared table/components/theme and synthetic data in an ignored local visual harness; its callbacks do not call the API. Desktop 1440, tablet 768 and mobile 390 component checks had no document horizontal overflow; keyboard-contained scrolling exposed attendance, marks and Save on mobile. Command payloads and failure/permission behavior were verified by the automated regressions, not claimed as live assessment writes.

Screenshots are under `.artifacts/applicant-quick-actions-review/`: verification and assessment desktop/tablet/mobile, the completed assessment row, and the authenticated fee empty state. The harness is test-only and adds no application route or dependency. Staging acceptance and an authenticated synthetic assessment save/reload remain separate checks.

### Completed assessment history correction (2026-10-10)

The previous compact table change covered the active panel but missed the separate completed-stage history renderer. Selected completed stages now reuse the same table in read-only mode. The focused history, active panel and stage-selection regression passed 34 tests, including shared table rendering, saved session evidence, no editors/actions even when response capabilities allow them, nullable historical policy, denied access without a GET, empty evidence and unchanged lazy noncompact history. Affected-source TypeScript validation reported zero diagnostics across 17 files; focused ESLint and formatting passed.

Authenticated localhost verification used the user's existing APP-2026-000003 selected Entrance assessment. The completed table showed recorded Present attendance, 67 / 100 marks and Passed status. Desktop 1440x900 and mobile 390x844 had no document horizontal overflow; mobile keyboard scrolling exposed the marks within the common table scrollbar. Existing assessment data and admission decisions were not modified. Proof screenshots are `.artifacts/applicant-quick-actions-review/completed-assessment-fixed-desktop.png` and `completed-assessment-fixed-mobile.png`. These checks establish local behavior only.

## Applicant 360 More menu and activity drawer (2026-10-10)

The focused five-file regression passed 83 tests for the activity drawer, application follow-ups, counsellor assignment, existing applicant dialogs and Applicant 360 workspace. Coverage includes lazy and permission-scoped reads, combined history, note create/edit, ISO scheduling with the current inquiry stamp, Complete/Cancel with both stamps, read-only/no-inquiry states, source failures and retry, preserved drafts across type changes and failed saves, pending-save close/duplicate locks, custom counsellor action integration and existing workflow navigation. MSW checks establish command payloads and interaction guards rather than live persistence.

Authenticated localhost browser checks opened the original counsellor dialog through More, then the Notes & Follow-ups drawer on the active APP-2026-000013 case. The real MUI picker selected a date and time; scheduling remained disabled without a purpose and enabled with valid input. Switching Note/Follow-up retained both drafts, Keep editing preserved them, and closing required confirmation. Existing follow-up history loaded from the running API. Desktop 1440x900, tablet 768x1024 and mobile 390x844 had no document horizontal overflow; mobile uses a full-width drawer and the common custom scrollbar. Browser validation used unsaved QA draft text only; no note, follow-up, counsellor assignment, assessment or admission decision was saved.

Proof screenshots are `.artifacts/applicant-quick-actions-review/more-menu-desktop.png`, `activity-note-desktop.png`, `activity-follow-up-desktop.png`, `activity-tablet.png` and `activity-mobile.png`. Focused lint/formatting, affected-file TypeScript and documentation checks are recorded separately from whole-repository checks. These are local checks; authenticated save/reload, staging and deployment acceptance remain separate evidence.

## Admission Stage template layout (2026-10-11)

The five focused template, create/edit dialog, journey replacement, draft command and template drawer suites passed 42 tests. Coverage includes the two offered starting points, Standard admission's Assessment → Form → Document verification → Payment → Admission Decision graph, published form attachment to the second stage, four usual routes, blank preview counts, existing graph retention, replacement confirmation and failed-save guards. Affected-file TypeScript reported zero diagnostics across nine files; focused lint and the Student documentation gate passed.

Authenticated localhost browser checks at 1512×900 confirmed matching card heights (606.61 px), header counts and zero stepper top/bottom padding. At 390×844, the cards stacked and document width stayed at 390 px; Blank workflow showed zero stages/routes. The isolated `QA Standard Admission UI 11 Oct` Draft (`3a243c34-9549-eef9-435d-ce048cb2c429`) was created and reloaded with all five stages in order and four routes. Returning through the completed details step retained its published `Admission application · v1` form. This draft was not published. Proof images are `.artifacts/workflow-template-ui-11oct/desktop.png`, `mobile.png` and `saved-journey.png`. These establish local layout and draft persistence, not staging or full applicant-journey acceptance.

### Simplified next steps

Special-outcome creation and condition editing are removed from the active builder. Focused regression across eleven workflow, assessment-action and journey-closure suites passed, including the three simple-next-step cases: create a default route, edit its destination without condition fields, and preserve an existing special route as read-only with submission blocked. Coverage also includes stage-card/menu actions, duplicate default-route validation, existing condition preservation, Form/Assessment settings, retake actions and the required-reason withdrawal dialog/API. The read-only MUI select test asserts its actual `aria-disabled` contract. Focused lint passed and affected-file TypeScript reported zero diagnostics across 23 changed files.

Authenticated browser verification on the same QA Draft confirmed no Add special outcome action in stage cards, menus or the Next step settings card. The simplified drawer showed only the destination and completion guidance at 1512×900 and 390×844, without horizontal document overflow. Saving the existing normal path, saving the Draft and reloading retained five stages and four routes. No applicant result or withdrawal was changed; assessment runtime gating is unchanged. Proof images are `.artifacts/workflow-linear-ui-11oct/next-step-desktop.png`, `next-step-mobile.png` and `journey-desktop.png`.

### Fixed stage sequence

Drag-and-drop, reorder handles, keyboard reorder sensors and the draft reorder handler are removed from Admission Stage. The stage body uses an accessible ordered list sorted by saved `displayOrder`, with consecutive visible numbers. This presentation change preserves saved stage order and explicit next-step routes. The navigation, draft refresh and builder utility suites passed 22 tests, including out-of-order input rendered sequentially without mutating its data, absent drag controls and retained edit/history/empty/read-only actions. Focused lint passed and affected-file TypeScript reported zero diagnostics across 28 files.

Authenticated local browser checks on the same QA Draft at 1440×900, 768×1024 and 390×844 confirmed five stages in saved order, no reorder controls or draggable stages, and no document horizontal overflow. Proof images are `.artifacts/workflow-sequence-ui-11oct/desktop.png`, `tablet.png` and `mobile.png`. No workflow or applicant data was changed during these layout checks.

## Intake drawer and restore UI (2026-10-11)

Focused regression passed 43 tests across intake row actions, editor integration/schema, list/concurrency state and real RTK Query wiring. Coverage includes disabled archived Edit, active-usage Archive restrictions, restore confirmation, retry, stale-version reload, cache refresh, drawer entry with retained table context, multi-selects and unsaved Escape/discard protection. Four backend setup integration tests and five HTTP contract tests passed; the isolated Host build succeeded. Affected-source TypeScript validation reported zero diagnostics across six files; diagnostics outside those files were excluded, so this is not a full repository typecheck.

Authenticated in-app localhost checks confirmed right-side creation, equal desktop review-card heights (257.5 px each), natural stacking at 390 px, reachable footer actions, no document overflow, preserved draft after cancelled discard and the Restore confirmation. The unsaved verification draft was discarded and no existing setup was changed. Screenshots are `.artifacts/intake-drawer-review-desktop.png`, `.artifacts/intake-drawer-review-mobile.png` and `.artifacts/intake-table-actions.png`.

The running localhost API still exposes Archive but lacks the new Restore route (read-only GET probes returned 405 and 404 respectively). Restore persistence is verified through backend integration tests; browser save/reload remains pending a restart with the latest Host build at `.artifacts/intake-ui-restore/bin/ShikshaMitra.HttpApi.Host/debug/`. Staging and deployment were not verified.

## Guardian profile-email mismatch repair (2026-10-12)

The supplied 400 `Students.Onboarding.PortalAccountInvalid` came from provisioning: `relationship=guardian` selects the separate GuardianDetails profile, while the intended owner was Father. Focused guardian/profile/credential checks passed 19 tests; lint and the six-file affected-source TypeScript check passed. The broader three-file run passed 39/40: the unrelated `Admissions.FormMakerCheckerRequired` message expectation fails identically with the HEAD parser, confirmed by `.artifacts/guardian-parser-baseline.ts`. The first unrestricted worker run timed out before tests started; serialized fork workers completed the focused rerun.

After rebuilding/restarting the verified localhost Development Host without seed-grant changes, the authenticated case opened. Its Father profile email was blank and both pinned credential email rules were disabled. With explicit case-only user approval, the Father-email correction was submitted through the existing Records command; its review remains Pending (0/1). The visible diff changes only Father email. A different authorized reviewer is required by the existing Records policy; no approval bypass was performed.

The parent credential email rule was enabled only for APP-2026-000002 through the new audited case command. The refreshed UI reports parent email Blocked until the portal account is verified; Student email remains Disabled. No real identity was created and no credential email was requested; SMTP/inbox delivery remains unverified. The original user's Finance tab was untouched.

The final three UI suites cover owner selection, read-only saved contacts, scoped email corrections, approval/conflict feedback, permission guards, required reasons, retry, credential recovery and password-free staff UI. Affected-source TypeScript checks cover 11 files; this is not a full repository check. Focused lint passes. Local mobile review at 390×844 uses the same shared dialog as nearby Onboarding overrides and has no horizontal document overflow. Evidence: `.artifacts/guardian-email-correction-fe-tests.log`, `.artifacts/guardian-email-correction-lint.log`, `.artifacts/guardian-email-typecheck.log`, and screenshots under `.artifacts/guardian-email-ui/`.
