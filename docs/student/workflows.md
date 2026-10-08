---
module: student
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-10-08
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
Close uses a compact consequence confirmation without dependency counts, a reason field, or a checkbox. The Close cycle button sends the existing active-Offering acknowledgement and a staff-confirmation audit statement after the dependency check succeeds. Reopen and archive still require a reason.
Reopen requires a non-expired or extended close date.
Delete is visible only for an unused Draft and still uses a destructive confirmation.

View details loads current dependency counts and immutable history on demand.
Clone creates a Draft without Offerings or Applications.
Published or Closed windows can be revised with a reason. The scheduling action is hidden from Admission Periods; existing scheduled actions and their backend processing are unchanged.
The backend remains authoritative for stale concurrency, lifecycle transitions, dependencies, and all View/Add/Delete permissions.

## Configuration workflow

1. In **Admission Periods**, an administrator creates or selects the admission cycle that controls the intake window.
2. In **Admission Form**, the administrator builds, previews, validates, and publishes reusable Inquiry and Registration forms. Correction requests reopen the existing Registration form; consent questions can be included in that form. Document requirements are configured in the Document Verification stage of the Admission Stage workflow.
3. In **Admission Stage**, the administrator builds the workflow stages, chooses what happens next, previews the journey, validates it, and publishes it.
4. In **Admission Offering**, the administrator selects Board, Medium, Stage, and Standard, connects the published process and form versions to the period, validates readiness, and activates the intake.

The setup screens are `admission-cycles.tsx`, `admission-offerings.tsx`, `admission-workflows.tsx`, `admission-forms.tsx`, and `admission-form-preview.tsx`.

Workflow creation uses a two-step setup flow. **Workflow details** offers Standard admission, Simple direct admission, Assessment-based admission, and Blank workflow. The selected template appears in the journey preview on the right. Beneath the templates, the administrator enters a name, optional description, and a published Registration form for a ready journey's Form stage. A blank journey can attach a Registration form after its Form stage is added. The create step does not collect an Inquiry form or set an Inquiry form default. **Continue** creates one Draft with the selected stages and routes, then opens **Build journey** in the existing builder. Back lets the administrator edit the saved details of that same Draft; saving does not create another workflow. Edit details also exposes the same templates and Registration form, with the actual current journey shown by default. Only an explicit template selection replaces stages/routes, after confirmation; ordinary name/description edits retain the graph. The separate builder Template action remains available. When an Offering selects the published workflow, its linked Registration form prefills the Offering selector and can be changed there. Inquiry capture and qualification happen before an application starts, so new Admission Stage templates begin with Application form, followed by Document verification, Review, and Admission decision; optional assessment, eligibility, payment, and offer steps are added only when the school needs them. Historical Inquiry workflow stages remain readable and executable for applications already pinned to them but are not selectable for new processes.
The first step generates a code from the name and keeps the selected template's stages visible while details are entered. The page description uses the shared breadcrumb tooltip. The second step retains the builder's independent Save draft, Validate, and Publish actions.
The builder's Template drawer groups Starting journey, Journey preview, and Published forms in shared section cards on a neutral background. Its title information uses the shared blue tooltip. The replacement warning can be dismissed for the current opening; dismissing it does not bypass required Registration form validation or the unsaved-selection guard. Descriptive helper copy is omitted while field errors remain visible.
Create and edit details use an in-page workspace beneath the Admission Stage breadcrumb, not a fullscreen dialog. Both setup steps use a full-width white background card containing their progress and working content. Desktop module navigation stays visible; narrow screens retain the existing responsive navigation. In create and edit details, Workflow details sits on the left and Journey preview on the right from the desktop breakpoint; they stack at smaller widths. The form body scrolls independently of its compact footer. Build journey groups progress, view controls, and the journey canvas inside the same outer card, retaining independent lifecycle actions in the page header. The shared progress stepper is read-only and has no separate Back button. With no template selected, its actual current stages and route count remain in preview; changing the Registration form updates only the first ordered Form stage using the shared form-policy writer. Selecting a template previews the replacement and requires confirmation before saving it, including Blank workflow when it would clear a non-empty journey. Keep current journey cancels template replacement. Inquiry defaults remain unchanged, and failed saves do not replace local graph state or concurrency stamps. Duplicate step-count text and the inline edit title/information row are omitted; the close control and named workspace remain accessible. Create/edit breadcrumb Back invokes the same guarded close as Cancel, including blocking saves and unsaved-details confirmation. Clone continues to use the existing bounded drawer.
The dedicated `/student/admissions/settings/workflows/[id]` builder owns stage ordering, stage-owned next-step paths, advanced entry and ending controls, guided outcome conditions, undo/redo, validation results, route-aware preview, route simulation, version comparison, restore-as-draft, and usage.

