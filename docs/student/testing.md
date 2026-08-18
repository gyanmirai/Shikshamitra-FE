---
module: student
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-08-14
owner: frontend-team
audience: humans-and-agents
---

# Validate Student Enrollment Admissions changes

TL;DR: run the documentation check first, then focused lint, formatting, type, unit, and browser checks for the Enrollment Admissions surface that changed.

## Documentation and hygiene

Run from `Shikshamitra-FE`:

```bash
npm run docs:check
git diff --check
```

## Focused frontend checks

```bash
.\node_modules\.bin\eslint.cmd src/screens/student/admissions src/redux/student/admissions
npx prettier --check src/screens/student/admissions src/redux/student/admissions docs/student
npm run ts
```

Run the smallest relevant Vitest or Playwright command when a test exists for the changed screen or client.
For browser validation, use the Codex in-app browser after automated checks when the environment has an authenticated tenant.

## Coverage map

| Change area             | First checks                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Cycles or offerings     | `admission-cycles-api.ts`, `admission-offerings-api.ts`, offering model tests, cycles and offerings screens, route/menu review |
| Workflow builder        | `admission-workflows-api.ts`, workflow screen, publish and validation interaction checks                                       |
| Form builder or preview | `admission-forms-api.ts`, form screen, preview and field visibility checks                                                     |
| Inquiry CRM             | `admission-inquiries-api.ts`, inquiry screen, duplicate and contacted workflows                                                |
| Applicant 360           | `admission-applicants-api.ts`, Applicant 360 screen, notes and activity states                                                 |
| Application runtime     | `admission-applications-api.ts`, application detail, draft, concurrency, field validation, and submit flow                     |

## Backend coordination

When a frontend contract changes, verify the matching backend contracts under `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/Enrollments/Admissions/**` and run the backend focused Admissions tests.

## Admission Offering checks

```bash
npx vitest run src/utils/dateConvertor.test.ts src/screens/student/admissions/admission-offering-model.test.ts --pool=threads
npx playwright test e2e/student/admission-offerings.spec.ts --project=chromium --no-deps
npx eslint src/screens/student/admissions src/redux/student/admissions
npm run ts
```

The focused Playwright flow covers cascading academic selectors, inherited cycle dates, published workflow and form assignment, activation, the create payload, and duplicate-offering feedback.

`npm run ts` currently includes unrelated baseline failures outside the Admission Offering files; compare failure paths before attributing them to this feature.
