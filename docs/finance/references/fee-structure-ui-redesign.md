---
module: finance
domain: fee-structure
content_type: Reference
status: proposal
updated_on: 2026-10-07
owner: frontend-team
audience: humans-and-agents
---

# Fee structure workspace: UI and language proposal

This proposal covers the four supplied views of the existing fee structure workspace: **Fee heads and payment terms**, **Policies**, **Collection policy coverage**, and **Review and publish**. It is a presentation and interaction specification for the current frontend workflow. The [active workspace reference](fee-structure-workspace.md) describes current behavior; the [backend workspace reference](../../../../Shikshamitra-BE/docs/modules/finance/references/fee-structure-workspace.md) owns permissions, policy rules, persistence, and publication readiness.

## Design direction

Make the current class, selected structure, version, fee head, step, and next action unmistakable. A class can contain **multiple independent fee structures**, and a named structure can have **multiple revisions**. Keep a fee-head list on the left side of the selected structure card, with the active step on the right. Use clear section headings and a stable action footer. The design should answer six questions at a glance: **Which class am I in? Which structure am I editing? Which version is open? Which fee head is selected? What needs attention? What happens when I continue?**

This proposal follows the repository's [frontend patterns skill](../../../.agents/skills/shikshamitra-fe-patterns/SKILL.md) and its relevant [implementation](../../../.agents/skills/shikshamitra-fe-patterns/references/implementation-patterns.md), [page-header](../../../.agents/skills/shikshamitra-fe-patterns/references/page-headers.md), [form](../../../.agents/skills/shikshamitra-fe-patterns/references/forms.md), [complex-dialog](../../../.agents/skills/shikshamitra-fe-patterns/references/complex-dialogs.md), [table](../../../.agents/skills/shikshamitra-ui-consistency/references/tables.md), [sidebar](../../../.agents/skills/shikshamitra-fe-patterns/references/sidebars.md), [stepper](../../../.agents/skills/shikshamitra-fe-patterns/references/steppers.md), [horizontal-stepper](../../../.agents/skills/shikshamitra-fe-patterns/references/horizontal-steppers.md), [detail-view](../../../.agents/skills/shikshamitra-fe-patterns/references/detail-views.md), and [popup](../../../.agents/skills/shikshamitra-fe-patterns/references/popups.md) rules. The published configuration and its pinned versions must remain identifiable; no UI total should imply a student has been billed.

### Shared-component audit

The live components and [timetable full-screen dialog](../../../src/screens/academic/timetable-schedule-management/timeTable/newTimetable.tsx) were checked before specifying this layout. Reuse the current component API in each area:

