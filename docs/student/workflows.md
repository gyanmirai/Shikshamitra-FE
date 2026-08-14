---
module: student
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-08-14
owner: frontend-team
audience: humans-and-agents
---

# Trace Student Enrollment Admissions workflows

TL;DR: the Enrollment Admissions CRM project connects configurable setup screens to an inquiry-to-application runtime flow.

## Configuration workflow

1. An administrator creates or selects an admission cycle.
2. The administrator configures an offering and associates published workflow, inquiry form, and application form definitions.
3. The administrator builds workflow stages and transitions, then previews, validates, and publishes the workflow.
4. The administrator builds form sections and fields, configures bindings, rules, defaults, required state, and read-only state, then previews, validates, and publishes the form.

The setup screens are `admission-cycles.tsx`, `admission-offerings.tsx`, `admission-workflows.tsx`, `admission-forms.tsx`, and `admission-form-preview.tsx`.

## CRM runtime workflow

1. A counselor creates an inquiry from the inquiry dialog.
2. The inquiry flow checks duplicate phone, email, applicant name, and date-of-birth signals before creating or reusing family context.
3. The inquiry list supports search and cycle, offering, status, and source filters.
4. The counselor marks contact, reviews Applicant 360, adds notes, and starts an application for an active offering.

The runtime screens are `admission-inquiries.tsx`, `admission-applicant-360.tsx`, and `admission-applicant-notes.tsx`.

## Application workflow

1. Starting an application freezes the selected published workflow and form versions for that application.
2. The application detail screen renders configured fields by type and shows prefilled approved bindings and defaults.
3. Save Draft persists editable values with the current concurrency stamp.
4. Submit performs authoritative validation and displays field-level errors before allowing progress.
5. The application detail view shows workflow stage progress and the application timeline.

The runtime screen and field adapter are `admission-application-detail.tsx` and `admission-runtime-field.tsx`.

## Integration rules

Frontend screens own loading, empty, error, and interaction states.
Backend services remain authoritative for duplicate detection, tenant isolation, permissions, validation, version freezing, workflow transitions, and persistence.
Do not add non-Phase-1 exam, payment, document, seat, enrollment, or approval behavior to this workflow without extending the backend contract first.
