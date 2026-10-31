---
module: security
domain: permissions
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-30
owner: frontend-team
audience: humans-and-agents
---

# Validate Security frontend changes

## Visibility prerequisites and role shortcuts

Run the prerequisite logic and shared-editor tests with one worker, followed by the dedicated
desktop/mobile fixture and Role Management browser checks:

```sh
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/screens/security/role/visibility-prerequisites.test.ts src/screens/security/role/permission-visibility-prerequisite.test.tsx src/screens/security/role/permission-inline-editor.test.tsx src/screens/security/role/permission.test.tsx --pool=forks --maxWorkers=1
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/@playwright/test/cli.js test --config e2e/security/visibility-prerequisite.config.ts
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/@playwright/test/cli.js test --config e2e/security/role-management.config.ts
```

The tests cover inherited visibility, explicit user denial, module ancestors, alternate navigation
paths, provider-ineligible prerequisites, disabled controls, cancel without changes, and confirmed
visibility/action saves. Role shortcuts open the selected role's existing dialogs and retain
management permission guards. Complete the final smoke test in the Codex in-app browser.
The fixture contains synthetic records and does not validate deployed DDVS access.

## Academic navigation

`src/utils/academic-navigation-access.test.ts` covers every active Academic menu leaf, independent View and visibility grants, empty groups, first accessible landing, direct URLs, nested seating routes, legacy aliases, and unaffected non-Academic navigation.
Class Teacher Assignment, elective actions, syllabus question actions, Grade Entry, and Result Creation have focused allowed/denied action tests in their screen folders.

```sh
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/utils/academic-navigation-access.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism
node node_modules/@playwright/test/cli.js test --config e2e/academic/academic-permission-navigation.config.ts
```

The browser fixture uses production navigation and the Academic route layout with synthetic permissions.
It verifies denied direct access, immediate revocation, loading, nested seating access, both themes, and contained layouts at 390/768/1440 widths.
Finish with the Codex in-app browser.
Synthetic grants validate frontend behavior, not deployed role configuration or backend endpoint dependencies.

## Shared permission feedback

Run `permission-denied.test.ts`, `api-problem-details.permission.test.ts`, `service.permission-feedback.test.ts`, `normalize-permission-response.test.ts`, `service.auth-session.test.ts`, and `customQueryAndMutation.test.ts` with Vitest. Keep the broader `api-problem-details.test.ts` results explicit, including unrelated domain-message failures.
Cover JSON/ABP/RFC/legacy errors, empty and HTML 403 bodies, report blobs, specific scope/business messages, missing endpoint metadata, unchanged status/code data, current/stale authentication ownership, and no request-derived labels.
Run `node node_modules/@playwright/test/cli.js test --config e2e/security/shared-permission-feedback.config.ts` for real shared API/parser/toast/Snackbar behavior with synthetic responses. The fixture exercises actual HR, Transport, Library, and Academic hooks through automatic, manual, and legacy handlers; it also verifies duplicate notices, explicit suppression, close behavior, and nonpermission errors.
Finish with Codex in-app browser checks at desktop and narrow widths. These checks prove shared feedback behavior, not deployed access grants or acceptance of every application workflow.

TL;DR: validate permission mappings, override persistence, review/discard, and the responsive matrix using current evidence.

## Student three-action permission contract

The current backend registry groups profile workflows under Student List (32 feature groups, 109 unchanged action leaves). Run `student-record-menu-permissions.test.ts`, `student-record-permissions.test.ts` and `student-permission-actions.test.ts` to verify menu-only rows, complete bundled action coverage, unchanged navigation guards, partial grants, explicit denials and unsupported Delete operations.
The action identifier remains `Add`; the displayed label is Add/Update.
The October 30 final in-app browser check uses the real permission form with a disposable synthetic catalogue. Role and user editors omit all five extra profile rows; Delete targets four existing actions, Add/Update targets six, and View revocation includes its dependent actions (16 total). Hidden features disable Allow while retaining role Revoke and user Deny/Follow role. A six-action Deny save survives close/reopen; keyboard navigation skips disabled Allow, and a six-action Follow role save survives another reopen without changing visibility. Review/discard and the existing draft flow remain intact. Light/dark checks at 390/768/1440 widths show no document-level horizontal overflow. Saves affect only the synthetic fixture, not school grants or deployed role configuration. Browser evidence is `.artifacts/student-record-menu-browser/final-user-desktop.png`.

