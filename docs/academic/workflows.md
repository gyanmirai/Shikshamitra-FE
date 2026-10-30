---
module: academic
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-10-30
owner: frontend-team
audience: humans-and-agents
---

# Follow the Academic setup workflow

TL;DR: the guide takes an authorized user through the visible configuration families and reuses each manager's real forms.
Saving guide progress records navigation and deferred choices; configuration is saved through the owning form.

## Use the Insights dashboard

Select the academic year, board and medium with the shared global selector, then open Academic Dashboard.
The service returns sections for the user's actual scope; the screen prioritizes those sections for the resolved role.
Administrator, leadership, coordinator, teacher, examination and timetable roles share the existing permission boundaries.
Student and parent dashboards use verified personal context and a linked-student selector when needed.
The absence of a child selection never defaults to a school-wide view.

The section catalogue covers class assignments, Student Academic 360, calendar, syllabus, lesson plans and diary, timetable/rooms/substitutions, learning tasks, evaluation, examinations, reports, notifications, audits and the nine active settings.
Each visible staff section links to its permitted existing workflows.
Graphs use actual samples: mappings, scatter comparisons, timelines, progress bars, status columns, period occupancy, task stacks, review distributions, exam stages and report counts.
Where the source cannot safely provide the selected scope, the section explains its limitation and retains permitted navigation.
Notification templates remain read-only, and settings existence is not a readiness score.

The shared header stays visible during loading and failures.
Each insight uses the shared outlined `FormSectionCard`, a neutral semantic icon, a `subtitle1`/600 heading and an adjacent accessible information tooltip.
Section gaps and content spacing follow the shared 16 px rhythm.
The approved-image dashboard is a separate presentation; the previous dashboard implementation remains preserved in code.
It uses compact outlined summary cards, two section columns on wide screens, a single column on narrow screens, compact real-data lesson tables, horizontal task charts, a donut beside its numeric legend, date-led calendar entries, audit/template tables and a full-width settings section.
The calendar preview shows at most five upcoming entries and hides recurring weekend holidays. Real events and other holidays remain visible even when their dates fall on a weekend; an empty preview displays a short message.
Administrator pairs follow the approved image: assignments/syllabus, timetable/lessons, tasks/evaluation, Student360/examination, calendar/reports, templates/audits, then settings. Its summary shows full-scope mapped/total divisions, recorded progress, saved timetables and actual weekly entries; missing source totals remain unavailable.
Other roles retain their existing permitted priorities and metric selection; personal dashboards keep their own titles and never acquire staff workflow links.
The syllabus headline uses only the supplied recorded-progress aggregate, without calculating an average from preview points or inventing chapter counts.
Staff timetable summaries distinguish saved timetables from actual weekly entries beside a compact weekday chart; returned counts retain real zeros and omit missing days. Personal timetables retain their numbered-period matrix.
Settings groups follow Curriculum, Timetable, Homework & Assignment, and Examination; Lecture Slots precedes Weekly Lectures.
Chart values retain a screen-reader alternative without adding a visible data toggle to every section.
Missing context, loading, empty data, section failures and request retry have separate states.
Switching academic context or account permissions removes previously visible response data immediately.

## First access and reopening

1. Wait for authenticated tenant context and initialized Academic permissions.
2. Read the school's configuration-visit state before deciding whether to open the guide automatically.
3. Automatically show setup only while no authorized user at that school has visited Academic configuration.
4. Record a visit from the guide or an included configuration destination through the backend visit client.
5. Keep the guide manually reopenable after the school-wide first visit, even when configuration remains incomplete.

Browser storage, existing record counts, and an individual user's previous route are not substitutes for the server's school-wide visit state.
Do not infer completion from having visited a page.

## Configure and continue

The catalogue orders Welcome, Curriculum, Timetable, Homework & Assignment, Examination, and Review & Finish.
Curriculum includes subjects and elective groups; Timetable includes weekly lectures and lecture slots.
Homework & Assignment includes homework types, assignment types, and reusable rubric templates.
Examination includes grade scaling and exam types.

The guide renders each existing manager under `AcademicSetupEmbeddingProvider`.
`AcademicSetupManagerHeader` retains the original actions in a compact toolbar without repeating page breadcrumbs.
Outside the provider, the existing standalone screen header is unchanged.

Use the manager's existing add, edit, bulk import, Submit, Save draft, or publish controls.
Those controls own domain validation, duplicate checks, payload conversion, mutations, and toast feedback.
The guide's Save progress action must not claim that invalid or unsubmitted domain values were saved.

Guide saves report their state in the fixed footer, and refresh progress stays outside the content flow.
Successful saves must not insert banners above the heading or peer tabs; tab changes retain their position while saving.
Failures and concurrency recovery remain actionable inline and preserve the current selection.

## Protect unfinished work

Modal forms keep their existing dirty-close guard and backdrop behavior.
Inline rubric and lecture-slot forms report actual dirty and busy states through `useAcademicSetupFormState` so guide navigation and exit cannot discard active work.
Grade-scale forms also report their existing state while preserving the local dialog's owner.
The state hook clears its report when the owning form or manager unmounts.
Embedded Lecture Slots uses one local navigation guard for Cancel, Back, links, browser traversal, and unload protection.
Its embedded forms use normal page flow and a static form footer so the outer setup page owns scrolling; standalone Slot layouts retain their existing internal scrolling.

Submit or discard the active form through its own controls before continuing the guide.
Failed form saves preserve the existing form's retry behavior and do not advance guide configuration status.

## Schedule homework in school time

Homework publish and due pickers use Asia/Kolkata (IST), including initial values and edits from browsers in other timezones. Requests retain an explicit `+05:30` offset. The due picker uses the selected class/division calendar and blocks holidays, vacations and emergency closures; publish timestamps are not restricted by the homework due-date policy. Failed saves keep the form open and show one message owned by the form. The [backend calendar contract](../../../Shikshamitra-BE/docs/modules/academic/product.md#homework-calendar-validation) owns authoritative validation and calendar selection.

## Assign electives after admission

On `/academic/assign-elective-subject`, newly admitted students remain editable beside previously locked students. Locked rows disable their subject controls and selection checkboxes. Individual edits, bulk assignment and clearing preserve locked rows, and saving excludes them from the update payload. Save new selections before using Review & Lock; refreshing after the final lock makes those students read-only too. The [backend product rules](../../../Shikshamitra-BE/docs/modules/academic/product.md#data-integrity) own lock enforcement.

## Review the current scope

Configuration status comes from the backend for the selected academic year, medium, and most recently selected timetable class.
Weekly Lectures and Lecture Slots report their actual class selection through `useAcademicSetupStandard`.
Review identifies that class scope; it must not imply that all classes are configured.

Show inaccessible settings only according to the guide's permission model, and distinguish unavailable context from empty configuration.
Deferred settings remain explicitly deferred instead of receiving a completed state.
Finishing review records the guide review outcome; it does not create missing configuration records.
