---
module: frontend-docs
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-07-31
owner: frontend-team
audience: humans-and-agents
---

# Find frontend module documentation

TL;DR: frontend module docs use a compact structure for routes, clients, workflows, and validation.
Start from this page when you need the canonical frontend doc for a documented module.

## Module docs

Use this table before searching older docs.

| Module    | Canonical index                                   |
| --------- | ------------------------------------------------- |
| Dashboard | [docs/dashboard/README.md](./dashboard/README.md) |
| Finance   | [docs/finance/README.md](./finance/README.md)     |
| HR        | [docs/hr/README.md](./hr/README.md)               |
| Library   | [docs/library/README.md](./library/README.md)     |
| Student   | [docs/student/README.md](./student/README.md)     |

## Standard

New frontend module docs should follow [module-docs-standard.md](./module-docs-standard.md).
Do not keep old plans, generated notes, or phase docs under `docs/`.

## Interface design

Use [DESIGN.md](../DESIGN.md) for the canonical page, table, tab, loader, responsive, state, accessibility, and validation contracts.

## Validation

Run this command before handing off frontend docs changes:

```powershell
npm run docs:check
```

Run this focused check for HR-only docs changes:

```powershell
npm run docs:hr:check
```

The validator checks required files, README handoff sections, frontmatter, links, source paths, stale dates, and removed doc structures.
