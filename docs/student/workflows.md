---
module: student
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-10-15
owner: frontend-team
audience: humans-and-agents
---

## Staff academic scope

Student browser tasks are staff tasks. The staff member's existing Academic assignments determine which Student records are available. Keep the global year selection and use local Board/Medium selectors for authorized placement contexts. Attendance drafts retain their unsaved-navigation flow; failed authorization or a revoked placement clears inaccessible roster data.

## Shared permission editing

The original [Security editor layout](../security/workflows.md) is retained, with complete catalogue coverage and independent action toggles.
Do not enumerate grants from a fixed CRUD list, infer action bundles, or restore revoked access through reseeding.
The backend [security standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md) owns authorization and approved repair rules.
Existing backend operations that share one permission identifier remain one capability until a separately approved domain change.

# Trace Student Enrollment Admissions workflows

## Finalized admission review

After status `AdmissionFinalized`, the decision panel becomes a read-only summary with Admission summary, Onboarding handover, Admission evidence and collapsed Decision & finalization history. There is no repeated green success banner or visible introductory guidance; the handover information button contains that guidance. Existing stage review stays available. The guarded footer returns to the originating Applications/Assessments list and opens Student Onboarding only with its View grant. Actual case placement, identifiers and persisted activation evidence are displayed separately from admission finalization; absent, denied, loading and failed reads are explicit states. Document evidence reports recorded stage completion/skipping rather than asserting that every individual document was accepted, and a saved fee selection is confirmed only with its completed owner stage or Onboarding confirmation. No admission, enrollment or Finance mutation is performed by this review.

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

## Academic filters

Admissions Inquiries, Pipeline, Applications, and Admission Offering use one Board and one Medium, with no All option for either. Empty or invalid parent selections default to an available school option; changing a parent resets its descendants. Class supports multiple selections within the selected Medium. Student Setup uses the same parent rules and supports multiple classes and divisions, with class names included in division labels. Class and Division retain All options within the selected academic scope. Clear filters retains Board and Medium; URL selections survive reload. Identifier locks still require exactly one Division. The retained Review queue component uses the shared filters, but `/student/admissions/reviews` currently has no active route. Assessments explicitly allows all Boards/Mediums within the selected year; its workspace Clear Filters resets academic and assessment filters together.

## Certificate workspace

Certificates uses the compact icon tabs from Student Setup, with the Generated month picker on the right of the same bar (stacked within that bar on narrow screens). The page header offers a small Create certificate action; Configure template is not shown here. Certificate creation defaults to the first school level, class and division under the selected Board/Medium. Changing a parent selects the first available descendants and clears selected students. Creation, preview, batch review and certificate-action dialogs use the shared dialog shell, Title Case headings, title information tooltips and small footer buttons with leading icons.

## Configuration workflow

1. In **Admission Periods**, an administrator creates or selects the admission cycle that controls the intake window.
2. In **Admission Form**, the administrator builds, previews, validates, and publishes reusable Inquiry and Registration forms. Correction requests reopen the existing Registration form; consent questions can be included in that form. Document requirements are configured in the Document Verification stage of the Admission Stage workflow.
3. In **Admission Stage**, the administrator builds the workflow stages, chooses what happens next, saves the draft, and publishes it after server validation.
4. In **Admission Offering**, the administrator explicitly selects an open published cycle, an **Admission type** (General, RTE, Management or Staff), Board, Medium and classes, connects a published workflow, optionally selects an intake setup, previews readiness, and bulk-creates inactive offerings. Activation is a separate action in the Offering list. General starts with Inquiry; new special-type offerings start with Registration. There is no **Starts with** dropdown. Inquiry forms are selected only for inquiry-enabled offerings. **No setup — manual assignment** leaves intake profiles empty without blocking activation. The Registration form comes from the workflow's Form stages; there is no second Registration form selector. Bulk class choices remain available across school levels in the selected medium, and bounded type-specific codes are generated automatically.

General admissions start through Inquiry and Pipeline. Authorized staff can use **Start special registration** on Applications, explicitly select an open published cycle and special admission type, then choose an active, open, configured offering. RTE workflows must start with Form and contain neither Inquiry nor Assessment. Management and Staff direct workflows must start with Form and contain no Inquiry. Registration enters that offering's common workflow; it does not skip document checks, Finance confirmation or admission finalization. Existing applications retain their frozen form and workflow. Historical routing and the governed Student Records return flow remain unchanged. See [backend offering rules](../../../Shikshamitra-BE/docs/modules/student/workflows.md#create-or-edit-an-offering).

The setup screens are `admission-cycles.tsx`, `admission-offerings.tsx`, `admission-workflows.tsx`, `admission-forms.tsx`, and `admission-form-preview.tsx`.

Workflow creation uses a two-step setup flow. **Workflow details** offers only Standard admission and Blank workflow. Standard admission starts with Entrance assessment, then Admission form, Document verification, Payment and Admission finalization, with five stages and four usual routes. Payment retains the Finance class fee-structure confirmation policy; Admission finalization retains the existing Admission Decision runtime. The selected template appears in the journey preview on the right, with stage and route counts in its header. Existing saved journeys stay unchanged unless a replacement template is explicitly selected. Beneath the templates, the administrator enters a name, optional description, and a published Registration form for a ready journey's Form stage. A blank journey can attach a Registration form after its Form stage is added. The create step does not collect an Inquiry form or set an Inquiry form default. **Continue** creates one Draft with the selected stages and routes, then opens **Build journey** in the existing builder. Back lets the administrator edit the saved details of that same Draft; saving does not create another workflow. Edit details also exposes the same templates and Registration form, with the actual current journey shown by default. Only an explicit template selection replaces stages/routes, after confirmation; ordinary name/description edits retain the graph. Template selection remains in Workflow details; Build journey has no separate Template action. When an Offering selects the published workflow, the backend resolves its linked Registration form; the Offering does not collect a separate Application form choice. Inquiry capture and qualification happen before an application starts, so new Admission Stage templates use only Form, Assessment, Payment, Document verification, and Admission decision; each template includes the stages it needs. Historical Inquiry workflow stages remain readable and executable for applications already pinned to them but are not selectable for new processes.
The first step generates a code from the name and keeps the selected template stages visible while details are entered. The page description uses the shared breadcrumb tooltip. Save draft and Publish sit at the bottom-right beside the journey status. Publish saves pending changes, validates them on the server, publishes immediately and returns to the Admission Stage table only after success. Validation or publication failures preserve the journey and display actionable feedback. Scheduled publication, governance decisions and workflow notifications are removed from this active setup flow; historical records remain readable.
Create and edit details use an in-page workspace beneath the Admission Stage breadcrumb, not a fullscreen dialog. Both setup steps use a full-width white background card containing their progress and working content. Desktop module navigation stays visible; narrow screens retain the existing responsive navigation. In create and edit details, Workflow details sits on the left and Journey preview on the right from the desktop breakpoint; both cards stretch to the same height and they stack at smaller widths. Setup progress has no extra vertical padding. The form body scrolls independently of its compact footer. Build journey groups progress and the ordered journey inside the same outer card. Undo and Redo sit beside Add stage; the shared Scrollbar owns stage-list scrolling, while journey status and lifecycle actions stay visible in the bottom footer. The completed Workflow details step is clickable and opens the existing guarded details form. Build journey uses the same forward validation and save path as Continue; no shared stepper component is changed. With no template selected, its actual current stages and route count remain in preview; changing the Registration form updates only the first ordered Form stage using the shared form-policy writer. Selecting a template previews the replacement and requires confirmation before saving it, including Blank workflow when it would clear a non-empty journey. Keep current journey cancels template replacement. Inquiry defaults remain unchanged, and failed saves do not replace local graph state or concurrency stamps. Duplicate step-count text and the inline edit title/information row are omitted; the close control and named workspace remain accessible. Create/edit breadcrumb Back invokes the same guarded close as Cancel, including blocking saves and unsaved-details confirmation. Clone continues to use the existing bounded drawer.
The dedicated `/student/admissions/settings/workflows/[id]` builder shows numbered stages in saved `displayOrder` sequence and owns simple next-step destinations, undo/redo, validation and permission-gated actions. Drag-and-drop, reorder handles and keyboard reordering are removed; this does not rewrite stage order or applicant routes. Stage behavior groups Required stage, Entry stage and End of journey together. The former Configure/Journey map tabs and builder overflow menu are removed. Stage-level action menus remain available.

Administrators set Entry stage and End of journey in Stage behavior. When another stage is already the entry, the Entry toggle is hidden; the current entry keeps its toggle so staff can explicitly release it before choosing another eligible stage. Entry retains the stage-type capability restriction, while ending is available for all stage types. Saved ending flags survive a type change. Completing an ending stage ends the journey after its completion requirements pass; ending stages have no outgoing routes. Read-only workflows keep these controls locked.

