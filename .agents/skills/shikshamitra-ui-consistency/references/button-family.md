# Button family: ShikshaMitra UI consistency

Use the existing common buttons for equivalent actions in [drawers](drawers.md),
[CustomDialog forms](form-dialogs.md), and [page forms](page-forms.md). The shell owns footer
padding and scrolling; this guide owns button choice, dimensions, icons, and interaction states.
For step navigation use [stepper forms](stepper-forms.md); for destructive decisions use
[confirmations](confirmations.md). Do not replace either workflow with a generic Submit pair.

## Visual references

These supplied images were inspected for this guide on 16 October 2026. All show light-theme
forms; CSS viewport and scale are unknown. They establish normal footer composition, not
loading, disabled, keyboard, mobile, or dark-theme behavior.

| Shell | Existing image | Button reference |
| --- | --- | --- |
| Drawer | [Create Concession Policy](../assets/drawer.png) | Bottom-right outlined Cancel, neutral dark Submit, leading icons |
| Dialog | [Add Subject](../assets/form-dialog.png) | Compact outlined Cancel and contained Submit in stationary DialogActions |
| Page | [Syllabus chapter form](../assets/page-form-syllabus.png) | Stable footer, Cancel before primary action; ordinary forms use Submit rather than the legacy Add Chapter label |

![Drawer form with compact Cancel and Submit actions](../assets/drawer.png)

Reuse these assets rather than duplicating screenshots. The linked shell guides include the
dialog and page image embeds. Loading and disabled visual matching remains Unverified.

## Existing components and supported APIs

| Component | Use / current API |
| --- | --- |
| [SubmitButton](../../../../src/components/submit-button/index.tsx), [props](../../../../src/components/submit-button/interface.ts) | Default export. `loading`, `disabled`, `type`, `buttonText`, `variant`, `startIcon`, `size`, `sx`, `onClick`. Defaults: Submit, submit type, contained, small, save icon. No arbitrary MUI prop forwarding. |
| [CancelButton](../../../../src/components/cancel-button/index.tsx), [props](../../../../src/components/cancel-button/inerface.ts) | Default export. Only `onClick`, `buttonText`, `startIcon`. Internally button type, outlined, small. No `disabled`, `loading`, `sx`, `size`, or `color` prop. |
| [LoadingButton](../../../../src/components/loading-button/index.ts) | Named export of the installed MUI Button. Use its supported `loading`, `disabled`, `loadingPosition`, button and accessibility props when the wrappers cannot express the action. This is an alias, not another custom loading implementation. |
| MUI Button / IconButton | Use the configured components for other supported actions, icon-only controls, or props absent from a wrapper. Preserve the same theme and interaction contract. |
| [FormBusyRegion](../../../../src/components/form-busy-region/index.tsx) | Named export. `busy`, optional `label`, `children`; disables native controls and makes its children inert, with status/progress overlay. It does not lock controls or dismissal paths outside its subtree. |

`SubmitButton` currently imports the lab LoadingButton internally; the shared named
`LoadingButton` export aliases MUI Button. Inspect these sources before changing integrations;
do not assume their prop surfaces are identical. Extend a common wrapper only in an authorized
implementation task, rather than inventing props or creating a feature-local button family.

## Action choice, labels, and icons

| Action | Presentation | Leading icon / behavior |
| --- | --- | --- |
| Ordinary create/edit submission | `SubmitButton`, contained neutral, label `Submit`, `type="submit"` | `GlobalIcons.submit` in create and edit; loading tracks the actual submission |
| Cancel form | `CancelButton` when its API fits; shared LoadingButton/MUI Button when direct disabled control is needed. Outlined neutral, Cancel, button type | `GlobalIcons.cancel`; call the owning dirty-close guard |
| Close read-only view | `CancelButton` with `buttonText="Close"`, outlined neutral | `GlobalIcons.cancel`; no dirty prompt for a purely read-only view |
| Create/open task from page header | Small contained neutral supported button, specific label such as `Create Template` | `GlobalIcons.addIcon`; button type unless it really submits a form |
| Secondary action | Small outlined neutral supported button, specific action label | Existing semantic GlobalIcons key; type button |
| Publish, archive, discard, or other consequential decision | Follow the owning workflow and confirmation guide; use the actual outcome label | Existing semantic GlobalIcons key and appropriate semantic treatment; do not invent an operation |

