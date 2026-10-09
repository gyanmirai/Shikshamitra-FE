---
module: security
domain: permissions
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-09
owner: frontend-team
audience: humans-and-agents
---

# Validate Security frontend changes

TL;DR: validate permission mappings, override persistence, review/discard, and the responsive matrix using current evidence.

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
| Matrix | Existing grouped mappings; repeat navigation stays selected; search/collapse never edits grants; inline focus returns to the opener |
| Visibility | Separate dialog, independent flags, nested settings, unmapped flags, no action mutations |
| Direct and inherited grants | Role/user grant and revoke round trips; removing direct grants leaves inherited access effective |
| Statutory Schemes | View/Edit/Delete controls, four-action Edit group, unavailable Delete disabled, provider restrictions and unrelated or undisplayed grants preserved |
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

The user approved the matrix on October 9. It replaces the September 17 presentation while preserving grouped mappings.
Legacy switch-component tests still validate their helpers but do not prove the new workspace renders correctly.
Run the current matrix entrypoint, form integration, shared table, and inheritance browser suites.
Record current results and unrelated baseline failures in ignored `.artifacts`.
Use the authenticated Codex in-app browser for final visible confirmation after automated checks.

## Permission inheritance regression

`src/screens/security/role/permission-inheritance.test.tsx` drives the real form, RTK Query client, and save verification with network fixtures.
Its eight cases cover editable role defaults, Deny persistence, Allow removal through Follow role, separate visibility, role/provider restrictions, multiple-role union, refreshed defaults, and dependency review/discard without writes.
The loopback-only browser fixture renders the production form and client with synthetic HOD/users and in-memory API responses.
It does not use school credentials or change school data.

```sh
npx playwright test --config e2e/security/permission-inheritance.config.ts
```

The browser suite covers default states, direct single-click changes, repeat-choice no-ops, repeat navigation, Allow/Deny persistence through role edits, Follow role, verified save/reopen, keyboard operation, compact 32px desktop controls and 44px touch controls, WCAG AA checks, and independent visibility at desktop, tablet, and mobile sizes.
It also checks wheel scrolling in navigation and permission lists for Role/User Module Permission and Set Module Visibility, with the footer remaining reachable and no permission writes.
The draft tests distinguish Deny from Follow role during save verification, preserve dirty drafts, reject override/provider drift, and submit only changed entries.
Use the same fixture in the Codex in-app browser for final visible checks when school credentials are unavailable.
Synthetic evidence does not prove the role membership or grants of a deployed Akshay Patel account.
The backend's safe seeding, exact API authorization, atomic batch validation, and tenant boundaries remain mandatory.
