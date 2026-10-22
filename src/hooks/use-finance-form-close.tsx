import { useDispatch, useSelector } from 'react-redux';
import { useRef, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import type { RootState } from 'src/redux/store';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useUnsavedNavigation } from './use-unsaved-navigation';

/** A single close path for Cancel, X and navigation, scoped to the open form session. */
export function useFinanceFormClose(
  open: boolean,
  close: () => void,
  busy = false,
  hasUnsavedChanges?: boolean
) {
  const dispatch = useDispatch();
  const router = useRouter();
  const globalDirty = useSelector((state: RootState) => state.confirmPopup.isChanges);
  const wasOpen = useRef(open);
  const ownedGlobalDirty = useRef(hasUnsavedChanges === undefined);
  const dirty = hasUnsavedChanges ?? globalDirty;
  const reset = () => {
    if (hasUnsavedChanges === undefined) dispatch(setIsChanges(false));
    close();
  };
  const { requestNavigation, cancelNavigation, confirmation } = useUnsavedNavigation(
    open && dirty,
    {
      blockNavigation: open && busy,
      push: (href) => {
        reset();
        router.push(href);
      },
    }
  );
  useEffect(() => {
    if (!open) {
      cancelNavigation();
      if (wasOpen.current && ownedGlobalDirty.current) dispatch(setIsChanges(false));
    }
    wasOpen.current = open;
    ownedGlobalDirty.current = hasUnsavedChanges === undefined;
  }, [open, cancelNavigation, dispatch, hasUnsavedChanges]);
  return {
    handleClose: (_event?: unknown, submitted = false) => {
      if (!open) return;
      if (busy && !submitted) return;
      if (submitted) reset();
      else requestNavigation(reset);
    },
    confirmation: open ? confirmation : null,
  };
}