The final local Security regression run passes 253 tests across 33 suites, with full `npm run ts` and the configured Security ESLint scope passing. It includes route composition inventory, runtime Public Inquiry Links guards, actual user-row guards, hidden-feature override persistence, and structural deployment-workflow assertions. The static inventory follows rendered layout composition and rejects unused guards and sibling bypasses. The main-only deployment workflow now calls the reusable Security Regression gate before building. Earlier four Security failures and the route-inventory failure are resolved; this is local verification, not a GitHub Actions or deployment run.

A later whole-checkout typecheck found seven unsupported Testing Library `exact` query options in three concurrently added Student contact tests. Removing those options preserves exact accessible-name matching for string names. The three suites pass 37 tests and their scoped lint passes; no production behavior changed in this follow-up.

```sh
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/screens/security/role src/utils/permissions.test.ts src/components/progress-bar/progress-bar.history.test.tsx src/components/three-dots-actions/index.test.tsx src/constants/student-record-menu-permissions.test.ts src/constants/student-record-permissions.test.ts src/constants/student-route-permissions.test.tsx src/screens/security/user/user-management-guards.test.tsx --pool=forks --maxWorkers=1 --no-file-parallelism
npm run ts
```

## Login and session redirect regression (2026-10-16)

The global loader previously ran private verification on public pages and signed out after every bootstrap failure. A red regression run reproduced that behavior (16 failed / five passed before the loader fix). Because Auth.js sign-out broadcasts across tabs, a public-page failure could also invalidate an open staff workspace. The original browser incident did not retain its failing HTTP response, so its exact transport status is not claimed.

The recovery suite covers anonymous/valid/invalid sessions on both public route families, context and permission failures, explicit retry, malformed responses, genuine 401/inactive-school invalidation, token/tenant transitions, A-to-B-to-A races, employee-response ownership, and cancellation on public navigation/unmount. Guard tests verify fail-closed retry UI, unchanged host/school/setup landing, and same-user tenant changes. Cache/service regressions preserve current-session invalidation while rejecting stale auth side effects; refresh and credential-request regressions preserve the existing policies.

Run these focused files with one worker on memory-constrained Windows workstations:

```sh
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/redux/auth src/redux/session-cache.test.ts src/redux/service.auth-session.test.ts src/components/auth-route-layout/index.test.tsx src/components/normal-route-layout/index.test.tsx src/redux/host-tenants/session-context.test.ts src/redux/host-tenants/workspace-landing.test.ts src/auth-token.test.ts src/auth-request.test.ts src/utils/permissions.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism
```

The authenticated localhost browser check verified an existing-session login landing, public inquiry alongside the staff tab, staff-page reload, explicit logout, fresh DDVS sign-in, and return to the protected Public inquiry links table. No applicant, permission, or school-setting mutation was submitted. Failure injection is covered by component/request fixtures rather than live API disruption. Staging/production acceptance and a full-repository build are separate gates.

Final focused validation passed 147 tests across 20 files: 30 loader/recovery cases, 20 cache/service/token-refresh cases, and 97 route/slice/credential/permission and existing Academic/HR transport cases. Strict ESLint passed all 22 changed source/test files with repository ignores disabled; the final recovery-test additions passed a separate one-file refresh. Focused TypeScript passed 14 session source/test files with the project theme and Vitest matcher setup included. This does not certify unrelated repository files. Security/Student documentation and scoped whitespace checks passed. Browser screenshots, the scoped typecheck runner and regression log are in `.artifacts/session-redirect-20261016*`.

## Role deletion

`role-delete-dialog.test.tsx` drives the production dialog and RTK Query mutation with HTTP fixtures.
It verifies an actionable 409 reason, retained role/dialog, retry success, pending-request locks and cancel after failure.
The shared query wrapper owns the error toast; the dialog preserves the error inline and emits success before closing so immediate unmounting cannot suppress feedback.

```sh
npx vitest run src/screens/security/role/role-delete-dialog.test.tsx src/redux/customQueryAndMutation.test.ts
```

For browser validation, use the production dialog/client with synthetic authentication and real ABP endpoints backed by a disposable local database.
Check assigned-role rejection, archived-employee rejection, unused-role deletion, retry/cancel and keyboard focus in both themes and narrow viewports.
Do not delete deployed school roles to test this flow.

## Permission editor checks

