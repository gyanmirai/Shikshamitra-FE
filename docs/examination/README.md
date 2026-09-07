---
module: examination
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-08-31
owner: frontend-team
audience: humans-and-agents
---

# Understand Examination frontend integration

TL;DR: this doc set currently covers the examination seating-plan routes, guided workflow, clients, and validation.
Backend behavior is canonical in [Examination backend docs](../../../Shikshamitra-BE/docs/modules/examination/README.md).

## Read order

| Step | File | Use it to |
|---|---|---|
| 1 | [routes.md](./routes.md) | Confirm guided and legacy route ownership |
| 2 | [clients.md](./clients.md) | Find workspace, preview, apply, and lifecycle clients |
| 3 | [workflows.md](./workflows.md) | Trace exam-level plan grouping and publication |
| 4 | [testing.md](./testing.md) | Select type, unit, lint, and browser checks |

## Source of truth

| Need | Source |
|---|---|
| Routes | `src/app/(auth-route)/academic/(examination)/seatallocation/**` |
| Guided screen | `src/screens/examination/seatingPlan/guided/**` |
| List entry point | `src/screens/examination/seatingPlan/pages/SeatingPlanListPage.tsx` |
| Guided client | `src/redux/academicAPI/ExaminationApi/ScheduleExamApi/guided-seat-allocationApi.ts` |
| Interface rules | `DESIGN.md` |

## For agents

| Question | First file |
|---|---|
| Which route should new work target? | [routes.md](./routes.md) |
| Which request invalidates seating cache? | [clients.md](./clients.md) |
| How does preview differ from apply? | [workflows.md](./workflows.md) |
| What must pass before handoff? | [testing.md](./testing.md) |

## Validation

Run from `Shikshamitra-FE`:

```bash
npm run docs:check
git diff --check
```
