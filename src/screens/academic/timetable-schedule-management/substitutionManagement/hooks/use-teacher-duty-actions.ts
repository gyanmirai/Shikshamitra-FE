import type { AppDispatch } from 'src/redux/store';

import { useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  substitutionManagementApi,
  substitutionStatusInvalidationTags,
} from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import {
  useRejectSubstitutionDutyAction,
  useAcknowledgeSubstitutionAction,
  useRequestSubstitutionChangeAction,
} from '../substitutionManagement.hooks';
import {
  type DutyAction,
  applyDutyResponse,
  type DutyActionPayload,
  DUTY_ACTION_REASON_MIN_LENGTH,
  resolveDutyActionErrorMessage,
} from '../services/duty-actions';

export function useTeacherDutyActions(externalPendingAction: DutyActionPayload | null = null) {
  const dispatch = useDispatch<AppDispatch>();
  const [acknowledge] = useAcknowledgeSubstitutionAction();
  const [reject] = useRejectSubstitutionDutyAction();
  const [requestChange] = useRequestSubstitutionChangeAction();
  const [payload, setPayload] = useState<DutyActionPayload | null>(null);
  const [note, setNote] = useState('');
  const [pendingAction, setPendingAction] = useState<DutyActionPayload | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const selectedRef = useRef<DutyActionPayload | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (payload || !shouldRefresh) return;
    setShouldRefresh(false);
    // Preserve the existing ordering: close the dialog before refreshing tables.
    dispatch(
      substitutionManagementApi.util.invalidateTags([...substitutionStatusInvalidationTags])
    );
  }, [dispatch, payload, shouldRefresh]);

  const open = (id: string, action: DutyAction) => {
    if (selectedRef.current || submittingRef.current || externalPendingAction) return;
    selectedRef.current = { id, action };
    setPayload(selectedRef.current);
    setNote('');
  };

  const close = () => {
    if (submittingRef.current || externalPendingAction) return;
    selectedRef.current = null;
    setPayload(null);
    setNote('');
  };

  const submit = async () => {
    const selected = selectedRef.current;
    const reason = note.trim();
    if (
      !selected ||
      submittingRef.current ||
      externalPendingAction ||
      (selected.action !== 'accept' && reason.length < DUTY_ACTION_REASON_MIN_LENGTH)
    ) {
      return;
    }

    // A ref also guards keyboard submits and multiple calls before React renders.
    submittingRef.current = true;
    setPendingAction(selected);
    try {
      const { id, action } = selected;
      const updated = await (
        action === 'accept'
          ? acknowledge({ id, reason: reason || undefined })
          : action === 'reject'
            ? reject({ id, reason })
            : requestChange({ id, reason })
      ).unwrap();
      applyDutyResponse(dispatch, updated);
      shikshaMitraToast.success({
        message:
          action === 'accept'
            ? 'Substitution duty accepted successfully.'
            : action === 'reject'
              ? 'Substitution duty rejected and admin notified.'
              : 'Substitution change request sent to admin successfully.',
      });
      selectedRef.current = null;
      setPayload(null);
      setNote('');
      setShouldRefresh(true);
    } catch (error) {
      shikshaMitraToast.error({
        message: resolveDutyActionErrorMessage(
          error,
          selected.action === 'accept'
            ? 'Unable to accept substitution duty.'
            : selected.action === 'reject'
              ? 'Unable to reject substitution duty.'
              : 'Unable to request substitution change.'
        ),
      });
    } finally {
      submittingRef.current = false;
      setPendingAction(null);
    }
  };

  return {
    payload,
    note,
    setNote,
    pendingAction: pendingAction || externalPendingAction,
    isSubmitting: !!(pendingAction || externalPendingAction),
    open,
    close,
    submit,
  };
}
