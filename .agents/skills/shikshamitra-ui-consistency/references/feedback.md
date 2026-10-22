# Toasts, inline alerts, and recovery

Use [DESIGN.md Toast](../../../../DESIGN.md#13-toast) and the actual
[shikshaMitraToast wrapper](../../../../src/components/toast/index.tsx). Do not import Sonner
directly in feature screens or create feature-specific notification styles.

## Choose the presentation

| Situation | Presentation |
| --- | --- |
| Brief result after a completed action | Shared success/info toast; identify the outcome or record where useful |
| Field validation | Associated field error and helper; retain entered values |
| Blocking prerequisite, failed region, or persistent recovery task | MUI Alert inside the affected region, visible explanation and an actual recovery action |
| One consequential decision before acting | [ConfirmDialog](confirmations.md), with the named outcome and safe alternative |
| Background request lifecycle | Existing promise/progress feedback with real request state; distinguish queued, running, and complete |

## Actual API and behavior

- `success`, `warning`, and `error` receive `{ message, alertProps? }`. `info` also accepts a message
  callback receiving the toast ID. `alertProps` may be an object or callback receiving that ID.
  `dismiss(id?)` closes feedback; it does not cancel or undo a request.
- `promise(promise, { pending?, success?, error? })` observes that promise. Do not invent wrapper
  props such as `duration`, `position`, or `dedupeKey`; inspect the snackbar provider for policy.
- The error wrapper converts generic permission errors into an `Access required` warning and
  deduplicates that case. Preserve its safe message handling; do not show raw backend exceptions.
- Await mutation success before claiming completion. A loading indicator disappearing is not a
  successful save. Keep a durable inline error when an unresolved problem must remain visible.
- Do not announce one failed request through repeated field, inline, and toast messages. Prefer
  the owning field/region for actionable detail and one concise overall result when needed.
- Toast text, inline severity, and modal action must describe the same state. Do not use green
  for merely queued work or success language after an optimistic update that can still fail.
- Keep close/retry/undo controls named and keyboard reachable. Important errors must remain
  available after transient feedback disappears; do not hide the only recovery path in a toast.

## Undo is an existing workflow, not a styling option

Inspect [useConfirmWithUndo](../../../../src/hooks/useConfirmWithUndo.tsx) and
[UndoToast](../../../../src/components/UndoToast/index.tsx) only for an already supported delayed
commit. The hook optimistically removes, restores on Undo/failure, and commits after a timer.
Do not retrofit Undo onto an irreversible server operation or claim that closing a toast restores
data. Verify timer cleanup, overlapping requests, cache restoration, and server errors before reuse;
the current helper is not proof that those cases are handled for a new feature.

## Reference and checks

[DashboardZone](../../../../src/screens/mainDashboard/dashboard-zone.tsx) demonstrates a region-owned
loading/empty/error boundary. [Images](image-references.md) do not yet establish transient toast or
Undo appearance. Do not trigger a school-data mutation merely to manufacture a screenshot.
Check repeated activation, success/failure copy, retry, announcements, long text, focus, and dismissal.
