# Subjects Creation UI consistency checks

These checks assess compliance with existing ShikshaMitra rules, not a redesign.
All checks are **Not run**; no running screen has been visually signed off.
Use the [execution guide and source/rule keys](test-data.md).
Missing supported states or documented mismatches are findings, not reasons to weaken the rule.

## Supplied references

The two existing reference assets below were opened and visually inspected during authoring on 21 October 2026.
They establish the depicted light-theme composition only.
The dialog image includes browser chrome; its CSS viewport/scale is unknown.
The table image is 1172 x 648 pixels; this is an image dimension, not an asserted CSS viewport.

- Form reference: centered Add Subject, header info/close, one section, named fields, swatches, fixed Cancel/Submit footer.
- Table reference: Subject Creation header, insights/bulk/create actions, search/utilities, subject/status/action regions, dense/pagination footer.
- The written Subject Details casing/typography rule supersedes the form image's older Subject details title.
- Loading, dirty-close, validation, dark theme, mobile, import, and usage behavior are not established by these two images.
- Confirmation/upload-specific references are pending; assess their written rules and keep image matching Unverified.

![Supplied Add Subject reference](<../../../../../../../.agents/skills/shikshamitra-ui-consistency/assets/form-dialog.png>)

![Supplied Subject Creation table reference](<../../../../../../../.agents/skills/shikshamitra-ui-consistency/assets/table-workspace.png>)

## Checklist

## QA-ACM-SUB-UI-001: Page identity and breadcrumb family

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1; U1

**Setup:** Populated desktop screen; SC-Manager.

**Procedure**

1. Compare title, description/help, breadcrumbs, selected menu item, and neighboring Academic settings headers.
2. Use every linked breadcrumb and return.

**Required result**

- Heading is Subject Creation while the menu label is Subjects Creation; that deliberate distinction stays consistent.
- The established inline/header family, spacing, and action area are preserved; no repeated page title or unrelated decorative metrics are added.
- Breadcrumb links reach their named screens; nonlinks remain understandable.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-002: Page action order and accessible purpose

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1; U1

**Setup:** SC-Manager, then SC-Reader; desktop and narrow viewport.

**Procedure**

1. Inspect View full insights, Bulk Add, and the plus Subject action.
2. Tab to them; inspect tooltip/accessibility names and hover/focus/disabled states.

**Required result**

- Actions follow insights, bulk import, create order; create remains the rightmost primary action when space permits.
- Controls are compact and theme-based; the plus-and-noun Subject action has an explicit Add subject accessible purpose.
- Permission filtering and wrapping do not leave empty action placeholders or unreachable controls.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-003: Table toolbar and utility group

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S4,S7; U1

**Setup:** D08; default table preferences.

**Procedure**

1. Inspect search at left and Columns, Export, fullscreen utilities at right.
2. Resize and tab through toolbar controls; toggle fullscreen.

**Required result**

- Search is a small outlined control with usable clear behavior.
- Utility order and sizes match the shared table; fullscreen has a specific enter/exit name.
- Toolbar wraps in reading order instead of clipping, shrinking text, or pushing the whole document sideways.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-004: Header filters and column meaning

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S4,S7; U1

**Setup:** D08 including numeric status representations where existing fixtures provide them.

**Procedure**

1. Inspect each data-column header and open each filter.
2. Filter usage counts numerically, dates as dates, and status with its named choices.

**Required result**

- Eligible Subject, Category, Used In Classes, Used In Elective Groups, Last Updated, and Status columns expose supported filter controls.
- Actions has neither sort nor filter controls; numeric-looking statuses do not appear as raw codes.
- Displayed Active/Inactive/Archived semantics match filter values even if the underlying status representation is numeric.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-005: Full-height table workspace and footer

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S4,S7; U1

**Setup:** Populated and empty states at desktop/tablet sizes.

**Procedure**

1. Inspect the breadcrumb-to-toolbar-to-table-to-footer sequence.
2. Scroll a long list; switch Dense and change page size.

**Required result**

- Table fills the remaining workspace through the shared layout instead of an arbitrary fixed viewport height.
- The table body owns vertical scrolling; toolbar and footer remain reachable.
- Density and pagination keep their shared order and do not leave a second empty scroll region.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-006: Sticky columns and cell truncation

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S4,S7; U1

**Setup:** D08 plus a legal 100-character subject and 50-character display name.

**Procedure**

1. Scroll horizontally on a narrow table.
2. Inspect sticky Subject, Status, and Actions regions and truncated text.
3. Open the record to inspect full saved values.

