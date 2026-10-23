# Elective Group Creation QA

Detailed cases cover the reusable group master, create/edit dialog, subject selector, table, insights, usage details and lifecycle confirmations. Authoring is complete for this revision. Execution is partial; the dated report distinguishes failures, incomplete variations and missing fixtures.

| Metadata | Value |
| --- | --- |
| Exact menu label | `Elective Group Creation` |
| Navigation | Curriculum > Settings > Elective Group Creation |
| Route | `/academic/curriculumSetting/electiveGroupCreation` |
| Discovery status | Menu/source confirmed; local in-app browser execution on 22 October 2026 |
| Page source | [src/app/(auth-route)/academic/(curriculum-management)/curriculumSetting/electiveGroupCreation/page.tsx](<../../../../../../../src/app/(auth-route)/academic/(curriculum-management)/curriculumSetting/electiveGroupCreation/page.tsx>) |
| Owning screen | [src/screens/academic/curriculum-management/setting/electiveSubjectSetting/index.tsx](<../../../../../../../src/screens/academic/curriculum-management/setting/electiveSubjectSetting/index.tsx>) |
| Case authoring | 88 independent checks and six composite school journeys authored |

## Read order

1. [Test data and execution guide](test-data.md): fixtures, scope, source ownership, cleanup and contract decisions.
2. [Functional cases](cases.md): 32 checks for navigation, validation, membership, duplicates, lifecycle, access and scope.
3. [Edge cases](edge-cases.md): 30 checks for boundaries, failures, stale data and API integrity.
4. [UI consistency](ui-consistency.md): 26 checks for shared controls, accessibility, responsiveness and feedback.
5. [School examples](school-examples.md): six composite journeys, including languages, skills, streams, retirement, multiple media and phone use.

The baseline cases start Not run (UI: Unverified). Reusable specifications do not imply automation or executed coverage. School journeys reuse the independent cases and are not counted again.

## Latest execution: 22 October 2026

[Detailed QA report](<../../../../../../../test-results/qa/20261022-elective-group-creation/report.md>) · [Per-case results](<../../../../../../../test-results/qa/20261022-elective-group-creation/case-results.json>)

The existing focused unit suite passed **3 files / 7 tests**. Local in-app browser checks exercised create/edit, name boundaries, minimum subjects, duplicate name/combination, table search/filter, four-subject overflow, usage, insights, archive/restore and deletion. Light desktop/tablet/phone and dark-phone form states were sampled. This is not full matrix or module sign-off.

Independent results: **20 Passed, 17 Failed, 29 Partial, 13 Blocked, 9 Not run**. Six composite journeys remain Not run and are excluded from those totals. The 17 failed checks map to eight defects.

Eight defects were recorded: Active filter hides active records; forced name capitalization; missing associated Color error; form help/section/required-field/footer inconsistencies; usage-view inconsistencies and missing saved details; ambiguous confirmation actions/context; three direct row actions; unclear create-action label. Dirty-close native confirmations remain partially tested because browser control timed out; source evidence is recorded separately.

Two disposable unused groups were created and removed. Final list and insights returned to zero, with existing subject masters unchanged. Light theme was restored. No application fix or new automation was added in this task. Role/tenant/API bypass/concurrency/dependency scenarios and complete school journeys remain unverified. Generated evidence stays under ignored `test-results/`.

`npm run docs:check` reports the existing 27 issues in `docs/testing`. Focused link/ID/source checks and `git diff --check` are recorded in the report.

[Academics index](<../../../README.md>) | [Route inventory](<../../../inventory.md>)