Administrators may enable **End of journey** for any stage type, including Form and Assessment. Changing stage type preserves the chosen ending. Completing that stage ends the workflow after its completion requirements are met; ending stages have no outgoing routes. Read-only workflows keep these controls locked.

Stage configuration uses **Basics** and **Settings**. Settings contains process controls, stage behavior, completion, and saved next-step paths. Next validates Basics, and Save stage validates the full stage. Changing a configured stage type requires confirmation before clearing its process configuration and attached form; custom names and instructions are preserved, while unchanged defaults follow the new type. Invalid saves return to the step owning the error. Historical Inquiry stages retain their migration guidance.

**Choose next step** creates the usual path; **Add special outcome** handles an exception. Conditions offer compatible comparisons and choice values from published Form stages earlier on the connected path. The editor loads the full frozen form schema, reports loading failures with Retry, and keeps saved field codes accessible in the advanced editor. Numeric lists are accepted only for list comparisons. Duplicate simple conditions and outcomes disabled by completion settings are rejected. Appending stages auto-connects only an unsaved, simple linear journey; saved and branched journeys retain their paths.

Offer validity fields keep full labels visible, and changing default validity while expiry override is disabled updates both fixed limits. Payment installment help explains that a minimum equal to the full fee prevents smaller installments; a final remaining balance may be below the minimum. These controls edit the workflow policy draft. Settlement, independent verification, waiver authority, monetary calculations, and historical application snapshots remain backend-owned.
Configure does not expose a separate technical Transitions workspace. Each stage shows its usual and special outcome paths under **What happens next?**; the saved transition graph remains the backend runtime contract. Stage ordering remains presentation order and does not silently rewrite advanced routes. Required stages cannot use ordinary manual skip, while a separately authorized emergency override requires a reason.
Seat, Enrollment, and Custom remain readable and executable in immutable historical workflow versions but are not selectable for new stages. Room-derived class capacity is configured through Admission Offering details; new waitlisting setup remains separate. Workflow Builder does not show placeholder capacity fields. Final admission creates the Student and hands operational work to Student Onboarding. Appointment remains hidden until its runtime scheduling and completion contract is available.
Published and archived versions are read-only.

The URL-backed **Configure** and **Journey map** views preserve the administrator's selected workspace across reload and browser navigation. Configure keeps the ordered stages and each stage's next-step paths together; Journey map groups reachable stages by actual graph depth from the entry stage, keeps branches together, identifies disconnected stages and dead ends, and opens the same stage editor for correction.

**Test routes** runs the complete release-safety scenario set and summarizes how many reach a terminal stage. Administrators can open any scenario, adjust its condition values, and inspect the selected journey. The simulation follows the same priority-first conditional selection and default-route fallback as runtime routing and identifies ambiguous or missing routes. Conditional routes leaving one stage require unique non-negative priorities, and a route without a condition is saved as the stage's single default route. It is a configuration preview only; backend validation, managed-stage policy validation, stage evidence, permissions, and runtime completion gates remain authoritative.

The route preview also checks managed outcome gates: pending payments do not complete, failed/absent/retake assessments need explicit matching paths, and Offer/Seat outcomes must be enabled. It shows when multiple special paths match and which priority wins. It does not submit forms, review evidence, record payments, or make admission decisions.

Release readiness is deliberately checked at two lifecycle points. Publishing a workflow validates graph integrity, runtime support, managed-stage configuration, and configured SLA or deadline ranges. Staff availability depends on an Offering's academic hierarchy, so activation revalidates it in that concrete scope: configured Inquiry counsellors must be active and accessible, and a default Review assignee must be active, have the configured role, and be able to access the Offering hierarchy. This keeps reusable workflows independent of one campus while preventing an unusable Offering from becoming active.

Version history includes the complete stage and route definition plus per-version Offering and Application usage. Administrators can compare the open version with an earlier version by stable stage codes, review added, removed, and changed stages/routes, and copy a selected immutable version into a new Draft. Creating that Draft never changes published versions or applications already pinned to them, and only one Draft may exist in a workflow history.

The permission-protected Usage panel reports real runtime records for the selected immutable version: journeys started, active and completed, overall completion rate and duration, plus per-stage entered, active, completed, skipped, completion-rate, average-duration, and oldest-active values. It also shows Offering, distinct Campus, and Application impact; an Offering without a Campus remains labelled as school-wide scope. Empty versions show an explicit no-data state; the frontend does not manufacture estimates.

