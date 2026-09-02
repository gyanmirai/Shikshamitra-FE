---
module: examination
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-09-02
owner: frontend-team
audience: humans-and-agents
---

# Find Examination seating routes

TL;DR: the seating list launches the guided setup route; allocate and review routes remain available for legacy plans and detailed fallback work.

| Route                                        | Screen                                  | Status                                                                                                                         | Gate                                                                |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `/academic/seatallocation`                   | Seating-plan list                       | Active menu entry                                                                                                              | View                                                                |
| `/academic/seatallocation/[examId]/setup`    | Draft workflow or published room viewer | Four-phase create, regroup, reset, review, and single-publish flow while draft; final read-only room seating after publication | View plus Add, Auto Allocate, Delete, and Publish gates while draft |
| `/academic/seatallocation/[examId]/allocate` | Detailed legacy editor                  | Compatibility route, not linked from the primary flow                                                                          | Add and Auto Allocate as used                                       |
| `/academic/seatallocation/[examId]/review`   | Detailed legacy review                  | Compatibility route for existing plans                                                                                         | Finalize, Publish, and Print as used                                |

The guided route stores `step` and optional `planId` in its query string so refresh and back navigation preserve context.
After examination-wide publication, the same route ignores the draft step and opens the final room seating directly.
The page displays missing Add, Auto Allocate, Delete, or Publish permission at the action that needs it. Finalize is performed inside the atomic examination publish and is not a separate user step.