| Area | Existing component/API | Constraint for this proposal |
|---|---|---|
| Full-screen workspace | [`CustomDialog`](../../../src/components/customDialog/index.tsx) with `fullScreen`, `hasForm={false}` | Keep its header and close button. The owning fee workspace already handles its aggregate dirty-close guard; do not add another prompt. |
| Long dialog content | `DialogScrollContent` | Use it inside the policy coverage dialog. The workspace step body already scrolls through the stepper, so do not add a second ordinary form scroll container there. |
| Class navigation | [`CustomTabs`](../../../src/components/custom-tabs/custom-tabs.tsx) with `variant="scrollable"`, `scrollButtons="auto"`, and `allowScrollButtonsMobile` | Keep `guardUnsavedChanges={false}` only because the owning class-switch handler controls the dirty confirmation. |
| Structure, policy, fee head, and term selectors | [`CustomSelect`](../../../src/components/custom-select/index.tsx) with `isSearch`, `helperText`, `error`, `disabled`, and `noOptionsMessage` | Keep the structure selector above the card for switching between structures in the selected class. Use the shared selector for form choices, including adding an existing fee head. |
| Fee-head navigator | MUI `Paper`, `List`, `ListSubheader`, and `ListItemButton`, following the [academic setup sidebar](../../../src/components/academic-setup/academic-setup-sidebar.tsx) pattern; MUI `Drawer` on narrow screens | The academic component is hierarchy-specific, so reuse its accessible layout pattern with current MUI primitives. The navigator is scoped to the selected structure, independently scrollable, and present beside every step on desktop. |
| Structure name and empty states | [`ShakingTextField`](../../../src/components/shaking-text-field/index.tsx) around MUI `TextField`; [`EmptyContent`](../../../src/components/empty-content/empty-content.tsx) | Keep name errors on blur/save and the shared class-empty presentation. Use the table's `noDataText` for an empty fee head table. |
| Guided steps and footer | [`CustomStepperWithFormik`](../../../src/components/custom-stepper/index.tsx) with `steps`, `completedSteps`, `errors`, `onStepClick`, `onSave`, and button-label/props | It owns the horizontal stepper, one scrolling body, loading lock, and action footer. Keep save status in the existing adjacent `aria-live` region; do not build another footer. |
| Fee-head overview and review tables | [`CustomizableTable`](../../../src/components/customizabaleTable/index.tsx) and `IColumn` | The all-head overview summarizes rows and opens the focused head editor. Use stable `tableId`s and enable only useful controls per table. It supports internal scrolling and sticky columns, but has no stacked mobile-card mode. |
| Row/header actions | [`AdaptiveThreeDotsActions`](../../../src/components/adaptive-three-dots-actions/index.tsx) | Keep row actions under the shared direct-action/overflow rule. A header **More actions** menu can use this component with `directActionLimit={0}` if action grouping is needed. |
| Status, help, loading, feedback | [`Label`](../../../src/components/label/label.tsx), [`CustomTooltip`](../../../src/components/custom-tooltip/index.tsx), MUI `LoadingButton`, [`Iconify`](../../../src/components/iconify/iconify.tsx), and `shikshaMitraToast` | Use semantic theme colors, accessible help buttons, the existing icon set, locked loading actions, and the shared toast. Do not introduce local badges, popovers, or a second toast system. |
| Decisions and coverage view | [`ConfirmDialog`](../../../src/components/confirm-dialog/confirm-dialog.tsx); `CustomDialog` + `DialogScrollContent` for coverage | Use `ConfirmDialog` for publish, delete, discard, and revision. Keep policy coverage a read-only detail dialog, not a confirmation or calculation form. |
| Payment schedule details | [`StructureScheduleDialog`](../../../src/screens/finance/settings/FeeStructure/Components/StructureScheduleDialog.tsx) | Keep the existing inherited/customized schedule interaction and confirmation when replacing a customized term; the focused fee-head form opens it. |

`CustomBreadcrumbs` belongs to the owning route page; the fee editor is already inside a full-screen dialog. Do not insert another breadcrumb inside that dialog. Existing Formik/Yup behavior and the fee editor's domain-specific candidate/save logic remain the governing form pattern; a copy change must not replace them with independent field state or new API clients.

## Class, structure, and fee-head hierarchy

**Recommended model: class tabs → fee structure selector → fee-head navigator inside the selected structure.** A class may have several independent structures. Keep the searchable `CustomSelect` above the editor to choose a structure and its version. The **left side of the selected structure card** lists its fee heads. Clicking a head focuses the main pane while the head list remains available through all three steps.

```text
Fee structures · Seed–Main Fee Structure · 2026–27                  [Close]
[Nursery] [LKG] [UKG] [Class 1] [Class 2] ...
Fee structure: [Monthly tuition · Draft · version 2 ▾]  [+ Add structure]
──────────────────────────────────────────────────────────────────────────────
┌── FEE HEADS IN THIS STRUCTURE ───┬── MONTHLY TUITION · DRAFT · VERSION 2 ─┐
│ [All fee heads]                  │ 1 Fee heads → 2 Policies → 3 Review   │
│                                  │                                          │
│ > Tuition                        │ Selected head's fields or coverage      │
│   Fixed · ₹2,692                 │ for the current step                     │
│                                  │                                          │
│   Transport                      │                                          │
│   Set during assignment          │                                          │
│                                  │                                          │
│   Examination                    │                                          │
│   Optional · ₹500                │                                          │
│                                  ├──────────────────────────────────────────┤
│ [+ Add fee head]                 │ [Back]   [Save draft] [Save and continue]│
└──────────────────────────────────┴──────────────────────────────────────────┘
```

