---
module: examination
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-19
owner: frontend-team
audience: humans-and-agents
---

# Validate Examination seating frontend changes

TL;DR: run focused unit and lint checks, full TypeScript, and a final signed-in browser smoke test.

```bash
npm exec vitest -- run src/screens/examination/seatingPlan/guided/workflow-config.test.ts src/screens/examination/seatingPlan/guided/guided-payloads.test.ts src/screens/examination/seatingPlan/guided/workflow-utils.test.ts src/screens/examination/seatingPlan/utils/mappers.test.ts
npm exec vitest -- run src/screens/examination/seatingPlan/guided/hooks --maxWorkers=1
npm exec eslint -- "src/screens/examination/seatingPlan/guided/**/*.{ts,tsx}" "src/screens/examination/seatingPlan/components/list/**/*.{ts,tsx}"
npm run ts
npm exec playwright -- test e2e/academic/academic-seating-guided.spec.ts --project=chromium --workers=1 --no-deps
npm run docs:check
git diff --check
```

Browser acceptance covers `/academic/seatallocation` to the guided setup route at 375x667, 390x844, 768x1024, 844x390, and 1440x900.
Verify one exam row regardless of subject-session count, labelled class and status selection, actionable empty states, mobile exam cards, one-or-many subject selection, disabled owned subjects, editable draft groups, legacy per-plan publication displayed as draft readiness, complete draft reset, no publish while subjects remain unplanned, exactly one examination publish, direct post-publication room viewing without workflow or edit controls, keyboard-visible controls, no page-level horizontal overflow, readable permission blockers, preview-before-apply, warning acknowledgement, and valid schedule times.
The Playwright workflow runs Axe checks at every guided phase and fails for serious or critical WCAG 2 A or AA violations.
The delayed-preview regression keeps room and rule controls usable, starts the layout request before the proposal completes, rejects outdated responses, and disables continuation until the current proposal arrives.
Hook tests also verify that actual draft saves remain blocking and recover after successful and failed requests.

Room-layout regressions are covered by `utils/room-layout.test.ts`, `guided/manual/manual-room-layout.test.ts`, and `components/workspace/room-layout-canvas.test.tsx`. Verify unequal columns, legacy partial-grid seat identities, protected occupants, reserved/disabled seats, zero usable capacity, and missing-bench labels. Run these with the existing seating-plan mapper, manual-preview, validation, and allocation suites.

Room studio is covered by `guided/manual/room-studio.test.tsx` and `guided/manual/room-studio-draft.test.ts`. These exercise the real seat components and draft hook for keyboard placement, drag activation/cancellation, move/swap, queue replacement, cross-room moves, Undo/Redo, removal, reservations, protected occupancy, read-only behavior, room switching and student search. Browser acceptance must also check actual pointer and touch dragging, theme contrast, zoom, contained canvas scrolling and an authenticated save/reload cycle.

`guided/published/published-plan-room-view.test.tsx` verifies the Room studio presentation at the published-view entry point, including legacy partial rows, combined-plan occupancy, read-only keyboard/click restrictions, zoom, loading and retry. Final browser acceptance must open a published examination and verify the physical bench design without editing controls.