The Offering screen uses server-side search, paging, sorting, URL-backed primary and advanced filters,
inherited or overridden cycle dates, readiness feedback, optimistic concurrency, and
`ThreeDotsActions` row commands. Published workflow and form selectors search and page the server
instead of limiting large schools to an initial client-side option list.
Inquiry and application selectors are purpose-safe: Inquiry selectors request only published Inquiry forms, while Application selectors request only published Registration forms. Document conditions expose Admission type, Class, Category, RTE status, Transfer admission, Scholarship, and Assessment outcome. Parent messages remain Communication templates so Communication continues to own approval, consent, providers, delivery attempts, retries, and usage.
Archived cycles are excluded from the setup selector.
Clone can target any non-archived admission cycle. It copies the source code, dates, workflow, and
form versions, then clears and revalidates the academic hierarchy against the target cycle;
applications are never copied.
Single and bulk setup distinguish safe inactive preparation from full activation readiness. Bulk
create performs an all-or-nothing server preview before either commit mode. Action confirmations
show the Offering identity, linked Application count, and the effect on new and existing intake.
Offering details let authorized staff assign rooms to a class for an academic year. Inquiry and direct-registration screens show the backend-calculated remaining class seats; Inquiry capture and handoff block a full class unless its offering allows waitlisting; Direct Registration retains its existing capacity behavior. General and RTE Offerings for the same class share that count. Opening a form or Offering detail refetches the latest count; accepting an offer or finalizing a direct admission refreshes the cached capacity shown to counsellors.
Selecting the RTE track in Offering configuration switches entry to Registration and clears the Inquiry form. Its published workflow must omit Inquiry and Assessment stages; other tracks may use either entry mode.

## Inquiry capture and handoff

1. Select the admission period and the school Board, Medium, and Class before entering family details. A matching open, configured Inquiry offering is required on staff and public capture; no new Offering unknown entry is available. Full classes follow the offering's waitlist setting. Availability failure offers Retry rather than claiming admissions are closed.
2. Complete the offering's published Inquiry form. Current admission Board, Medium, and Class are system context and are not repeated in the builder's student-field palette. New inquiries start Pending and receive the intake setup's automatic counsellor routing.
3. In **Inquiries**, open **Edit / Follow-up** to edit the original pinned published form, record contact, schedule follow-ups, and set Pending, Interested, or Not interested. Not interested and reopening require a reason. Academic changes recheck availability before saving. Legacy records and activity are retained.
4. Mark Interested only after confirming the family's response. The first Interested transition queues the qualification email when an eligible email is available; email handling does not create an application or block inquiry updates. Delivery remains Communication-owned.
5. Use **Move to next stage** only for Interested inquiries. The backend rechecks availability and capacity, creates or returns the linked application, carries the counsellor forward, and opens the existing application workspace. Direct Registration continues independently.
6. Transferred inquiries leave the main **Inquiries** list and appear in **Pipeline**, whose name and route remain unchanged. Opening a Pipeline row continues its linked application; the historical inquiry remains read-only. The existing Applications route remains available.

Inquiry rows expose only Edit / Follow-up and Move to next stage. Exceptional **Change counsellor** is available in detail only when the server grants the manager capability; it requires a transfer reason and validates configured pool eligibility and capacity. New bulk operations remain backlog.

## Student Onboarding configuration

Configure the academic structure in Institute Setup before authoring onboarding rules. Board, Medium, School Level, Class, and Division are separate dimensions; a board selection never implies a medium or school level.

1. Select the academic year in the Student header. In **Readiness & Access**, add a named route rule. The removed Saved Defaults menu is not a prerequisite.
2. Select Board, its related Medium, then one or more enabled school levels and related Standards. DDVS currently enables Secondary and Higher Secondary; another school's choices come from its own hierarchy and onboarding availability. Parent changes clear invalid descendants. All three **Numbering & Placement** editors use the same selector; Saved GR & Seat Settings is removed.
3. Save the scoped readiness and numbering rules. School/year overrides persist; narrower rules win and equal-priority overlap is rejected. Historical broad defaults remain readable.
4. Finalize the accepted application and open its onboarding case. Prepare actual documents, placement, GR/roll and required approval. Refresh readiness; each mutation uses current concurrency.
5. Activate only after a fresh backend eligibility check. This creates enrollment and enters Provisioning, not Completed.
6. In the student drawer, assign a published fee structure through the existing Finance drawer, then open the standard Finance collections page. Select the academic year and find and verify the student manually before collecting the first installment; no custom Finance filter is installed. Refresh onboarding completion afterward; partial or unconfirmed payments do not satisfy the handoff.
7. Required student and guardian accounts are created or linked through the saved manual/automatic provisioning mode. Email switches default OFF; enabled credential emails follow the selected activation/completion timing and readiness checks. Existing parent accounts keep their password when a sibling is linked.
8. If a legacy onboarding policy requires service consent, save the signed consent in school records, then use **Confirm consent** on its handoff and enter the saved record reference. This is an audited staff confirmation, not a consent-collection form.
9. Check completion to re-read Finance and account links. Completion requires all required handoffs. Future installments may remain due. Bulk refresh/activation calls real per-case commands and reports individual results; failed rows can be retried without repeating successes.

