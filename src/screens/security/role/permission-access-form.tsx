'use client';

import { useDispatch } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import PermissionAccessBody from './permission-access-body';
import { usePermissionDraft } from './use-permission-draft';
import PermissionDraftFooter from './permission-draft-footer';
import PermissionChangeReview from './permission-change-review';

export default function PermissionAccessForm({
  editData,
  providerName,
  handleClose,
  mode = 'actions',
  onBusyChange,
}: {
  editData: { id?: string; name?: string; userName?: string };
  providerName: string;
  handleClose: () => void;
  mode?: 'actions' | 'visibility';
  onBusyChange?: (busy: boolean) => void;
}) {
  const dispatch = useDispatch();
  const review = useBoolean();
  const providerKey = (providerName === 'R' ? editData?.name : editData?.id) ?? '';
  /** Memoization Justification: stable provider identity prevents the draft synchronization
   * effect from running for unrelated form renders. */
  const provider = useMemo(() => ({ providerName, providerKey }), [providerName, providerKey]);
  const draft = usePermissionDraft(provider, () => {
    shikshaMitraToast.success({
      message:
        mode === 'actions' ? 'Updated Permissions successfully' : 'Updated Visibility successfully',
    });
    review.onFalse();
    handleClose();
  });
  useEffect(() => {
    onBusyChange?.(draft.busy);
  }, [draft.busy, onBusyChange]);
  useEffect(
    () => () => {
      onBusyChange?.(false);
    },
    [onBusyChange]
  );
  const close = () => {
    dispatch(setIsChanges(false));
    handleClose();
  };
  const openReview = () => {
    if (!draft.blocked && draft.dirty) review.onTrue();
  };
  return (
    <>
      <PermissionAccessBody
        draft={draft}
        provider={provider}
        mode={mode}
        onReview={openReview}
        subjectName={providerName === 'U' ? editData?.userName : editData?.name}
      />
      <PermissionDraftFooter draft={draft} onClose={close} onReview={openReview} />
      <PermissionChangeReview
        open={review.value}
        onClose={review.onFalse}
        draft={draft}
        provider={provider}
      />
    </>
  );
}
