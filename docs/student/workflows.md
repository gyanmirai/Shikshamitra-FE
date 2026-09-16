---
module: student
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-09-11
owner: frontend-team
audience: humans-and-agents
---

## Shared permission editing

The original [Security editor layout](../security/workflows.md) is retained, with complete catalogue coverage and independent action toggles.
Do not enumerate grants from a fixed CRUD list, infer action bundles, or restore revoked access through reseeding.
The backend [security standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md) owns authorization and approved repair rules.
Existing backend operations that share one permission identifier remain one capability until a separately approved domain change.

# Trace Student Enrollment Admissions workflows

TL;DR: the Enrollment Admissions CRM project connects configurable setup screens to an inquiry-to-application runtime flow.

## Configuration workflow

1. An administrator creates or selects an admission cycle.
2. The administrator configures an offering through scoped Board, Medium, Stage, and Standard selectors and associates published workflow, inquiry form, and application form versions.
3. The administrator builds workflow stages and transitions, then previews, validates, and publishes the workflow.
4. The administrator builds form sections and fields, configures bindings, rules, defaults, required state, and read-only state, then previews, validates, and publishes the form.

The setup screens are `admission-cycles.tsx`, `admission-offerings.tsx`, `admission-workflows.tsx`, `admission-forms.tsx`, and `admission-form-preview.tsx`.

Workflow creation collects only identity and description.
The dedicated `/student/admissions/settings/workflows/[id]` builder owns stage ordering, explicit entry and terminal flags, controlled transition conditions, validation results, preview, version history, and usage.
Published and archived versions are read-only.

The Offering screen uses server-side search, paging, sorting, URL-backed filters, inherited or overridden cycle dates, readiness feedback, optimistic concurrency, and `ThreeDotsActions` row commands.
Archived cycles are excluded from the setup selector.
Clone copies source operational configuration while requiring a new valid identity.
Bulk create performs an all-or-nothing server preview before commit.

## Managed assessments

An Assessment stage keeps **Basic completion (existing process)** unless an administrator opts a draft workflow into **Record an assessment result** or **Schedule an entrance exam**. Published workflows remain read-only; create and publish a new version to change these settings. Existing applications keep their pinned workflow version.

The stage editor exposes optional attendance, aggregate scoring and pass marks, review by a different staff member, and an attempt limit. Scheduling adds sessions with dates, location, and capacity. It does not create exam questions, subject rubrics, parent booking, or automatic reminders.

1. Configure the Assessment stage in a draft workflow and choose its completion requirements.
2. Add outgoing routes using **Continue after**. The default route accepts passed or waived results; failed, absent, and retake outcomes require their own matching route. A retake can also remain in the assessment stage while staff create another allowed attempt.
3. Publish the workflow and assign it to an admission offering.
4. For scheduled assessments, open **Admissions > Applications > Assessments**, choose the offering and stage, and create a session. The selected scope is stored in the URL. Result-only assessments do not require sessions.
5. In application detail, create an attempt or book an available session, record attendance if required, and enter an aggregate mark or a manual pass/fail result when scoring is disabled.
6. If review is required, a different authorized staff member approves or returns the result. The assessment panel explains outstanding requirements before staff advance the application.

Retakes preserve earlier attempts. Waivers require permission and a reason. Session, booking, result, and review actions use concurrency stamps and show server errors without discarding entered values. Backend checks remain authoritative for permissions, scope, capacity, review, and advancement; see the [backend student module](../../../Shikshamitra-BE/docs/modules/student/README.md) for domain and API ownership.

## Document verification setup

A Document verification stage keeps **Basic completion (existing process)** until an administrator chooses **Collect and verify documents** in a draft workflow. Published versions remain read-only, and existing applications retain their pinned version.

1. Add a standard document or choose **Add custom document**. Save each requirement into the stage draft, then save the stage.
2. Choose required, optional, or conditional collection. Conditional requirements use applicant answers or known workflow facts with comparison controls and all/any groups. An unavailable answer is shown as a blocker rather than silently making the document unnecessary.
3. Choose a file upload, a physical-original inspection, either, or both. Configure file formats and size. An optional student document category links accepted evidence to the later student record; its stricter file limits also apply.
4. Choose independent review and whether authorized staff may waive requirements with a recorded reason.
5. Use **Continue after document review** in outgoing transitions. The default route follows resolution of required documents; the waiver preset can send authorized exceptions to a separate review stage. Custom conditions remain available.
6. Validate and publish the workflow, then assign the published version to an offering. Use the applicant document checklist to collect and review evidence.

