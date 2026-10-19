# ConfirmDialog: confirmation pop-up UI consistency

Use the shared `ConfirmDialog` for one consequential decision, including discarding an unsaved
form, deleting, archiving, or publishing when the workflow requires confirmation. Use
[CustomDialog](form-dialogs.md) or a [drawer](drawers.md) for substantial data entry. This replaces
the previous compact confirmation guide and is the shared decision pattern for both form shells.

## Reference status

No confirmation screenshot has been supplied. `assets/confirmation.png` remains a pending slot
in [image references](image-references.md); do not create a broken embed or claim visual matching.
The rules below are based on the current shared component/theme and the user's confirmed naming,
icon, sizing, and unsaved-form requirements. Do not infer a confirmation design from a form image.

## Anatomy, title, and content

```text
[Meaningful icon] Discard Unsaved Changes?

Your changes to this form will be lost if you discard them.

                         [X Keep Editing] [Discard icon Discard Changes]
```

- Use a clear Title Case action/object title, such as `Discard Unsaved Changes?`, `Delete Subject?`,
  or `Archive Policy?`. Preserve user-entered names inside dynamic content. Do not use a vague
  `Warning`, `Confirmation`, or repeated page heading as the only title.
- Put one meaningful leading icon beside the title. Use `Iconify` with `GlobalIcons`; choose a
  warning icon for losing unsaved work, a delete icon for deletion, or the relevant operation icon.
  Status/semantic color reinforces the message without replacing the title or consequence.
- Use concise sentence-case body text naming the consequence and record when useful. For discard:
  `Your changes to this form will be lost if you discard them.` Never imply that existing saved
  records will be deleted when only the local draft is being discarded.
- A normal confirmation needs its leading meaning/action icon, not another redundant title-help
  tooltip. Put the material consequence visibly in the body rather than hiding it in info help.
- Keep a single readable content column. No decorative cards, section grids, repeated warnings,
  summary metrics, or long instructional paragraphs. A reason field appears only when the existing
  workflow requires one, with a visible label, required marker if applicable, help/error association,
  and preserved input after failure. Larger forms follow the sectioned form/dialog rules.

## Spacing and button sizes

Use existing theme units (currently 8 px), palette, typography, and dialog margins. These values
come from the inspected implementation; they are not measurements from an unattached image.

| Element | Standard / current owner |
| --- | --- |
| Shell | `ConfirmDialog` uses `fullWidth`, `maxWidth="xs"`; theme radius 16 px and non-fullscreen outer margin `2` |
| Title | Existing `DialogTitle p: 2` (16 px), `h6` typography; Title Case and natural wrapping |
| Icon/title gap | Shared `gap={1}` (8 px), vertically centered; icon does not shrink away |
| Title icon | Use a compact meaningful glyph, typically 24 px for this header; avoid oversized decorative illustrations |
| Message | Shared `body2`; current content padding is 0 top, 16 px horizontal/bottom; no second padded wrapper |
| Footer | Shared `DialogActions p: 2`, subtle divider/surface treatment, actions right aligned |
| Between buttons | Dialog theme adds spacing `1.5` (12 px) to successive actions; do not add another gap/margin on top |
| Buttons | `size="small"`, existing 30 px height, content width; theme owns font, radius, icon/text spacing, and non-text horizontal padding 8 px |
| Leading button icons | `Iconify` with relevant `GlobalIcons` keys, typically 16–18 px; no decorative star glyphs |

Keep the safe button before the outcome button. Do not add local minimum heights, fixed equal
widths, new shadows, or feature-specific fonts. Use theme colors rather than hardcoded black,
white, or red. On narrow screens keep viewport margins, allow long text/action labels to wrap
without clipping, and keep both actions reachable; use body scrolling if content grows.

| Decision | Safe action | Outcome action |
| --- | --- | --- |
| Unsaved form | `Keep Editing`: outlined, inherit/neutral, `GlobalIcons.cancel` | `Discard Changes`: contained, error, `GlobalIcons.delete`; discards only the local draft |
| Delete | `Cancel`: outlined, inherit/neutral, cancel icon | Specific `Delete` label: contained, error, delete icon |
| Archive | `Cancel`: outlined, inherit/neutral | `Archive`: contained neutral with archive icon; warnings belong to an actual restriction |
| Other lifecycle decision | Safe `Cancel` or workflow-specific wording | Explicit outcome such as `Publish`; existing semantic styling and matching icon |

Every footer button uses a leading action icon and `type="button"` for a pure decision. Do not
trigger the underlying form submission. Avoid Yes/No/Okay labels. Destructive discard/delete may
use the error variant even though ordinary form Submit uses the neutral dark contained treatment.

## Unsaved-form cancellation

This applies to [form dialogs](form-dialogs.md) and [form drawers](drawers.md). Use one form dirty
baseline and one close/confirmation owner. Editing includes fields, selectors, toggles, uploads,
and collections; focusing or touching an unchanged field is not an unsaved change.

| Attempt / choice | Required behavior |
| --- | --- |
| Cancel/X/Escape on a clean form | Close once without a discard confirmation; clean up the session |
| Cancel/X/Escape on a dirty form | Leave the form and all values mounted; show `Discard Unsaved Changes?` |
| `Keep Editing` | Close only the confirmation; preserve values, errors, selection, and form context; return focus to the form |
| `Discard Changes` | Reset the local draft/baseline and edit identity, then close confirmation/form; do not save or issue a record-delete request |
| Confirmation backdrop | Keep confirmation open; never discard implicitly |
| Confirmation Escape while idle | Safe dismissal only, equivalent to Keep Editing; no draft reset |
| Form backdrop / navigation | Follow its shell's dismissal policy; every supported leave path must use the same dirty guard |
| Blocking form save or confirmed async action | Prevent duplicate/conflicting decisions; lock outcome, safe action, reason inputs, Escape, and any close/backdrop path |