- Use Title Case for multiword action labels, such as `Keep Editing` and `Discard Changes`.
  Keep one clear primary action per ordinary form footer. Required-field asterisks never belong
  on buttons; a start icon is a leading action icon, not a decorative star.
- Render icons through [Iconify](../../../../src/components/iconify/iconify.tsx) and
  [GlobalIcons](../../../../src/utils/icons.ts). Explicitly pass `startIcon` to common wrappers
  so feature code uses central keys even though the wrappers currently contain literal defaults.
  Use `width={18}` consistently for these footer icons; Iconify's unconfigured default is 20.
  Let the button theme own the icon/text gap, with no additional manual margins.
- Navigation arrows follow the stepper's supported direction/placement. Ordinary Submit and
  Cancel have leading icons. New semantic keys, when needed, belong in GlobalIcons; do not
  invent nonexistent keys or introduce a second icon library.
- Contained `color="inherit"` uses the theme's neutral dark fill and white text in light mode,
  with the configured contrasting treatment in dark mode. SubmitButton already inherits this
  theme default. Cancel stays outlined. Do not hardcode black/white or add accent colors to
  ordinary submission. Destructive confirmation colors follow their specific guide.

## Sizes and spacing

Source: [button theme](../../../../src/theme/core/components/button.tsx),
[typography](../../../../src/theme/core/typography.ts), and
[dialog theme](../../../../src/theme/core/components/dialog.tsx). Spacing values below use the
current 8 px theme unit. Screenshot pixels do not override these tokens.

| Area | Standard |
| --- | --- |
| Standard labeled actions | `size="small"`, 30 px visible height, content width at every breakpoint |
| Small horizontal padding | Theme-owned 8 px each side for outlined/contained; 4 px for text variant |
| Typography and radius | Keep the theme's size-specific font, weight, line height, casing, and shape; no local overrides |
| Medium / large | Retain theme defaults only for a task that needs them; large is 48 px with 16 px outlined/contained horizontal padding. Neither is the ordinary form-footer size |
| Drawer action group | Right aligned, vertically centered, `Stack direction="row" spacing={1}` (8 px); Cancel then Submit |
| Page action group | Same right alignment, order, and 8 px group spacing; footer remains outside the scrolling form body |
| Dialog action group | Direct children of DialogActions get the theme's 12 px successive-action margin; do not add another Stack gap to those same children |
| Footer insets | Owned by the shell: dialog `p: 2`; drawer horizontal inset `{ xs: 2, sm: 3 }`, current reference `py: 1.75`; page follows its existing footer container |

Do not force equal widths, a local minimum height of 44 px, extra shadows, or custom padding on
small labeled buttons. An explicitly approved workflow may need a minimum width or full-width
action; keep that exception scoped. On narrow screens keep actions content-width and right
aligned, allowing the action row to wrap with its existing gap rather than clipping or shrinking
text. Ensure footer space accounts for the last field/error and the mobile keyboard.

Icon-only controls use IconButton with a meaningful accessible name, tooltip, visible focus,
and adequate hit area. The 30 px labeled-button rule does not prescribe an icon-only hit area.
Table row actions still follow [AdaptiveThreeDotsActions](adaptive-three-dots-actions.md).

## Loading, disabled, and submission states

| State | Required behavior |
| --- | --- |
| Ready | Clear visible label and icon; normal hover, focus, and keyboard activation |
| Missing prerequisite / unavailable action | Actual `disabled` behavior with theme disabled styles; put the actionable reason near the control or in accessible help. A faded color or CSS pointer lock alone is insufficient |
| Validation failure | Show the form's field errors and required ShakingTextField feedback; focus the first invalid field. Do not universally disable Submit merely because untouched required fields are empty |
| Blocking save/mutation | Primary `loading={busy}` and `disabled={busy || otherActualRestriction}`; stop repeat activation and conflicting edits/cancellation/navigation |
| Failure | Release loading/locks, retain entered values and useful errors, allow retry |
| Success | Clear loading and reset the dirty baseline only after actual success; close or transition according to the owning workflow |

