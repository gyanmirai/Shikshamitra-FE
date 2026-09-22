---
module: student
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-09-19
owner: frontend-team
audience: humans-and-agents
---

## Shared permission editing

The original [Security editor layout](../security/workflows.md) is retained, with complete catalogue coverage and independent action toggles.
Do not enumerate grants from a fixed CRUD list, infer action bundles, or restore revoked access through reseeding.
The backend [security standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md) owns authorization and approved repair rules.
Existing backend operations that share one permission identifier remain one capability until a separately approved domain change.

# Trace Student Enrollment Admissions workflows

TL;DR: Student Admissions connects school setup screens to an inquiry-to-application runtime flow.

## Manage Admission Periods

The `/student/admissions/settings/cycles` screen loads server-paged cycles and exposes independent Lifecycle and Application Window filters.
Each row shows its Academic Year, date window, current or scheduled action, lifecycle, computed window status, Offering count, and Application count.

Create saves a Draft and supports every configured Academic Year, including future years.
The form normalizes the code, validates dates, accepts an optional description, labels the command **Save as draft**, and confirms before discarding edits.
Publishing first loads server readiness errors and warnings.
Close, reopen, and archive require a reason; Close displays dependency counts and requires explicit acknowledgement when active Offerings exist.
Reopen requires a non-expired or extended close date.
Delete is visible only for an unused Draft and still uses a destructive confirmation.

View details loads current dependency counts and immutable history on demand.
Clone creates a Draft without Offerings or Applications.
Published or Closed windows can be revised with a reason, and Draft or Published lifecycle actions can be scheduled using institution-local input converted to UTC.
The backend remains authoritative for stale concurrency, lifecycle transitions, dependencies, and all View/Add/Delete permissions.

## Configuration workflow

1. In **Admission Periods**, an administrator creates or selects the admission cycle that controls the intake window.
2. In **Admission Forms**, the administrator builds, previews, validates, and publishes reusable inquiry and application forms.
3. In **Admission Process**, the administrator builds the workflow stages, chooses what happens next, previews the journey, validates it, and publishes it.
4. In **Class Admission Setup**, the administrator selects Board, Medium, Stage, and Standard, connects the published process and form versions to the period, validates readiness, and activates the intake.

The setup screens are `admission-cycles.tsx`, `admission-offerings.tsx`, `admission-workflows.tsx`, `admission-forms.tsx`, and `admission-form-preview.tsx`.

Workflow creation generates a code from the name and lets the administrator start from the recommended standard journey or an empty workflow. Inquiry capture and qualification happen before an application starts, so new Admission Process templates begin with Application form, followed by Document verification, Review, and Admission decision; optional assessment, eligibility, payment, and offer steps are added only when the school needs them. Historical Inquiry workflow stages remain readable and executable for applications already pinned to them but are not selectable for new processes.
The dedicated `/student/admissions/settings/workflows/[id]` builder owns stage ordering, stage-owned next-step paths, advanced entry and ending controls, guided outcome conditions, undo/redo, validation results, route-aware preview, route simulation, version comparison, restore-as-draft, and usage.
Configure does not expose a separate technical Transitions workspace. Each stage shows its usual and special outcome paths under **What happens next?**; the saved transition graph remains the backend runtime contract. Stage ordering remains presentation order and does not silently rewrite advanced routes. Required stages cannot use ordinary manual skip, while a separately authorized emergency override requires a reason.
Seat, Enrollment, and Custom remain readable and executable in immutable historical workflow versions but are not selectable for new stages. New capacity and waitlisting setup is planned as a separate Admission Offering contract; Workflow Builder does not show placeholder capacity fields. Final admission creates the Student and hands operational work to Student Onboarding. Appointment remains hidden until its runtime scheduling and completion contract is available.
Published and archived versions are read-only.

The URL-backed **Configure** and **Journey map** views preserve the administrator's selected workspace across reload and browser navigation. Configure keeps the ordered stages and each stage's next-step paths together; Journey map groups reachable stages by actual graph depth from the entry stage, keeps branches together, identifies disconnected stages and dead ends, and opens the same stage editor for correction.

**Test routes** runs the complete release-safety scenario set and summarizes how many reach a terminal stage. Administrators can open any scenario, adjust its condition values, and inspect the selected journey. The simulation follows the same priority-first conditional selection and default-route fallback as runtime routing and identifies ambiguous or missing routes. Conditional routes leaving one stage require unique non-negative priorities, and a route without a condition is saved as the stage's single default route. It is a configuration preview only; backend validation, managed-stage policy validation, stage evidence, permissions, and runtime completion gates remain authoritative.

