import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useStudentSetupFormState } from 'src/screens/student/setup/embedding';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

export function useAdmissionDraftGuard({
  dirty,
  busy = false,
  active = true,
  reset,
  push,
}: {
  dirty: boolean;
  busy?: boolean;
  active?: boolean;
  reset: () => void;
  push?: (href: string) => void;
}) {
  useStudentSetupFormState({ dirty: active && dirty, busy: active && busy });
  return useUnsavedNavigation(active && dirty, {
    push,
    blockNavigation: active && busy,
    guardContextChanges: active,
    onNavigationApproved: reset,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { busy }),
  });
}
