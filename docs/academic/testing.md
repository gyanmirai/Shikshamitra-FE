---
module: academic
domain: validation
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-29
owner: frontend-team
audience: humans-and-agents
---

# Validate Academic guided setup

TL;DR: verify guide persistence and authorization separately from the existing settings forms, then smoke-test the completed flow in the Codex in-app browser.
Do not report a check as passed unless it ran against the current implementation.

## Local checks

Run from the frontend repository root:

```powershell
npm run ts
npm test -- src/screens/academic/setup
npm run docs:check
git diff --check
```

On Windows, the repository's focused Vitest bootstrap is available when required:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/academic/setup --pool=threads
```

Run ESLint with `--max-warnings=0` against changed guide, embedding, route, client, and manager files.
Run the existing tests for any owning form, validator, mapper, or API client changed by the implementation.

## Focused evidence

For Insights, run the response/API tests and the screen's model, context and visualization tests:

```powershell
npx vitest run src/redux/academicAPI/academicInsightsResponse.test.ts src/redux/academicAPI/academicInsightsApi.test.ts src/screens/academic/insights
npx vitest run src/screens/academic/dashboard-design
```

These cover strict response parsing, exact scope parameters, cache separation by identity/context/child, mutation refresh, permission filtering, role ordering, context switching and accessible chart alternatives.
Overview tests verify semantic metric definitions, role-supplied priority and genuine zero values without exposing links or substituting sample counts. Progress-headline tests verify the server aggregate instead of the preview average and omit an unavailable aggregate.
Separate dashboard tests cover exact administrator image order, unchanged priorities for other roles, authoritative mapped totals, null/zero timetable counts, compact lesson summaries, numeric donut legends, source dates/values, read-only templates and five audit rows.
Dashboard browser cases assert the active image-dashboard root, exact administrator row pairs, compact chart geometry, two columns on desktop and one column on narrow screens, all role priorities, linked students, both themes and chart containment. The prior presentation remains in code and its existing tests remain applicable.
`src/components/chart/chart-sizing.test.tsx` covers forwarding pixel frame heights to the chart renderer, including conflicting options and adaptive CSS heights.
Browser chart checks compare every rendered SVG against its visible frame and verify that donut labels expose real counts and percentages.
Scatter presentation tests cover padded data domains, genuine zero values and escaped names with both coordinates in the tooltip.
Browser acceptance must also exercise real dashboard rendering in both themes at desktop and phone widths, permitted workflow links, empty/error retry, linked children and absence of the top module-name strip.
Use synthetic fixtures for browser evidence; they are not production fallbacks.

| Surface | Test ownership |
| --- | --- |
| Catalogue, permitted positions, and review model | `src/screens/academic/setup/academic-setup-model.test.ts` |
| Dashboard section shape validation, real zeros, and malformed-response errors | `src/redux/academicAPI/academicDashboardApi.response.test.ts` |
| Non-finite health scores and unavailable versus valid zero presentation | `src/screens/academic/components/command-center/AcademicHealthScoreCard.test.tsx` |
| Tenant-separated client caches, explicit visit writes, and stale-save cache retention | `src/redux/academic-setup/api.test.ts` |
| Automatic visit race, unmount cancellation, resume URLs, and failed deferrals | `src/screens/academic/setup/academic-setup-persistence.test.tsx` |
| Real form state blocking and form retention during status refresh/failure | `src/screens/academic/setup/AcademicSetupWorkspace.test.tsx` |
| Normal-route entry and exact menu/route permission checks | `src/screens/academic/setup/AcademicSetupEntry.test.tsx` and `src/utils/academic-navigation-access.test.ts` |
| Retained create actions, standalone header, dirty/busy reports, and selected class scope | `src/screens/academic/setup/embedding/academic-setup-embedding.test.tsx` |
| Lecture Slots query preservation on open and close | `src/screens/academic/setup/embedding/lecture-slot-action-location.test.ts` |
| Embedded Lecture Slots browser Back, discard, and busy-close behavior | `src/screens/academic/setup/embedding/useLectureSlotsNavigation.test.tsx` |
| Existing subject form validation and dirty-close behavior | `src/screens/academic/curriculum-management/setting/subjectCreation/subjectForm.test.tsx` |
| Real reusable rubric draft and publish behavior | `src/screens/academic/homework-assignment-management/setting/rubricConfig/rubricConfigForm.test.tsx` and `useRubricTemplateSave.test.tsx` in that folder |

Academic E2E inventory lives in `docs/testing/module-inventory.json` and `tests/catalog/academic.yaml`.
Update the catalogue before adding or changing Academic automation.
Use `npm run test:e2e:academic:smoke -- --list` to verify focused discovery, then run the relevant scenarios and `npm run test:e2e:all-reports` when E2E coverage changes.
Classify failures using `docs/testing/BUG_CLASSIFICATION_POLICY.md` without weakening assertions or treating baseline failures as guide regressions.

## Browser acceptance

- A school with no recorded configuration visit opens the guide for an authorized user; another user in that school does not receive a repeated automatic opening after the visit is recorded.
- Leaving setup for the Academic dashboard renders valid empty metrics without `NaN`; malformed section responses expose unavailable/retry and recover when valid data returns.
- Manual reopening works and restores saved guide position/deferred choices.
- All nine included managers expose their existing permitted actions and real fields; inactive Calendar and LMS settings are excluded.
- Form validation failures preserve values and prevent misleading configuration completion.
- Inline dirty/busy forms block guide navigation, while modal forms retain their existing close guard.
- Lecture Slots actions retain guide stage/setting query parameters; closing returns to the same setting.
- Timetable review states the current class scope and refreshes after real configuration changes.
- Loading, permission errors, concurrency failures, and retries keep the guide shell stable.
- Switching peer tabs in all four settings stages retains heading, tab, footer, and main-scroll positions during a delayed save and after navigation.
- At 390 by 844, 768 by 1024, and 1440 by 900 pixels, keyboard focus, footer access, tables, dialogs, and document overflow behave correctly in light and dark themes.

Run automated checks before the final Codex in-app browser confirmation.
Keep source checks, automated results, browser evidence, and any unverified environments separate in delivery notes.

## Operational read regressions

Homework calendar regression: `e2e/academic/homework-calendar.spec.ts` runs with `node node_modules/@playwright/test/cli.js test --config e2e/academic/homework-calendar.config.mjs`. It checks the 29 October publish / 30 October midnight due payload, publishing from India/UTC/Los Angeles browsers at desktop/tablet/phone widths, one-toast calendar rejection with retained input, and division-vacation picker rules. The isolated API uses synthetic data; backend application tests verify real validation separately. Unit coverage includes `src/utils/learning-task-date-time.test.ts`, the homework serialization test, shared picker tests and query-hook error ownership tests.

Elective late admissions: run the state, column and save-payload tests under `src/screens/academic/curriculum-management/assignElectiveSubject`. The isolated browser regression runs with `node node_modules/@playwright/test/cli.js test --config e2e/academic/elective-late-admission.config.mjs` and covers desktop, tablet and dark phone layouts; admission after locking, discard, keyboard assignment, saving only editable students, final locking and reload. Its synthetic API does not establish deployed acceptance; backend enforcement is tested separately in the [backend testing guide](../../../Shikshamitra-BE/docs/modules/academic/testing.md).

The [backend read reference](../../../Shikshamitra-BE/docs/modules/academic/references/ui-read-performance.md) maps service/provider coverage and its limits.
Frontend regression sources cover query ownership and UI behavior:

| Concern | Test source |
| --- | --- |
| Workspace page arguments, global options and complete filtered export | `src/screens/academic/course-management/lessonPlan/hooks/use-lesson-plan-workspace.test.tsx`, `src/screens/academic/course-management/lessonPlan/hooks/use-lesson-workspace-export.test.ts` |
| Rubric server paging, on-demand detail and evaluation refresh | `src/screens/academic/homework-assignment-management/setting/rubricConfig/hooks/useRubricTemplateList.integration.test.tsx`, `src/screens/academic/homework-assignment-management/setting/rubricConfig/hooks/useRubricTemplateDetails.integration.test.tsx`, `src/screens/academic/homework-assignment-management/marksAndFeedback/useRubricEvaluationQueries.integration.test.tsx`, `src/screens/academic/homework-assignment-management/marksAndFeedback/rubricSaveRefresh.integration.test.tsx` |
| Room page controls, tab/query ownership and summary reads | `src/screens/academic/timetable-schedule-management/roomAvailability/room-paging.integration.test.tsx`, `src/screens/academic/timetable-schedule-management/roomAvailability/room-query-ownership.test.tsx` |
| Native file responses, polling cancellation and preview reopening | `src/redux/academicAPI/AcademicReportApi.download.test.ts`, `src/screens/academic/components/reports/useAcademicReportDownload.test.tsx`, `src/screens/academic/components/reports/report-preview-lifecycle.test.tsx` |
| Student detail paging, query serialization and cache reuse | `src/screens/academic/student-academic-360/components/StudentAcademic360Drawer.test.tsx`, `src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api.test.ts` |
| Grouped elective readiness and cached published seating | `src/screens/examination/scheduleExam/components/use-elective-readiness.test.tsx`, `src/screens/examination/seatingPlan/guided/published/use-published-seating-data.cache.test.tsx` |

Run these focused groups from `Shikshamitra-FE`:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/academic/course-management/lessonPlan/hooks/use-lesson-plan-workspace.test.tsx src/screens/academic/course-management/lessonPlan/hooks/use-lesson-workspace-export.test.ts src/screens/academic/timetable-schedule-management/roomAvailability/room-paging.integration.test.tsx src/screens/academic/timetable-schedule-management/roomAvailability/room-query-ownership.test.tsx --pool=threads
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/redux/academicAPI/AcademicReportApi.download.test.ts src/screens/academic/components/reports src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api.test.ts src/screens/academic/student-academic-360/components/StudentAcademic360Drawer.test.tsx --pool=threads
```

For final browser acceptance, check filtering/sorting and later pages, badge counts, older audit/student records, all-filtered table exports and report preview close/reopen.
Navigate away during export polling and confirm a late response does not download a file or reopen UI.
Check one authorized and one denied context without changing permission grants.
Record the actual commands and browser results separately; these test maps do not establish a passing run.
