---
module: student
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-08-08
owner: frontend-team
audience: humans-and-agents
---

# Trace Student frontend workflows

TL;DR: Student Enrollment is one applicant record moving through six visible steps.
Every worklist opens the same applicant workspace and uses the backend progress projection as lifecycle truth.

## Enrollment submodules

| Area                  | Route                                     | Primary interaction                                                        |
| --------------------- | ----------------------------------------- | -------------------------------------------------------------------------- |
| My Work               | `/student/enrollment/my-work`             | Assigned tasks, due work, blockers, and one recommended action             |
| Pipeline              | `/student/enrollment/pipeline`            | Board and list views over every pre-admission applicant                    |
| Entrance Exams        | `/student/enrollment/entrance-exams`      | Scheduling, attendance, result, eligibility, absence, and retest work      |
| Registration          | `/student/enrollment/registration`        | Form progress, missing items, corrections, documents, and verification     |
| Class Placement       | `/student/enrollment/class-placement`     | Capacity review and division assignment                                    |
| Activation            | `/student/enrollment/activation`          | Gate review, approval, repair state, and Student Records handoff           |
| Follow-ups & Messages | `/student/enrollment/follow-ups-messages` | Due reminders, manual follow-ups, message history, and delivery failures   |
| Admission Reports     | `/student/enrollment/reports`             | Auditable funnel, source, standard, stage, and outcome analysis            |
| Applicant workspace   | `/student/enrollment/applicants/{leadId}` | Current command, six-stage journey, focused operations, context, and audit |

## Applicant command workspace

The applicant command workspace contains exactly these six school-facing stages.
The backend applicant progress projection decides each step status, blocker, and next action.
The projection `currentStep`, `nextAction`, `nextActionCode`, step status, and reason are the only lifecycle and primary-action authority.
The workspace does not derive competing instructions from the lead stage.

| Order | Step            | Completion meaning                                                                                             |
| ----- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| 1     | Inquiry         | Minimum applicant, guardian, academic preference, source, type, and owner data are captured                    |
| 2     | Entrance Exam   | The exam is completed and an eligibility decision exists, or the published Admission Year Setup permits a skip |
| 3     | Registration    | Required responses, documents, corrections, and verification are complete                                      |
| 4     | Finance         | Finance confirms the configured admission requirement, or the published setup marks Finance as optional        |
| 5     | Class Placement | Board, medium, standard, and required division placement are confirmed                                         |
| 6     | Activation      | Configured gates pass and the applicant is handed to Student Records as an active student                      |

Step statuses are `Not Started`, `In Progress`, `Complete`, `Skipped`, `Blocked`, and `Needs Review` in the API.
The interface presents `Skipped` as `Not required` and never uses a completion check for it.
Optional steps show `Not required` only when the immutable Admission Year Setup snapshot permits the skip or an authorized bypass is recorded.
Blocked steps identify the missing field, document, Finance state, capacity issue, or permission requirement.
Completed and current stages are navigable, while blocked, optional, and future stages remain readable without starting invalid work.
Desktop renders one six-column journey without horizontal scrolling.
Tablet and mobile render current-step progress plus a `View Journey` disclosure with a vertical status list.
The applicant header owns identity, lifecycle status, labeled inquiry facts, SLA, and the next best action.
The main column owns the active operation, while the sticky desktop context rail owns pathway, ownership, priority, lead score, follow-ups, Activity and Audit, and Additional Checks.
Activity and Audit opens as a URL-backed drawer rather than a competing applicant tab.
Parent-facing status uses the same step order but hides internal notes, scoring details, duplicate evidence, and staff permissions.

## Pipeline

Every applicant enters the Pipeline first, including direct-registration, transfer, RTE, referral, sibling, and walk-in cases.
Pipeline is the pre-admission source of truth, while Student Records owns active-student data after activation.

The board contains these fixed columns:

1. New Inquiry.
2. Follow-up.
3. Exam Pending.
4. Exam Done.
5. Eligible.
6. Registration Pending.
7. Registration Done.
8. Finance Verification.
9. Placement Pending.
10. Ready for Activation.
11. Activated.