Do not erase fields before displaying the popup. After a successful save, establish the saved
baseline before closing so the guard does not prompt again. On a failed save preserve the form,
release the busy lock, and permit retry or guarded cancellation. A purely read-only view needs
no unsaved-change confirmation.

`CustomDialog` currently uses `window.confirm` internally. For this shared pop-up pattern, let
the owning form's `requestClose` show `ConfirmDialog`, use `guardUnsavedChanges={false}` on
`CustomDialog`, and route its `handleClose` and footer Cancel through that same local owner.
This replaces the guard rather than bypassing protection; keep `disableClose={busy}` and actual
navigation/unload protection where applicable. Do not show both a native and custom prompt.
Nested forms must not reset a parent form's dirty state. Drawer close paths follow the same
owner with their existing supported backdrop policy.

## Current API and composition example

Inspect [ConfirmDialog](../../../../src/components/confirm-dialog/confirm-dialog.tsx) and
[its types](../../../../src/components/confirm-dialog/types.ts) before passing props.

| Prop | Actual contract / caution |
| --- | --- |
| `open`, `title`, `action`, `onClose` | Required; `action` is the caller's outcome button; `onClose` handles the built-in safe button and allowed dismissal |
| `content` | Optional ReactNode for consequence or required-reason content |
| `cancelText` | Safe button label; set exactly `Keep Editing` for unsaved work |
| `icon` | ReactNode or a supported semantic string; default is error, so choose an explicit meaning; pass an Iconify node to use `GlobalIcons` |
| `disableBackdropClick` | Defaults false; set true for focused confirmations |
| `disableCancel` | Disables only the safe button, not Escape or every dismissal path |
| MUI dialog props | Support `disableEscapeKeyDown`, accessible title/message relationships, etc.; still guard `onClose` while busy |
| Outcome loading/disabled | Owned by the supplied button and real request state; no generic `loading`, `onDiscard`, `onConfirm`, or `keepEditingText` prop |

The following is an integration excerpt. `discardOpen`, `keepEditing`, and `discardChanges`
belong to the single close owner; `busy` comes from actual blocking request/submission state.
`discardChanges` must guard busy, reset the draft, and close the owning form without saving.

```tsx
<ConfirmDialog
  open={discardOpen}
  title={<span id="discard-title">Discard Unsaved Changes?</span>}
  content={
    <span id="discard-message">
      Your changes to this form will be lost if you discard them.
    </span>
  }
  aria-labelledby="discard-title"
  aria-describedby="discard-message"
  icon={<Iconify icon={GlobalIcons.alertIcon} width={24} color="warning.main" />}
  cancelText="Keep Editing"
  onClose={() => { if (!busy) keepEditing(); }}
  disableBackdropClick
  disableCancel={busy}
  disableEscapeKeyDown={busy}
  action={
    <Button
      type="button"
      size="small"
      variant="contained"
      color="error"
      disabled={busy}
      startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
      onClick={discardChanges}
    >
      Discard Changes
    </Button>
  }
/>
```

Use unique accessible IDs per mounted instance, for example from React `useId`; literal IDs above
illustrate one instance. The built-in safe button already uses `GlobalIcons.cancel` and small
size; do not add a duplicate Keep Editing button inside `action`. ConfirmDialog also forces a
valid outcome element to small size. For an async operation, supply a loading-capable outcome
button; retain content and request-specific retry errors until success. Confirm only an operation
the backend and feature actually allow. The discard example itself is a local decision.

## Component relationships

| Concern | Existing source / related guide |
| --- | --- |
| Shell / props | [ConfirmDialog](../../../../src/components/confirm-dialog/confirm-dialog.tsx), [types](../../../../src/components/confirm-dialog/types.ts) |
| Icons | [GlobalIcons](../../../../src/utils/icons.ts), [Iconify](../../../../src/components/iconify/iconify.tsx) |
| Sizing and surfaces | [Dialog theme](../../../../src/theme/core/components/dialog.tsx), [button theme](../../../../src/theme/core/components/button.tsx) |
| Form owners | [CustomDialog guide](form-dialogs.md), [drawer guide](drawers.md); use their single dirty-close boundary |
| Existing discard wiring | [Concession form drawer](../../../../src/screens/finance/policies/components/ConcessionPolicyDrawer.tsx); inspect current behavior rather than copying its older labels/icons |

## Verification and inconsistencies

Check Title Case and visible consequence; correct semantic/GlobalIcons glyphs; one padding owner;
30 px small buttons; safe/outcome order; exact Keep Editing/Discard Changes labels; clean versus
dirty cancellation; no reset on safe dismissal; no duplicate/native prompt; backdrop/Escape;
focus trap, safe initial focus and focus return; busy locks; errors/retry; narrow screens and
both themes. Documentation changes validate links, skill structure, and whitespace; UI changes
also need focused checks and the required in-app browser smoke test.

Current implementation differences: the default header icon map uses MUI icons rather than
GlobalIcons; caller-supplied Iconify nodes support the requested convention. The shared component
does not create an unsaved-change guard or explicit accessible message IDs for the caller, and
`disableCancel` alone does not block all dismissal paths. A confirmation image, runtime focus,
keyboard, mobile, loading, and visual matching remain Unverified. No application behavior is
changed by updating this guide.
