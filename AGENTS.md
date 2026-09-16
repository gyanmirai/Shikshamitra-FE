# Agent / contributor guide

ShikshaMitra frontend is a multi-tenant school operating UI built with Next.js, React, TypeScript, Redux Toolkit Query, and MUI.

## Start here

Before changing permissions, navigation guards, identity, scope, or security-related seeders, read [the canonical backend security standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md).
Follow its mandatory checklist and [frontend Security documentation](docs/security/README.md).
Require the Security Regression PR job and review incidental permission changes and reverts explicitly.
For the security-permission-consistency release, preserve the existing Role and User UI, including separate Module Permission and Set Module Visibility dialogs.
Do not reintroduce the catalogue-editor redesign without explicit approval.
The user approved behavior fixes within that layout: render the full backend catalogue, toggle exact independent actions, include hidden/collapsed entries in bulk operations, and distinguish direct from inherited grants.
Preserve drafts and verify changed-only saves through the shared permission form.
Do not restore fixed CRUD lists or Student/Finance action bundles to imitate the old behavior.

1. [DESIGN.md](DESIGN.md) is the canonical frontend interface contract.
2. [docs/README.md](docs/README.md) is the frontend documentation map.
3. [docs/module-docs-standard.md](docs/module-docs-standard.md) is the frontend module docs standard.
4. Run commands from the `Shikshamitra-FE` repo root.
5. If you opened `C:\Repo\ShikshaMitra`, move into `C:\Repo\ShikshaMitra\Shikshamitra-FE` before using git.

Before adding or changing a frontend route, screen, API workflow, or shared component, read the applicable section of `DESIGN.md`.
Configure new module and feature paths in `src/constants/` first, then add the App Router entry under `src/app/` and the owning screen under `src/screens/`.
Use the existing shared component or MUI component before creating a local primitive, use theme palette tokens instead of hardcoded colors, and serialize date-time payloads as `DateTimeOffset`-compatible ISO 8601 values.
When no suitable project component exists, consult [Minimal UI components](https://minimals.cc/components) and adapt the pattern to this repository’s theme, accessibility, routing, and state rules.

## Finance work (mandatory)

Before planning, implementing, reviewing, or testing any Finance UI/client behavior—or any Student, Admission, Transport, Hostel, Library, HR/Payroll, Dashboard, Notification, or Report change that creates, changes, settles, reverses, exports, or displays money—read **[the Finance Engineering Constitution](../Shikshamitra-BE/docs/modules/finance/references/constitution.md)**. Backend permission constants and contracts are the security and behavior source of truth; frontend menu, route, page, action, and API guards must match them exactly. Existing aliases or mismatches are migration debt, not a precedent to copy.

## Repository layout

| Area                    | Path                            |
| ----------------------- | ------------------------------- |
| App routes and screens  | `src/screens/`                  |
| Redux and API clients   | `src/redux/`                    |
| Shared UI and utilities | `src/components/`, `src/utils/` |
| Interface design        | `DESIGN.md`                     |
| E2E tests               | `e2e/`                          |
| Module docs             | `docs/<module>/`                |
| Docs validators         | `scripts/docs/`                 |

## Commands

```bash
npm run dev
npm run ts
npm run build
npm run docs:check
npm run docs:hr:check
```

Use focused unit, lint, and E2E commands when the touched module already has them.

## Academic Playwright workflow

When creating or updating Academic module automation:

1. Read `docs/testing/module-inventory.json`.
2. Read `tests/catalog/academic.yaml`.
3. Update the catalogue before adding or changing tests.
4. Run focused Academic commands first, such as `npm run test:e2e:academic:smoke -- --list`.
5. Classify failures with `docs/testing/BUG_CLASSIFICATION_POLICY.md`.
6. Generate reports with `npm run test:e2e:all-reports`.
7. Never weaken assertions, skip tests without a tracked reason, update snapshots automatically, or expose secrets.

## Documentation practice

- Frontend docs own routes, screen folders, client wiring, cache behavior, browser workflows, and frontend validation.
- Backend docs own product rules, endpoint contracts, permissions, domain invariants, errors, and data integrity.
- Link backend docs instead of copying backend behavior.
- Each documented frontend module keeps five active pages: `README.md`, `routes.md`, `clients.md`, `workflows.md`, and `testing.md`.
- Use `references/` only for active deep notes that are too detailed for the five active pages.
- Do not add placeholder reference pages, generated exports, old plans, or phase notes.
- Keep one page to one job.
- Prefer compact tables over long prose.
- Mark partial or inactive routes clearly.

## Git hygiene

- Check state with `git status --short --branch` before editing.
- Do not revert user changes unless explicitly asked.
- Keep generated Playwright, build, auth, and local tool artifacts out of commits.
- Prove ignore behavior with `git check-ignore -v <path>` when artifact hygiene is part of the task.
- Run `git diff --check` before handoff.

## Definition of done

- The change follows existing route, client, and component patterns.
- The relevant docs and source paths agree.
- The focused validation commands pass or the remaining blocker is stated.
- When browser validation is part of the task, automated checks may run first, but the final browser smoke test must be performed in the Codex in-app browser with `browser:control-in-app-browser` unless the user explicitly requests another browser.
- The final diff contains only intentional source, docs, workflow, or test changes.
