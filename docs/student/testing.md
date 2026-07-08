---
module: student
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-07-08
owner: frontend-team
audience: humans-and-agents
---

# Validate Student frontend changes

TL;DR: run docs validation for documentation changes and targeted Student tests for route, client, attendance, records, or browser changes.
Do not claim Student behavior is validated unless the relevant tests or a stronger suite ran.

## Documentation checks

Run these commands after editing Student frontend docs.

```powershell
node scripts/docs/validate-docs.mjs --module student
npm run docs:check
git diff --check
```

## Focused frontend checks

Use these commands as the first validation set.

| Risk area | Command |
|---|---|
| Student route and permission gates | `npm run test -- src/constants/student-menu.permissions.test.ts` |
| Production API contracts and mock guardrails | `npm run test -- src/redux/student/student-api.production.test.ts src/screens/student/no-production-mocks.test.ts` |
| Enrollment settings | `npm run test -- src/screens/student/enrollment/setting` |
| Student management tabs and roll projections | `npm run test -- src/screens/student/management` |
| Student attendance dashboard and lock behavior | `npm run test -- src/screens/student/attendance` |
| Browser role access | `npx playwright test e2e/student/student-module-role-access.spec.ts --project=chromium --reporter=list` |
| TypeScript impact | `npm run ts` |

## Add coverage when needed

Add or update tests when a change affects these areas.

| Change | Expected coverage |
|---|---|
| Active route or menu status | Menu permission test |
| Client endpoint shape | Student API contract test |
| Inquiry Source behavior | Enrollment setting utility or wiring test |
| Roll number or GR number behavior | Management projection test |
| Attendance save or lock behavior | Attendance screen or query test |
| Role visibility | Playwright role access test |
