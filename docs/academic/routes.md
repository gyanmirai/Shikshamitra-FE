---
module: academic
domain: navigation
content_type: Reference
status: canonical
updated_on: 2026-10-28
owner: frontend-team
audience: humans-and-agents
---

# Find Academic setup and configuration routes

TL;DR: `/academic/setup` is the guided configuration workspace; the nine existing sidebar settings remain independent destinations.
Use `academicPaths` and `academicPermissions` from `src/constants/academic-menu.ts` instead of duplicating route or permission strings.

## Guide and shell

Ordinary Academic pages use the protected application layout, dashboard shell, and module navigation.
The Academic layout in `src/app/(auth-route)/academic/layout.tsx` checks the initialized permission state and Academic route access before rendering module content.
The standalone guide route in `src/app/academic/setup/page.tsx` uses `AuthRouteLayout` and the shared setup workspace, matching the Initial Setup flow outside the dashboard shell.
The first-visit gate is school-wide; manual reopening remains available after the initial visit.

## Included settings

| Catalogue key | Existing route | Owning manager under `src/screens/` |
| --- | --- | --- |
| `subjects` | `/academic/curriculumSetting/subjectCreation` | `academic/curriculum-management/setting/subjectCreation/index.tsx` |
| `elective-groups` | `/academic/curriculumSetting/electiveGroupCreation` | `academic/curriculum-management/setting/electiveSubjectSetting/index.tsx` |
| `weekly-lectures` | `/academic/timetableSettings/weeklyLectures` | `academic/timetable-schedule-management/settings/components/weeklyLectures/weeklyLectures.tsx` |
| `lecture-slots` | `/academic/timetableSettings/lectureSlots` | `academic/timetable-schedule-management/settings/components/lectureSlots/lectureSlots.tsx` |
| `homework-types` | `/academic/homeworkSettings/homeworkTypes` | `academic/homework-assignment-management/setting/homeworkType/index.tsx` |
| `assignment-types` | `/academic/homeworkSettings/assignmentTypes` | `academic/homework-assignment-management/setting/assignmentType/index.tsx` |
| `rubrics` | `/academic/homeworkSettings/rubricConfig` | `academic/homework-assignment-management/setting/rubricConfig/index.tsx` |
| `grading-scales` | `/academic/examinationSetting/gradeScaling` | `examination/settings/gradeScaleManagement/gradeScaling.tsx` |
| `exam-types` | `/academic/examinationSetting/examTypes` | `examination/settings/examAssessmentTypeSetting.tsx/examTypeSetting/examTypeSetting.tsx` |

## Permission and query behavior

The guide filters available settings using their existing navigation and action grants.
Each manager retains its View/Add/Delete checks; embedding does not grant another capability.
The backend remains responsible for authorization on every request.

Guide stage and setting selection use URL query parameters so reload and browser navigation restore the visible destination.
Lecture Slots preserves those parameters when opening `action=add`, `edit`, `view`, or `assign`.
Closing a Lecture Slots form removes its action/record context while retaining the guide position and unrelated query parameters.

## Excluded and inactive surfaces

Calendar Settings and the five LMS settings are outside this guide because their navigation entries are inactive.
Existing Calendar operations, operational Academic pages, and their own route guards retain their current ownership.
Do not add inactive LMS placeholder forms to setup or label them as saved configuration.
