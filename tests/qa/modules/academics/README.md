# Academics QA structure

This library follows the current Academics menu and its nested Settings groups.
It contains screen ownership and navigation metadata for future web UI testing.

## Read order

1. Use the module links below to find a screen.
2. Read its README for the exact menu label, route, and owning source.
3. Use [the route inventory](<inventory.md>) for aliases, compatibility pages, inactive menu entries, and unverified routes.

## Modules and screens

- [Dashboard](<dashboard/README.md>)
- [Class Teacher Assignment](<class-teacher-assignment/README.md>)
- [Student Academic 360](<student-academic-360/README.md>)
- [Academic Calendar](<academic-calendar/README.md>)
- [Curriculum](<curriculum/README.md>)
- [Timetable](<timetable/README.md>)
- [Homework & Assignment](<homework-assignment/README.md>)
- [Examination](<examination/README.md>)
- [Audits](<audits/README.md>)
- [Notification](<notification/README.md>)

## Discovery and boundaries

- Checked against repository source on 21 October 2026: 33 menu leaf entries and three independently routed seating pages.
- Menu-confirmed means present in the current menu configuration with an existing page source. It does not establish live availability, permissions, or working behavior.
- Source-confirmed workflow means connected by source or canonical route documentation. Compatibility routes remain separate from the primary guided flow.
- [Subjects Creation](curriculum/settings/subjects-creation/README.md) has 106 authored checks plus seven composite school journeys. [Elective Group Creation](curriculum/settings/elective-group-creation/README.md) has 88 authored checks plus six composite school journeys. Both have partial local browser results from 22 October 2026 linked from their suites; other screen suites have not started.
- Continue screen-by-screen case authoring; automation mapping and browser execution are separate evidence.
- Keep dialogs, drawers, and tabs within their owning screen unless they have an independent route.
- Preserve existing catalogue IDs, test files, and module documentation. Authored cases do not claim additional executed or automated coverage.

## Source of truth

- Menu labels and hierarchy: [src/constants/academic-menu.ts](<../../../../src/constants/academic-menu.ts>).
- Examination workflow and compatibility status: [Examination routes](<../../../../docs/examination/routes.md>).
- Existing Academic catalogue: [academic.yaml](<../../../catalog/academic.yaml>).
- UI contract for later authoring: [DESIGN.md](<../../../../DESIGN.md>) and [UI consistency rules](<../../../../.agents/skills/shikshamitra-ui-consistency/SKILL.md>).