Stage configuration is one continuous form with Stage details, stage-specific settings and Stage behavior in existing rounded cards. The Next step card is removed from all five stage-type settings. Form completion and Assessment setup show their settings directly inside existing section cards, without accordions; errors and unavailable-data feedback remain visible. The Form stage picker lists published Registration forms only. Existing Inquiry form references remain stored until replaced, but cannot be applied to a Form stage. There is no Stage details/Completion rules stepper. Special outcome creation and condition editing are removed from the active builder. Existing conditional paths remain visible and read-only on journey cards. Form, Assessment and Documents use managed settings by default; Payment explains Finance fee-structure confirmation. Stage codes remain internal. Apply changes validates the full form and updates the local journey; Save draft persists it. Back protects unsaved changes. Small Back and Apply changes align on the right. Type changes confirm before clearing process settings and the attached form; names and instructions remain. Published versions remain read-only.

**Choose next step** appears on a journey card only when a stage has no usual path. It opens the normal Add stage settings; Apply changes adds the new stage and its default connection together, without opening a route drawer or linking back to an existing earlier stage. One Undo/Redo reverses/restores both changes. Cancel leaves the journey unchanged. Existing default routes are never overwritten, and editing an existing usual destination remains available in its journey action menu. Saved conditional routes retain their original rules and can be viewed without being edited or deleted through route controls. New Standard admission workflows remain linear: passed or waived assessments can continue; failed, absent or retake outcomes remain at Assessment, where staff may arrange an allowed retake or use End journey to record a withdrawal. End journey does not record rejection. The separate Add stage action still auto-connects only an unsaved, simple linear journey; saved and branched journeys retain their paths unless Choose next step is explicitly used.

The selectable stage types are Form, Assessment, Payment, Document verification, and Admission decision. Eligibility, Review, and Offer setup and working actions are removed. Payment supports optional embedded Finance collection or reason-required deferral to Onboarding. Selecting a structure alone does not record money or claim payment settlement.

Build journey always opens the ordered stage list, including when an older link contains `view=map`. Each stage shows its usual path and any preserved historical conditional paths together. Template, Preview, Validate, Test routes, Versions, Governance, and Usage are no longer toolbar or overflow-menu actions in this workspace; publishing validation, stage editing, and the existing list-level version/usage entry points remain intact.

The retained route-simulation component (without a builder-toolbar entry point) runs the complete release-safety scenario set and summarizes how many reach a terminal stage. Administrators can open any scenario, adjust its condition values, and inspect the selected journey. The simulation follows the same priority-first conditional selection and default-route fallback as runtime routing and identifies ambiguous or missing routes. Conditional routes leaving one stage require unique non-negative priorities, and a route without a condition is saved as the stage's single default route. It is a configuration preview only; backend validation, managed-stage policy validation, stage evidence, permissions, and runtime completion gates remain authoritative.

The route preview also checks managed outcome gates: Payment requires a saved applicable Finance fee structure, and failed/absent/retake assessments need explicit matching paths. It shows when multiple special paths match and which priority wins. It does not submit forms, review evidence, record payments, or make admission decisions.

Release readiness is deliberately checked at two lifecycle points. Publishing a workflow validates graph integrity, runtime support, managed-stage configuration, and configured SLA or deadline ranges. Staff availability depends on an Offering's academic hierarchy, so activation revalidates it in that concrete scope: configured Inquiry counsellors must be active and accessible, and the existing Offering assignment profile must have eligible staff in its hierarchy. This keeps reusable workflows independent of one campus while preventing an unusable Offering from becoming active.

Version history includes the complete stage and route definition plus per-version Offering and Application usage. Administrators can compare the open version with an earlier version by stable stage codes, review added, removed, and changed stages/routes, and copy a selected immutable version into a new Draft. Creating that Draft never changes published versions or applications already pinned to them, and only one Draft may exist in a workflow history.

The permission-protected Usage panel reports real runtime records for the selected immutable version: journeys started, active and completed, overall completion rate and duration, plus per-stage entered, active, completed, skipped, completion-rate, average-duration, and oldest-active values. It also shows Offering, distinct Campus, and Application impact; an Offering without a Campus remains labelled as school-wide scope. Empty versions show an explicit no-data state; the frontend does not manufacture estimates.

The Offering screen uses server-side search, paging, sorting, URL-backed primary and advanced filters,
automatic cycle-date inheritance, readiness feedback, optimistic concurrency, and
`ThreeDotsActions` row commands. Published workflow and form selectors search and page the server
instead of limiting large schools to an initial client-side option list.
Inquiry and application selectors are purpose-safe: Inquiry selectors request only published Inquiry forms, while Application selectors request only published Registration forms. Document requirements use explicit Required or Optional settings; saved conditional requirements require an explicit replacement before applying changes. Parent messages remain Communication templates so Communication continues to own approval, consent, providers, delivery attempts, retries, and usage.
Archived cycles are excluded from the setup selector.
Edit opens the Offering drawer immediately while fresh detail loads inside its shell; table rows stay visible. Detail failures stay in the drawer with Retry rather than opening a creation form. Its two steps are **Configure** and **Preview**, sharing a full-height background card and the module's section cards. The admission cycle context appears below the stepper. Configure combines academic identity and operational configuration; Campus, Offering code and admission-window controls are absent. Both academic and configuration fields use equal two-column rows on desktop/tablet and stack on mobile. Configuration pairs Offering name with Published workflow, then Published inquiry form with Intake & assignment setup; direct-registration Offerings retain their existing rule of omitting the inquiry form. Existing code and campus assignments remain unchanged in form values and writes. New, bulk and edited Offerings inherit the selected cycle's dates rather than saving a date snapshot; existing custom-date Offerings are not migrated until edited and saved. Heading guidance is available through info icons, with no informational/warning banners or redundant field hints. Required-field, option-load, empty-hierarchy and server readiness errors remain actionable. Continue validates the complete form and requests readiness before Preview; an invalid active Offering cannot be saved. Preview shows readable academic values, the Offering name (without its code), its retained admission path and readiness. Back and Continue/Save changes are grouped on the right with shared icons. Configuration selectors retain their visible choices when returning from Preview. Unsaved-change protection, permissions, frozen application versions, concurrency and the existing active/inactive state are unchanged.
Clone can target any non-archived admission cycle. It copies the source code, workflow, and
form versions, inherits the target cycle's dates, then clears and revalidates the academic hierarchy against that cycle;
applications are never copied.
Single setup distinguishes safe inactive preparation from full activation readiness. Bulk create uses an all-or-nothing server preview and always saves Inactive; its Preview step has the same shared section-card treatment as Select & Configure, a creation summary, class names and codes, and class-specific validation. Common configuration messages appear once; duplicate-offering issues remain attached to their classes. The former After creation/activation choices are removed. Activation-only warnings do not block safe inactive preparation. A refused final commit updates the preview without closing or showing a success toast. Bulk Select & Configure requires an explicit Admission cycle selection from published, currently open cycles in the page's academic year; no cycle is automatically selected, even if only one is eligible. The searchable, paginated selector shows cycle names, academic years and dates, with loading, empty and error/Retry feedback. Both Preview and Create use this selected cycle ID and always inherit its dates; no Admission window dropdown or custom-date fields are shown. Changing or clearing the cycle invalidates the old preview while retaining class, workflow and form choices. Back from Preview retains the selected cycle and configuration. The readable selected cycle name, academic year and dates remain visible in both bulk steps. The Offering list's URL-backed cycle filter and first-non-archived fallback remain unchanged and no longer choose the bulk target. Action confirmations
show the Offering identity, linked Application count, and the effect on new and existing intake for activation and deactivation. Delete uses a concise plain-text permanent-removal confirmation naming only the Offering, without academic scope, usage counts or a warning panel. Existing deletion eligibility, permissions and server checks are unchanged.

Bulk Preview presents each class in a neutral outlined card with its generated code, creation status and class checks. Shared configuration checks appear once beneath their controlling field labels. Edit selection or Back returns to the preserved form choices and displays server feedback below the corresponding controls. Required inputs carry stars; workflow/form requirements remain conditional on activation, and the heading info icon explains inactive preparation. No setup — manual assignment remains visibly selected both initially and after clearing a setup; it clears both profile IDs without making assignment mandatory. Setup-load failures retain an inline error and Retry action.

Bulk Class options that already have an Offering for the selected cycle, academic/campus scope and admission type stay visible but disabled with **Offering already exists**, using the shared select's disabled-option pattern. **Select all classes** selects only eligible classes in the current medium; when all eligible classes are selected, **Deselect all classes** clears them. These actions never persist the synthetic menu option as a class ID. Changing Board or Medium keeps the existing dependent selection reset. General and RTE can therefore have separate offerings for the same cycle and class; the same type cannot be duplicated.
Changing the cycle refreshes these choices and retains only selected classes that remain available; workflow, form and intake selections are preserved.
The Class field and Preview wait for the complete lookup; a failed check shows field-level feedback and Retry class check instead of treating every class as available.
Changing Admission type derives its default entry route, clears selected classes and incompatible workflow/inquiry configuration, and refreshes the class check. Counsellor routing is retained. When all classes are configured, the field names the admission type for which no classes remain. Edit and clone retain saved routing unless the type is explicitly changed; used offering identity remains locked.

