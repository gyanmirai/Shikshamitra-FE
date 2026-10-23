import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

import { DiscardChangesDialog } from './DiscardChangesDialog';

export function useAcademicDiscardGuard(
  isDirty: boolean,
  blockNavigation = false,
  push?: (href: string) => void
) {
  return useUnsavedNavigation(isDirty, {
    blockNavigation,
    push,
    renderConfirmation: (keepEditing, discard) => (
      <DiscardChangesDialog open onClose={keepEditing} onDiscard={discard} />
    ),
  });
}
