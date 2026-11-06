'use client';

import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

export function useAdmissionCloseGuard(
  dirty: boolean,
  busy: boolean,
  enabled = true,
  push?: (href: string) => void,
  description?: string
) {
  return useUnsavedNavigation(enabled && dirty, {
    blockNavigation: enabled && busy,
    guardContextChanges: enabled,
    push,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { busy, description }),
  });
}
