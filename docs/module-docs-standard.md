---
module: frontend-docs
domain: standard
content_type: Reference
status: canonical
updated_on: 2026-07-08
owner: frontend-team
audience: humans-and-agents
---

# Structure frontend module documentation

TL;DR: each documented frontend module should have five active pages and one optional reference folder.
This keeps first-read docs focused and avoids stale material.

## Required structure

Use this structure for each documented frontend module:

```text
docs/<module>/
  README.md
  routes.md
  clients.md
  workflows.md
  testing.md
  references/        # optional, only when active deep notes exist
    <topic>.md
```

## File responsibilities

Each active file has one job.

| File | Content type | Job |
|---|---|---|
| `README.md` | Landing | Route humans and agents to the right frontend doc with required handoff sections |
| `routes.md` | Reference | List visible routes, menu ownership, permission gates, and inactive surfaces |
| `clients.md` | Reference | Map Redux Toolkit Query clients, adapters, contracts, and backend ownership |
| `workflows.md` | How-to | Trace screen-level user flows and integration effects |
| `testing.md` | Troubleshooting | Name docs, unit, contract, type, lint, and browser checks |

## Supporting folder

Use `references/` only when the five active pages need deeper supporting detail.
Do not add empty `references/README.md` placeholders.
A `references/README.md` is allowed only when it indexes active reference files.

## Ownership boundary

Frontend docs own route shape, screen folders, client wiring, cache behavior, and browser workflows.
Backend docs own product rules, endpoint contracts, permissions, errors, domain invariants, and data integrity.
Link backend docs instead of copying backend behavior.

## Metadata

Each active doc must use this frontmatter:

```yaml
---
module: <module>
domain: <domain>
content_type: Landing | Reference | Tutorial | How-to | Troubleshooting | Conceptual
status: canonical
updated_on: YYYY-MM-DD
owner: frontend-team
audience: humans-and-agents
---
```

## README handoff sections

Each module `README.md` must include these sections:

| Section | Purpose |
|---|---|
| `TL;DR` | State what the frontend doc set covers |
| `Read order` | Route readers through active frontend pages |
| `Source of truth` | Name current route, screen, client, test, and backend paths |
| `For agents` | Map common questions to first files |
| `Validation` | Name local docs and hygiene commands |

## Writing rules

Write for an engineer or agent joining mid-task:

- Start every page with one TL;DR paragraph
- Use sentence-case headings
- Keep one sentence per source line
- Keep each page focused on one job
- Prefer tables for route and client maps
- Name source paths and commands exactly
- Mark inactive routes and partial surfaces clearly
- Remove old plans instead of keeping them in `docs/`

## Validator expectations

The frontend docs validator checks this structure.

| Check | Expected result |
|---|---|
| Required files | The five active files exist |
| Root active files | Only the required files stay at a module root |
| Frontmatter | Active docs have required metadata |
| Content type | `content_type` uses a supported value |
| Freshness | `updated_on` is a valid ISO date within the configured max age |
| Links | Internal links resolve in active docs |
| Source paths | Inline source paths resolve, including `*` and `**` wildcards |
| README handoff | Module README files include the required handoff sections |
| Supporting folders | Only `references/` is allowed |
| Stale text | Active docs avoid old HR filenames, mojibake, duplicate README names, and placeholder markers |
