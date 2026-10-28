---
module: academic
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-10-28
owner: frontend-team
audience: humans-and-agents
---

# Follow the Academic setup workflow

TL;DR: the guide takes an authorized user through the visible configuration families and reuses each manager's real forms.
Saving guide progress records navigation and deferred choices; configuration is saved through the owning form.

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

## Review the current scope

Configuration status comes from the backend for the selected academic year, medium, and most recently selected timetable class.
Weekly Lectures and Lecture Slots report their actual class selection through `useAcademicSetupStandard`.
Review identifies that class scope; it must not imply that all classes are configured.

Show inaccessible settings only according to the guide's permission model, and distinguish unavailable context from empty configuration.
Deferred settings remain explicitly deferred instead of receiving a completed state.
Finishing review records the guide review outcome; it does not create missing configuration records.
