import type { Dayjs } from 'dayjs';

import { useState } from 'react';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import {
  useGetAdmissionJoiningDateQuery,
  useSaveAdmissionJoiningDateMutation,
} from 'src/redux/student/admissions/admission-joining-date-api';

import { useAdmissionFeePreview } from './use-admission-fee-preview';

export function useAdmissionJoiningDate(
  applicationId: string,
  {
    enabled,
    requiresVariableAmounts = false,
  }: { enabled: boolean; requiresVariableAmounts?: boolean }
) {
  const query = useGetAdmissionJoiningDateQuery(applicationId, {
    skip: !enabled || !applicationId,
  });
  const state = query.currentData;
  const [save, saving] = useSaveAdmissionJoiningDateMutation();
  const [draft, setDraft] = useState<{
    applicationId: string;
    value: Dayjs | null;
    stamp: string;
  }>();
  const [touched, setTouched] = useState(false);
  const currentDraft =
    state?.canEdit && !state.isLocked && draft?.applicationId === applicationId ? draft : undefined;
  const value = currentDraft ? currentDraft.value : parseDateOnly(state?.joiningDate);
  const validDate = Boolean(value?.isValid());
  const date = validDate ? toDateOnly(value) : '';
  const yearEnd = toDateOnly(state?.academicYearEndDate);
  const validation = !value
    ? 'Actual joining date is required.'
    : !validDate
      ? 'Enter a valid actual joining date.'
      : yearEnd && date > yearEnd
        ? 'Actual joining date must be within the academic year or earlier.'
        : '';
  const stale = Boolean(currentDraft && currentDraft.stamp !== state?.concurrencyStamp);
  const needsPreview = Boolean(
    enabled && state?.canPreview && !state.isLocked && !requiresVariableAmounts
  );
  const feePreview = useAdmissionFeePreview(
    {
      applicationId,
      joiningDate: date,
      variableFeeHeads: [],
    },
    needsPreview && !validation && !stale && !query.isFetching
  );
  const { result: preview, pending: previewPending, query: previewQuery } = feePreview;
  const blocked =
    !enabled ||
    !state ||
    query.isFetching ||
    query.isError ||
    saving.isLoading ||
    stale ||
    (!state.isLocked && (Boolean(validation) || (needsPreview && !preview)));
  const change = (next: Dayjs | null) => {
    setDraft({
      applicationId,
      value: next,
      stamp: currentDraft?.stamp ?? state?.concurrencyStamp ?? '',
    });
  };
  const confirm = async () => {
    setTouched(true);
    if (blocked)
      throw new Error(
        validation || 'Refresh the joining date and fee preview before collecting fees.'
      );
    if (state.isLocked || !state.canEdit) return;
    try {
      await save({
        applicationId,
        joiningDate: date,
        concurrencyStamp: currentDraft?.stamp ?? state.concurrencyStamp,
      }).unwrap();
    } catch (failure) {
      // A lost response or a competing confirmation can already have changed the
      // source. Refresh capabilities while retaining the user's draft for recovery.
      await query.refetch();
      throw failure;
    }
    setDraft(undefined);
    setTouched(false);
  };
  const retry = async () => {
    // Explicit refresh adopts the latest saved date and concurrency token, rather than
    // silently overwriting a competing user's date with an old draft.
    const next = await query.refetch();
    if ('data' in next && next.data) {
      setDraft(undefined);
      setTouched(false);
    }
  };
  return {
    state,
    query,
    value,
    date,
    change,
    confirm,
    retry,
    stale,
    blur: () => setTouched(true),
    error: touched ? validation : '',
    blocked,
    saving: saving.isLoading,
    preview,
    previewPending,
    previewQuery,
    previewFailed: feePreview.failed,
  };
}