Backend case commands own capacity, identifier uniqueness, approval, concurrency and audit history. Production workflow-preview rows, policy-preview drawers, fake successful handoff retries, and unsupported automatic placement/renumbering/notification controls are removed. Placement and Roll preparation are explicit staff actions; changing division clears the Roll reservation for re-preparation. Legacy configuration fields remain readable for compatibility but do not represent a batch scheduler or notification service.

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

1. Choose **Add eligibility criterion**, name the check, and select age, application answers, an earlier assessment, or an earlier document stage.
2. For age, enter the minimum, maximum, or both in years and months and choose a fixed cutoff date.
3. For answers or previous marks, select the published form and a supported answer field; use typed comparisons and all/any groups for the criterion.
4. For assessments and documents, select an earlier configured stage explicitly; waived assessments cannot also require a score.
5. Optionally enable exception requests, choose an approval role, and require a different reviewer.
6. Save each criterion, save the stage, configure outgoing routes, then validate and publish the workflow before assigning it to an offering.

Application answer choices in both Eligibility and Document conditions add step and section context when labels repeat. A field code distinguishes choices that still share the same context; saved field keys remain unchanged. Inquiry answer, status, source, and outcome options are removed from application-stage authoring. Published Inquiry forms are excluded from answer suggestions. Saved inquiry conditions remain unchanged on opening; use **Replace inquiry condition** or choose another eligibility check before saving that edited requirement or criterion. Historical route conditions remain preserved unless explicitly replaced.

An offering must use the application form version selected by its managed eligibility criteria. Historical inquiry criteria still retain their backend form-version compatibility requirements.
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

The form list opens **History & versions** in a shared dialog with separate Compare versions and Activity cards. Version and activity loads have retry feedback and show only the selected form's data; comparison results follow the selected form/version. Restore creates a new editable draft and locks conflicting actions while the request runs, retaining the dialog with retry feedback if it fails.

The full-screen editor in `src/screens/student/admissions/admission-form-dialog.tsx` uses the shared `CustomStepperWithFormik` for three ordered stages.
The shared stepper owns one Formik state across the stages; **Back** preserves entered values and **Next** validates the current stage without saving.

| Stage             | User interaction                                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Form details**  | Choose **Blank form**, the recommended **Admission application**, or **Inquiry form**, then enter the form details.                                                    |
| **Build form**    | View every section in the selected step, select a heading to choose where fields are added, add ready-made packs, or preview the applicant form.                       |
| **Review & save** | Preview the actual form controls in section cards and navigate configured steps inside the navigation card. Review publishing checks, then choose **Save draft** or **Publish now**. Return to Build form to change fields or sections. |

Form details uses a centered 1120px container on large screens, matching Review & save. The starting-form heading omits redundant helper text. The wizard uses the shared scrollbar for vertical body scrolling with horizontal scrolling disabled and stable footer actions.

Review reuses the applicant field controls and HR section cards, with a bordered background card around the step navigation. The title and step menu remain in place while the form sections scroll using the shared Scrollbar. Long step menus can scroll within their own card; on narrow screens, navigation stays above the scrolling preview. Fields have no extra outer card border, and the form description is available through the title's info tooltip. Preview entries are temporary and never become saved form-definition data. Review has no Edit or Delete actions or settings drawer; these actions remain in Build form. Form checks remain visible, and review issues are informational. Use Back or the wizard steps to return to the appropriate configuration stage. The existing Save draft and Publish validation remains unchanged.
Details validation checks name, code, layout, and fields per row; the builder stage checks the section and field schema.
The final save validates the complete draft schema and is the only wizard action that persists the form.
Publishing checks in the review are advisory and do not add a separate draft-save gate.