**Required result**

- Sticky regions do not overlap row actions or hide values underneath transparent backgrounds.
- Long content stays within its cell; full identity remains obtainable through a supported detail/edit view.
- The page itself does not acquire horizontal overflow.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-007: Adaptive row actions

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S4; U1

**Setup:** SC-Manager; active used, active unused, and archived records.

**Procedure**

1. Inspect direct icons and More subject actions; open using mouse and keyboard.
2. Inspect disabled Delete and restore-only archived actions.

**Required result**

- At most two actions are direct icons; remaining applicable actions appear in the anchored menu.
- Every icon/menu item has a meaningful name and tooltip; disabled restrictions explain why.
- Choosing an action does not also trigger the row's usage dialog.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-008: Empty and filtered-empty distinction

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S4; U1,U3

**Setup:** An empty medium, then a populated medium with an absent search token.

**Procedure**

1. Inspect each empty state and its next action.
2. Activate the empty Subject affordance by keyboard; clear an absent search.

**Required result**

- True-empty explains what is empty and provides the permitted next action.
- Filtered-empty explains that criteria produced no results and offers clear/reset rather than implying the school has no subjects.
- Current empty Subject click opens bulk import; label and accessible purpose must make that outcome understandable. A mouse-only Box is not compliant.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-009: Loading, refreshing, and recoverable errors

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S4,S5,S8; U1,U3

**Setup:** Throttle list requests and safely induce list/usage errors.

**Procedure**

1. Observe initial load, background refetch, empty response, and failed response separately.
2. Inspect loading announcements and available retry behavior.

**Required result**

- Shell, known heading, breadcrumbs, and page controls remain mounted.
- Initial load uses a content-shaped skeleton; background refresh retains safe rows and a nonblocking progress indication.
- Errors are visible and recoverable, not empty success or false unused data. Missing error/retry wiring is a gap even if a toast appears.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-010: Add/Edit dialog header and help

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1,S2; U2

**Setup:** Open Add Subject and Edit Subject.

**Procedure**

1. Compare shell width, title, help, close control, and title wrapping.
2. Focus/activate the title help and close control.

**Required result**

- Task titles use Add Subject and Edit Subject; equivalent forms use the same compact shell.
- Header has one meaningful accessible info control and a separately named close control.
- Help explains naming/grouping/visual identity without hiding mandatory errors; custom title content must retain shell semantics.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-011: Subject Details section anatomy

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S2; U2

**Setup:** Add/Edit open; compare supplied form reference and written section rules.

**Procedure**

1. Inspect section title, icon, info control, font/weight, card padding, and field spacing.
2. Compare create and edit at desktop and narrow widths.

**Required result**

- Required section title is Subject Details in Title Case, using shared subtitle1/600 styling and a neutral leading icon.
- Section help is adjacent, accessible, and useful; fields belong to one meaningful section.
- Written rules supersede the screenshot's older Subject details casing and the current source's smaller section default.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-012: Required controls and associated errors

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S2,S3; U2

**Setup:** Fresh blank Add Subject; keyboard only.

**Procedure**

1. Submit and inspect Name, Category, and Color required meaning and feedback.
2. Correct one field at a time; tab away from untouched controls.

**Required result**

- Required controls expose exactly one visual required marker and accessible required meaning.
- Errors are visibly associated with the actual control and announced; the first invalid control is focused/identified.
- Shared required-field feedback wraps all required editable controls, including Category; Color has readable feedback rather than only a shake/red label.
- No error is shown solely from focusing an unchanged optional field.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-013: Help and language controls by keyboard/touch

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1-S3,S5; U2,U3

**Setup:** Add/Edit and usage details; keyboard and a touch viewport.

**Procedure**

1. Reach header, section, Category, Color, and language-related help controls.
2. Open/close help with supported keyboard and touch interactions.

**Required result**

- Info is not a decorative hover-only icon; controls are named and keyboard reachable.
- Useful guidance appears on focus/touch without repeating the same paragraph in multiple places.
- Mandatory limits and validation remain visible or associated with fields rather than tooltip-only.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-014: Color picker and non-color selection state

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S3; U2

**Setup:** Fresh Add Subject, then Edit with a saved color.

**Procedure**

1. Tab through swatches; select Dark blue using Enter/Space.
2. Inspect accessible names, pressed/selected state, focus ring, and checkmark.
3. Repeat at narrow touch size and both themes.

**Required result**

