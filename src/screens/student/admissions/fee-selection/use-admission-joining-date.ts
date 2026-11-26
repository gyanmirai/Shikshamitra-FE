import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState } from 'react';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import {
  useGetAdmissionJoiningDateQuery,
  useSaveAdmissionJoiningDateMutation,
} from 'src/redux/student/admissions/admission-joining-date-api';

import { useAdmissionFeePreview } from './use-admission-fee-preview';

function validateJoiningDate(value: Dayjs | null, yearEnd: string) {
  if (!value) return 'Actual joining date is required.';
  if (!value.isValid()) return 'Enter a valid actual joining date.';
  if (yearEnd && toDateOnly(value) > yearEnd)
    return 'Actual joining date must be within the academic year or earlier.';
  return '';
}

export function useAdmissionJoiningDate(
  applicationId: string,
  {
    enabled,
    requiresVariableAmounts = false,
    defaultToToday = false,
  }: { enabled: boolean; requiresVariableAmounts?: boolean; defaultToToday?: boolean }
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
  const [selection, setSelection] = useState<{ applicationId: string; versionId: string | null }>();
  const applicationDraft = draft?.applicationId === applicationId ? draft : undefined;
  const currentDraft = state?.canEdit && !state.isLocked ? applicationDraft : undefined;
  const yearEnd = toDateOnly(state?.academicYearEndDate);
  const today = dayjs().startOf('day');
  const canDefaultToToday =
    enabled &&
    defaultToToday &&
    state?.canEdit &&
    !state.isLocked &&
    (!yearEnd || toDateOnly(today) <= yearEnd);
  const value = currentDraft
    ? currentDraft.value
    : (parseDateOnly(state?.joiningDate) ?? (canDefaultToToday ? today : null));
  const validDate = Boolean(value?.isValid());
  const date = validDate ? toDateOnly(value) : '';
  const selectedPolicyVersionId =
    selection?.applicationId === applicationId
      ? selection.versionId
      : (state?.defaultProrationPolicyVersionId ?? null);
  const prorationPolicyEligible = Boolean(
    date && state?.academicYearStartDate && date > toDateOnly(state.academicYearStartDate)
  );
  const validation = validateJoiningDate(value, yearEnd);
  const stale = Boolean(currentDraft && currentDraft.stamp !== state?.concurrencyStamp);
  const needsPreview = Boolean(
    enabled && state?.canPreview && !state.isLocked && !requiresVariableAmounts
  );
  const feePreview = useAdmissionFeePreview(
    {
      applicationId,
      joiningDate: date,
      variableFeeHeads: [],
      ...(state?.canSelectProrationPolicy &&
        prorationPolicyEligible && {
          prorationPolicyVersionId: selectedPolicyVersionId,
        }),
    },
    needsPreview && !validation && !stale && !query.isFetching
  );
  const { result: preview, pending: previewPending, query: previewQuery } = feePreview;
  const unavailable =
    !enabled || !state || query.isFetching || query.isError || saving.isLoading || stale;
  const blocked =
    unavailable || (!state?.isLocked && (Boolean(validation) || (needsPreview && !preview)));
  const canSaveValue = (candidate: Dayjs | null) =>
    Boolean(
      !unavailable &&
      state?.canEdit &&
      !state.isLocked &&
      !validateJoiningDate(candidate, yearEnd) &&
      toDateOnly(candidate) !== toDateOnly(state.joiningDate)
    );
  const hasUnsavedDateEdit = Boolean(
    applicationDraft &&
    (applicationDraft.value?.isValid() === false ||
      toDateOnly(applicationDraft.value) !== toDateOnly(state?.joiningDate))
  );
  const change = (next: Dayjs | null) => {
    setDraft({
      applicationId,
      value: next,
      stamp: currentDraft?.stamp ?? state?.concurrencyStamp ?? '',
    });
  };
  const changePolicy = (versionId: string | null) => {
    setSelection({ applicationId, versionId });
  };
  const persistDate = async (intent: 'save' | 'collect', candidate = value) => {
    const saveOnly = intent === 'save';
    setTouched(true);
    if (!state || (saveOnly ? !canSaveValue(candidate) : blocked))
      throw new Error(
        validateJoiningDate(candidate, yearEnd) ||
          (saveOnly
            ? 'Refresh the joining date before saving.'
            : 'Refresh the joining date and fee preview before collecting fees.')
      );
    if (state.isLocked || !state.canEdit) return;
    const joiningDate = toDateOnly(candidate);
    try {
      const saved = await save({
        applicationId,
        joiningDate,
        concurrencyStamp: currentDraft?.stamp ?? state.concurrencyStamp,
      }).unwrap();
      if (toDateOnly(saved?.joiningDate) !== joiningDate) {
        throw new Error(
          'Could not confirm the actual joining date. Check the saved date before retrying fee preparation.'
        );
      }
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
    selectedPolicyVersionId,
    prorationPolicyEligible,
    changePolicy,
    confirm: () => persistDate('collect'),
    canSaveDate: canSaveValue(value),
    canSaveValue,
    hasUnsavedDateEdit,
    saveDate: (candidate?: Dayjs | null) => persistDate('save', candidate),
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