Editing requirements does not rewrite existing application evidence. See the [backend student module](../../../Shikshamitra-BE/docs/modules/student/README.md) for policy validation, permissions, completion gates, and handoff rules.

## Eligibility setup

An Eligibility stage keeps **Basic completion (existing process)** until an administrator chooses **Check eligibility rules** in a draft workflow.
The managed option is available only when the backend advertises support; published versions remain read-only.

1. Choose **Add eligibility criterion**, name the check, and select age, application answers, inquiry answers, an earlier assessment, or an earlier document stage.
2. For age, enter the minimum, maximum, or both in years and months and choose a fixed cutoff date.
3. For answers or previous marks, select the published form and a supported answer field; use typed comparisons and all/any groups for the criterion.
4. For assessments and documents, select an earlier configured stage explicitly; waived assessments cannot also require a score.
5. Optionally enable exception requests, choose an approval role, and require a different reviewer.
6. Save each criterion, save the stage, configure outgoing routes, then validate and publish the workflow before assigning it to an offering.

Application and inquiry answer choices in both Eligibility and Document conditions add step and section context when labels repeat. A field code distinguishes choices that still share the same context; saved field keys remain unchanged.

An offering must use the same application and inquiry form versions selected by its managed eligibility criteria.
The backend rejects incompatible form selections and prevents an incomplete offering from being advertised as open or used to start an applicant journey.

The editor retains unrelated settings and preserves unsupported saved configuration instead of overwriting it.
Existing complex transition conditions are displayed read-only in the simple route editor and remain intact when route details change.
See the [backend student module](../../../Shikshamitra-BE/docs/modules/student/README.md) for rule semantics, authoritative sources, and publication checks.

## Managed Review setup and staff workflow

Review uses **Basic completion (existing process)** unless an administrator enables **Collect a staff review and recommendation** in a draft workflow. The managed controls require backend capability metadata. A new published version defines the policy; existing applications keep their pinned version.

1. Optionally choose a reviewer role and default assigned reviewer. Choose earlier managed Assessment, Document verification or Eligibility stages whose evidence must be considered.
2. Add school-specific checklist items, marking individual confirmations required or optional. Configure an approver role, independent approver and review due days only when needed.
3. Save and validate the draft. This first delivery allows one managed Review stage per workflow. Route negative decisions explicitly with **Continue after review decision**; the default route follows approval.
4. Staff open the Review queue or the application's Review panel to inspect evidence, blockers, assignment and deadline. Save an incomplete draft or submit a reasoned recommendation with the required confirmations.
5. An authorized approver uses the existing **Admission decision** actions. A recommendation alone never approves, rejects or advances an application. A correction request reopens the application form; resubmission returns to the same Review stage for another recommendation.
6. If authoritative evidence changes after Review, inspect it and submit a fresh recommendation. When the backend permits it, the existing approval action reaffirms the review while preserving the current offer lifecycle. History remains available through an explicit expansion.

The queue offers assigned-to-me and overdue filters with server pagination. Optional deadlines use local-time controls and ISO timestamps for API requests. Committee reviews, delegation, automatic reminders and escalation are outside this delivery. See the [backend student workflows](../../../Shikshamitra-BE/docs/modules/student/workflows.md) for authorization, evidence freshness, gates and audit rules.

## Dynamic form builder

The full-screen editor in `src/screens/student/admissions/admission-form-dialog.tsx` uses the shared `CustomStepperWithFormik` for three ordered stages.
The shared stepper owns one Formik state across the stages; **Back** preserves entered values and **Next** validates the current stage without saving.

| Stage             | User interaction                                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Form details**  | Enter the name, code, description, and applicant layout; a new form can start from **Use registration template**.                                                      |
| **Build form**    | Use the complete field library, form structure, and selected-field settings workspace.                                                                                 |
| **Review & save** | Review identity, layout, field counts, ordered sections, and advisory publishing checks; return through **Edit details** or **Edit fields**, or choose **Save draft**. |

Details validation checks name, code, layout, and fields per row; the builder stage checks the section and field schema.
The final save validates the complete draft schema and is the only wizard action that persists the form.
Publishing checks in the review are advisory and do not add a separate draft-save gate.