- Derive `busy` from the real awaited form/mutation state, including all blocking phases.
  Keep the async submit promise connected to the owner and guard the handler itself against a
  concurrent request. Button styling alone cannot prevent Enter or another submission path.
- Use the component's loading indicator; do not add a second spinner inside `startIcon`, erase
  the accessible action name, or replace the button with a different-sized element. For a
  supported MUI action, `loadingPosition="start"` can replace its leading icon while retaining
  its label. SubmitButton does not expose that prop; use its existing loading presentation.
- Use a supported `disabled={busy}` prop for footer controls that must visibly lock. CancelButton
  does not expose it: use the existing shared LoadingButton/MUI Button with outlined styling for
  that Cancel action, or extend the wrapper in an implementation task. A native disabled fieldset
  blocks native controls but does not itself apply MUI's disabled class styling. FormBusyRegion
  also locks its descendants, including custom controls; keep the loading primary action outside
  an inert/covered body region. If the footer is outside that region, lock it separately.
- Lock header X, Escape, backdrop, Back, and other conflicting leave paths through the shell's
  supported API and the same owner. A callback returning early is useful defense but does not
  replace a visibly disabled button. Ordinary read-only fetching need not lock Close.
- Dirty Cancel uses one [Keep Editing / Discard Changes](confirmations.md) flow. Never clear
  values before confirmation. Keep Editing preserves them; Discard Changes explicitly resets
  and leaves. Keep the shell-specific close rules from the linked guides.
- Bind the primary action to one real form submit path. Cancel, Close, Add Details, and other
  non-submit actions are button type. Do not call the same mutation from both onClick and
  onSubmit. SubmitButton does not forward a `form` attribute: if the footer is outside the form,
  use a supported MUI button with `form={formId}` or the established single-submit integration.

## Common footer example

This fragment is inside the owning native form. `busy`, `blockedByPrerequisite`, and
`requestClose` come from that form's existing state/guard. Body fields use their own busy
boundary; the header and navigation are locked separately. This is the drawer/page action
group; in dialogs preserve DialogActions' spacing ownership instead. The existing named
LoadingButton alias is used for Cancel because CancelButton cannot receive `disabled`.
Use CancelButton with `onClick={requestClose}` and the same `startIcon` when no direct
disabled state is needed. Cancel itself does not start a loading operation.

```tsx
import { Stack } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import SubmitButton from 'src/components/submit-button';

<Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
  <LoadingButton
    type="button"
    size="small"
    color="inherit"
    variant="outlined"
    disabled={busy}
    onClick={requestClose}
    startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
  >
    Cancel
  </LoadingButton>
  <SubmitButton
    type="submit"
    buttonText="Submit"
    size="small"
    variant="contained"
    loading={busy}
    disabled={busy || blockedByPrerequisite}
    startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
  />
</Stack>
```

For a dialog, put these two buttons directly inside DialogActions instead of the Stack, retaining
the individual loading/disabled props and the theme's 12 px action margin. Do not add another
form or padded footer around it.

## Verification and current limits

Check normal, hover, keyboard focus, disabled, loading, failure/retry, and success; one request
from click or Enter; busy cancellation locks; dirty-close outcomes; long labels; footer/body
scroll separation; narrow screens and both themes. Confirm no button width jump when progress
appears, no duplicate action gaps, and a visible/accessible action name during loading.

Source examples include [Concession footer](../../../../src/screens/finance/policies/components/concession/ConcessionFooterActions.tsx)
and [Subject form](../../../../src/screens/academic/curriculum-management/setting/subjectCreation/subjectForm.tsx).
Their legacy edit icon/Update labels do not override the ordinary Submit rule. Wrapper literal
icons and API limitations are implementation facts, not fixes made by this guide.
Documentation-only validation checks links, assets, skill structure, and whitespace. Runtime
changes require focused checks and the repository's in-app browser smoke test. This guide
does not claim application behavior or unpictured states have been changed or verified.
