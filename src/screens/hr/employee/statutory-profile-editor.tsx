'use client';

import type { StaffStatutoryProfile } from 'src/redux/hr/statutory-profile-api';

import { useFormik } from 'formik';
import { fDate } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Alert, Stack, Button, Skeleton, Typography } from '@mui/material';
import { useRef, useState, type Ref, useEffect, useImperativeHandle } from 'react';
import {
  emptyStatutoryProfile,
  useGetStaffStatutoryProfileQuery,
  useSaveStaffStatutoryProfileMutation,
} from 'src/redux/hr/statutory-profile-api';

import { StatutoryProfileFields, statutoryProfileSchema } from './statutory-profile-fields';

export type StatutoryProfileDraft = {
  profile: StaffStatutoryProfile;
  concurrencyStamp: string | null;
  updatePf: boolean;
  updateEsic: boolean;
  valid: boolean;
  pfChoice: boolean | null;
};
export type StatutoryProfileEditHandle = { save: () => Promise<boolean> };
export function StatutoryProfileEditor({
  employeeId,
  month,
  grossSalary,
  draftMode = false,
  pfEnrollmentRecorded = false,
  disabled = false,
  onDraftChange,
  onSaved,
  savedProfile,
  onEditorStateChange,
  guardNavigation = true,
  editorRef,
}: {
  employeeId: string;
  month?: string;
  grossSalary?: number;
  draftMode?: boolean;
  pfEnrollmentRecorded?: boolean;
  disabled?: boolean;
  guardNavigation?: boolean;
  editorRef?: Ref<StatutoryProfileEditHandle>;
  onEditorStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
  savedProfile?: import('src/redux/hr/statutory-profile-api').StaffStatutoryProfileResponse;
  onDraftChange?: (draft: StatutoryProfileDraft | null) => void;
  onSaved?: () => void;
}) {
  const query = useGetStaffStatutoryProfileQuery({ employeeId, month }, { skip: !employeeId });
  const [save, saving] = useSaveStaffStatutoryProfileMutation();
  const requestId = useRef('');
  const signature = useRef('');
  const observedVersion = useRef<string | null>(null);
  const appliedSavedProfile = useRef<
    import('src/redux/hr/statutory-profile-api').StaffStatutoryProfileResponse | null
  >(null);
  const loadedSignature = useRef('');
  const baselineStamp = useRef<string | null>(null);
  const baselineMonth = useRef<string | undefined>(undefined);
  const ignoredRead = useRef<string | undefined>(undefined);
  const observedEmployee = useRef(employeeId);
  const callback = useRef(onDraftChange);
  callback.current = onDraftChange;
  const data = query.currentData;
  const [pfChosen, setPfChosen] = useState(false);
  const choiceRequired =
    draftMode && grossSalary != null && grossSalary > 25000 && !pfEnrollmentRecorded;
  const form = useFormik<StaffStatutoryProfile>({
    initialValues: data?.profile ?? emptyStatutoryProfile,
    enableReinitialize: false,
    validationSchema: statutoryProfileSchema.pick([
      ...(data?.canViewPf
        ? (['applyPf', 'pfNumber', 'uanNumber', 'pfDisabledReason'] as const)
        : []),
      ...(data?.canViewEsic
        ? (['applyEsic', 'esicInsuranceNumber', 'esicDisabledReason'] as const)
        : []),
    ]),
    onSubmit: async (profile) => {
      if (!data) return false;
      const inputSignature = JSON.stringify(profile);
      if (signature.current !== inputSignature) {
        requestId.current = crypto.randomUUID();
        signature.current = inputSignature;
      }
      try {
        const result = await save({
          employeeId,
          profile,
          effectiveMonth: baselineMonth.current,
          concurrencyStamp: baselineStamp.current,
          idempotencyKey: requestId.current,
          updatePf: data.canManagePf,
          updateEsic: data.canManageEsic,
        }).unwrap();
        ignoredRead.current = query.requestId;
        observedVersion.current = result.profile.versionId ?? null;
        loadedSignature.current = JSON.stringify(result.profile);
        baselineStamp.current = result.concurrencyStamp;
        baselineMonth.current = result.effectiveMonth;
        form.resetForm({ values: result.profile });
        requestId.current = '';
        shikshaMitraToast.success({
          message: `Registration details saved for ${result.effectiveMonth}.`,
        });
        onSaved?.();
        return true;
      } catch (error) {
        shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
        return false;
      }
    },
  });
  const { resetForm, dirty, values } = form;
  const busy = disabled || saving.isLoading || form.isSubmitting;
  const { confirmation } = useUnsavedNavigation(!draftMode && guardNavigation && form.dirty);
  useImperativeHandle(editorRef, () => ({
    save: async () => {
      if (!form.dirty) return !query.isLoading && !query.isError;
      if (busy || query.isFetching || query.isError) return false;
      const errors = await form.validateForm();
      if (Object.keys(errors).length) {
        await form.setTouched(Object.fromEntries(Object.keys(errors).map((key) => [key, true])));
        return false;
      }
      return (await form.submitForm()) === true;
    },
  }));
  useEffect(() => {
    if (!savedProfile || savedProfile === appliedSavedProfile.current) return;
    appliedSavedProfile.current = savedProfile;
    ignoredRead.current = query.requestId;
    loadedSignature.current = JSON.stringify(savedProfile.profile);
    baselineStamp.current = savedProfile.concurrencyStamp;
    baselineMonth.current = savedProfile.effectiveMonth;
    resetForm({ values: savedProfile.profile });
  }, [savedProfile, resetForm, query.requestId]);
  useEffect(() => {
    if (observedEmployee.current !== employeeId) {
      observedEmployee.current = employeeId;
      observedVersion.current = null;
      setPfChosen(false);
      requestId.current = '';
      signature.current = '';
      loadedSignature.current = '';
      resetForm({ values: data?.profile ?? emptyStatutoryProfile });
    }
    if (
      !data ||
      busy ||
      dirty ||
      query.isFetching ||
      query.requestId === ignoredRead.current ||
      loadedSignature.current === JSON.stringify(data.profile)
    )
      return;
    observedVersion.current = data.profile.versionId ?? null;
    loadedSignature.current = JSON.stringify(data.profile);
    baselineStamp.current = data.concurrencyStamp;
    baselineMonth.current = data.effectiveMonth;
    resetForm({ values: data.profile });
  }, [employeeId, data, busy, query.isFetching, query.requestId, dirty, resetForm]);
  useEffect(() => {
    onEditorStateChange?.({ dirty: form.dirty, busy: busy || query.isLoading || query.isFetching });
  }, [form.dirty, busy, query.isLoading, query.isFetching, onEditorStateChange]);
  useEffect(
    () => () => {
      onEditorStateChange?.({ dirty: false, busy: false });
    },
    [onEditorStateChange]
  );
  const serializedDraft = JSON.stringify(
    data
      ? {
          profile: values,
          concurrencyStamp: baselineStamp.current,
          updatePf: data.canManagePf,
          updateEsic: data.canManageEsic,
          valid:
            !query.isError &&
            !query.isFetching &&
            statutoryProfileSchema.isValidSync({
              ...values,
              ...(data.canViewPf ? {} : { applyPf: true, pfNumber: null, uanNumber: null }),
              ...(data.canViewEsic ? {} : { applyEsic: true, esicInsuranceNumber: null }),
            }) &&
            (!choiceRequired || pfChosen),
          pfChoice: choiceRequired && !pfChosen ? null : values.applyPf,
        }
      : null
  );
  useEffect(() => {
    callback.current?.(JSON.parse(serializedDraft));
  }, [serializedDraft]);
  if (query.isLoading) return <Skeleton variant="rounded" height={210} />;
  if (query.isError)
    return (
      <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
        Unable to load statutory registration details.
      </Alert>
    );
  if (!data) return null;
  return (
    <Stack spacing={1.5}>
      <StatutoryProfileFields
        form={form}
        grossSalary={grossSalary}
        canManagePf={data.canManagePf}
        canManageEsic={data.canManageEsic}
        canViewPf={data.canViewPf}
        canViewEsic={data.canViewEsic}
        disabled={busy}
        pfChoiceRequired={choiceRequired}
        pfChoice={pfChosen ? form.values.applyPf : null}
        onPfChoice={(apply) => {
          setPfChosen(true);
          form.setFieldValue('applyPf', apply);
        }}
      />
      <Typography variant="caption" color="text.secondary">
        Applies from {fDate(`${data.effectiveMonth}-01`, 'MMM YYYY')}. Registration numbers are
        required for deductions. Locked payroll remains unchanged.
      </Typography>
      {!draftMode && !editorRef && (data.canManagePf || data.canManageEsic) && (
        <Button
          variant="outlined"
          size="small"
          disabled={!form.dirty || busy}
          onClick={() => form.submitForm()}
          sx={{ alignSelf: 'flex-end' }}
        >
          Save registration details
        </Button>
      )}
      {confirmation}
    </Stack>
  );
}