Offering details let authorized staff assign rooms to a class for an academic year. Inquiry and direct-registration screens show the backend-calculated remaining class seats; Inquiry capture and handoff block a full class unless its offering allows waitlisting; Direct Registration retains its existing capacity behavior. General and RTE Offerings for the same class share that count. Opening a form or Offering detail refetches the latest count; finalizing an approved admission refreshes the cached capacity shown to counsellors.
Selecting a special Admission type in Offering configuration switches new entry to Registration and clears Inquiry configuration. RTE's published workflow must omit Inquiry and Assessment stages. Historical Management/Staff Inquiry-or-direct offerings remain usable through their permitted entry routes; the setup UI does not expose a separate entry-mode selector.

## Inquiry capture and handoff

1. Select the admission period and the school Board, Medium, and Class before entering family details. A matching open, configured Inquiry offering is required on staff and public capture; no new Offering unknown entry is available. Full classes follow the offering's waitlist setting. Availability failure offers Retry rather than claiming admissions are closed.
2. Complete the offering's published Inquiry form. Current admission Board, Medium, and Class are system context and are not repeated in the builder's student-field palette. New inquiries start Pending; a selected intake setup supplies automatic counsellor routing. A public link created without a setup explicitly keeps its inquiries Unassigned for staff to assign later.
3. In **Inquiries**, open **Edit** for the original pinned published form and form-change history. Use **Follow-up** separately to read notes cards and submit Notes, Next Reminder Date, and Status together. Pending and Interested require a future reminder; Not interested requires only the note. Academic changes recheck availability before saving. Legacy records and activity are retained.
4. Mark Interested only after confirming the family's response. The first Interested transition queues the qualification email when an eligible email is available; email handling does not create an application or block inquiry updates. Delivery remains Communication-owned.
5. Use **Move to next stage** only for Interested inquiries. The backend rechecks availability and capacity, creates or returns the linked application, carries the counsellor forward, and opens the existing application workspace. This is the General inquiry handoff; special direct registrations use their separately selected offering and enter its Registration stage without creating an Inquiry.
6. Transferred inquiries leave the main **Inquiries** list and their active linked applications appear in **Pipeline**.
   Continue opens the existing application current step and returns to the retained Pipeline context.
   Inquiry details and qualification remain locked; permitted follow-ups continue through the application workspace using their original inquiry records.
   Entering **Admission Decision** removes the same case from Pipeline and shows it in **Applications** before any decision is recorded.
   Once transferred, correction work stays in Applications. A journey ended before Decision appears as Withdrawn in Applications history, while its decision-entry flag and timestamp remain unchanged.

Inquiry rows expose separate Edit, Follow-up, and Move to next stage actions. Follow-up is a focused notes dialog; Edit contains no contact, status, assignment, or follow-up panels. Move remains gated on Interested. Existing exceptional reassignment contracts retain manager capability, transfer reason, pool eligibility, and capacity enforcement. New bulk operations remain backlog.

## Student Onboarding configuration

Configure the academic structure and Admission Offering before preparing students in Onboarding.

1. Select the academic year in the Student header and open **Onboarding Settings**.
2. In **Portal Access**, choose whether student and parent/guardian logins are required.
   New schools default to Student No and Parent/Guardian Yes; existing saved choices and delivery preferences remain intact.
3. Admission and its published workflow supply the common readiness and document requirements automatically, without a named readiness rule or Offering linkage.
4. In the **GR Number** or **Roll Number** settings tab, configure numbering separately; new series start as Draft and require Publish before use.
   GR applicability uses Board/Medium/Class and retains School Level for GSEB; Roll uses Board/Medium/Class.
   The removed scope/reset/format/effective-date controls and Division Changes menu are not prerequisites.
5. Finalize the accepted application and open its case in **Readiness**.
   New and existing pending cases adopt common admission requirements and current saved account choices automatically, while keeping published document policies frozen.
   Activated, completed and cancelled cases retain their historical snapshots.
6. Use the pending count by hover, keyboard focus or tap, then choose a task to open the same case in its contextual tab/drawer.
   **Today** means cases that entered Onboarding today, rather than all students created today.
7. Verify required documents, reserve Division, prepare GR and Roll separately, and confirm an existing published fee structure in **Fees**.
   Fees selects optional heads where supported and confirms the admission snapshot without collecting money or opening a Finance assignment drawer.
8. Activate after a fresh backend eligibility preview, then find the active enrollment in Student Records.
9. Complete required account creation/linking and enabled credential-email sending in **Credentials** after activation using the saved automatic/manual mode.
   An account or email failure remains pending access work on the active enrollment and can be retried by an authorized user.

Student Setup orders its tabs as Readiness, Division, GR Number, Roll Number, Fees and Credentials.
Readiness has no student-selection checkboxes, and Entered onboarding today sits inside the academic filters card.
Student drawers combine Details and Checks into Details & Checks, retaining Tasks and History.

Division, GR, Roll, Fees and Credentials use one scope button instead of a Students dropdown.
Click **All Students** to show all rows; the button then becomes **Remaining Students**, which returns to pending rows (unassigned students in Division).
The compact row keeps only the task heading, pending count and controls; static descriptions, policy badges and selection guidance are omitted.
All buttons stay aligned on one line, with contained horizontal scrolling on narrow screens rather than document overflow; required manual-change reasons and validation remain visible when applicable.
GR, Roll and Division tables have no separate Select all visible button or Actions column; the student-name button still opens the case.
Auto operates on eligible students on the current page, or selected Division rows when exactly one Class is selected.
Division checkboxes appear only with that single-Class filter; selecting multiple classes or changing the worklist clears selection.
Auto Division requires an explicit target with current server capacity checks; it does not invent an automatic placement policy or Division lock.
Manual opens eligible table cells and saves only changed rows, with the published manual-entry rules and existing-number change reasons enforced.
Each case is refreshed and saved sequentially; saved rows are not repeated after a partial failure, while failed edits remain available for review.
Concurrent changes are not overwritten: cancel editing and reopen Manual to review the latest values before entering a new correction.
Drafts are protected when changing filters, page, scope or tabs, and an external academic-scope change blocks saving the old draft.
Fees and Credentials retain their per-student Review actions without selection checkboxes or Auto/Manual controls.

The retained per-student GR and Roll dialogs contain only their own inputs; a GR action never opens the Roll form or requires a Roll preview.
Roll numbering starts at 1 within each Class/Division/year, so Class 5-A and 5-B may each contain Roll 1.
Select exactly one Division in GR or Roll and use Lock/Unlock in the assignment toolbar for that identifier's whole Division/year group, including off-page students; Division placement itself remains editable.
An administrator with the required Repair capability can unlock with a reason, while a new student in a locked group receives the next automatic identifier.
Changing an existing GR requires a reason; first assignment does not.
Postactivation identifier corrections belong to Student Records.
CBSE GR uses the backend school-wide uniqueness rule across boards; changes to GSEB uniqueness and promotion remain backlog.
See the [backend Student workflows](../../../Shikshamitra-BE/docs/modules/student/workflows.md) for capacity, identifier uniqueness, approval, concurrency, requirement snapshots and audit enforcement.

## Managed assessments

Assessment has one managed configuration inside the Assessment setup accordion. Scheduling is optional; attendance, scoring, pass marks and Maximum attempts remain available. Independent result review is removed. Invalid configuration remains expanded so staff can correct it. Published versions stay read-only.

1. Open Admissions > Assessments to one applicant table, including unscheduled and result-only assessments.
   Board, Medium, Class and Session share one visible filter row; Offering/stage selectors and the insights action are removed.
   Session, search, sorting, page and progress selections retain their URL context. All, Pending, Complete and Ongoing use the compact Charges-style underline and count labels. Progress is supplied by the server before paging; see the backend assessment contract for its rules.
2. Use **Create Session** for the full-height task drawer: **Session details → Booking preview → Submit**.
   Choose School exam, Individual interview or Group interview; online assessment is not offered.
   Select Classes. One valid assessment match is selected automatically; multiple matches show a class-specific Select assessment choice. The request still preserves the chosen Offering and pinned workflow stage.
   Session name is suggested from assessment type, stage and date; a manually entered name is retained.
3. Search real Institute rooms by room, building or floor. Options are grouped by building with room name, floor and seat capacity; the selected value shows the room with building/floor helper text. Then set the date/time.
   School exam/group capacity defaults from the room and can be reduced; individual-interview capacity counts sequential generated slots, with a usable room still required.
   Interviews select an actual staff member through remote search; individual interviews additionally configure duration and gaps.
