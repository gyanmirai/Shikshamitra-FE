---
name: shikshamitra-module-docs
description: Use when creating, reviewing, or updating ShikshaMitra module documentation across frontend or backend repos.
---

# ShikshaMitra Module Docs

Use this skill for compact, source-owned module documentation.

## Workflow

1. Confirm the real repo root before editing.
2. Read the module `README.md` and the module docs standard before changing docs.
3. Trace source code first.
4. Do not invent routes, API contracts, permissions, entities, database structures, or workflows.
5. Keep frontend and backend ownership separate.
6. Link to the other repo when needed instead of copying the same facts.
7. Keep each page focused on one job.
8. Prefer compact tables over paragraphs.
9. Mark partial, inactive, or commented surfaces clearly.
10. Use `references/` only for active deep notes.
11. Remove placeholder reference pages, old plans, generated exports, and phase notes.

## Frontend docs

Frontend module docs live under `docs/<module>/`.
They own routes, visible menu wiring, clients, adapters, cache behavior, UI workflows, browser checks, and frontend validation.

Use these active pages:

| Page | Job |
|---|---|
| `README.md` | Route humans and agents to the right frontend page |
| `routes.md` | Map visible routes, menu ownership, permission gates, and inactive surfaces |
| `clients.md` | Map API clients, adapters, request shapes, cache tags, and backend ownership |
| `workflows.md` | Trace screen-level user flows and integration effects |
| `testing.md` | Name docs, type, unit, lint, contract, and browser checks |

Run:

```bash
npm run docs:check
```

## Backend docs

Backend module docs live under `docs/modules/<module>/`.
They own product behavior, API contracts, permissions, errors, domain invariants, data integrity, and backend validation.

Use these canonical pages:

| Page | Job |
|---|---|
| `README.md` | Route humans and agents to the right backend page |
| `product.md` | Explain shipped behavior, rules, partial surfaces, and data integrity |
| `api.md` | Map endpoint families, permissions, request conventions, and errors |
| `architecture.md` | Locate source paths, ownership boundaries, and implementation rules |
| `workflows.md` | Trace operational flows and integration effects |
| `testing.md` | Name focused tests, docs checks, and acceptance gates |

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/docs/validate-docs.ps1 -AllModules
```