| Workspace area     | User interaction                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Student fields** | Use the left palette to add linked student fields to the selected section; switch to Custom fields when needed. On narrow screens, this becomes a workspace tab. |
| **Your form**      | Keep all sections in the selected step visible. Use **Actions → Edit** to edit titles in place and the connected step navigation to select a step.               |
| **Add field**      | Open the field palette on narrow screens; on desktop the palette remains beside the canvas. Repeated additions keep the palette available.                       |
| **Field settings** | Select a field to open the right drawer. Basic groups field details, answer options, and guidance in section cards; Rules exposes visibility conditions and location dependencies. |

Field settings has only **Basic** and **Rules** tabs and reuses HR section cards. Visibility conditions are always visible; Advanced rules and Data editors are absent. Existing binding, validation, and conditional-required metadata stays intact when editing other settings. Redundant helper copy is removed, while field errors and compatibility warnings remain visible. The heading's info tooltip explains that changes belong to the draft until saved. The shared scrollbar owns the drawer body, with the heading and Done action fixed.

Within **Build form**, desktop shows a wider student-field palette beside the selected step's section cards. Its compact search keeps the label inside until a query is entered, with adjacent category expand and add controls. The step navigation uses the same outlined card surface as the form sections and the active step number and label indicate selection without a gray background. On desktop, its card fills the available height; only the step list scrolls, while **Add step** stays in a fixed footer. Narrow screens retain compact horizontal step navigation; **Add section**, **Grid layout**, and **Preview** share the right side of the canvas toolbar. The More menu is absent. Step names and their edit/delete actions live only in the left navigation, while section headings edit in their cards. Sections and fields reuse the Admissions action menu with **Edit** and **Delete**, anchored below the three-dot trigger with a matching arrow. Section accordions stay clipped within their rounded card boundary in both expanded and collapsed states. Build form uses the HR form footer placement: Back, Save draft, and Continue stay attached beneath the field canvas on desktop, beside the step navigation; smaller screens retain one reachable footer beneath the active workspace, and Preview keeps those same actions. Sections start expanded and use a chevron beside their actions to collapse the field area without changing the draft. Selecting a collapsed section, adding a field, or reporting submitted section errors reveals its contents. Each field has a compact rounded outline around its label, preview, and actions; selection and hover retain a white surface with a stronger outline and selection caption. Four-column layouts use full-width previews with controls above the label at desktop sizes. Field actions and reorder handles appear on hover or keyboard focus and remain visible on touch screens. Advanced section/step settings and new repeatable-section controls are absent; previously saved visibility and repeatable rules retain their metadata and runtime behavior. Field settings open in a right drawer; narrower screens use **Student fields** and **Your form** tabs. Custom questions begin with a name, type and required state, with existing Student field suggestions before creation. A full-width **Add custom field** button follows the controls, and the outlined **More field formats** disclosure reveals presets and other field types. Choice questions accept one option per line and retain the visual option editor for later changes.
The Student fields palette groups the 107 server-provided choices, searches names and groups, and marks a linked field as **Added** when it is already used anywhere in the form. The catalogue includes Student photo, optional Aadhaar/PAN numbers, single-parent/single-child flags, sibling selection and permanent-address country. Sibling selection reuses the shared searchable selector with bounded server pages and restores the names of saved selections separately; a failed lookup retains the answer. **Current address pack** and **Permanent address pack** live inside **Contact and addresses** and add the dependent country, state and city fields together. Adding a category or address pack fills the selected empty section, retaining its identity and saved rules; a populated section is kept and the pack creates another section in the same step. Location fields reuse the employee form's shared selectors; changing a parent clears dependent selections. Photo uses the shared avatar uploader and accepts JPEG/PNG up to 2 MB. Six Financial assistance suggestions remain excluded. Supported predefined values populate a new Student's structured profile at finalization; other answers remain captured admission details. Existing Student changes require an explicit finalization choice and respect Student Records and Identity Compliance ownership. Onboarding case details display captured values for staff review.
The local validation panel identifies structural, option, binding, and rule-reference issues before backend publish validation.
Closing or cancelling a changed draft requires confirmation, and replacing entered content with a different starting point requires confirmation.
The three starting forms produce the existing `CreateUpdateAdmissionForm` contract. Existing school forms remain available through the form list and its clone action; the starting-form chooser no longer offers a separate template library.
An unsuccessful save leaves the editor open with its values intact for correction or retry.
Saving persists a draft; publishing remains a separate form-list action.

## Inquiry runtime workflow