Release readiness is deliberately checked at two lifecycle points. Publishing a workflow validates graph integrity, runtime support, managed-stage configuration, and configured SLA or deadline ranges. Staff availability depends on an Offering's academic hierarchy, so activation revalidates it in that concrete scope: configured Inquiry counsellors must be active and accessible, and a default Review assignee must be active, have the configured role, and be able to access the Offering hierarchy. This keeps reusable workflows independent of one campus while preventing an unusable Offering from becoming active.

Version history includes the complete stage and route definition plus per-version Offering and Application usage. Administrators can compare the open version with an earlier version by stable stage codes, review added, removed, and changed stages/routes, and copy a selected immutable version into a new Draft. Creating that Draft never changes published versions or applications already pinned to them, and only one Draft may exist in a workflow history.

The permission-protected Usage panel reports real runtime records for the selected immutable version: journeys started, active and completed, overall completion rate and duration, plus per-stage entered, active, completed, skipped, completion-rate, average-duration, and oldest-active values. It also shows Offering, distinct Campus, and Application impact; an Offering without a Campus remains labelled as school-wide scope. Empty versions show an explicit no-data state; the frontend does not manufacture estimates.

The Offering screen uses server-side search, paging, sorting, URL-backed primary and advanced filters,
inherited or overridden cycle dates, readiness feedback, optimistic concurrency, and
`ThreeDotsActions` row commands. Published workflow and form selectors search and page the server
instead of limiting large schools to an initial client-side option list.
Archived cycles are excluded from the setup selector.
Clone can target any non-archived admission cycle. It copies the source code, dates, workflow, and
form versions, then clears and revalidates the academic hierarchy against the target cycle;
applications are never copied.
Single and bulk setup distinguish safe inactive preparation from full activation readiness. Bulk
create performs an all-or-nothing server preview before either commit mode. Action confirmations
show the Offering identity, linked Application count, and the effect on new and existing intake.

## Student Onboarding configuration

Configure the academic structure in Institute Setup before authoring onboarding rules. Board, Medium, School Level, Class, and Division are separate dimensions; a board selection never implies a medium or school level.

1. Open **Student Onboarding > Settings > Readiness & Access**. Use **Saved defaults** to persist the current academic year's required details, service handoffs, student and guardian accounts, completion SLA, and active state. Use **Add readiness rule** for advanced preview rules by admission route and academic applicability.
2. Open **Numbering & Placement**. Use **Saved GR & seat settings** to persist the seat-reservation window and create at least one active GR identifier series before operators prepare identifiers. Add advanced GR Number, Roll Number, or Division preview configurations by choosing one value in each cascading **Board**, **Medium**, **School Level**, **Class**, and **Division** field.
3. Readiness rules may use independent **All** or **Selected** coverage, while Numbering and Placement rules require all five explicit academic selections. Changing a parent clears child selections that no longer belong to the path.
4. Use the qualified option labels to distinguish repeated names across academic structures. Selecting GSEB filters the Medium choices but does not select Gujarati or infer a school level.
5. GR configurations apply to all onboarding profiles; there is no profile selector. GR and Roll workspaces also have no separate Assignment method selector beside **Add configuration**.
6. Save the advanced rule and inspect its **Academic Path** summary. Overlapping enabled rules at the same academic specificity are rejected, while a narrower path can coexist with its broader fallback.
7. In the Numbering & Placement policy preview, choose one complete Board / Medium / School Level / Class / Division path. Setup uses the same path to resolve the most specific GR, Roll, Division, and Readiness preview policies for each student.
8. Finalize the accepted Admission application. The finalization response includes the onboarding case ID, and the application detail links directly to Student Setup with the application number selected as the search handoff.
9. In **Student Setup**, use the task navigation and table filters directly; no clickable summary-card filter sits above the worklist. Assign an owner where needed, reserve a Division from live capacity, prepare GR and Roll identifiers, upload required documents, and refresh readiness. Manual identifier entry requires an audit reason. Every live command uses the case concurrency stamp.
10. For a ready case, open **Activate Student**. The confirmation loads a fresh backend activation preview, blocks stale or newly ineligible cases, and submits the preview's latest concurrency stamp. After activation, review service handoffs and retry failed handoffs when necessary. Cancelling a case is separately permission-controlled, requires a reason, and releases its reserved placement and identifiers. Bulk actions remain previews until a backend bulk command exists.

Specificity is deterministic: Board, then Medium, then School Level, then Class, then Division. Numbering and placement rules require a complete explicit path, while Readiness rules may still use broader coverage. The frontend still owns the richer configuration-editor projection and preview matching for fields not represented by the backend policy DTO. The backend is authoritative for the durable worklist, permissions, unique and atomic identifier allocation, seat capacity and concurrency, activation, audit history, service handoffs, and multi-user conflict handling. Do not present a local settings preview as a saved operational policy.

## Managed assessments