`permission-bulk-state.test.ts` verifies complete module/submodule traversal, duplicate mappings, role/user provider eligibility, missing catalogues, exact Statutory Schemes revocation boundaries, and preservation of unrelated and visibility grants.
Run its focused suite with the existing grouping tests:

```sh
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/screens/security/role/permission-bulk-state.test.ts src/screens/security/role/account-settings-permissions.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism
```

`e2e/security/permission-bulk.spec.ts` renders the production permission form and API client with a loopback-only synthetic catalogue.
It checks Grant all, Revoke all and user Follow role at all-module, module, submodule, nested-group and feature scopes, including filtered/collapsed descendants, exact eligible payloads and save/reopen persistence.
It also checks keyboard activation, accessible permission descriptions and hover tooltips without visible status lines, WCAG AA accessibility in both themes, control sizes and contained scrolling at 390/768/1440 widths.
The fixture disables hot reload so unrelated workspace edits cannot interrupt a permission workflow.

```sh
npx playwright test --config e2e/security/permission-bulk.config.ts
```

Finish with the Codex in-app browser when available; synthetic API saves do not establish deployed account access.

`institute-setup-permissions.test.ts` covers Shift Management and Academic Setup action discovery for both Role and User providers, independent visibility flags, bulk action names, and missing catalogues.
`e2e/security/institute-setup-permissions.spec.ts` uses the production permission form/client with a synthetic network catalogue. It checks all four existing actions, exact changed-only Edit saves, reload persistence, keyboard selection, accessibility, both themes and 390/768/1440 widths. Backend `PermissionConsistencyApi_Tests` separately verifies the real ABP catalogue and role/user override round trips. Finish with a read-only local Admin DDVS check in the Codex in-app browser; synthetic writes do not prove deployed acceptance.

```sh
npx playwright test --config e2e/security/institute-setup-permissions.config.ts
```

Run from the frontend repository:

```sh
npx vitest run src/screens/security/role src/utils/permissions.test.ts src/components/progress-bar/progress-bar.history.test.tsx src/components/three-dots-actions/index.test.tsx
npm run ts
node scripts/docs/validate-docs.mjs --module security
npm run build
git diff --check
```

Run ESLint on touched TypeScript files.
Run these checks locally before merging feature work.
The deployment workflow invokes Security Regression before build and deployment on `main`.
The Security Regression workflow remains reusable-only, and both the caller and called job guard `refs/heads/main`.
The September 17 staging reference uses compact grouped controls, not individual backend action tiles.
Tests preserve the staging Student bundles and Accounts Settings exceptions while verifying the unchanged server permission IDs.

## Required behavior coverage

| Surface | Evidence required |
| --- | --- |
| Catalogue | Preserve the full response and provider eligibility; submit only changes from mapped controls |
| Matrix | Existing grouped mappings; sibling alignment and consistent indentation for nested groups and features; cards below 1200px, including 900px, and table at 1200px; Feature stays pinned left during table horizontal scrolling; opaque sticky row backgrounds and headers above scrolling content; repeat navigation stays selected; search/collapse never edits grants; inline focus returns to the opener |
| Bulk actions | Separate table Bulk actions column pinned right with direct controls visible during horizontal scrolling; card controls beneath the feature name; 44px selectors and bulk buttons below 1200px and 32px at or above it; compact segmented styling with regular-weight labels and the same 0.12 primary/error/info tints as inline Allow, Revoke/Deny and user Role choices; disabled bulk actions remain neutral; all scopes include hidden/collapsed descendants; deduplicate and exclude ineligible names; preserve neighboring/unmapped grants and separate visibility |
| Visibility | Separate dialog, constants-only modules and nested flags, no API-only rows, missing catalogue entries disabled, no action mutations |
| Direct and inherited grants | Role revoke removes direct grants; user Revoke all persists Deny over role grants; Follow role removes user overrides; role and user saves round-trip through verification |
| Statutory Schemes | View/Edit/Delete controls, five-action Edit group including ConfigureCalculation when present, unavailable Delete disabled, provider restrictions, hidden exact-namespace actions revoked or reset with Follow role, neighboring grants preserved |
| Save | Changed entries only, unchanged grants preserved, pre-save drift check, post-save verification |
| Drafts | Review every changed entry, discard without writes, refetch errors, provider changes, duplicate submission, close during save |
| Browser | Keyboard operation, focus return, dirty Cancel/Escape/history, failed reads/writes, bounded scrolling and 44px actions |

The unchanged API has no compare-and-swap token.
Pre-save drift checks and verified writes do not guarantee conflict-free simultaneous administrator updates.

