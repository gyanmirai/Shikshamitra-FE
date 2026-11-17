'use client';

import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useStudentSetupFormState } from 'src/screens/student/setup/embedding';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

export function useAdmissionCloseGuard(
  dirty: boolean,
  busy: boolean,
  enabled = true,
  push?: (href: string) => void,
  description?: string
) {
  useStudentSetupFormState({ dirty: enabled && dirty, busy: enabled && busy });
  return useUnsavedNavigation(enabled && dirty, {
    blockNavigation: enabled && busy,
    guardContextChanges: enabled,
    push,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { busy, description }),
  });
}