4. Review global proposed applicants and available seats/slots, then adjust the candidate selection across pages before submitting.
   One confirmation books at most 200 selected applicants; applicants outside the confirmed selection remain pending without an automatic new batch.
   The preview exposes room-approval requirements and preserves server-suggested interview times; new choices without a proposed time are assigned on confirmation.
   Failed confirmation retains details, selection and fingerprint for correction/retry; the parent screen retains an unchanged confirmation's idempotency key.
5. Use **Manage Sessions** in a contextual drawer to select a session's applicants, edit future arrangements, book another batch or cancel with a reason.
   Per-session capability and action permissions guard writes, including sessions shared with Offerings outside the actor's full access.
   Legacy sessions without an Institute room must adopt a room through Edit before the shared booking flow; booked individual-interview arrangements remain locked.
   Existing session type and Offering/stage links remain fixed even before bookings. An ongoing individual interview can book remaining future slots until its end time; school exam/group bookings still require a future session start.
   Room-approval and unavailable-session states remain visible with safe retry or filter recovery.
6. The table shows Student Name, Class, session name only, labelled attendance, Pass/Failed/Waived without marks, short Next Action and labelled progress. Click a row (or focus it and press Enter/Space) for history and permitted contextual actions; there is no Actions column. Marks remain in result entry and details.
   Record attendance and results from Next Action/details or select eligible rows for **Record Attendance**, **Record Results** or **Continue**.
   Selection is limited to active stages with managed assessment configured. Inactive history and unconfigured stages keep disabled checkboxes with specific hover/keyboard-focus explanations; Select All explains when no eligible rows exist. Assessment progress Complete alone does not disable selection while the stage still awaits Continue.
   Bulk sheets keep unedited attendance pending, validate each applicant against their own workflow policy and refresh current assessment evidence before saving.
   Up to 100 selected applicants are processed sequentially; successful rows are retained as successful while failed rows remain available for explicit retry.
7. Continue explicitly only after fresh workflow position and assessment evidence pass the existing guarded advance command.
   Shared session scheduling does not replace an applicant's pinned policy, create admission decisions or automatically advance the journey.
   Retakes retain earlier attempts and existing maximum-attempt rules; result-only stages still need no session.

The screen is `src/screens/student/admissions/admission-assessments.tsx`; task drawers and bulk sheets remain under its existing `assessments/` folder.
See the [backend Student workflows](../../../Shikshamitra-BE/docs/modules/student/workflows.md) for reservation, eligibility, concurrency and admission-boundary enforcement.

### Booking from Pipeline

The pre-decision application workspace is headed **Pipeline**, with Students → Admissions → Pipeline breadcrumbs. Decision-owned cases retain the **Applications** heading. **Book Assessment Slot** opens a full-height right drawer within the current stage; the external scheduling warning is removed. Available sessions and individual interview times reuse the existing booking controls. An empty session list offers **Add Slot** only to staff with session-management access.

**Add Slot** switches the same drawer to the shared session form. The current Offering and pinned assessment stage are fixed internally; staff select the type, date/time, Institute room and capacity, plus interviewer arrangements when required. **Create & Book** previews eligibility and atomically confirms exactly the current student, never the global suggested batch. Room approval, capacity, current eligibility and backend permissions remain authoritative. Failed requests retain the form; an uncertain confirmation replays its original command/key. Back, Cancel and close protect unsaved entries. Existing attendance/result controls and explicit Continue remain in the stage workspace. All labeled drawer actions use the theme's small button size without local height overrides.

## Document verification setup

Documents has one managed checklist, with no independent-review, waiver, early-collection or evidence-mode setup.

1. Add a standard requirement or use Add custom document. Both entry points and requirement edits use the compact anchored popover, with the shared dialog fallback on mobile, small right-aligned Cancel/Save requirement actions and a dirty-state guard. Checklist cards show the document name, requirement status, class scope and upload limits, with accessible edit/remove icons. Codes are hidden. The backend generates codes for new custom requirements when the workflow is saved, preserving existing and preset codes.
2. Set Required or Optional, All classes or Selected classes, upload formats/limits, and the optional Student document category. The category and its stricter limits remain available. Keep as admission evidence is displayed when no category is selected and saves no student-document-category link; empty, loading, failed, and unavailable-category feedback remains visible.
3. Apply the stage, save and publish the workflow. Advanced settings are expanded section cards.
4. At the active stage, upload evidence, Accept it or request replacement with a reason. Replacements require fresh acceptance; earlier revisions remain readable.
5. Continue after every applicable required upload is accepted. Accepted mapped evidence is retained for the Student/Onboarding handoff.

## Eligibility setup

Eligibility, Review, and Offer are retired Admission Stage types. New drafts cannot select them, publication rejects them, application workspaces do not mount their working panels, and their direct admission operations reject unsupported stages. Existing enum numbers and stored audit records remain intact. Inquiry qualification, Student Records reviews, class capacity, and Finance ownership are separate contracts.

## Managed Review setup and staff workflow

Eligibility, Review, and Offer are retired Admission Stage types. New drafts cannot select them, publication rejects them, application workspaces do not mount their working panels, and their direct admission operations reject unsupported stages. Existing enum numbers and stored audit records remain intact. Inquiry qualification, Student Records reviews, class capacity, and Finance ownership are separate contracts.

## Dynamic form builder

The form list opens **History & versions** in a shared dialog with separate Compare versions and Activity cards. Version and activity loads have retry feedback and show only the selected form's data; comparison results follow the selected form/version. Restore creates a new editable draft and locks conflicting actions while the request runs, retaining the dialog with retry feedback if it fails.

The full-screen editor in `src/screens/student/admissions/admission-form-dialog.tsx` uses the shared `CustomStepperWithFormik` for three ordered stages.
The shared stepper owns one Formik state across the stages; **Back** preserves entered values and **Next** validates the current stage without saving.

| Stage             | User interaction                                                                                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Form details**  | Inquiry forms offer **Blank form** or **Inquiry form**; Registration forms offer **Blank form** or the recommended **Admission application**. Enter the form details.                                                                   |
| **Build form**    | View every section in the selected step, select a heading to choose where fields are added, add ready-made packs, or preview the applicant form.                                                                                        |
| **Review & save** | Preview the actual form controls in section cards and navigate configured steps inside the navigation card. Review publishing checks, then choose **Save draft** or **Publish now**. Return to Build form to change fields or sections. |

Form details uses a centered 1120px container on large screens. Review & save uses a wider bounded 1440px container to retain usable field widths beside navigation. The selected Inquiry or Registration tab supplies the purpose for a new form; template replacement retains that purpose. Existing drafts retain their stored purpose. There is no Form purpose selector or unrelated starting-form choice. The starting-form heading omits redundant helper text. The wizard uses the shared scrollbar for vertical body scrolling with horizontal scrolling disabled and stable footer actions.

Review reuses the applicant field controls and HR section cards, with a bordered background card around the step navigation. The title and step menu remain in place while the form sections scroll using the shared Scrollbar. Long step menus can scroll within their own card; on narrow screens, navigation stays above the scrolling preview. Fields have no extra outer card border, and the form description is available through the title's info tooltip. Preview entries are temporary and never become saved form-definition data. Form Preview shows only applicant form controls and navigation: Test scenario, Validate preview, and validation-summary banners are absent. Enter in a preview input cannot submit the enclosing builder. Review has no Edit or Delete actions or settings drawer; these actions remain in Build form. Form checks remain visible, and review issues are informational. Use Back or the wizard steps to return to the appropriate configuration stage. The existing Save draft and Publish validation remains unchanged.
Details validation checks name, code, layout, and fields per row; the builder stage checks the section and field schema.
Preview and Review & save reuse the HR Basic Details composition: profile-photo controls appear first in a dedicated left area, with ordinary fields beside them. On narrow screens photos appear above the fields. This presentation does not change stored field order, answers, visibility, or repeatable-entry behavior. Both views keep the shared theme's normal label and small control sizes without a wizard-level minimum-height override; field grids adapt to the available width up to the selected column count instead of squeezing four columns into a narrow canvas. The photo uploader uses the shared avatar dimensions and retains its loading and validation feedback.
The final save validates the complete draft schema and is the only wizard action that persists the form.
Publishing checks in the review are advisory and do not add a separate draft-save gate.

| Workspace area     | User interaction                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Student fields** | Use the left palette to add linked student fields to the selected section; switch to Custom fields when needed. On narrow screens, this becomes a workspace tab.                   |
| **Your form**      | Keep all sections in the selected step visible. Use **Actions → Edit** to edit titles in place and the connected step navigation to select a step.                                 |
| **Add field**      | Open the field palette on narrow screens; on desktop the palette remains beside the canvas. Repeated additions keep the palette available.                                         |
| **Field settings** | Select a field to open the right drawer. Basic groups field details, answer options, and guidance in section cards; Rules exposes visibility conditions and location dependencies. |

