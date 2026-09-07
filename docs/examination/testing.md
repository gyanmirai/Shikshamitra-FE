---
module: examination
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-09-02
owner: frontend-team
audience: humans-and-agents
---

# Validate Examination seating frontend changes

TL;DR: run focused unit and lint checks, full TypeScript, and a final signed-in browser smoke test.

```bash
npm exec vitest -- run src/screens/examination/seatingPlan/guided/workflow-config.test.ts src/screens/examination/seatingPlan/guided/guided-payloads.test.ts src/screens/examination/seatingPlan/guided/workflow-utils.test.ts src/screens/examination/seatingPlan/utils/mappers.test.ts
npm exec eslint -- "src/screens/examination/seatingPlan/guided/**/*.{ts,tsx}" "src/screens/examination/seatingPlan/components/list/**/*.{ts,tsx}"
npm run ts
npm exec playwright -- test e2e/academic/academic-seating-guided.spec.ts --project=chromium --workers=1 --no-deps
npm run docs:check
git diff --check
```

Browser acceptance covers `/academic/seatallocation` to the guided setup route at 375x667, 390x844, 768x1024, 844x390, and 1440x900.
Verify one exam row regardless of subject-session count, labelled class and status selection, actionable empty states, mobile exam cards, one-or-many subject selection, disabled owned subjects, editable draft groups, legacy per-plan publication displayed as draft readiness, complete draft reset, no publish while subjects remain unplanned, exactly one examination publish, direct post-publication room viewing without workflow or edit controls, keyboard-visible controls, no page-level horizontal overflow, readable permission blockers, preview-before-apply, warning acknowledgement, and valid schedule times.
The Playwright workflow runs Axe checks at every guided phase and fails for serious or critical WCAG 2 A or AA violations.
