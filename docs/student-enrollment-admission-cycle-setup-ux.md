# Student Enrollment Admission Cycle Setup UX

Date: 2026-07-27.

## Decision

Admission Cycles is a settings list, not the daily operational landing page.

The list page must show one primary table only.

Selecting a cycle opens a focused cycle workspace at `/student/enrollment/settings/admission-cycles/[academicYearId]`.

The selected-cycle workspace owns the readable setup journey.

Operational work remains in My Work, Pipeline, Registrations, Offers & Class Placement Plan, Activation, and Operations, scoped by the selected `cycle` query value.

## Structure

The cycle workspace uses four tabs.

- Overview shows the selected cycle header, readiness, summary facts, and a compact configured-journey map.
- Setup shows the six-step school-facing setup sequence.
- Journey rules owns the advanced application-stage policy editor.
- Activity shows only currently available cycle evidence and links users back to owning audit/history surfaces.

The Setup sequence is:

1. Cycle basics.
2. Inquiry intake.
3. Assessment.
4. Registration and documents.
5. Fees and Class Placement Plan.
6. Confirm and activate.

Assessment is skipped when the cycle policy does not require an entrance exam.

## Guardrails

Do not reintroduce a second always-visible summary below the Admission Cycles table.

Do not rename internal Seat Pool contracts for this UX change.

Do not invent Finance posting, Academic capacity synchronization, OCR, or delivery success evidence.

Use existing settings URLs as deep-link targets while the setup experience is being consolidated.