Field settings has only **Basic** and **Rules** tabs and reuses HR section cards. Visibility conditions are always visible; Advanced rules and Data editors are absent. The settings drawer shares the wizard's modal layer so newly opened select menus remain above it and accept pointer and keyboard selection. **Show field when** displays **Always visible** when no condition is saved; selecting it clears the rule without persisting a selector placeholder. Every other configured field, including dates and fields in other sections, remains selectable. Existing binding, validation, and conditional-required metadata stays intact when editing other settings. Redundant helper copy is removed, while field errors and compatibility warnings remain visible. The heading's info tooltip explains that changes belong to the draft until saved. The shared scrollbar owns the drawer body, with the heading and Done action fixed.

Within **Build form**, desktop shows a wider student-field palette beside the selected step's section cards. Its compact search keeps the label inside until a query is entered, with adjacent category expand and add controls. The step navigation uses the same outlined card surface as the form sections and the active step number and label indicate selection without a gray background. On desktop, its card fills the available height; only the step list scrolls, while **Add step** stays in a fixed footer. Narrow screens retain compact horizontal step navigation; **Add section**, **Grid layout**, and **Preview** share the right side of the canvas toolbar. The More menu is absent. Step names and their edit/delete actions live only in the left navigation, while section headings edit in their cards. Sections and fields reuse the Admissions action menu with **Edit** and **Delete**, anchored below the three-dot trigger with a matching arrow. Section accordions stay clipped within their rounded card boundary in both expanded and collapsed states. Build form uses the HR form footer placement: Back, Save draft, and Continue stay attached beneath the field canvas on desktop, beside the step navigation; smaller screens retain one reachable footer beneath the active workspace, and Preview keeps those same actions. Sections start expanded and use a chevron beside their actions to collapse the field area without changing the draft. Selecting a collapsed section, adding a field, or reporting submitted section errors reveals its contents. Each field has a compact rounded outline around its label, preview, and actions; selection and hover retain a white surface with a stronger outline and selection caption. Four-column layouts use full-width previews with controls above the label at desktop sizes. Field actions and reorder handles appear on hover or keyboard focus and remain visible on touch screens. Advanced section/step settings and new repeatable-section controls are absent; previously saved visibility and repeatable rules retain their metadata and runtime behavior. Field settings open in a right drawer; narrower screens use **Student fields** and **Your form** tabs. Custom questions begin with a name, type and required state, with existing Student field suggestions before creation. A full-width **Add custom field** button follows the controls, and the outlined **More field formats** disclosure reveals presets and other field types. Choice questions accept one option per line and retain the visual option editor for later changes.
The Student fields palette groups the 107 server-provided choices, searches names and groups, and marks a linked field as **Added** when it is already used anywhere in the form. The catalogue includes Student photo, optional Aadhaar/PAN numbers, single-parent/single-child flags, sibling selection and permanent-address country. Sibling selection reuses the shared searchable selector with bounded server pages and restores the names of saved selections separately; a failed lookup retains the answer. **Current address pack** and **Permanent address pack** live inside **Contact and addresses** and add the dependent country, state and city fields together. Adding a category or address pack fills the selected empty section, retaining its identity and saved rules; a populated section is kept and the pack creates another section in the same step. Location fields reuse the employee form's shared selectors; changing a parent clears dependent selections. Photo uses the shared avatar uploader and accepts JPEG/PNG up to 2 MB. Six Financial assistance suggestions remain excluded. Supported predefined values populate a new Student's structured profile at finalization; other answers remain captured admission details. Existing Student changes require an explicit finalization choice and respect Student Records and Identity Compliance ownership. Onboarding case details display captured values for staff review.
The Student fields palette omits available-field and search-result counts. Its shared **Board, medium and class** accordion starts open and explains that these values are already captured when an inquiry selects its admission option. When the catalogue provides those fields, the guidance remains available across searches; collapsing it does not change the fields' disabled state or pack exclusions. Loading and lookup errors retain their existing states.
The local validation panel identifies structural, option, binding, and rule-reference issues before backend publish validation.
Closing or cancelling a changed draft requires confirmation, and replacing entered content with a different starting point requires confirmation.
All starting forms produce the existing `CreateUpdateAdmissionForm` contract. Existing school forms remain available through the form list and its clone action; the starting-form chooser no longer offers a separate template library.
An unsuccessful save leaves the editor open with its values intact for correction or retry.
Saving persists a draft; publishing remains a separate form-list action.

## Inquiry runtime workflow

1. A counselor selects board, medium, class, and an open Inquiry offering; the admission cycle follows the offering automatically. The form captures the configured applicant and guardian fields and an allowed source.
2. The inquiry flow checks duplicate phone, email, applicant name, and date-of-birth signals in that admission cycle, plus same-mobile families visible to the counsellor from earlier cycles. Staff can open an existing inquiry, link a sibling only when the primary guardian mobile matches and the server marks the family linkable, or use the permitted separate-family override. A name/email-only match remains visible for review but cannot be linked directly.
3. The server-paged inquiry list supports search and cycle, offering, status, source, My inquiries, Unassigned, specific-counsellor, Overdue, Awaiting first contact, Awaiting qualification, and Open follow-ups filters. Filters stay in the URL for refresh and sharing, sorting stays on the server, and Export downloads the complete filtered set rather than only the visible page.
4. Staff with Inquiry Assign permission can assign or reassign one inquiry, or select up to 100 visible inquiries and assign them together. The server changes the whole selection or none of it. New offerings use their selected Counsellor Assignment profile to distribute new inquiries by current workload and capacity; historical offerings retain their pinned workflow assignment behavior.
5. Edit shows the attached inquiry form and filtered form history. The separate Follow-up dialog shows notes cards with status, author, and reminder, then a compact note/reminder/status form. Its atomic command validates both inquiry and management versions. Once an application starts, inquiry editing and follow-up submission become read-only.
6. Staff with Inquiry Manage and Communication Add permission can use language-aware acknowledgement, follow-up, or application-link templates. Creation can immediately create/send the acknowledgement when selected; Communication Send controls immediate delivery, while provider, consent, approval, retry, and delivery tracking remain in Communication.
7. The counselor reviews Applicant 360 and starts an application only for an offering whose computed availability is `Open`. Opening Applicant 360 from an inquiry carries that exact inquiry into application start so the handoff is traceable and the inquiry is locked after conversion.

Pipeline is the active worklist for Inquiry-linked applications and started special registrations before Admission Decision.
Special registrations show Direct registration instead of an Inquiry reference and have no Inquiry follow-ups. On first Decision entry, ownership transfers permanently to Applications, including later corrections.
It shows the current application counsellor, actual stage/status, existing workflow next-action guidance, stage entry time, configured due date and retained open follow-ups.
Case defaults come from the server; changing My/All cases never expands the user's authorized academic scope.
Counsellor and stage choices come from full scoped results rather than the current page.
Board, Medium and Class stay in the academic row; Filters opens Cases, Counsellor, Current step and Status in the shared popover.
Apply Filters submits all four operational choices together; Clear removes only those criteria and preserves academic scope, search, sort and page size.
The server's My/All default remains implicit until changed, and My cases disables the separate Counsellor choice.
Academic filters, search, sort and pagination are shareable in the URL; academic-year changes reset hierarchy and page.
With exact Applications View and Add access, staff can select eligible admissions on the current page and choose Assign / change counsellor; Select all applies only to that page.
The shared dialog offers counsellors eligible for every selected offering, explains the linked-inquiry and scheduled-follow-up handover, and accepts an optional reason.
Submission rereads each application and uses its latest concurrency stamp in the existing single-record command, skipping applications already assigned to the chosen counsellor.
Runtime-backed and direct applications also verify the existing workflow read; cancelled, failed or unverifiable runtime cases cannot be submitted through this bulk action.
Successes are removed from selection; failed rows and their reasons remain for retry, with a fresh owner check preventing duplicate assignment after an uncertain result.
Changing tenant, user, academic scope, filters, search, sort or page clears selection and stops remaining commands; an already-sent command may still complete.
The application workspace remains authoritative for readiness, blocking reasons and workflow commands.
Continue opens the shared full-page Applicant 360 with validated list return context.
Entering Admission Decision switches its menu ancestry and return list to Applications when the current queries settle and no unsaved or busy editor remains.
Applications is the decision/finalization daily workspace and retains cases returned to earlier stages for correction, plus Withdrawn cases for archived history.
Its common table has toolbar search, server paging/sorting, one applicant/reference identity column, Class, Contact, Journey counsellor, Decision phase entered, status Labels and action icons.
The former separate Search, Status, Current stage and Journey counsellor filter row and Offering/Current stage columns are removed; academic Board/Medium/Class scope remains.
Removed URL filters are stripped, so invisible filters cannot silently restrict the list.
Configured journey stages use the shared vertical stepper; preparing a future stage never advances it and completed evidence remains read-only.
Header assignment, horizontal form sections, document verification and audit/history actions reuse existing components and permissions.
Unsaved-navigation and busy guards protect editor changes and automatic phase routing.
Missing legacy inquiry sources remain visible with an unavailable label, without creating another application.

