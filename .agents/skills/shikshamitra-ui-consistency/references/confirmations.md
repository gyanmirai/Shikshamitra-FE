# Confirmations and reason requests

Adapted from [popup rules](../../shikshamitra-fe-patterns/references/popups.md) and
[FE implementation patterns](../../shikshamitra-fe-patterns/references/implementation-patterns.md).

## When to use

Use for one consequential decision: delete, archive, discard, publish, or a required reason.
Use a form/drawer/page for substantial data entry. Do not interrupt low-risk tasks unnecessarily.

## Reference image

Image pending: `assets/confirmation.png`. See [image references](image-references.md).
Expected callouts: 1 action/object title, 2 consequence/record, 3 required reason if applicable,
4 safe secondary action, 5 outcome action.

## How to build

1. Use `ConfirmDialog` for focused decisions and inspect its props/default actions. Use `useBoolean`
   for controlled open state where appropriate; reserve imperative confirmation hooks for flows
   that actually need them. Do not build another confirmation shell.
2. Use a clear Title Case action/object title, such as `Delete Subject?` or `Unlock Published Marks`.
   The message names the affected record, actual consequence, and reversibility when relevant.
3. Keep one aligned content column with consistent padding. Omit decorative cards, repeated headings,
   and nested popups. Simple confirmations may omit an info icon when it adds no information.
4. Ask for a reason only when the backend/workflow requires it for a meaningful business record.
   Put it after the consequence, use a visible label, explain its audit purpose when relevant,
   and preserve the input after errors. Do not invent a minimum length absent a governing rule.
5. Use Cancel or Keep editing for the safe action and a specific outcome for the primary action:
   Delete, Archive, Publish, Confirm unlock, or Submit reason. Avoid generic Yes/No/Okay labels.

## Semantics and lifecycle

- Danger styling belongs to Delete, Discard, irreversible reset, or other destructive outcomes.
  Archive is a lifecycle action and normally uses neutral styling; warnings describe actual caution.
  Do not color the whole popup or spread status colors across unrelated controls.
- Confirmation backdrop clicks keep the popup open unless the workflow explicitly requires dismissal.
- During a blocking request, lock primary/secondary actions, inputs, Close, Escape, and backdrop
  dismissal. Preserve the outcome label/progress, message, geometry, and entered reason.
- Prevent duplicate requests. Close only after confirmed success and update the parent through the
  established cache/notification pattern. On failure retain context and expose a safe retry path.
- Use the existing unsaved-changes flow for discard decisions; do not create a competing guard.

## Responsive and verification rules

- Center the short decision surface, keep readable copy and reachable actions, and allow body
  scrolling on small screens without horizontal overflow.
- Associate the title/message with the dialog, trap focus, expose visible keyboard focus, and
  return focus to the launching control on close.
- Verify outcome wording, affected record, permission/state eligibility, correct semantic emphasis,
  required-reason validation, request locks, backdrop behavior, retry, and parent refresh.

## Code reference

Inspect `src/components/confirm-dialog/confirm-dialog.tsx` and `types.ts` before passing props.
For reason-entry decisions inspect the owning module's existing implementation and backend contract.