The sample names and amounts are illustrative. The top selector changes the **fee structure** within Class 1; the left list changes the **fee head** within that structure. Do not mix structures and fee heads in one navigator. Do not add **Default**, **Active**, **Primary**, or **Assigned** structure badges: the current structure contract defines none of those class-level roles, and publishing does not create a student assignment or demand.

### Multiple structures for one class

- Keep the searchable `CustomSelect` in the class toolbar. Each saved option reads **Structure name · Draft/Published · version N**; a new local candidate reads **Untitled structure N · Not saved**. Two options may share a name when they are versions in one `revisionRootId` series. Show version and status so users can tell them apart. Independent live structures must have unique names within the class.
- Keep **Add structure** beside the selector, scoped to the selected class and permission. It creates an independent local candidate, selects it, and starts at step 1. The temporary untitled label is not saved as the name. **Create revision** is a separate action on an authorized latest published version; a live draft revision should be opened rather than duplicated.
- Preserve the current `ClassAccordionPanel` behavior that keeps structure editors mounted while switching within one class. Each structure retains its candidate, unsaved marker, selected fee head, and current step. A stale refetch must not overwrite a dirty editor or newer canonical save response. Switching class or closing follows the aggregate unsaved-work guard.

### Fee-head navigator inside the selected structure

- Build a compact `Paper component="aside"` with MUI `List` and `ListItemButton`, following the accessible layout of the [academic setup sidebar](../../../src/components/academic-setup/academic-setup-sidebar.tsx). Its hierarchy data model is not reused. Rows come from the selected structure candidate's `feeHeads`, so added or removed heads appear immediately without a refetch.
- Start with **All fee heads**, then one row per configured head. Each row shows its name and one concise secondary line: **Fixed · ₹amount**, **Set during assignment**, and/or **Optional**. Use the same terminology and currency formatting as the editor. Selection uses MUI's selected state, a visible focus outline, and an accessible name such as **Edit Tuition fee head**.
- Put **Add fee head** in the navigator. It reveals the existing searchable `CustomSelect` for active, not-yet-added heads in the main pane; adding one appends it to the selected structure and selects it. If no head is configured, show **No fee heads added** and the authorized Add action. Removing the selected head returns selection to **All fee heads**.
- Keep the navigator about 240–280 px wide only when the main pane remains usable. Let its list scroll independently under a stable heading and Add action. At narrower widths, show a **Fee heads** button that opens the same list in a temporary MUI `Drawer`; selecting a head closes it and focuses the main step heading. The editor tables retain their own internal horizontal scrolling.
- Scope the selected fee head to the selected structure ID or local draft key. Moving between steps keeps that head selected. Moving to another structure restores its own selected head or **All fee heads**. Disable head switching during blocking save/publish/revision operations. Opening the policy coverage dialog makes the underlying list inert until it closes.

### What clicking a fee head does on each step

| Step | **All fee heads** | Selected fee head |
|---|---|---|
| **1. Fee heads and payment terms** | Show the shared `CustomizableTable` overview of every configured head, plus the Add selector. | Show a focused form for that head's pricing method, configured amount, pinned payment term version, schedule action, optional charge setting, and Remove action. Use existing form controls and `StructureScheduleDialog`; changes update the same structure candidate as the overview. |
| **2. Policies** | Show the Collection and Refund policy cards and structure-wide coverage entry points. | Keep those **same structure-level policy selectors** visible. Add a compact, read-only **Coverage for [head name]** section using already loaded policy-impact rows or the saved publication review. Clicking a head does not attach or change a policy for that head. If exact-version coverage is unavailable, say so. |
| **3. Review and publish** | Show all backend readiness issues, warnings, policy coverage rows, and installment rows. | Keep the **global readiness summary, every blocking issue, and Publish action** visible. Highlight or filter the selected head's coverage and installment rows with a clear **Viewing [head name] · Show all fee heads** control. A focused view never hides unrelated publication blockers. |