Rejected, Ineligible, Withdrawn, Cancelled, Duplicate, and Not Interested are closed outcomes.
Closed outcomes appear through filters and reports rather than permanent board columns.
The pipeline column answers where an applicant is.
The checklist answers what is missing.
Missing checklist items must not create extra board columns.

## Applicant capture

Quick Inquiry minimizes front-desk entry while preserving enough data to route the applicant safely.
Required capture includes applicant name, guardian contact, academic year, board, medium, standard, inquiry source, inquiry type, and owner.
Division is normally assigned during Class Placement rather than inquiry.
Duplicate detection runs before lead creation and requires an authorized merge reason before records can be merged.
The created lead stores the published Admission Year Setup identifier, version, and immutable snapshot.

## Focused worklists

Each focused submodule uses one `CustomizableTable`.
Filtering, sorting, and pagination are server-owned for bounded performance.
Actions open or update the same applicant record used by Pipeline and My Work.

| Worklist              | Required row context                                                              |
| --------------------- | --------------------------------------------------------------------------------- |
| My Work               | Applicant, current step, issue, due time, owner, priority, and recommended action |
| Entrance Exams        | Schedule, attendance, result, eligibility, absence, retest, and review state      |
| Registration          | Completion, missing fields, missing documents, correction state, and verification |
| Class Placement       | Board, medium, standard, division, capacity state, and override authority         |
| Activation            | Registration, Exam, Finance, Placement, approval, account setup, and repair gates |
| Follow-ups & Messages | Due state, assignee, channel, template, provider state, and last attempt          |

## Enrollment interface contract

Enrollment follows the global [frontend interface design contract](../../DESIGN.md).
Table-first pages use an unbroken full-height flex chain so the primary `CustomizableTable` consumes all remaining desktop content height.
The table region owns data scrolling, while the document must not gain horizontal overflow.
The page header, admission-year context, filters, and tabs remain mounted during loading, empty, and error states.
Durable tabs, views, paging, sorting, and meaningful filters use shareable URL state.
`SplashScreen` is reserved for authentication, permission, or application bootstrap rather than normal Enrollment route or tab changes.

| Page type          | Enrollment surfaces                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Table workspace    | My Work, Pipeline list, Entrance Exams, Registration, Class Placement, Activation, Follow-ups and Messages, Admission Reports, and table-first Settings panels |
| Document workspace | Setup Centre, Finance Handoff forms, provider forms, and other pages whose primary task is guidance or data entry                                              |
| Sequential setup   | Admission Year Setup and the genuinely ordered Registration and Documents setup flow                                                                           |
| Mixed workspace    | Applicant, Admission Year history, Activation Settings, and other routes that must explicitly separate a primary table panel from document-style panels        |

A bounded table is permitted only for an embedded preview, import result, comparison, or history.
The component and its tests must name that exception explicitly.

## Admission Year Setup

Admission Year Setup extends an existing Institute Setup academic year.
It never creates a second academic-year entity.
Published setup versions are immutable so an applicant keeps the rules under which the school accepted the inquiry.

The setup flow uses a genuine four-step stepper:

1. Admission scope selects target standards and permitted admission routes.
2. Dates and gates define the inquiry window, registration deadline, activation target, Exam requirement, Finance requirement, and placement timing.
3. Ownership assigns a default owner and optional owner for each applicant step.
4. Review and publish validates the complete setup and creates the active immutable version.

Only one Draft and one Published version may exist for a tenant and academic year at a time.
Publishing supersedes the previous Published version without rewriting existing applicant snapshots.
Closing requires an auditable reason.

## Settings

Settings are grouped by the school task they control.
A generic configuration page must not replace these submodule boundaries.

| Settings page            | Responsibility                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Admission Year Setup     | Academic year, dates, target standards, routes, required gates, placement timing, ownership, and publication              |
| Pipeline Settings        | Inquiry sources, inquiry types, owner pool, default owner, quick-capture fields, follow-up reasons, and allowed shortcuts |
| Entrance Exam Settings   | Applicability, schedules, pass rules, retest policy, parent scheduling, and exam messages                                 |
| Registration Settings    | Sections, required fields, documents, languages, verification, and correction reasons                                     |
| Finance Handoff Settings | Finance requirement, handoff trigger, and visible Finance reference fields                                                |
| Class Placement Settings | Placement timing, live capacity status, and override permissions                                                          |
| Activation Settings      | Required gates, approver, cancellation window, account handoff, and confirmation message                                  |
| Communication Settings   | Channels, templates, variables, consent, provider mode, delivery logs, and simple reminders                               |