1. A counselor selects board, medium, class, and an open Inquiry offering; the admission cycle follows the offering automatically. The form captures the configured applicant and guardian fields and an allowed source.
2. The inquiry flow checks duplicate phone, email, applicant name, and date-of-birth signals in that admission cycle, plus same-mobile families visible to the counsellor from earlier cycles. Staff can open an existing inquiry, link a sibling only when the primary guardian mobile matches and the server marks the family linkable, or use the permitted separate-family override. A name/email-only match remains visible for review but cannot be linked directly.
3. The server-paged inquiry list supports search and cycle, offering, status, source, My inquiries, Unassigned, specific-counsellor, Overdue, Awaiting first contact, Awaiting qualification, and Open follow-ups filters. Filters stay in the URL for refresh and sharing, sorting stays on the server, and Export downloads the complete filtered set rather than only the visible page.
4. Staff with Inquiry Assign permission can assign or reassign one inquiry, or select up to 100 visible inquiries and assign them together. The server changes the whole selection or none of it. New offerings use their selected Counsellor Assignment profile to distribute new inquiries by current workload and capacity; historical offerings retain their pinned workflow assignment behavior.
5. The management drawer keeps editable contact/source/language details, concurrency-safe saving, structured contact channel/direction/outcome, follow-ups, structured closure reasons, and a unified activity timeline. Once an application starts, inquiry details become read-only.
6. Staff with Inquiry Manage and Communication Add permission can use language-aware acknowledgement, follow-up, or application-link templates. Creation can immediately create/send the acknowledgement when selected; Communication Send controls immediate delivery, while provider, consent, approval, retry, and delivery tracking remain in Communication.
7. The counselor reviews Applicant 360 and starts an application only for an offering whose computed availability is `Open`. Opening Applicant 360 from an inquiry carries that exact inquiry into application start so the handoff is traceable and the inquiry is locked after conversion.

Inquiry Pipeline groups the same inquiry records into Active inquiries and Handoffs and closed lanes. Every visible lane keeps its own server count and bounded recent-card page, while the shared cycle, offering, source, counsellor, and work-queue filters apply across the board. Cards expose the same Manage, Assign, and permission-controlled Compose actions as the inquiry table. Inquiry Pipeline is not an Applications alias and does not make application-stage decisions.

The runtime screens are `admission-inquiries.tsx`, `admission-applicant-360.tsx`, and `admission-applicant-notes.tsx`.

## Managed inquiries

Inquiry capture and qualification are owned by the Inquiries workspace before the application workflow starts. Historical published workflows may still contain a managed Inquiry stage, but Admission Stage no longer offers Inquiry as a new stage and the school-ready templates begin with Application Form. Inquiry answer rule choices are removed from new stage editing.
The **Intake & Assignment** settings page combines Inquiry handling (allowed sources, contact and qualification deadlines, follow-up defaults) with Counsellor routing (staff pool, active-case capacity, fallback manager) in reusable admission intake setups. An Offering selects its Inquiry profile when it accepts inquiries and always selects its assignment profile. A new active Offering requires these references; older Offerings keep their previous workflow settings until explicitly moved to profiles.
The settings page opens on a searchable, customizable setup table. **Create intake setup** opens a right-side three-step form for Inquiry handling, Counsellor routing, and review. Duplicate inquiry, Before application starts, Sources needing details, and the hidden email/date-of-birth requirement switches are removed from both setup and legacy profile editors. Allowed sources remains available; source details are optional. Opening an editor refreshes the eligible staff lookup; failed lookups disable routing selection and expose Retry without clearing the draft. The Public inquiry links tab lists links in a separate table and opens its creation form in a drawer.