Policy attachments belong to the fee structure, and the backend decides publication readiness for the **entire** structure. The fee-head list is navigation and inspection; it must not imply per-head policy selection or per-head publishing.

## Responsive editor layout

```text
NARROW SCREEN
Fee structures                                [Close]
[Class 1] [Class 2] ...
[Fee structure: Monthly tuition · Draft · v2 ▾]
[Fee heads]  Tuition
1 Fee heads ─ 2 Policies ─ 3 Review
Selected head's current-step content
[Back]                    [Save draft] [Continue]

Tap Fee heads:
┌── Fee heads in Monthly tuition ──────────────┐
│ [All fee heads]                         [×] │
│ > Tuition                                  │
│   Transport                                │
│   Examination · Optional                  │
│ [+ Add fee head]                           │
└──────────────────────────────────────────────┘
```

- Keep the header, class tabs, structure selector, selected-structure identity, fee-head navigator, stepper, and footer stable. Only the fee-head list and current step body scroll in their respective regions. Do not repeat the academic year or head count in several header bands.
- Keep class tabs horizontally scrollable through `CustomTabs`. Keep the structure selector visible above the editor at all widths; it is the only control that changes the selected structure. The fee-head rail or drawer changes only the selected head within it.
- Keep **Refresh class data** available for context-load recovery. Put selected-structure actions such as **Create revision**, **Discard unsaved changes**, and **Delete draft** in the structure header, using `AdaptiveThreeDotsActions` and `ConfirmDialog` where appropriate. Keep **Add structure** beside the structure selector and **Add fee head** in the head navigator.
- Use the shared stepper's footer for **Back**, **Save draft**, and **Save and continue**. On the last step, set its `finalButtonLabel` to **Publish structure**. Keep the existing saved-state/blocked-action `aria-live` text adjacent to the stepper. A failed save never advances or changes the selected head.

## Screen 1 — Fee heads and payment terms

**Goal:** Name the structure, add fee heads, set fixed or variable pricing, choose the exact published payment term version, and inspect each schedule.

1. Put **Structure name** first, at a readable width. Show a unique-name error below the field. If a revision cannot rename the structure, show the saved name as read-only with an explanation.
2. Replace the grey sentence block with one compact, neutral summary line: **Configured fixed amount** (₹ value), **Variable fee heads** (count), and **Optional fee heads** (count). Keep calculation guidance in an accessible `CustomTooltip` beside the section heading; state that the sum includes optional heads and is not an amount due for a student. Do not add a dashboard-style card strip above the content.
3. Put **Add fee head** in the left navigator. It reveals a searchable `CustomSelect` and an adjacent **Add head** button in the main pane. Disable the button until a valid, unselected, active head is chosen. Show the “can be added once” rule only where it affects selection; on success, select the new head in the navigator.
4. When **All fee heads** is selected, show a read-only `CustomizableTable` overview: **Fee head | Pricing method | Configured amount | Payment term | Student charge options | Action**. A row shows its fee category as quiet secondary text if available. Its **Edit head** action selects that head in the left navigator. Group the payment term's name and pinned version in one cell. Set static columns to `isSort: false` and `isFilter: false`.
5. When a head is selected, show its editable fields in the main pane with a heading such as **Tuition fee head**. Retain the current MUI `Switch` and `FormControlLabel`, but replace the bare **Variable** label with a state-explicit label such as **Set during assignment**; show **Fixed amount** as the off-state text. For a variable head, replace the numeric input with **Set during student assignment**. For a fixed head, label the input **Configured amount (₹)**. Keep the actual fixed/variable backend contract unchanged.
6. Put **Optional for students**, the pinned payment term version, **View schedule**, and **Remove fee head** in this focused form. Provide a keyboard-reachable `CustomTooltip` on a labelled info button explaining that optional heads are charged only when selected during assignment. Keep schedule customization in `StructureScheduleDialog`. Editing the focused form updates the same structure candidate displayed in the overview and left list; it must not create a second copy of fee-head state.
7. At narrow widths, the **Fee heads** drawer selects the focused form. The **All fee heads** overview retains `CustomizableTable` with its internal horizontal scrollbar and a sticky fee head column (`sticky`, `stickyOnMobile`) where space allows. Keep the dialog and footer within the viewport; a stacked row mode would require a reviewed extension to the shared table. Keep a compact empty state through `noDataText`: **No fee heads added. Add a fee head to build this structure.**

