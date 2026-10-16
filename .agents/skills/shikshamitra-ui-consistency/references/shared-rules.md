# Shared implementation and verification rules

Adapted from [DESIGN.md](../../../../DESIGN.md) and
[FE implementation patterns](../../shikshamitra-fe-patterns/references/implementation-patterns.md).
Read the applicable design-contract section when a rule requires additional detail.

## Build with the current components

| Concern | Existing source to inspect |
| --- | --- |
| Header and breadcrumbs | `src/components/custom-breadcrumbs/custom-breadcrumbs.tsx`, `types.ts` |
| Empty, search/no-results, skeletons and blocking save | [Empty/loading states](empty-loading-states.md); EmptyContent, SearchNotFound, MUI Skeleton, FormBusyRegion |
| Record table | `src/components/customizabaleTable/index.tsx`, `types.ts` |
| Form dialog and scroll body | `src/components/customDialog/index.tsx`, `close-guard.ts` |
| Confirmation | `src/components/confirm-dialog/confirm-dialog.tsx`, `types.ts` |
| Form section | `src/components/form-section-card/index.tsx`, `section-header.tsx` |
| Required-field validation wrapper | `src/components/shaking-text-field/index.tsx`; [usage rules](sections.md#shared-required-field-wrapper) |
| Select and searchable choices | [CustomSelect](custom-select.md), [searchable dropdowns](searchable-dropdowns.md) |
| Numeric entry and number display | [NumericFormatCustom](numeric-format-custom.md); `src/utils/formate_number.ts` |
| Uploads, document validation and file actions | [CustomUpload](custom-upload.md); inspect the actual directory-default versus alternate import |
| Date and range fields | [Date pickers](date-pickers.md), [range picker](date-range-picker.md) |
| Submit action | `src/components/submit-button/index.tsx`, `interface.ts` |
| Cancel action | `src/components/cancel-button/index.tsx`, `inerface.ts` |
| Button sizes/icons/states and loading alias | [Button family](button-family.md); `src/components/loading-button/index.ts`, `src/components/form-busy-region/index.tsx` |
| Notifications | `src/components/toast/` |
| Colors and typography | `src/theme/core/palette.ts`, `typography.ts`, `components/button.tsx` |

- Reuse or extend the appropriate shared component before creating a local primitive. Use MUI
  when no suitable project component exists. Preserve feature-specific patterns that are
  explicitly required by the user or contract.
- Inspect wrappers before adopting them: `CancelButton` currently has no disabled/loading prop.
  For blocking operations, use an existing action component that supports the required lock or
  extend the shared wrapper within the authorized task; never invent unsupported props.
- Use Formik and Yup for new forms unless the owning feature has a more specific current pattern.
  Do not duplicate the RTK Query base API. Use `shikshaMitraToast` for shared notifications.
- Every required editable field uses `ShakingTextField` around its actual shared control,
  with validation feedback gated by touch/submission. This applies in page forms, drawers, and dialogs;
  preserve required markers, small field styling, visible errors, and the existing validation contract.
- Every form and corresponding view uses [the same section rules](sections.md), regardless of
  page/dialog/drawer shell. Retain meaningful saved details and replace inputs with readable values.
- Keep permission-aware UI aligned with backend actions. Never invent a grant or expose an
  enabled action whose only result is an authorization error.

## Appearance and layout

- Use configured palette tokens, semantic status mappings, typography, spacing, and MUI defaults.
  Do not add hardcoded colors or a feature-specific visual theme. Use theme channel helpers for
  transparency. Pair status colors with text or another accessible signal.
- Preserve the same label, icon, order, and placement for equivalent actions. Use shared formatters
  for dates, times, numbers, money, and missing values.
- Do not infer spacing, radius, font family, or colors from screenshot pixels when a theme token
  already defines them. Avoid additional padding around a component that already owns it.
- Preserve module-family breadcrumb layout. Do not switch inline/stacked layouts because content
  changes from a table to dashboard cards.
- Standard labeled buttons keep the compact theme convention: visible height 30 px. Do not add a
  local 44 px minimum height. Preserve adequate surrounding space and accessible icon-only targets.
- Make narrow-screen layouts deliberate: fields stack, chips wrap, long text stays contained,
  table/tab scrolling stays inside its region, and primary actions remain reachable.

## States and interactions

- Preserve loading, refreshing, empty, filtered-empty, error, disabled, success, and prerequisite
  states when applicable. Keep navigation and headers mounted during content requests.
- Preserve entered values after errors. Prevent duplicate mutations and conflicting edits during
  blocking operations; do not leave Escape, Close, Cancel, or another submission path unlocked.
- Protect unsaved work at its owning boundary. Avoid a second competing dirty-state store or
  confirmation flow. Reset form values, edit identity, and open state together after completion.
- Use visible labels, specific accessible names for icon actions, visible focus, logical keyboard
  order, and native semantics. Tooltips must work with keyboard focus as well as pointer hover.
- Restore focus after dialogs close; do not copy a screenshot's missing keyboard/focus behavior.
- Preserve URL-backed state for meaningful tabs, filters, and pagination according to the owning
  feature. Personal density and column preferences may remain local.

## Verification and handoff

- Run commands inside Shikshamitra-FE. Choose focused typecheck, lint, and existing unit/E2E tests
  for the changed behavior; do not run unrelated suites just to claim broad coverage.
- For changed UI, follow repository browser validation: automated checks first, final smoke test
  in the Codex in-app browser unless the user requests another browser.
- Check relevant states at 390 x 844, 768 x 1024, and 1440 x 900, and both supported themes. Check
  keyboard behavior, body/table scroll ownership, overflow, action placement, and loading locks.
- If an image exists, compare only its documented surface, viewport, theme, and state. Record
  mismatches; a desktop screenshot cannot establish mobile or loading-state correctness.
- Use `Consistent`, `Inconsistent`, or `Unverified` for applicable rules. Back a passing check with
  the command, observation, or screenshot. State missing images and environment blockers plainly.
- Run `git diff --check`. Keep screenshot artifacts and auth/build output out of source commits
  except the intentionally approved reference images stored in this skill's assets directory.