| Workspace area     | User interaction                                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Add fields**     | Search student fields or choose a custom field; the destination section is displayed above the library and each field has an explicit add action.                                                                    |
| **Your form**      | Arrange steps, sections, and fields; select a field to customize it.                                                                                                                                                 |
| **Field settings** | See the selected field and its section, then edit its label, type, required state, and help text; expand additional settings for defaults, read-only access, data connection, codes, visibility, and advanced rules. |

Within **Build form**, desktop shows all three workspace areas together; narrower screens use **Add fields**, **Your form**, and **Field settings** tabs.
The local validation panel identifies structural, option, binding, and rule-reference issues before backend publish validation.
Closing or cancelling a changed draft requires confirmation, and replacing entered content with **Use registration template** requires confirmation.
An unsuccessful save leaves the editor open with its values intact for correction or retry.
Saving persists a draft; publishing remains a separate form-list action.

## CRM runtime workflow

1. A counselor creates an inquiry from the inquiry dialog.
2. The inquiry flow checks duplicate phone, email, applicant name, and date-of-birth signals before creating or reusing family context.
3. The inquiry list supports search and cycle, offering, status, and source filters.
4. The counselor marks contact, reviews Applicant 360, adds notes, and starts an application only for an offering whose computed availability is `Open`.

The runtime screens are `admission-inquiries.tsx`, `admission-applicant-360.tsx`, and `admission-applicant-notes.tsx`.

## Managed inquiries

An Inquiry stage keeps the Basic process unless an administrator enables the version 1 Inquiry policy in a draft workflow.
Managed setup can require contact or qualification before an application starts, constrain sources, require source detail and identity fields, configure duplicate handling, assign scoped counsellors manually or round robin, set response deadlines, and define a qualification checklist.
The list uses backend paging with cycle, offering, status, source, applicant, and phone filters.
The **Manage** drawer explains readiness and overdue work, records contact notes, schedules and completes follow-ups, records a qualification outcome, and can reopen a non-terminal qualification.
Server capability flags and blockers control available commands; application-start and workflow guards remain authoritative on the backend.

## Managed Form stages

A Form stage retains the Basic process unless the administrator enables managed Form behavior in a draft workflow. The editor selects the published application form, responsibility, optional deadline, submission limit, save-and-resume behavior, automatic advancement, correction requests, and any sections that staff must verify. Unsupported or unrelated configuration is preserved.

The selected Form-stage definition must exactly match the application form assigned to the Offering. An applicant can save and submit through the existing dynamic form; the frozen published definition and immutable submission snapshots remain authoritative. When automatic advancement is disabled or section verification is required, submit holds the workflow at Form. Authorized staff can verify each configured section, revoke a verification with a reason, or request a reasoned correction. Correction returns the form to draft and makes earlier section verification stale; resubmission consumes another configured attempt. The existing Continue action becomes available only after the server reports that every blocker is resolved.

## Managed Payment stages

A Payment stage retains basic manual completion until an administrator enables **Managed collection with financial controls**. Configure the receipt purpose, amount and currency, payer, accepted staff methods, optional deadline, installments, independent verification, waiver authority, and continuation behavior. Online collection is explained but cannot be selected for publication until a trusted tenant gateway exists.

The application card shows required, settled, and outstanding money with progress, deadline, blockers, receipts, references, and transaction status. Staff record received money; non-cash methods require a reference. A different staff member verifies when dual control is enabled. Rejections, waivers, and reversals require permanent reasons. The stage continues only after settlement or an authorized waiver.

## Managed Offer stages

An Offer stage retains the existing admission decision behavior until an administrator enables the managed process. The editor configures unconditional or conditional content, terms and response confirmations, validity and expiry overrides, decline reasons, extension/reissue limits, completion outcomes, and automatic continuation after acceptance. A preview shows the applicant-facing content while configuration errors block publishing.

At runtime, the application card shows version, status, conditions, expiry, blockers, capabilities, and permanent history. Staff issue, accept, decline, extend, withdraw, or reissue through focused dialogs that preserve entered values on failure. Acceptance collects configured evidence; decline and exception actions collect reasons. The frontend continues only when the server reports completion, and non-acceptance outcomes depend on explicit backend-validated routes.

## Managed Seat stages

