import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import type { LibraryReturnTarget, CirculationDialogState } from './return-target';

export function useCirculationDialog() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [dialog, setDialog] = useState<CirculationDialogState | null>(null);
  const [busy, setBusy] = useState(false);
  const clear = () => {
    setDialog(null);
    dispatch(setIsChanges(false));
  };
  const guard = useUnsavedNavigation(Boolean(dialog) && isChanges, {
    blockNavigation: busy,
    guardContextChanges: true,
    onNavigationApproved: clear,
    onBeforeTraversal: clear,
    push: (href) => {
      clear();
      router.push(href);
    },
  });
  const onClose = (_event?: unknown, submitted = false) => {
    if (submitted) clear();
    else guard.requestNavigation(clear);
  };
  return {
    dialog,
    busy,
    setBusy,
    onClose,
    confirmation: guard.confirmation,
    reload: () => {
      if (dialog && !busy) {
        const next = { ...dialog, session: (dialog.session || 0) + 1 };
        guard.requestNavigation(() => setDialog(next));
      }
    },
    open: (
      kind: CirculationDialogState['kind'],
      accessionNo = '',
      target?: LibraryReturnTarget
    ) => {
      if (!busy) guard.requestNavigation(() => setDialog({ kind, accessionNo, target }));
    },
  };
}
