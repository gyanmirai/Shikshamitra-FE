---
module: examination
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-09-02
owner: frontend-team
audience: humans-and-agents
---

# Trace guided examination seating

TL;DR: users see one list record per exam, group every subject into plans, configure and validate each plan, then publish all examination seating once.

| Phase         | User decision                                                                                                  | UI behavior                                                                                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan subjects | Open an existing plan directly with **Edit seating**, or select one or many unassigned subjects for a new plan | Shows exam-wide subject coverage and plan readiness; drafts can be regrouped, deleted when empty, or fully reset. When every subject is ready, the primary action becomes **Review examination & publish**, even when a plan was previously selected. |
| Configure     | Select rooms and allocation rules                                                                              | Prevents continuation below usable capacity and generates a reversible server preview                                                                                                                                                                 |
| Review plan   | Inspect each proposed room and seat                                                                            | Applies the accepted proposal, validates it, then returns to subject planning for any remaining subjects                                                                                                                                              |
| Publish exam  | Approve the complete examination                                                                               | Requires every subject to have exactly one ready plan, then publishes and locks all plans atomically                                                                                                                                                  |

The list never flattens an exam into repeated session rows.
It shows subject coverage and plan-group count on focused phone cards and the full configurable table on larger screens.
Subjects already owned by a plan are disabled in the creation picker and identify their current plan.
The right summary rail keeps plan, subject, schedule, student, room, and capacity context visible on large desktop screens. It is hidden on smaller screens so the active step and bottom actions remain reachable; each step keeps its essential progress and context in the main content area.
First-use and filtered empty states explain why no plans are visible and provide the next useful action.
Draft reset removes only seating plans and seat assignments; examination schedules and subjects remain intact.
Changing the subjects of a populated draft plan clearly warns that its existing seats will be cleared.

When legacy data contains per-plan `Published` flags but no examination publication record, the guided workflow presents those complete plans as `Ready` and keeps the examination draft controls available. Only examination-wide publication makes the workspace read-only.
Draft exam actions use **Manage plans**. Published exam actions use **View seating** and open the final room seating without rendering the four workflow steps.
The published viewer lets users switch plan groups and rooms, inspect every final student assignment, and does not expose edit, reset, regroup, or repeat-publish controls.
Publishing currently approves the plan but does not claim that student or parent messages were delivered.