**Priority fix:** the current **Fixed fees subtotal: ₹0** message can look like the student's payable amount. Rename and qualify it before adding visual prominence.

## Screen 2 — Policies

**Goal:** Attach pinned Collection and Refund policy versions and understand which structure heads each policy covers.

- Use two restrained outlined cards on desktop and one column on mobile. Each card starts with **Collection policy** or **Refund policy**, followed by caption text **Required to publish** or **Optional**. Reserve the shared `Label` for real lifecycle or edit states. Give each `CustomSelect` a visible policy label; the shared control uses that label for its input association and accessible name.
- Explain the domain in one sentence: collection controls can apply late fees and waivers to matching heads; refund policy determines eligibility for matching heads and does not approve a refund.
- Replace the unexplained eye icon and “Use the eye action” instruction with a small MUI button: **View fee head coverage**. Place it in the card action row. It opens the existing `CustomDialog` coverage view; remove any duplicate instructional banner.
- Show a concise coverage result when data exists, such as **1 structure fee head covered**. If no version matches or details cannot load, use a specific state and do not imply coverage.
- Keep each card's **Refresh list** action, labelled **Refresh collection policies** or **Refresh refund policies**. Show **Remove refund policy** for an optional attachment. A draft may temporarily omit Collection policy, but the field's `helperText`/`error` must show **Select a collection policy before publishing** and prevent moving to Review when required by the existing flow.
- Preserve the selected exact version during catalog refresh; do not silently replace it with the latest version. Indicate unavailable saved versions without hiding them.
- When a fee head is selected in the left list, add a read-only **Coverage for [fee head]** summary below the policy cards. Derive it from available exact-version coverage data. The two policy selectors and their attachments remain structure-wide.

## Screen 3 — Collection policy coverage dialog

**Goal:** Explain the selected policy's relationship to fee heads, without presenting a financial simulation.

- Title: **Collection policy coverage**. Subtitle: **Policy name · version N · Default** when applicable. For a published structure, show **Saved publication review**.
- Replace **Fee head impact** with **Fee head coverage**. Keep the dialog's existing semantic list for its compact set of rows: **Fee head** and **Policy treatment**. Include matching heads and a clear excluded/not covered state only where the existing model supplies it. Do not add a full table toolbar to this small read-only dialog or invent policy-only rows.
- Replace **Impact summary** with **What this means**. Keep the domain explanation short. Add the scope note: **This shows configuration only. Student eligibility and transactions are checked when those workflows run.**
- Use **Close** once in the footer, plus the standard accessible header close icon. Return focus to **View fee head coverage** and preserve unsaved edits in the underlying workspace.
- Loading, unavailable historical version, permission denial, fetch error, and zero structure heads need distinct messages. Do not invent current-policy details for a saved historical version.

## Screen 4 — Review and publish

**Goal:** See readiness, fix blockers, understand warnings, inspect policy coverage and installment dates, then publish the saved configuration.