The runtime screens are `admission-inquiries.tsx`, `admission-applicant-360.tsx`, and `admission-applicant-notes.tsx`.

## Managed inquiries

Inquiry capture and qualification are owned by the Inquiries workspace before the application workflow starts. Historical published workflows may still contain a managed Inquiry stage, but Admission Stage no longer offers Inquiry as a new stage and the school-ready templates begin with Application Form. Inquiry answer rule choices are removed from new stage editing.
The **Intake & Assignment** settings page combines Inquiry handling (allowed sources, contact and qualification deadlines, follow-up defaults) with Counsellor routing (staff pool, active-case capacity, fallback manager) in reusable admission intake setups. Selecting a setup on an Offering stores and validates both profile references. Leaving both empty permits activation when its other readiness checks pass; staff can manually assign from active Admissions Counselor users with access to that Offering. Configured pools retain their eligibility and capacity rules.
The settings page opens on a searchable, customizable setup table. **Create intake setup** opens a full-height right-side drawer with three steps for Inquiry handling, Counsellor routing, and review while retaining the table context. Edit uses the same drawer. Desktop review cards stretch to equal content-driven heights and stack naturally on narrow screens. Archived rows retain a disabled Edit action with a restore explanation and an enabled Restore action. Archive is disabled while active Offerings or operational links use the setup. Restore requires confirmation and the latest concurrency stamp, makes the setup editable and available for selections again, and preserves profile IDs and rules without reactivating historical Offerings or links. Stale restore attempts expose Reload latest; failed requests preserve the confirmation for retry. Allowed sources and Counsellor pool use shared checkbox multi-selects that remain open while selecting several values. Pool chips use the neutral gray style. Both pool and fallback choices request only active admission-access users assigned the canonical Admissions Counselor role. Review shows selected source and staff names, section-level Edit actions, and Review & update when editing. Unsaved-discard, shared-use confirmation, and stale-version reload protection remain available. Duplicate inquiry, Before application starts, Sources needing details, and the hidden email/date-of-birth requirement switches are removed from both setup and legacy profile editors. Allowed sources remains available; source details are optional. Opening an editor refreshes the eligible staff lookup; failed lookups disable routing selection and expose Retry without clearing the draft. The Public inquiry links tab lists links in a separate table and opens its creation form in a drawer.

Choosing a link's admission period loads compatible setup/form pairs from the public-link options endpoint. The form selector shows a labelled skeleton while published forms or period-compatible routing options load, then shows linked published Inquiry forms; the setup selector then shows matching setups. If a successful lookup has no compatible form, opening Published inquiry form shows the project info toast asking staff to create or attach a published Inquiry form to an active Inquiry/Both Offering in this period. No empty menu or large prerequisite information banner opens; a compact Refresh offerings action remains. Changing the period clears both routing selections while preserving the link details. Loading, failed, and empty compatibility reads block creation; Retry and Refresh offerings preserve the draft. An `OfferingRequired` response also refreshes compatibility and shows corrective guidance, including when an older server returns generic business-rule text. Configuration and permission ownership remain in the [backend Student workflow](../../../Shikshamitra-BE/docs/modules/student/workflows.md).
Entry mode may be Inquiry first, Direct registration, or Inquiry or direct. A direct registration with no manually selected owner uses the Offering's assignment profile. The assigned counsellor is the student's journey owner across application stages and becomes the onboarding case owner at finalization. Application Details and Applicant 360 show that owner. Authorized stage specialists may perform their own checks without replacing the owner. Staff can change the journey owner during inquiry or through the dedicated application assignment action; scheduled inquiry follow-ups move to the new owner. Onboarding has its own owner-change action and audit event.
Staff can capture a lead before an Offering is known under a published admission cycle, then confirm a matching open Offering in the management drawer. In **Intake & Assignment**, an administrator can also create a separate public link for a website, QR campaign, referral, or school fair. The link fixes the period, published Inquiry form and source; its intake setup is optional. A selected setup supplies automatic routing. **No setup — manual assignment** keeps submitted inquiries Unassigned, including when the selected Offering has automatic routing. Manual links require a compatible active Offering and published Inquiry form, with no setup match required; configured links also require matching setup and eligible owners. The generated URL is shown once, can expire, and can be revoked. The public form uses the selected Offering's published Inquiry form and requires contact consent.
Historical managed Inquiry versions keep their stored snapshots, deadlines, assignment policy, and audit history. Effective policy reads normalize retired requirements: contact and qualification are optional before application start, and policy-level email, date-of-birth, and source-detail requirements do not block capture. Automatic duplicate detection still offers opening an existing inquiry or linking an eligible sibling; creating a separate family for an actual duplicate requires a reason. Published form requirements and Allowed sources remain authoritative. See the [backend Inquiry rules](../../../Shikshamitra-BE/docs/modules/student/product.md).
The list uses backend paging with cycle, offering, status, source, owner, assignment state, operational work queue, applicant, and phone filters. Work queues are evaluated before paging so small, medium, and large schools see correct counts and pages.
The **New inquiry** and **Edit** screens use a full-height white outer card around the same section cards, bold headings and field spacing as Add Staff. Configured profile photos appear on the left of their section, with other fields alongside them and a single-column layout on narrow screens; registration forms reuse the same photo layout. Inquiry actions stay in a fixed footer while fields scroll. Both list-based and dedicated Edit entry points keep the originally captured form, preserve dirty-cancel protection and omit Form history from the editing surface. The table reuses the Finance Edit icon and shared notebook icon for Follow-up, with a left-aligned Actions heading and three direct icons for Edit, Follow-up and Move to next stage in the sticky column; this Inquiry-specific layout has no overflow menu. The separate **Follow-up** dialog reads notes cards and atomically records a note, business status, and optional reminder through the existing management, activity, and follow-up services. Existing audit persistence is unchanged.
Server capability flags and blockers control available commands; application-start and workflow guards remain authoritative on the backend.

The Inquiry table's Class cell shows only the selected class name returned as `standardName`, such as `1`, `2` or `LKG`; it does not show the offering code or admission cycle. Missing class data displays an em dash. The existing offering filter and academic class selectors retain their server-side behavior.

## Managed Form stages

Form uses Submission with rules by default. Select the published Registration form and configure late submissions, corrections and optional section verification in the Form completion card. Completed by and Due after are hidden; saved responsibility and deadlines remain intact. Allow late submission is editable without a deadline and saves its actual boolean preference. Runtime enforcement still applies only when a deadline exists; no deadline leaves submissions open. Applicant Save Draft and backend submission/correction safeguards remain. Loading form sections offers Retry without losing edits.

Submission advances after authoritative validation when no staff verification is required. With verification, the stage remains open until authorized staff verify every configured section; Continue then uses the existing backend gate. Correction returns the form to draft and makes earlier verification stale. Frozen forms and submission history remain authoritative.

## Managed Payment stages

The compact Payment workspace uses two equally stretched cards on desktop: Fee structure on the left and Fee collection on the right.
Both fill the available stage height through the existing workspace flex layout, with actions at the bottom; smaller screens stack them and use the common workspace scrollbar.
Selection remains explicit. The empty candidate state keeps Cancel and Check again, without an Open Finance shortcut or repeated setup guidance.
Collection keeps the server's balances, blockers, pending-verification warnings and receipts; unknown balances display an em dash rather than zero.
The student header shows the application reference and actual Class, Board and Medium context, with the existing counsellor and More actions.

Payment offers **Select fee structure**, **Collect Fees**, and **Collect later in Onboarding**. Structure selection reuses published Finance structures for the Offering academic year, Board, Medium and Class, with mandatory and optional heads and the application concurrency stamp. A structure is required only for collection. After a recorded collection, including a partial payment, ordinary Continue admission is available. No structure or no payment does not block reason-based deferral.

Collect Fees explicitly prepares the Finance account and dues, then opens the existing Finance collection form in a contextual dialog. It requires exact Finance collection View/Add grants, not Finance menu navigation. Amounts, payment methods, allocation, transaction review, outcomes and receipts reuse Finance. Viewing the stage or saving a structure does not prepare dues. Duplicate confirmation and uncertain-response retry retain the original payment command/key; unresolved outcomes block editing and closing until retry resolves. Receipt download requires its own Finance receipt grant.

Collect later in Onboarding opens a short reason dialog. Whitespace-only reasons are rejected; failure preserves the draft. Submit advances the existing workflow and saves the reason, actor and time, without creating an account, dues, payment or receipt. It does not mark fees Paid or approve/finalize admission. Historical review and the Onboarding Fees tab display the saved reason after ordinary admission finalization. Onboarding confirms a structure when needed and reuses the same Finance account and remaining dues for collection. See the [Finance ownership and duplicate safeguards](../../../Shikshamitra-BE/docs/modules/finance/references/admission-fee-collection.md).