An Assessment stage keeps **Basic completion (existing process)** unless an administrator opts a draft workflow into **Record an assessment result** or **Schedule an entrance exam**. Published workflows remain read-only; create and publish a new version to change these settings. Existing applications keep their pinned workflow version.

The stage editor exposes optional attendance, aggregate scoring and pass marks, review by a different staff member, and an attempt limit. Scheduling adds sessions with dates, location, and capacity. It does not create exam questions, subject rubrics, parent booking, or automatic reminders.

1. Configure the Assessment stage in a draft workflow and choose its completion requirements.
2. Add outgoing routes using **Continue after**. The default route accepts passed or waived results; failed, absent, and retake outcomes require their own matching route. A retake can also remain in the assessment stage while staff create another allowed attempt.
3. Publish the workflow and assign it to an admission offering.
4. For scheduled assessments, open **Admissions > Assessments**, choose the offering and stage, and create a session. The selected scope is stored in the URL. Result-only assessments do not require sessions.
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
4. Staff open Application Reviews or the application's Review panel to inspect evidence, blockers, assignment and deadline. Save an incomplete draft or submit a reasoned recommendation with the required confirmations.
5. An authorized approver uses the existing **Admission decision** actions. A recommendation alone never approves, rejects or advances an application. A correction request reopens the application form; resubmission returns to the same Review stage for another recommendation.
6. If authoritative evidence changes after Review, inspect it and submit a fresh recommendation. When the backend permits it, the existing approval action reaffirms the review while preserving the current offer lifecycle. History remains available through an explicit expansion.

The queue offers assigned-to-me and overdue filters with server pagination. Optional deadlines use local-time controls and ISO timestamps for API requests. Committee reviews, delegation, automatic reminders and escalation are outside this delivery. See the [backend student workflows](../../../Shikshamitra-BE/docs/modules/student/workflows.md) for authorization, evidence freshness, gates and audit rules.

## Dynamic form builder

The full-screen editor in `src/screens/student/admissions/admission-form-dialog.tsx` uses the shared `CustomStepperWithFormik` for three ordered stages.
The shared stepper owns one Formik state across the stages; **Back** preserves entered values and **Next** validates the current stage without saving.

| Stage             | User interaction                                                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Form details**  | Choose **Blank form**, the recommended **Admission application**, or **Student registration**. **Browse all templates and school forms** opens a searchable, categorized library with purpose, section, field, and completion-time previews. |
| **Build form**    | Focus one section at a time, add individual fields, add a ready-made section pack, edit field settings, or open the complete structure when steps and sections need arranging.                                                               |
| **Review & save** | Review identity, layout, field counts, ordered sections, and advisory publishing checks; return through **Edit details** or **Edit fields**, or choose **Save draft**.                                                                       |

Details validation checks name, code, layout, and fields per row; the builder stage checks the section and field schema.
The final save validates the complete draft schema and is the only wizard action that persists the form.
Publishing checks in the review are advisory and do not add a separate draft-save gate.

| Workspace area     | User interaction                                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Form outline**   | Move between steps and sections without loading the full form into the editing canvas. Add an individual field or a ready-made section beside the selected section.                                                  |
| **Your form**      | Edit the selected section and its fields. Open **Manage structure** only when steps or sections need adding, deleting, editing, or reordering.                                                                       |
| **Section packs**  | Search categorized student, family, address, document, medical, transport, finance, consent, and survey sections. Linked student fields already present in the form are skipped rather than duplicated.              |
| **Add field**      | Open a focused drawer, confirm the destination section, then search student fields or choose a custom field.                                                                                                         |
| **Field settings** | See the selected field and its section, then edit its label, type, required state, and help text; expand additional settings for defaults, read-only access, data connection, codes, visibility, and advanced rules. |

Within **Build form**, desktop shows the outline, focused section canvas, and field settings together; narrower screens use **Outline**, **Your form**, and **Field settings** tabs. Choice fields use a visual list editor with add, paste, reorder, rename, and delete actions. A technical compatibility value is exposed only when old saved choice data cannot be interpreted safely.
The local validation panel identifies structural, option, binding, and rule-reference issues before backend publish validation.
Closing or cancelling a changed draft requires confirmation, and replacing entered content with a different starting point requires confirmation.
Ready-made full-form templates remain frontend-owned structures that produce the existing `CreateUpdateAdmissionForm` contract. **Your school forms** uses the existing tenant-scoped form list and detail reads to create a fresh editable copy with new client IDs and a new copy code; the source form, lifecycle, and published versions remain unchanged.
An unsuccessful save leaves the editor open with its values intact for correction or retry.
Saving persists a draft; publishing remains a separate form-list action.

## Inquiry runtime workflow