Choosing a link's admission period loads compatible setup/form pairs from the public-link options endpoint. The form selector shows linked published Inquiry forms; the setup selector then shows matching setups. Changing the period clears both routing selections while preserving the link details. Loading, failed, and empty compatibility reads block creation; Retry and Refresh offerings preserve the draft. An `OfferingRequired` response also refreshes compatibility and shows corrective guidance, including when an older server returns generic business-rule text. Configuration and permission ownership remain in the [backend Student workflow](../../../Shikshamitra-BE/docs/modules/student/workflows.md).
Entry mode may be Inquiry first, Direct registration, or Inquiry or direct. A direct registration with no manually selected owner uses the Offering's assignment profile. The assigned counsellor is the student's journey owner across application stages and becomes the onboarding case owner at finalization. Application Details and Applicant 360 show that owner. Authorized stage specialists may perform their own checks without replacing the owner. Staff can change the journey owner during inquiry or through the dedicated application assignment action; scheduled inquiry follow-ups move to the new owner. Onboarding has its own owner-change action and audit event.
Staff can capture a lead before an Offering is known under a published admission cycle, then confirm a matching open Offering in the management drawer. In **Intake & Assignment**, an administrator can also create a separate public link for a website, QR campaign, referral, or school fair. The public form asks for basic student and guardian details, class interest, and contact consent. Its link fixes the period and source, and its assignment profile distributes the lead immediately; staff confirm the exact Offering later. The generated URL is shown once, can expire, and can be revoked. This public form is a basic lead-capture form; staff capture with a selected Offering continues to use that Offering's published Inquiry Form.
Historical managed Inquiry versions keep their stored snapshots, deadlines, assignment policy, and audit history. Effective policy reads normalize retired requirements: contact and qualification are optional before application start, and policy-level email, date-of-birth, and source-detail requirements do not block capture. Automatic duplicate detection still offers opening an existing inquiry or linking an eligible sibling; creating a separate family for an actual duplicate requires a reason. Published form requirements and Allowed sources remain authoritative. See the [backend Inquiry rules](../../../Shikshamitra-BE/docs/modules/student/product.md).
The list uses backend paging with cycle, offering, status, source, owner, assignment state, operational work queue, applicant, and phone filters. Work queues are evaluated before paging so small, medium, and large schools see correct counts and pages.
The **Manage** drawer explains readiness and overdue work, edits pre-application inquiry details, records structured contacts, schedules and completes follow-ups, records a qualification outcome with a standard closure reason, shows the activity timeline, and can reopen a non-terminal qualification.
Server capability flags and blockers control available commands; application-start and workflow guards remain authoritative on the backend.

## Managed Form stages

A Form stage retains the Basic process unless the administrator enables managed Form behavior in a draft workflow. The editor selects the published application form, responsibility, optional deadline, submission limit, save-and-resume behavior, automatic advancement, correction requests, and any sections that staff must verify. When staff verification is enabled, the editor loads the selected form's full published definition before offering sections; a failed load can be retried without losing stage changes. Changing the attached form clears old verification section choices so staff can select sections from the new version. Unsupported or unrelated configuration is preserved.

The selected Form-stage definition must exactly match the application form assigned to the Offering. An applicant can save and submit through the existing dynamic form; the frozen published definition and immutable submission snapshots remain authoritative. When automatic advancement is disabled or section verification is required, submit holds the workflow at Form. Authorized staff can verify each configured section, revoke a verification with a reason, or request a reasoned correction. Correction returns the form to draft and makes earlier section verification stale; resubmission consumes another configured attempt. The existing Continue action becomes available only after the server reports that every blocker is resolved.

## Managed Payment stages

A Payment stage retains basic manual completion until an administrator enables **Managed collection with financial controls**. Configure the receipt purpose, amount and currency, payer, accepted staff methods, optional deadline, installments, independent verification, waiver authority, and continuation behavior. Online collection is explained but cannot be selected for publication until a trusted tenant gateway exists.

The application card shows required, settled, and outstanding money with progress, deadline, blockers, receipts, references, and transaction status. Staff record received money; non-cash methods require a reference. A different staff member verifies when dual control is enabled. Rejections, waivers, and reversals require permanent reasons. The stage continues only after settlement or an authorized waiver.

## Managed Offer stages

An Offer stage retains the existing admission decision behavior until an administrator enables the managed process. The editor configures unconditional or conditional content, terms and response confirmations, validity and expiry overrides, decline reasons, extension/reissue limits, completion outcomes, and automatic continuation after acceptance. A preview shows the applicant-facing content while configuration errors block publishing.

At runtime, the application card shows version, status, conditions, expiry, the existing journey counsellor, blockers, capabilities, and permanent history. Issue and reissue dialogs keep the existing owner; the dedicated application assignment action changes it when needed. Direct Registration offers an optional owner choice at entry. Applications display the owner and provide a server-filtered counsellor queue. Staff issue, accept, decline, extend, withdraw, or reissue through focused dialogs that preserve entered values on failure. Acceptance collects configured evidence; decline and exception actions collect reasons. The frontend continues only when the server reports completion, and non-acceptance outcomes depend on explicit backend-validated routes.

## Legacy managed Seat stages

Seat is hidden from new workflow drafts. Published versions and applications already pinned to a managed Seat stage retain their configured capacity, reservation timing, renewal limits, FIFO waitlisting, exceptions, release reasons, completion outcomes, and continuation rules.

For those historical journeys, the application card continues to show available, reserved, confirmed, and total seats with occupancy progress, reservation expiry, waitlist position, blockers, server-authorized actions, and permanent history. Staff actions remain governed by server capabilities and concurrency controls.

