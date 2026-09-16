---
module: security
domain: permissions
content_type: Troubleshooting
status: canonical
updated_on: 2026-09-16
owner: frontend-team
audience: humans-and-agents
---

# Validate Security frontend changes

TL;DR: validate behavior inside the retained layout, not just the presence of the old dialogs.

Run from the frontend repository:

```sh
npx vitest run src/screens/security/role src/utils/permissions.test.ts src/components/progress-bar/progress-bar.history.test.tsx src/components/three-dots-actions/index.test.tsx
npm run ts
node scripts/docs/validate-docs.mjs --module security
npm run build
git diff --check
```

Run ESLint on touched TypeScript files.
The Security Regression PR and reusable deployment job runs the complete role test directory, shared exact-action/history/menu tests, lint, TypeScript, documentation validation, and production build.
Removing unknown future actions, restoring fixed CRUD lists, or bundling Student actions must fail these tests.

## Required behavior coverage

| Surface | Evidence required |
| --- | --- |
| Catalogue | Every action reachable exactly once, nested and flat catalogues, future/unmapped actions, provider eligibility |
| Existing panels | Hidden navigation does not block configuration; search does not reduce the bulk subtree |
| Visibility | Separate dialog, independent flags, nested settings, unmapped flags, no action mutations |
| Direct and inherited grants | Role/user grant and revoke round trips; removing direct grants leaves inherited access labelled |
| Save | Changed entries only, unchanged grants preserved, pre-save drift check, post-save verification |
| Drafts | Refetch errors, provider changes, explicit reload, duplicate submission, close during save |
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
The tests create isolated synthetic roles and use the fresh FullDemo HR Manager account with verified inherited grants.
They verify the account's full catalogue before and after the direct-grant round trip.
The existing identity-create role-membership path is not a reliable fixture and is not claimed as validated by this suite.
Browser setup does not fabricate compensation approvals, alter payroll, or activate ESI.

## Current evidence

The focused retained-layout behavior suite passes 46 tests in eight files.
Local evidence is `.artifacts/security-local/rc-0916-editor-unit-final.log`.
The final Security/HR/shared regression run passes 636 tests in 109 files; its existing happy-dom network/teardown warnings remain documented.
The final production build, standalone TypeScript check, and touched-file ESLint pass.
Evidence is recorded in the `rc-0916-permissions-final-*` logs under ignored local artifacts.
The five-browser acceptance run passes all 35 cases with zero failures, skips, retries, or flaky results.
Its final log is `.artifacts/security-local/rc-0916-permissions-final-browser.log`.
The JSON report is under ignored `e2e/security/.artifacts/security-browser/results.json`.
Authenticated Codex in-app confirmation verifies the retained Role/User layout, separate visibility, all five ESI actions, inheritance labels, focus return, and footer bounds at all three requested viewport sizes.
That confirmation is recorded in `.artifacts/security-local/rc-0916-permissions-final-codex.md`.
Do not substitute the previous unchanged-UI or withdrawn-editor browser results for those gates.

Use the authenticated Codex in-app browser for final visible confirmation.
The [backend validation matrix](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency-validation.md) records the final Passed, Failed, and Not run results.
Follow the [release runbook](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency-release.md) for publication, backup, environment verification, and reset sequencing.