A Seat stage keeps basic manual completion until an administrator enables managed capacity. The editor configures offering capacity, manual or entry-time reservation, default and optional staff-adjusted hold duration, renewal limits, FIFO waitlisting, authorized capacity exceptions, release reasons, permitted completion outcomes, and continuation after confirmation.

The application card shows available, reserved, confirmed, and total seats with occupancy progress, reservation expiry, waitlist position, blockers, server-authorized actions, and permanent history. Staff can reserve, confirm, renew, waitlist, release, promote, or change capacity through focused dialogs. Confirmed allocations remain visible after workflow advancement so staff can release them before finalization. Mutations refresh the shared offering capacity and advance only when the server reports an allowed outcome.

## Application workflow

1. Starting an application freezes the selected published workflow and form versions for that application.
2. The application detail screen renders configured fields by type and shows prefilled approved bindings and defaults.
3. Save Draft persists editable values with the current concurrency stamp.
4. Submit performs authoritative validation and displays field-level errors before allowing progress.
5. Submit advances the configured Form stage only after authoritative validation succeeds.
6. Later stages advance through the runtime API, which uses idempotency keys and returns current stage state, the server-derived next required action, and immutable transition history.
7. The application detail and Applicant 360 views render the frozen journey instead of assuming a fixed list of admission steps.

Journey chips include their text status as well as color, and Applicant 360 shows the current stage, next required action, and stage-entry timestamp.

The runtime screen and field adapter are `admission-application-detail.tsx` and `admission-runtime-field.tsx`.

## Integration rules

Managed eligibility appears through `eligibility/application-eligibility.tsx` inside the application detail workspace when `eligibilityEnabled` is present.
Staff choose **Check eligibility** to evaluate saved information and inspect each criterion's expected value, recorded value, source, and explanation.
The card displays Not checked, Eligible, Ineligible, More information needed, Exception approved, or Out of date according to the server summary.
Missing information and stale results show server blockers; a new evaluation is available only when the server permits it.
When staff reopen and correct an application form at managed Eligibility, submitting the correction keeps that stage open so they can recheck eligibility before explicitly continuing.
Visited eligibility stages and earlier checks load when their history is expanded.
Before finalization, a visited stage can offer a permitted recheck without reopening or advancing that historical stage.

An exception request and each approval or decline require a reason.
Dialogs show the selected check, request reason, and configured reviewer requirements, retain entered reasons after failure, and preserve the application's existing dirty-state guard.
Available exception actions follow both global permissions and server flags, including the per-request reviewer flag.
The existing **Continue admission** action remains separate from evaluation and exception decisions and uses server completion and routing readiness.
An ineligible result can continue only when the backend permits a configured review route or approved exception; the frontend does not issue an admission rejection.

The application detail screen mounts `document-verification/application-documents.tsx` only for stages marked `documentVerificationEnabled`, including lazy, read-only history for completed stages. The current checklist displays required progress, server blockers, and Missing, Pending review, Accepted, Needs resubmission, Waived, or Not applicable status. Per-requirement actions collect a permitted file, record a physical-original check, accept evidence, request a replacement with a reason, or record an authorized waiver.

Document action dialogs preserve the selected evidence and application stamp while editing, keep entered values on failure, and use the local `CustomDialog.hasUnsavedChanges` guard without clearing a dirty application form. Replacement and original-attestation behavior is explained before saving. The existing workflow advance action is available only when the backend reports `canComplete` and the user has advancement permission.

Once admission finalization links evidence to a Student record, the existing student profile **Documents** tab can show **Admission evidence**. `studentProfile/student-admission-evidence-panel.tsx` groups retained versions by their source application, stage, and requirement. It requires both student-record and admission-document view access; authorized downloads retain the student scope. This panel is read-only and leaves normal student document collection in place.

The profile first loads its protected record summary and checks that the returned Student GUID matches the requested identity. Tabs mount only after that read succeeds. A failed profile request shows a clear error and Retry instead of empty identity fields; the Documents tab then reads normal documents and retained admission evidence for the resolved student.

Frontend screens own loading, empty, error, and interaction states.
Backend services remain authoritative for duplicate detection, tenant isolation, permissions, validation, version freezing, workflow transitions, and persistence.
Add new admission behavior only after extending and validating the owning backend contract, permission, workflow, and persistence rules.