1. Start with one readiness summary: **Ready to publish**, **Ready with warnings**, or **Cannot publish yet**. State counts and the next action. Do not show a green completed-looking third step while publication is blocked.
2. Put **Issues to fix** before **Warnings to review**. Each issue should identify the affected policy or fee head and offer **Edit policies** or **Edit fee heads and payment terms**. A warning should explain whether it affects this structure or only unused policy heads.
3. Avoid repeating the same error in an alert, a status paragraph, and the disabled-button hint. Use one actionable issue list and one concise footer reason.
4. Show **Policy coverage** in the existing `CustomizableTable` with **Fee head | Collection | Refund | Accounting**. Use explicit values such as **No late fee**, **Not covered**, and **Ready** only when they match backend evidence. Explain ambiguous statuses with a keyboard-reachable `CustomTooltip` or detail link. Use `isSearch={false}`, `isFilter={false}`, `isPagination={false}`, `isShowedDense={false}`, and `isSort: false`/`isFilter: false` on static columns.
5. Show **Installment schedule** in a second `CustomizableTable`. Keep **Fee head**, **Payment term version**, **Installment**, **Covered period**, **Demand date**, **Due date**, and **Amount**. Format all dates consistently as `DD MMM YYYY` (for example, `01 Jun 2026`); right-align amounts and format them with `en-IN` currency. On small screens, use the table's internal horizontal scrolling and a sticky fee-head column; do not build a separate expandable-table primitive for this screen.
6. The final action reads **Publish structure**. Before confirmation, verify that the draft is saved, unchanged, and freshly reviewed. The confirmation should say that the pinned configuration becomes protected, future edits require a revision, and publishing does not create student demands.
7. Selecting a fee head in the left list may focus its coverage and installment rows, but the readiness summary and all publication blockers remain visible. Show **Viewing [fee head] · Show all fee heads** above filtered rows so the user can return to the full review.

## Exact UI wording and naming conventions

Use sentence case for visible UI copy. Keep domain nouns consistent: **fee structure**, **fee head**, **payment term**, **collection policy**, **refund policy**, **draft**, **published**, and **revision**. Capitalize them only at the start of a sentence or title. Use **version N** in explanatory text; compact selectors may use **vN** if the accessible name says “version N.” Use **and** in headings and actions; avoid `&`. Use **fee head** for one item and **fee heads** for a collection. Do not rename backend IDs, enum values, or API properties as a copy cleanup.

| Current wording | Proposed wording | Reason |
|---|---|---|
| Manage Fee Structure | Fee structures | Stable workspace title; the selected structure identifies the record. |
| Add Fee Structure | Add structure | Context already identifies the object; keep accessible name “Add fee structure.” |
| Fee structure selector alone | Fee structure selector above the card; fee heads within the card | Separates switching structures in a class from selecting a head inside one structure. |
| Add Fee Head / Add head | Add fee head | Use one sentence-case label in the left navigator and accessible action. |
| Fee Head | Fee head | Use sentence case for the list heading and table column. |
| New fee structure · Draft · v1 · Unsaved | Untitled structure 1 · Not saved | Distinguishes multiple unnamed local candidates; a new candidate has no saved draft/version yet. |
| Draft structure action | Continue setup | Distinguishes editing an existing draft from creating another structure. |
| Published structure action | View structure | Makes the protected read-only state clear. |
| Fee heads & terms | Fee heads and payment terms | Names the actual setting. |
| Review & publish | Review and publish | Consistent headings. |
| Fee Structure name * | Structure name * | Natural field label in context. |
| Fixed fees subtotal | Configured fixed amount | Avoids implying the student's amount due. |
| Pricing / Variable | Pricing method / Set during assignment | Makes the row choice explicit. |
| Total fee | Configured amount (₹) | Distinguishes configuration from a demand. |
| Payment Term & version | Payment term | The selected option still shows its pinned version. |
| Charge options | Student charge options | Clarifies the scope. |
| Refresh context | Refresh class data | States what is refreshed. |
| Unsaved | Unsaved changes | States the condition. |
| Draft · v1 | Draft · version 1 | Clear version terminology. |
| Collection Policy impact | Collection policy coverage | This dialog describes configuration coverage. |
| Fee head impact | Fee head coverage | Matches the dialog's content. |
| Impact summary | What this means | Plain-language explanation. |
| Refresh list | Refresh collection policies / Refresh refund policies | Names the resource on each policy card. |
| Clear selection | Remove refund policy / Clear collection policy | Names the selected attachment and consequence; collection remains required to publish. |
| Review these warnings | Warnings to review | Short, grammatical heading. |
| Resolve before publishing | Issues to fix | Actionable and easier to scan. |
| Term version | Payment term version | Matches the selector and domain. |
| Service coverage | Covered period | Clearer date-range heading; retain underlying field meaning. |
| Save & next | Save and continue | Explains that the current step is saved before navigation. |
| Discard changes | Discard unsaved changes | Makes data loss explicit. |
| 1 Fee Heads / 0 variable fee heads | 1 fee head / 0 variable fee heads | Correct singular/plural grammar. |