## Managed Offer stages

Eligibility, Review, and Offer are retired Admission Stage types. New drafts cannot select them, publication rejects them, application workspaces do not mount their working panels, and their direct admission operations reject unsupported stages. Existing enum numbers and stored audit records remain intact. Inquiry qualification, Student Records reviews, class capacity, and Finance ownership are separate contracts.

## Legacy managed Seat stages

Seat is hidden from new workflow drafts. Published versions and applications already pinned to a managed Seat stage retain their configured capacity, reservation timing, renewal limits, FIFO waitlisting, exceptions, release reasons, completion outcomes, and continuation rules.

For those historical journeys, the application card continues to show available, reserved, confirmed, and total seats with occupancy progress, reservation expiry, waitlist position, blockers, server-authorized actions, and permanent history. Staff actions remain governed by server capabilities and concurrency controls.

Room-derived class capacity now belongs to the Admission Offering setup and is shared across tracks. New waitlist setup still requires its own persisted contract; the Workflow Builder must not simulate either policy with UI-only fields.

## Application workflow

1. Starting an application freezes the selected published workflow and form versions for that application.
2. The application detail screen renders configured fields by type and shows prefilled approved bindings and defaults.
3. Save persists editable values with the current concurrency stamp and stays on the selected section. Save & Next validates and saves before moving to the next form section; on the final section, Submit application replaces that forward action.
4. Submit performs authoritative validation and displays field-level errors before allowing progress.
5. Submit advances Form after validation unless configured staff verification still blocks it.
6. Later stages advance through the runtime API, which uses idempotency keys and returns current stage state, the server-derived next required action, and immutable transition history.
7. The application detail and Applicant 360 views render the frozen journey and its current working action. Approval, Waitlist and Reject belong to the active Admission decision stage. Waitlist keeps that stage pending; Approved or Rejected can complete it. Approved plus a completed journey enables Finalize without an Offer acceptance step. Finalize creates/links the Student and hands activation to Onboarding.

Pipeline and Applications open Applicant 360 as a normal page with the left working menu visible. The shared vertical journey stepper lets staff select every configured stage without counts or status captions. Pending stages permit preparation through server capabilities, while completed evidence remains read-only. Selecting a stage never advances or skips the actual workflow. Application form sections use a compact horizontal stepper at the top of their workspace.

Applicant identity, journey navigation, the selected stage and footer share one connected surface. Narrow screens collapse the journey into an expandable navigator and stack stage summaries beneath their controls. The form footer contains Previous, Save and Save & Next (or the final Submit application action); submitted/read-only forms retain navigation without exposing edit actions. Assessment rules use a compact strip, with a focused empty state and actionable booking/error messages. Fee confirmation groups published mandatory/optional heads with their actual revision and selection summary; amounts remain reference values and do not represent collected payment or new dues. Decision review rows open the corresponding guarded stage and use its real recorded status.

The page uses small themed actions, a header More menu and the shared document verification table. More includes the existing authorized counsellor assignment, review/history and workflow actions, plus Notes & Follow-ups. Notes & Follow-ups opens a right drawer with the shared note editor, MUI date-time scheduling form and combined history; the journey no longer repeats the inline follow-up panel. Switching activity type retains both drafts, failed commands preserve input, and closing confirms unsaved notes, scheduling or completion comments. The drawer uses one common custom scrollbar with a fixed header/footer. Inquiry screens retain their existing scheduling popover and history disclosure. Form section navigation uses the common custom scrollbar, while verification aligns each section's status and action without fixed offsets. End journey and Continue admission sit together in the footer; Continue acts only on the actual current stage after its existing requirements pass. End journey requires an audit reason and server eligibility before withdrawing the pre-finalization application. History and evidence remain available. Leaving or switching workspaces confirms unsaved answers/fee changes; blocking mutations lock conflicting actions. Failed saves preserve answers and the selected section. View-only access cannot edit or submit answers.

The runtime screen and field adapter are `admission-application-detail.tsx` and `admission-runtime-field.tsx`.

## Daily Attendance alignment

Daily Attendance uses the same active Student List population and Board, Medium, Class and Division filters in the selected global academic year. Admins begin with a paged read-only student table; marking requires one class and division. Teachers with one active assignment open that register automatically. Assignment, permission and academic scope remain server-enforced.

The rightmost sticky Attendance column contains Present, Absent, Pending and policy-enabled Half-day icons. Absent rows expose optional inline remarks in Details (maximum 500 characters). There is no Edit/Actions column or Draft breadcrumb badge. Ineligible students remain visible with a reason and disabled marking; they do not count as pending expected attendance.

Save draft permits partial marking. Submit attendance requires the complete eligible register, including rows outside the current search or page. Admin Lock is separate and applies to a submitted reviewed register. Mark pending as Present acts on eligible pending rows across the class while preserving saved marks, approved leave and rows requiring review. Existing correction safeguards remain; this change adds no correction queue, menu or Student List shortcut.

## Student List and profile

### Find an activated student and review the record

1. Complete configured Admissions and finalize to create or link the permanent Student and its Onboarding case.
2. Continue preparation in Onboarding until enrollment activation; a finalized-only case stays in Onboarding rather than Student List.
3. Open Student Records → Student List in the global header year; Active is the default population, with Former available inside Filters.
4. Narrow by Board, Medium, Class and Division; server search, sorting and pagination preserve that academic/population context.
5. Open the Student name or View link; Overview shows permanent identity, selected-year placement and linked admission/onboarding milestones.
6. Use Details, Documents or History without losing list context; related school/service views remain reachable through Related.

Activated students remain discoverable while credential preparation or email work is pending in Onboarding.
Former students retain their permanent identity and selected-year history.
Approved historical records retain their existing eligibility path; missing admission or onboarding evidence is displayed as unavailable rather than synthesized.
Student List keeps Student, GR number, Class / Division, Roll number, Status and Actions as its compact core columns; school-specific fields appear only in the profile.

### Edit the retained offering form and review audit history

Overview uses equal-height desktop cards with thin dividers and leaves Class/Division, Roll, GR and Medium in the identity header rather than repeating them in cards. Cards stack naturally on narrow screens.
Details displays the retained offering Registration form in its original field order and configured grid, including supported mapped and custom fields. Edit details opens the same form inline. Policy-masked fields and protected identifiers, placement, file/photo or read-only fields cannot be changed through this form.
Editing a school form later does not add its new questions to existing profiles or reinterpret their original submissions.
Admission/onboarding milestones remain on Overview; the separate Admission & Onboarding tab has been removed. Inquiry remains in its existing Admissions workspace.

