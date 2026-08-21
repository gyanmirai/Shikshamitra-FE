---
module: student
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-08-19
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
| Workflow builder        | `admission-workflows-api.ts`, list and builder screens, graph utilities, publish, validation, preview, versions, and usage     |
| Dynamic form builder    | `admission-forms-api.ts`, three-panel palette/canvas/properties builder, local validation panel, preview rules, and runtime validation |
| Form builder or preview | `admission-forms-api.ts`, form screen, preview and field visibility checks                                                     |
| Inquiry CRM             | `admission-inquiries-api.ts`, inquiry screen, duplicate and contacted workflows                                                |
| Applicant 360           | `admission-applicants-api.ts`, Applicant 360 screen, notes and activity states                                                 |
| Application runtime     | `admission-applications-api.ts`, application detail, draft, concurrency, field validation, and submit flow                     |

## Workflow builder checks

```bash
npx vitest run src/utils/permissions.test.ts src/screens/student/admissions/workflow-builder-utils.test.ts src/screens/student/admissions/admission-visibility-rules.test.ts src/screens/student/admissions/admission-form-validation.test.ts --pool=threads
npx playwright test e2e/student/admission-workflows.spec.ts --project=chromium --no-deps
npx eslint "src/screens/student/admissions/admission-workflow*.tsx" src/screens/student/admissions/workflow-builder-utils.ts src/redux/student/admissions/admission-workflows-api.ts
```

The workflow Playwright flow covers the empty list, draft creation, stage add/remove/edit,
transition conditions, stale concurrency recovery, validation feedback, publish, and read-only state.

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

Dynamic choice fields use the approved form data-source metadata/options endpoints. Static option arrays remain supported; source descriptors are resolved at runtime and are never treated as arbitrary URLs. Stepper Next and Save & Continue validate the active visible section, while Submit validates the complete form.

Permission unit tests must prove that the temporary Admissions bypass applies only in development, is disabled in production, and never grants an unrelated module permission.

`npm run ts` currently includes unrelated baseline failures outside the Admission Offering files; compare failure paths before attributing them to this feature.