Room-derived class capacity now belongs to the Admission Offering setup and is shared across tracks. New waitlist setup still requires its own persisted contract; the Workflow Builder must not simulate either policy with UI-only fields.

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
Configure each requirement for All classes or Selected classes; option labels include academic context, unavailable saved selections remain visible, and lookup failures offer Retry without clearing the selection.
In the Document Verification stage, choose **When to collect documents** to link a Form stage that leads to this document stage.
`document-verification/application-form-documents.tsx` renders the same checklist within the staff application form when the server permits early collection; save dirty answers before uploading so applicability uses saved values.
The upload remains pending review under the document requirement, and the later verification screen reads the same evidence revisions.
Original checks, reviews, waivers, and completion remain in the active document stage; no duplicate generic Form Builder upload field or parent portal is introduced.
Documents not applicable to the applicant are collapsed behind an explicit Show action; their retained evidence stays accessible.

Document action dialogs preserve the selected evidence and application stamp while editing, keep entered values on failure, and use the local `CustomDialog.guardUnsavedChanges` behavior without clearing a dirty application form. Replacement and original-attestation behavior is explained before saving. The existing workflow advance action is available only when the backend reports `canComplete` and the user has advancement permission.

Once admission finalization links evidence to a Student record, the existing student profile **Documents** tab can show **Admission evidence**. `studentProfile/student-admission-evidence-panel.tsx` groups retained versions by their source application, stage, and requirement. It requires both student-record and admission-document view access; authorized downloads retain the student scope. This panel is read-only and leaves normal student document collection in place.

The profile first loads its protected record summary and checks that the returned Student GUID matches the requested identity. Tabs mount only after that read succeeds. A failed profile request shows a clear error and Retry instead of empty identity fields; the Documents tab then reads normal documents and retained admission evidence for the resolved student.

Frontend screens own loading, empty, error, and interaction states.
Backend services remain authoritative for duplicate detection, tenant isolation, permissions, validation, version freezing, workflow transitions, and persistence.
Add new admission behavior only after extending and validating the owning backend contract, permission, workflow, and persistence rules.

## Onboarding account email workflow

Readiness & Access configures student and parent/guardian credential emails independently from account preparation. Email-enabled accounts must also be prepared. Schools choose staff-driven or automatic provisioning and activation or full-onboarding-completion timing. GR, roll, division, and required documents or authorized overrides remain required before sending.

Student Setup shows persistent Pending/Sent/Failed/Blocked sending states and authorized send/retry actions. Sent means sender acceptance, not inbox delivery. Existing sibling parent accounts retain their password. The staff interface never displays passwords. Document uploads remain awaiting verification until validated, accepted Admissions evidence is available, or an authorized staff member records an individual/all-document override with a mandatory note. Overrides are available independently of whether further uploads are enabled.

See the [backend Student rules](../../../Shikshamitra-BE/docs/modules/student/product.md) for contracts and lifecycle access rules.
## Student dashboard

1. Open Dashboard from the Student menu with its exact View grant. The existing Student header supplies the academic year.
2. Wait for server-confirmed identity, role mode, academic scope and permitted destinations. Admin/leadership prioritize records; teachers prioritize attendance; common staff prioritize assigned admission work. Role names change priority, while permissions and scope determine access.
3. Read available Student records, Admissions & student setup, and Attendance & leave sections. Each section has its own loading, error, retry and update time. A failed section does not block the others.
4. Scan Needs attention for setup requiring review, ready-to-activate students, attendance drafts and pending leave requests. This queue uses permitted positive counts and follows role priority; failed reads mark it incomplete. It does not invent an overall health score.
5. Review Student population and Attendance registers doughnuts, then Class strength and Admissions workload bars. Charts show the selected year and scope; register submission is not a student attendance percentage, and setup states overlap within unfinished cases. Graph value links open existing permitted workspaces. Non-empty charts mount near the viewport through the shared chart implementation; all graphs share the same three reads as the summary cards. The existing class-strength expansion remains available.
6. Use Refresh dashboard to repeat live reads. Switching academic years clears previous-year metrics, priorities and chart values immediately. Missing access, missing year and empty data have explicit states. Follow Quick links into other permitted workspaces; section spacing, breadcrumbs and `DashboardSectionCard` match the academic dashboard.

Verified Student/Parent-only identities see only their linked student names and relationships. Staff reports and directory links are withheld for this portal context. The current frontend has no independent student-self dashboard destination to invent; personal Attendance percentages remain owned by established reports/API surfaces. Mixed staff/portal roles retain staff permission and scope handling.