1. A counselor selects an admission cycle and offering, then captures a workflow-allowed source, its optional or required Source details, the family's preferred language, and the configured applicant and guardian fields.
2. The inquiry flow checks duplicate phone, email, applicant name, and date-of-birth signals within the selected admission cycle. Staff can open the existing inquiry, continue with a sibling, or use the permitted override instead of creating an unexplained duplicate.
3. The server-paged inquiry list supports search and cycle, offering, status, source, My inquiries, Unassigned, specific-counsellor, Overdue, Awaiting first contact, Awaiting qualification, and Open follow-ups filters. Filters stay in the URL for refresh and sharing, sorting stays on the server, and Export downloads the complete filtered set rather than only the visible page.
4. Staff with Inquiry Assign permission can assign or reassign one inquiry, or select up to 100 visible inquiries and assign them together. The server changes the whole selection or none of it. Workflow defaults and round-robin policies continue to provide automatic assignment when configured.
5. The management drawer keeps editable contact/source/language details, concurrency-safe saving, structured contact channel/direction/outcome, follow-ups, structured closure reasons, and a unified activity timeline. Once an application starts, inquiry details become read-only.
6. Staff with Inquiry Manage and Communication Add permission can use language-aware acknowledgement, follow-up, or application-link templates. Creation can immediately create/send the acknowledgement when selected; Communication Send controls immediate delivery, while provider, consent, approval, retry, and delivery tracking remain in Communication.
7. The counselor reviews Applicant 360 and starts an application only for an offering whose computed availability is `Open`. Opening Applicant 360 from an inquiry carries that exact inquiry into application start so the handoff is traceable and the inquiry is locked after conversion.

Inquiry Pipeline groups the same inquiry records into Active inquiries and Handoffs and closed lanes. Every visible lane keeps its own server count and bounded recent-card page, while the shared cycle, offering, source, counsellor, and work-queue filters apply across the board. Cards expose the same Manage, Assign, and permission-controlled Compose actions as the inquiry table. Inquiry Pipeline is not an Applications alias and does not make application-stage decisions.

The runtime screens are `admission-inquiries.tsx`, `admission-applicant-360.tsx`, and `admission-applicant-notes.tsx`.

## Managed inquiries

Inquiry capture and qualification are owned by the Inquiries workspace before the application workflow starts. Historical published workflows may still contain a managed Inquiry stage, but Admission Process no longer offers Inquiry as a new stage and the school-ready templates begin with Application Form.
The managed inquiry contract can require contact or qualification before an application starts, constrain sources, require source detail and identity fields, configure duplicate handling, assign scoped counsellors manually or round robin, set response deadlines, and define a qualification checklist.
The list uses backend paging with cycle, offering, status, source, owner, assignment state, operational work queue, applicant, and phone filters. Work queues are evaluated before paging so small, medium, and large schools see correct counts and pages.
The **Manage** drawer explains readiness and overdue work, edits pre-application inquiry details, records structured contacts, schedules and completes follow-ups, records a qualification outcome with a standard closure reason, shows the activity timeline, and can reopen a non-terminal qualification.
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

## Legacy managed Seat stages

Seat is hidden from new workflow drafts. Published versions and applications already pinned to a managed Seat stage retain their configured capacity, reservation timing, renewal limits, FIFO waitlisting, exceptions, release reasons, completion outcomes, and continuation rules.

For those historical journeys, the application card continues to show available, reserved, confirmed, and total seats with occupancy progress, reservation expiry, waitlist position, blockers, server-authorized actions, and permanent history. Staff actions remain governed by server capabilities and concurrency controls.

New offering-level capacity and waitlist setup requires a separate persisted Admission Offering API and finalization gate. The Workflow Builder must not simulate that ownership with UI-only fields.

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

Document action dialogs preserve the selected evidence and application stamp while editing, keep entered values on failure, and use the local `CustomDialog.guardUnsavedChanges` behavior without clearing a dirty application form. Replacement and original-attestation behavior is explained before saving. The existing workflow advance action is available only when the backend reports `canComplete` and the user has advancement permission.

Once admission finalization links evidence to a Student record, the existing student profile **Documents** tab can show **Admission evidence**. `studentProfile/student-admission-evidence-panel.tsx` groups retained versions by their source application, stage, and requirement. It requires both student-record and admission-document view access; authorized downloads retain the student scope. This panel is read-only and leaves normal student document collection in place.

The profile first loads its protected record summary and checks that the returned Student GUID matches the requested identity. Tabs mount only after that read succeeds. A failed profile request shows a clear error and Retry instead of empty identity fields; the Documents tab then reads normal documents and retained admission evidence for the resolved student.

Frontend screens own loading, empty, error, and interaction states.
Backend services remain authoritative for duplicate detection, tenant isolation, permissions, validation, version freezing, workflow transitions, and persistence.
Add new admission behavior only after extending and validating the owning backend contract, permission, workflow, and persistence rules.