- Each swatch exposes a color name/hex and selected state; a visible checkmark or equivalent supplements color.
- Keyboard/touch selection changes the form value without submitting.
- Icon targets follow the accessible target convention while the visual swatch can remain compact.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-015: Ordinary form footer and submission labels

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S2; U2

**Setup:** Add and Edit dialogs, idle then saving.

**Procedure**

1. Compare Cancel and the save action, leading icons, colors, and order.
2. Activate the save action once and observe feedback.

**Required result**

- Ordinary create/edit use Cancel first and Submit last with shared cancel/submit icons and small styling.
- Visible labeled-button height follows the 30 px theme convention; do not force 44 px button heights.
- Current edit Update/edit icon is recorded as inconsistent with the rule; browser execution still uses the current label.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-016: Consistent unsaved-change decision

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1,S2,S6; U2,U3

**Setup:** Dirty Add/Edit/Import, then a clean form.

**Procedure**

1. Try every supported Cancel/X/Escape/backdrop leave path.
2. Use Keep Editing and Discard Changes; inspect focus and saved records.

**Required result**

- Dirty paths use one consistent in-app Discard Unsaved Changes? decision with Keep Editing and Discard Changes.
- Keep Editing preserves all values/errors; Discard resets only the local draft and does not delete the saved subject.
- Clean close requires no prompt; native browser confirmation or unguarded Cancel is not a consistency pass.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-017: Busy state, loading announcements, and locks

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1,S2,S5,S6; U2,U3

**Setup:** Slow single save, bulk save, archive, delete, and restore.

**Procedure**

1. Observe initiating controls, loading text/spinner, disabled styles, and footer/header locks.
2. Attempt duplicate keyboard/click actions and dismissal during each request.

**Required result**

- Busy state has an accessible explanation, keeps submitted values stable, and blocks all conflicting paths.
- No second submit, outcome change, reason edit, or close path starts a competing mutation.
- Success/failure clears the busy state correctly without double toast or duplicate dialogs.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-018: Focus, single submission, and modal keyboard use

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1,S2,S6; U2,U3

**Setup:** Keyboard-only Add/Edit/Import/usage and nested duplicate warning.

**Procedure**

1. Open each dialog from its trigger; tab forward/backward through it.
2. Press Enter on a form input and on each action; press Escape in safe/dirty states.
3. Try Ctrl/Cmd+Enter, close safely, and inspect restored focus.

**Required result**

- Focus stays within the active dialog, is visible, and returns to the launching control on close.
- Enter follows a single deliberate submit path; it must not merely prevent default without saving when form submission is expected.
- No unrequested Ctrl/Cmd+Enter submit shortcut is advertised or triggers a second save.
- Nested warning dismissal preserves parent form focus and values.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-019: Usage detail header and read-only meaning

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S5; U3

**Setup:** D04 detail dialog, including a long subject name.

**Procedure**

1. Inspect saved identity, status, header help, close, and detail values.
2. Compare with governing read-only detail rules.

**Required result**

- Name/status identify the record; title and section help are accessible.
- Saved values are readable facts rather than disabled inputs, required markers, or an ordinary Submit form.
- Do not force a right drawer because of the source filename; preserve the current supported shell while checking the detail standard.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-020: Usage sections, restrictions, and dependency links

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S5; U3

**Setup:** D04 and an unused subject.

**Procedure**

1. Inspect metric groups, allocated classes, mapped groups, safety message, and links.
2. Compare heading hierarchy and help across sections; try keyboard link navigation.

**Required result**

- Section titles follow Title Case/shared typography with semantic icons and accessible info.
- Counts and restrictions describe actual records, and details do not omit meaningful saved identity context.
- Links clearly name their destination and respect normal route access; an unavailable dependency is not a dead enabled action.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-021: Insights presentation and scope

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S4; U1,U3

**Setup:** D08; open View full insights, then change table search.

**Procedure**

1. Inspect panel title, close, cards, count formatting, and scope explanation.
2. Resize, close, and reopen after a successful mutation.

**Required result**

- Five real metric labels and values remain readable; zero is distinct from pending/failed data.
- The view describes medium-wide subjects, not current-page totals.
- Insights do not replace the page header or introduce decorative unsupported statistics.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-022: Responsive layout matrix

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1-S7; U1-U3

**Setup:** Run the populated/empty table, Add/Edit, import preview, usage, and confirmations.

**Procedure**

1. Check at 390 x 844, 768 x 1024, and 1440 x 900.
2. Open dropdowns, swatches, long text/errors, and a 200-row preview.
3. At mobile size simulate the on-screen keyboard.