Save requires a reason, validates conditional fields and applies allowed changes immediately through the dedicated audited profile endpoint without an approval step or page redirect. Existing role/field access and optimistic concurrency still apply. Failed saves retain the draft, Back/navigation use the same discard guard, and an in-progress edit retains its academic context during a global-year change.
History shows audit events with actor, timestamp, reason, outcome and field before/after details. Prior pending/rejected requests retain their real state; generic Changes approval policy remains unchanged. No enrollment-history table is rendered.
The original submitted Registration form is read-only and remains unchanged by a current-value correction.
If an edited condition hides a question, its current value is retained and becomes visible again when its condition applies.
Returning-admission differences are offered for explicit review; opening the profile or newer source does not silently overwrite current Student values.
Backend Records services own approval authority, value compatibility, snapshots, persistence and source integrity; see [Records product rules](../../../Shikshamitra-BE/docs/modules/student/product.md#permanent-student-records-behavior).

## Integration rules

Applicant 360 is the full-page application workspace showing the frozen journey and the selected stage. The Next action card and offering code in the applicant heading are omitted. Application name/reference links and legacy bookmarks reach the same workspace with safe return context. Review Application Form, Application History and Notes & Follow-ups remain available in its More menu. Notes require applicant View/Add grants; follow-ups require application View and the server's canManageFollowUps capability for commands. Sources load only when the drawer opens and only with their corresponding view access. Applicant notes and inquiry-backed application follow-ups retain their existing separate endpoints and concurrency rules. An application without a source inquiry can still show authorized notes. New workflows use the supported stage workspaces; historical Seat compatibility remains. Retired Eligibility, Review and Offer operations remain unavailable.

Finalize Admission uses a professional admission-summary presentation with semantic status colors, compact readiness rows and an information icon beside its heading. It still requires all non-duplicate readiness gates, an explicit identity choice when matches exist, and verified guardian contact. Repair applicant identity opens the existing identity editor and refreshes readiness afterward. Profile-field review remains optional and permission-gated. The presentation does not issue an Offer, assign enrollment or collect fees.

In Applicant 360, Finalize admission opens within the working page and groups readiness checks beside student-record details and guardian verification. Its Cancel/Finalize footer replaces the normal journey actions; other page navigation stays locked until Cancel or successful finalization. Other consumers retain the existing bounded dialog. Both presentations use the same identity, permission, concurrency and readiness logic.

The document checklist mounts for active managed Documents and lazy read-only completed-stage history. It shows required progress, server blockers, Missing, Pending review, Accepted and Needs resubmission. Staff upload, accept or request a reasoned replacement.
Configure each requirement for All classes or Selected classes; option labels include academic context, unavailable saved selections remain visible, and lookup failures offer Retry without clearing the selection.
Uploads are collected at the active Document verification stage. Early Form-stage collection, physical-original checks, separate review exceptions and waivers are removed from the supported flow. Replacement uploads require fresh acceptance.

Document action dialogs preserve the selected evidence and application stamp while editing, keep entered values on failure, and use the local `CustomDialog.guardUnsavedChanges` behavior without clearing a dirty application form. Replacement behavior is explained before saving. The existing workflow advance action is available only when the backend reports `canComplete` and the user has advancement permission.

Once admission finalization links evidence to a Student record, **Documents** merges that evidence with ordinary documents in one shared table. The separate Admission evidence card is removed. Retained versions, original checks and reviews open in their existing read-only detail view; authorized downloads retain student scope. Ordinary uploads require Student List Add and the document owner's registration-stage eligibility, so they are disabled for active/former records.

The profile first loads its protected record summary and checks that the returned Student GUID matches the requested identity. Tabs mount only after that read succeeds. A failed profile request shows a clear error and Retry instead of empty identity fields; the Documents tab then reads normal documents and retained admission evidence for the resolved student.

Frontend screens own loading, empty, error, and interaction states.
Backend services remain authoritative for duplicate detection, tenant isolation, permissions, validation, version freezing, workflow transitions, and persistence.
Add new admission behavior only after extending and validating the owning backend contract, permission, workflow, and persistence rules.

## Onboarding account email workflow

Portal Access offers only student and parent/guardian login requirements; saved delivery and automatic/manual provisioning choices remain compatible, with credential release after activation.
The simplified drawer hides separate account-preparation and release-timing controls; enabled email recipients still require their corresponding account preparation.

Credentials shows Account type, the selected person's read-only saved Email and one Send Credentials action.
One parent recipient is selected automatically; multiple legal parent recipients expose a Recipient selector.
Send creates or safely reuses the account and queues the selected email through one backend command.
Only the selected recipient's status or actionable block is displayed; verification checkboxes, separate Create/link actions and repeated Disabled policy rows are removed.
Saved account requirements and readiness remain authoritative; an explicit manual Send requests the selected email without changing the school's automatic-email preferences.
Missing email is corrected in Student Records rather than entered as an arbitrary delivery address.
Refresh, initial loading, recoverable errors, permission blocks and failed-send retry preserve the compact form; a pending send prevents drawer dismissal or tab changes.
Completion-timed requests remain Queued until the backend confirms onboarding completion.
Sent means sender acceptance, not inbox delivery, and a failed request does not deactivate the enrollment.
Existing sibling parent accounts retain their password, and the staff interface never displays passwords.
Readiness reuses the Offering workflow document checklist, including original-record and upload/review actions, with no waiver or override action.
An Offering snapshot with no required documents shows that empty state and does not introduce unrelated school-wide document requirements.
Accepted linked Admissions evidence is reused; a replacement upload requires review again.

See the [backend Student rules](../../../Shikshamitra-BE/docs/modules/student/product.md) for contracts and lifecycle access rules.

## Student dashboard

1. Open Dashboard from the Student menu with its exact View grant. The existing Student header supplies the academic year.
2. Wait for server-confirmed identity, role mode, academic scope and permitted destinations. Admin uses the operations workspace; leadership, teacher and common staff retain their existing shared views. Permissions and scope determine access in every mode.
3. Read available Student records, Admissions & student setup, and Attendance & leave sections. Each section has its own loading, error, retry and update time. A failed section does not block the others.
4. Scan Needs attention for setup requiring review, ready-to-activate students, attendance drafts and pending leave requests. This queue uses permitted positive counts and follows role priority; failed reads mark it incomplete. It does not invent an overall health score.
5. In the shared non-admin view, review Student population and Attendance registers doughnuts, then Class strength and Admissions workload bars. Charts show the selected year and scope; register submission is not a student attendance percentage, and setup states overlap within unfinished cases. Graph value links open existing permitted workspaces. Non-empty charts mount near the viewport through the shared chart implementation; all graphs share the same three reads as the summary cards. The existing class-strength expansion remains available.
6. Use Refresh dashboard to repeat live reads. Switching academic years clears previous-year metrics, priorities and chart values immediately. Missing access, missing year and empty data have explicit states. Follow Quick links into other permitted workspaces; section spacing, breadcrumbs and `DashboardSectionCard` match the academic dashboard.

Verified Student/Parent-only identities see only their linked student names and relationships. Staff reports and directory links are withheld for this portal context. The current frontend has no independent student-self dashboard destination to invent; personal Attendance percentages remain owned by established reports/API surfaces. Mixed staff/portal roles retain staff permission and scope handling.

### Admin operations workspace

1. Choose Board, Medium and Class; Division becomes selectable after Class. Parent changes clear dependent filters. URL scope is restored on reload/back navigation, and changing academic year clears the previous hierarchy. Invalid/unavailable URL filters block summary reads and offer Clear filters.
2. Review the compact overview, bounded student setup attention preview, permitted decisions/follow-ups, pending Onboarding tasks, expandable Class → Division counts and today's register submission summary. All widgets share one read per permitted section; errors remain local to their source section.
3. Open the exact scoped queue or setup case. Dashboard links carry an explicit year and population preset so destination defaults cannot silently narrow an all-board/all-medium population. Decisions and mutations stay in their owning workspace.
4. Open pending registers to see a paginated class/division register queue, then open the existing dated register. The Attendance view resolves a linked year without changing the global header's context or restoring a different year's draft.
5. Treat provisional Attendance separately from confirmed completeness. Outside-year dates and days with no expected registers are explicit states; submitted-register counts are not student attendance percentages. Overlapping setup task groups are never summed into a total.
6. Open the heading information controls for helper text and the Attendance school date/time zone. The compact filter row keeps its field labels and values without the scope/freshness footer; Division help remains keyboard-accessible while the field is disabled. Successful empty queues use the shared illustrated empty state, while loading, unavailable data and provisional warnings retain their own visible treatment.

## Applicant 360 compact verification and assessment actions (2026-10-10)

Section verification uses the shared embedded table with Section, Status and Action columns. Pending/Verified use the shared Label; Verify is the primary row action and Request correction remains secondary with its existing reason flow.

Pipeline Entrance assessment shows attempts as compact cards, newest first, with status, session date/time in school time, room, attendance and result. Assigned interview slots take precedence over the whole session window. Present/Absent records pending attendance directly; Change opens the existing attendance dialog. Marks or a non-scoring outcome use the existing validated result form with a small Save Result button beside it. Completed results replace the editor. Waive, Cancel and Retake reason dialogs remain available through ThreeDotsActions; optional attendance/result notes retain their dialog commands. Server capabilities and exact action permissions remain authoritative. There is no separate Activity or Attempt history section or Save result to continue text.

Selecting a completed Entrance assessment uses the same cards in read-only mode, without editors or action menus. Saved attendance, marks, result and session evidence remain visible. Historical evidence without a policy retains recorded marks without inventing a maximum score; assessment View permission and query recovery still apply.

Inline result drafts retain the reviewed attempt concurrency stamp across refreshes, remain available after failed writes/background reads, and participate in the workspace discard/navigation guards. Saving a result does not advance admission. End Journey and Continue admission keep their existing footer positions and readiness rules. Attendance and result sections stack on smaller screens, with scrolling contained by the existing journey workspace.

An empty fee candidate list shows the shared empty state, a short class/year explanation and Check again. The Open Finance shortcut is removed; setup remains owned by Finance and the Payment workspace preserves its existing selection and collection commands.

## Correcting a guardian credential email

Credentials uses the selected Father, Mother or Other guardian's saved profile email; the Recipient selector is shown only when a choice is needed.
When the email is missing, authorized Records editors can open Correct saved profile email through the normal audited Records change flow.
If review is required, follow Review correction in Changes & Approvals and wait for a different authorized reviewer.
Refresh after the change is applied, review the correct recipient and use Send Credentials.
The account owner verifies their own mailbox and chooses a password through the secure setup link; staff do not attest mailbox verification in this form.

Manual Send is allowed even when automatic email is Off, while preserving the school's settings and the case snapshot.
Missing required access, permission, recipient or readiness still produces one actionable message.
The legacy audited case-only correction API remains available to its existing authorized consumers but is not part of the simplified Send flow.