### Internal naming guidance for implementation

Choose component names by responsibility if these files are refactored: `ClassAccordionPanel` is a class workspace, not an accordion; `FeeStructureWorkspaceCard` is an editor, not a card; `PolicyImpactDialog` is a coverage dialog, not a monetary impact preview. Suggested names are `FeeStructureClassWorkspace`, `FeeStructureEditor`, and `PolicyCoverageDialog`. Rename imports and tests together. Keep persisted field names and server contracts unchanged.

## States and acceptance criteria

| State | Required presentation |
|---|---|
| New empty class | Explain that no structures exist and show **Add structure** when authorized. |
| Several structures in one class | Keep the searchable structure selector above the card on every step. Selecting an option changes the structure and its fee-head list while preserving class context. |
| One named series with revisions | Show each available version and status in the structure selector using `revisionRootId` to distinguish a revision series from independent structures. Never label a revision as an independent structure. |
| Local unsaved structure | Show **Untitled structure N · Not saved** in the structure selector with no invented version until saved or explicitly discarded. |
| New draft, no fee heads | Show a clear empty row state and keep **Save draft** available only under the existing save rules. |
| Several fee heads in one structure | Show **All fee heads** and every configured head in the left list on desktop. Selecting a head changes only the focused step content and preserves unsaved edits. |
| Dirty drafts in several structures | Mark each dirty version in the structure selector; switching within the class preserves all edits, each version's selected head, and each version's step. Switching classes or closing follows the existing aggregate discard guard. |
| Structure search has no matches | Show the selector's filtered-empty message and clear-search action while keeping the selected editor identified in its header. |
| Missing Collection policy | Show field-level guidance; drafts can remain incomplete; Review/publication stays blocked. |
| Fee head selected on Policies | Keep policy attachments structure-wide; show read-only coverage for the selected head only when exact-version data exists. |
| Catalog refresh/error | Preserve current selections and edited values; show a named retry action. |
| Published structure | Show read-only pinned versions and saved publication review; offer **Create revision** only when authorized. |
| Blocked review | Show actionable issues, warnings separately, and a reason beside disabled **Publish structure**. Selecting one fee head never hides blockers from another. |
| View-only access | Hide write actions, preserve readable coverage and schedule evidence, and label the workspace **Read-only**. |
| Mobile and keyboard | Replace the fee-head rail with a **Fee heads** drawer while keeping the structure selector above the card; no page-wide horizontal overflow; 44 px reachable touch targets; visible focus; selection moves focus to the editor heading and dismissal returns it to the opener. |

Check the redesign at 390, 768, 1280, and 1440 px in light and dark themes. Verify a class with zero, one, and several structures; independent names and a multi-version revision series; structure selector search; two unsaved local candidates; same-class structure switching on **each of the three steps** without data loss; selected-head and step restoration per structure; class-switch and close confirmations; mobile fee-head drawer focus; a variable head; an optional head; an unavailable pinned version; structure-wide policy attachments with selected-head coverage; global review blockers even when one head is focused; and the protected published view. Run the existing fee structure focused tests, TypeScript, focused lint, Finance docs validation, and the final in-app browser smoke test described in the active workspace reference.
