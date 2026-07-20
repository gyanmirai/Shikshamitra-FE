# Agent / contributor guide

ShikshaMitra frontend is a multi-tenant school operating UI built with Next.js, React, TypeScript, Redux Toolkit Query, and MUI.

## Start here

1. [docs/README.md](docs/README.md) is the frontend documentation map.
2. [docs/module-docs-standard.md](docs/module-docs-standard.md) is the frontend module docs standard.
3. Run commands from the `Shikshamitra-FE` repo root.
4. If you opened `C:\Repo\ShikshaMitra`, move into `C:\Repo\ShikshaMitra\Shikshamitra-FE` before using git.

## Repository layout

| Area | Path |
|---|---|
| App routes and screens | `src/screens/` |
| Redux and API clients | `src/redux/` |
| Shared UI and utilities | `src/components/`, `src/utils/` |
| E2E tests | `e2e/` |
| Module docs | `docs/<module>/` |
| Docs validators | `scripts/docs/` |

## Commands

```bash
npm run dev
npm run ts
npm run build
npm run docs:check
npm run docs:hr:check
```

Use focused unit, lint, and E2E commands when the touched module already has them.

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