**Required result**

- Page actions wrap, inputs stack where needed, table/preview scrolling stays within its region.
- Dialog header/close/footer remain reachable; only the intended body scrolls.
- No document-level horizontal overflow, hidden save/cancel control, clipped dropdown, or lost validation text.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-023: Delete/archive decision wording and styling

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1; U3

**Setup:** Unused and used subject plus archive dialog.

**Procedure**

1. Inspect title, leading meaning icon, named record, consequence, reason, and buttons.
2. Cancel, then confirm one disposable operation.

**Required result**

- Delete decision names the subject and outcome Delete rather than a generic Yes; safe Cancel comes first.
- Archive names the consequence of future allocations versus retained history; reason requirement matches the real contract.
- Actions use shared compact icons/spacing/semantic treatment and cannot submit an underlying form accidentally.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-024: Supported themes, contrast, and status meaning

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1-S7; U1-U3

**Setup:** Light and dark themes; representative subject colors and all three statuses.

**Procedure**

1. Inspect tables, dialogs, swatches, chips, tooltips, disabled actions, skeletons, focus rings, and error helpers.
2. Measure text/control contrast with the approved accessibility checker; record values.

**Required result**

- Normal text meets 4.5:1, large text 3:1, and applicable nontext control boundaries/states meet 3:1 against adjacent colors; focus remains perceivable.
- Status and selected color are conveyed by text/state as well as color.
- Theme switching leaves no unreadable fixed-color backgrounds or invisible action icons; screenshots alone do not prove contrast.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-025: Import upload and preview accessibility

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S6; U2,U3

**Setup:** Valid and invalid import files; parsing and saving states.

**Procedure**

1. Operate file selection and CSV/Excel downloads with keyboard.
2. Inspect Reading subject file status, error association, preview headings, row messages, and Import N subjects.
3. Review a long invalid preview without using pointer-only controls.

**Required result**

- File limits and required columns are understandable before upload; errors are announced and tied to selection.
- Preview exposes Subject import preview table semantics and row-specific validation text, not color-only status.
- Preview has contained scrolling; count/action labels update to the current file, and busy/invalid state blocks import.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-026: Zoom, reduced motion, and magnification

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S2,S3,S7; U1-U3

**Setup:** Desktop browser at 200% zoom; reduced-motion preference; narrow layout.

**Procedure**

1. Repeat table navigation and Add/Edit with long errors at 200% zoom.
2. Enable reduced motion and trigger required-field feedback.
3. Navigate using keyboard and inspect focus visibility.

**Required result**

- Content reflows without hidden primary actions or two-direction page scrolling.
- Motion respects the preference; validation remains understandable without animation.
- Tooltips/focus/labels remain visible under magnification; no overlapping text or traps.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-027: Formatting, placeholders, and safe error copy

**Priority:** P2 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1-S8; U1,U3

**Setup:** Known saved values, missing optional values, all statuses, and a server error.

**Procedure**

1. Compare Subject/Display, category, usage labels, Last Updated, and status across list/edit/details/export.
2. Inspect a deliberate recoverable error message and success feedback.

**Required result**

- Dates follow the current DD-MM-YYYY convention; missing values use a deliberate readable placeholder.
- Statuses use Active/Inactive/Archived and counts are meaningful, not enum numbers/undefined/NaN.
- Feedback identifies what happened and next action without raw stack traces, internal permission identifiers, or credentials.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

## QA-ACM-SUB-UI-028: Modal scroll ownership and underlying table context

**Priority:** P1 | **Status:** Not run | **Consistency verdict:** Pending execution | **Basis:** S1,S2,S5,S6,S7; U1-U3

**Setup:** Long Add/Edit content and import preview; table has nondefault search/page.

**Procedure**

1. Open a dialog, scroll body and page behind it, then close.
2. Repeat with nested duplicate confirmation and with usage details.
3. Inspect search, pagination, column choice, selected record, and focus after close.

**Required result**

- Only the topmost active dialog owns focus and intended scrolling; the underlying page does not scroll unexpectedly.
- Fixed header/footer stay reachable and do not form competing scroll areas.
- Closing preserves relevant parent table context and clears only the completed/discarded record session.

**Evidence:** Record viewport, theme, keyboard/touch mode, actual observation, and a sanitized screenshot or measurement. Use Consistent, Inconsistent, or Unverified after execution.

[Suite index](README.md) | [Functional cases](cases.md) | [Edge cases](edge-cases.md)
