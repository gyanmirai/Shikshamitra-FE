---
module: security
domain: permissions
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-08
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
Run these checks locally before merging feature work.
The deployment workflow does not invoke Security Regression or run tests on merge.
The optional Security Regression workflow remains reusable-only, with a `main` guard and no automatic caller.
The September 17 staging reference uses compact grouped controls, not individual backend action tiles.
Tests preserve the staging Student bundles and Accounts Settings exceptions while verifying the unchanged server permission IDs.

## Required behavior coverage

| Surface | Evidence required |
| --- | --- |
| Catalogue | Preserve the full response and provider eligibility; submit only changes from mapped controls |
| Existing panels | Staging navigation groups and View/Add/Delete controls; expansion never grants; bulk operations include collapsed descendants |
| Visibility | Separate dialog, independent flags, nested settings, unmapped flags, no action mutations |
| Direct and inherited grants | Role/user grant and revoke round trips; removing direct grants leaves inherited access effective |
| Statutory Schemes | View/Edit/Delete controls, four-action Edit group, unavailable Delete disabled, partial and undisplayed direct grants fully revoked, provider restrictions and unrelated grants preserved |
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
The tests create isolated synthetic roles and use a synthetic HR Manager account with verified inherited grants.
They restore the exact initial direct user grant in a finally block, so an existing local fixture is supported.
The complete Statutory Schemes user-revocation test restores all five original direct grants in a finally block and verifies the full catalogue afterward.
They verify the account's full catalogue before and after the direct-grant round trip.
The existing identity-create role-membership path is not a reliable fixture and is not claimed as validated by this suite.
Browser setup does not fabricate compensation approvals, alter payroll, or activate ESI.

## Evidence for the staging restoration

Staging at `https://app.gyanmirai.in/security/role` is the visual and grouped-control reference.
Inspect it without saving live permission changes.
Local browser tests cover grouped role Grant All/Revoke All with save/reopen verification, direct user grants with role inheritance, separate dialogs, and failed-save/draft behavior.
The individual-action tile assertions from the prior release are superseded by the user's September 17 correction.
Do not reuse the earlier 35-case report as evidence for this restoration.
Record current results and any baseline failures in the ignored `.artifacts` directory.

Use the authenticated Codex in-app browser for final visible confirmation after automated checks.
The backend's safe seeding, exact API authorization, atomic batch validation, and tenant boundaries remain mandatory.