Simple reminders belong to Communication Settings.
There is no separate Automation, Policy and Compliance, Journey Rules, or generic Governance page in canonical navigation.
One-time admission moments send immediately when the corresponding action occurs.
Idle-delay controls are enabled only for Registration Issued, Registration Incomplete, Registration Correction Requested, Registration Verified, Fee Follow-up, Exam No-show, and Activation Welcome.
The UI resets idle delay to zero when staff selects a one-time event.
Provider header values, parameter values, and callback secrets are write-only.
Stored credential values are represented only by protected-value indicators, and blank replacement fields preserve the existing values.

## Admission Reports

Admission Reports presents four focused views: lifecycle, inquiry source, target standard, and closed outcome.
Only one `CustomizableTable` is shown at a time.
Date filters apply to applicant creation dates and include the selected calendar dates.
The date span cannot exceed 366 days.
The optional target-standard filter is applied by the backend after effective UserScope enforcement.
The UI shows when results are scope-restricted and does not attempt to reconstruct hidden school-wide totals.
All groupings come from the server and reuse the same fixed lifecycle projection as Pipeline.

## Integration ownership

| Integration            | Ownership rule                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| Academic structure     | Institute Setup owns academic year, board, medium, stage, and standard                                 |
| Division and capacity  | Class Management owns divisions and capacity truth                                                     |
| Payment                | Finance owns charge, payment, receipt, waiver, reversal, and verification truth                        |
| Active student         | Student Records owns the student after activation                                                      |
| Communication delivery | The provider response owns sent, delivered, failed, and undelivered truth                              |
| Enrollment             | Enrollment owns the applicant, progress projection, admission decisions, tasks, and handoff references |

Enrollment must not mark fees paid without a Finance reference.
Enrollment must not duplicate board, medium, standard, division, or capacity configuration.
The UI must not claim a message was delivered without provider evidence.

## Navigation state

The selected academic year travels through the `cycle` query key for compatibility with the existing global academic-year context.
Pipeline rows, applicant names, generic Open Inquiry actions, and newly created inquiries open with `tab=inquiry`.
Stage-specific worklist actions continue to use their explicit stage tab.
Direct applicant URLs without an explicit tab open Inquiry; `tab=next` remains the backend-projected current-work destination.
Focused worklists may use `tab=exam`, `tab=registration`, `tab=finance`, `tab=offer`, `tab=activation`, or `tab=governance`.
Legacy `tab=overview` canonicalizes to `tab=next`.
Legacy `tab=activity` canonicalizes to `tab=next&activity=1`.
The Activity and Audit drawer uses `activity=1`.
Targeted exam work uses `/student/enrollment/entrance-exams?cycle={academicYearId}&applicant={leadId}&examAction={action}`.
A versioned session-backed return token expires after four hours and preserves the source URL, Pipeline scroll position, originating applicant, and focus target.
Explicit Back to Pipeline navigation restores the URL-backed filters, page, view mode, scroll position, and originating applicant focus after Pipeline data is ready.
If the originating applicant no longer exists, focus returns safely to the Enrollment workspace heading.
Pipeline-to-inquiry and explicit return navigation use directional view transitions with a shared applicant-name transition; reduced-motion preferences disable animation.
Browser Back remains available and keeps the unsaved-change guard, but browser history navigation does not animate.
All other worklist filters use shareable URL state where the workspace supports them.
Compatibility redirects preserve query state and then land on the canonical route.

## Parent and staff experience

Staff see one clear next action and the exact reason an applicant cannot proceed.
Parents receive approved messages at configured inquiry, exam, registration, Finance, placement, and activation moments.
Ineligible and rejected messages use school-approved wording.
Capacity is shown as available, full, over capacity with override, or unknown.
Loading, empty, permission, validation, provider failure, and integration-unavailable states are explicit.