## Local browser runner

```sh
npx playwright test --config e2e/security/permission-consistency.config.ts
```

The runner requires `SECURITY_LOCAL_WRITES=1` and explicit loopback-only `SECURITY_BROWSER_URL` and `SECURITY_API_URL`.
Supply the synthetic administrator password through `SECURITY_ADMIN_PASSWORD`.
Use an isolated, freshly seeded FullDemo database and local mail sink.
Never point the runner at DDVS staging or a production database.

Each browser project covers Chromium, Firefox, WebKit, mobile Chrome emulation, or mobile Safari emulation.
Round trips and retained-dialog smoke cover 390x844, 768x1024, and 1440x900.
Failure/loading/history coverage is an additional case per browser project.
The tests create isolated synthetic roles and use a synthetic HR Manager account with verified inherited grants.
They restore the exact initial direct user grant in a finally block, so an existing local fixture is supported.
The complete Statutory Schemes user-revocation test restores all five original direct grants in a finally block and verifies the full catalogue afterward.
They verify the account's full catalogue before and after the direct-grant round trip.
The existing identity-create role-membership path is not a reliable fixture and is not claimed as validated by this suite.
Browser setup does not fabricate compensation approvals, alter payroll, or activate ESI.

## Evidence for the approved matrix

### Visibility bulk controls

`src/screens/security/role/visibility-bulk-state.test.ts` covers mapped module/descendant targeting, deduplication, absent catalogue entries, provider eligibility, and exclusion of API-only flags and action permissions.
`e2e/security/visibility-bulk.spec.ts` uses the real shared form and synthetic API fixture to check selected-module and all-module controls for roles and users, search-independent updates, exact changed-only save/reopen, draft restoration, keyboard activation, both themes, responsive containment, and WCAG AA checks.

```sh
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vitest/vitest.mjs run src/screens/security/role/visibility-bulk-state.test.ts src/screens/security/role/permission-bulk-state.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism
node node_modules/@playwright/test/cli.js test --config e2e/security/permission-bulk.config.ts
```

The shared bulk-action browser configuration includes the visibility cases at desktop and phone widths, with readability cases also at tablet width. Finish with a Codex in-app browser check against the fixture; synthetic evidence does not validate DDVS role configuration or live backend authorization.

### Matrix validation

The user approved the matrix on October 9. It replaces the September 17 presentation while preserving grouped mappings.
Legacy switch-component tests still validate their helpers but do not prove the new workspace renders correctly.
Run the current matrix entrypoint, form integration, shared table, and inheritance browser suites.
Record current results and unrelated baseline failures in ignored `.artifacts`.
Use the authenticated Codex in-app browser for final visible confirmation after automated checks.

## Permission inheritance regression

`src/screens/security/role/permission-user-result.test.tsx` checks that explicit user Allow/Deny results take precedence in the visible badge while preserving the role default caption, including visibility and partial grouped access.
The inheritance-values browser case checks these separate results in both themes and at desktop, tablet, and phone widths.

`src/screens/security/role/permission-inheritance.test.tsx` drives the real form, RTK Query client, and save verification with network fixtures.
Its eight cases cover editable role defaults, Deny persistence, Allow removal through Follow role, separate visibility, role/provider restrictions, multiple-role union, refreshed defaults, and dependency review/discard without writes.
The loopback-only browser fixture renders the production form and client with synthetic HOD/users and in-memory API responses.
It does not use school credentials or change school data.

```sh
npx playwright test --config e2e/security/permission-inheritance.config.ts
```

The browser suite covers default states, direct single-click changes, repeat-choice no-ops, repeat navigation, Allow/Deny persistence through role edits, Follow role, verified save/reopen, keyboard operation, compact 32px controls at widths of 1200px and above and 44px controls below 1200px, WCAG AA checks, and independent visibility at desktop, tablet, and mobile sizes.
It also checks wheel scrolling in navigation and permission lists for Role/User Module Permission and Set Module Visibility, with the footer remaining reachable and no permission writes.
The draft tests distinguish Deny from Follow role during save verification, preserve dirty drafts, reject override/provider drift, and submit only changed entries.
Use the same fixture in the Codex in-app browser for final visible checks when school credentials are unavailable.
Synthetic evidence does not prove the role membership or grants of a deployed Akshay Patel account.
The backend's safe seeding, exact API authorization, atomic batch validation, and tenant boundaries remain mandatory.
