# Elective Group Creation: data and execution guide

[Suite index](README.md)

## Scope and evidence

Route: `/academic/curriculumSetting/electiveGroupCreation`. This screen manages reusable groups; choosing a student's elective and allocating groups to classes belong to separate screens. Dialogs, usage details and insights stay in this suite. There is no group import, dedicated group report, group-status editor or sort-order control in the inspected form. Do not invent them.

Authored cases are specifications, initially **Not run**. Execution status belongs in the dated report linked from the README. A source inspection or mocked unit assertion is not a live API, permission, tenant-isolation or full browser pass. School examples combine existing cases and do not increase independent coverage totals.

## Source map

Paths are relative to the owning repository.

| Layer | Source / purpose |
| --- | --- |
| FE page | `src/app/(auth-route)/academic/(curriculum-management)/curriculumSetting/electiveGroupCreation/page.tsx` |
| FE screen | `src/screens/academic/curriculum-management/setting/electiveSubjectSetting/index.tsx`: header, create/edit, archive/delete confirmations |
| FE fields | Same folder, `components/ElectiveGroupDetailsFields.tsx`, `ElectiveGroupSubjectSelection.tsx`, `validationSchema.tsx`, `initialValues.tsx` |
| FE behavior | Same folder, `hooks/useElectiveSubjectForm.ts`, `hooks/useElectiveSubjectSetting.ts`, `components/electiveSubjectTable.tsx`, `ElectiveGroupUsageDrawer.tsx`, `electiveSubjectTableActions.ts` |
| FE client | `src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi.ts` |
| BE contract | `Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Academic/Curriculum/CreateUpdateElectiveGroupDto.cs` |
| BE rules | `Shikshamitra-BE/src/ShikshaMitra.Domain/Academic/Curriculum/Settings/ElectiveGroupManager.cs`, `Shikshamitra-BE/src/ShikshaMitra.Application/Academic/Curriculum/ElectiveGroupAppService.cs` |
| BE controller | `Shikshamitra-BE/src/ShikshaMitra.HttpApi/Controllers/Academic/Curriculum/ElectiveGroupController.cs` |
| Existing automation | FE `tests/catalog/academic.yaml`: `ACM-CUR-ELECT-001`, `e2e/academic/academic-curriculum-api.spec.ts`; broad navigation `ACM-CUR-001` in `academic-smoke.spec.ts`. These are existing mappings, not evidence of execution in this run. |

Client base: `/academic-mediums/{academicMediumId}/elective-groups`. Existing operations: list with `includeArchived`, get by ID, create, update, delete, POST `check-duplicate`, POST `{id}/archive`, POST `{id}/restore`, GET `{id}/usage`, GET `{id}/audit-logs`. Audit API existence does not establish a visible audit tab.

## Safe fixtures

Use a non-production school and a unique run marker, e.g. `Qa 20261022 Egc Languages`. Record tenant, year, board, medium, browser, viewport and source revision. Never place pupil names, real enrollment changes or confidential data in screenshots. Do not change existing school groups or subject masters.

| Fixture | Preparation / purpose |
| --- | --- |
| G-new | Unique name, Language, English + Hindi, a selected hex color, description `Disposable QA elective group; no student allocation`. If this combination already exists, select another pair; record the pair used. |
| G-alternative | Same name tests use a different pair; same-combination tests use a different unique name and reversed selection order. No second valid duplicate should persist. |
| G-unused | Test-owned saved group with all usage counts zero, deletable and membership editable. |
| G-used | Separately seeded QA group allocated to test classes/students; record exact nonzero counts and restore source fixtures afterward. Never create this state against real school enrollments. |
| G-archived | Test-owned unused group archived through its confirmation; preserve ID/name, reason and subjects for restore. |
| Subjects | Two or more distinct active subjects in the current medium; an inactive and archived subject for eligibility checks in an isolated fixture. Cross-medium and nonexistent IDs require controlled API tests. |
| Roles | Academic admin with View/Add/Delete, View-only, Add-only if valid, no Elective Group permission, expired session; separate sessions and actual backend grants. Do not revoke the running user's rights. |
| Scope | Two media/boards and two tenants with distinguishable test-owned groups. A single admin session cannot prove isolation. |
| Scale | 11+ groups for pagination; 4+ subjects for chip overflow; 100-character name; long description. Seed only in a dedicated QA environment. |

## Common procedure

1. Record baseline group names/counts and current scope; identify existing active subjects without editing them.
2. Execute each case independently from its listed state. Record actual values, message, visible result, screenshot and affected ID when available through authorized evidence. Do not infer a save from a toast alone: reopen or reload.
3. For errors, confirm no extra record was created and entered values remain. For concurrency and failed requests use an isolated test harness; do not disable security protections.
4. Delete only test-owned unused groups through the normal product action. If deletion is blocked, archive them and explicitly record residual data and why. Never purge database rows. Verify the baseline list/counts after cleanup.

Priorities: **P0** data/security integrity; **P1** routine workflow; **P2** secondary presentation/usability. Methods: **Browser**, **API** (authorized harness), **Unit**, **Review**. UI expectations come from FE `DESIGN.md` and `.agents/skills/shikshamitra-ui-consistency/SKILL.md`; a captured legacy screen is not approval of inconsistencies.

## Decisions to keep explicit

- The form defaults Group Type to Language and hides status/sort order although payload values exist. Test hidden-value preservation without inventing visible controls.
- Frontend duplicate-name checks use trimmed lowercase active-list names; server duplicate preflight normalizes punctuation and recognizes some aliases, also checks archived combinations. Test each layer separately.
- Frontend treats duplicate combinations as blocking; direct create/update enforcement requires API verification. Do not assume the preflight is an atomic uniqueness constraint.
- Frontend upper/lowercases entered names on every change. Real names/acronyms such as `CBSE`, `IT` and `IB` must be checked against the shared copy contract.
- Minimum two **distinct** eligible subjects is the integrity expectation. Repeated IDs are an API edge case even when the UI prevents selecting the same option twice.
- Group Type and Description server limits/allowed custom values need contract clarification before arbitrary maxima are treated as product failures. Sort-order FE schema and BE range differ, but no UI control exists here.
- Archive keeps historical records. Restoring, inactive-subject behavior and audit completeness require API/integration evidence; no broad pass from a single list view.
