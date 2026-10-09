'use client';

import * as Yup from 'yup';
import { useEffect } from 'react';
import { useFormik } from 'formik';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, Skeleton, Typography } from '@mui/material';
import {
  useGetStudentOnboardingCaseQuery,
  useGetStudentOnboardingFeeStructureQuery,
  useGetStudentOnboardingFeeCandidatesQuery,
  useConfirmStudentOnboardingFeeStructureMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

export default function StudentOnboardingFees({
  caseId,
  canManage,
}: {
  caseId: string;
  canManage: boolean;
}) {
  const item = useGetStudentOnboardingCaseQuery(caseId);
  const selection = useGetStudentOnboardingFeeStructureQuery(caseId);
  const candidates = useGetStudentOnboardingFeeCandidatesQuery(caseId);
  const [confirm, saving] = useConfirmStudentOnboardingFeeStructureMutation();
  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      structureId: selection.data?.selection?.structureId ?? '',
      optionalHeadIds:
        selection.data?.selection?.heads
          .filter((head) => head.isOptional)
          .map((head) => head.feeHeadId) ?? ([] as string[]),
    },
    validationSchema: Yup.object({
      structureId: Yup.string().required('Choose a published fee structure.'),
    }),
    onSubmit: async (values) => {
      if (!canManage || !item.data || saving.isLoading) return;
      const selected = candidates.data?.find(
        (candidate) => candidate.structureId === values.structureId
      );
      if (!selected) {
        form.setStatus('The selected structure is unavailable. Refresh the list and choose again.');
        return;
      }
      if (
        !selected.heads.some(
          (head) => !head.isOptional || values.optionalHeadIds.includes(head.feeHeadId)
        )
      ) {
        form.setStatus('Select at least one fee head.');
        return;
      }
      try {
        await confirm({
          id: caseId,
          concurrencyStamp: item.data.concurrencyStamp,
          ...values,
        }).unwrap();
        form.setStatus(undefined);
        shikshaMitraToast.success({ message: 'Fee structure confirmed for onboarding.' });
      } catch (error) {
        form.setStatus(
          parseApiProblemDetail(error).detail ||
            'The fee structure could not be confirmed. Refresh and retry.'
        );
      }
    },
  });
  const { setFieldValue } = form;
  useEffect(() => {
    if (!form.values.structureId && candidates.data?.length === 1)
      setFieldValue('structureId', candidates.data[0].structureId);
  }, [candidates.data, form.values.structureId, setFieldValue]);
  if (item.isError || selection.isError || candidates.isError)
    return (
      <Alert
        severity="error"
        action={
          <Button
            size="small"
            onClick={() => {
              item.refetch();
              selection.refetch();
              candidates.refetch();
            }}
          >
            Retry
          </Button>
        }
      >
        Fee structures could not be loaded.
      </Alert>
    );
  if (!item.data || !selection.data || candidates.isLoading)
    return (
      <Stack role="status" aria-label="Loading fee structures">
        <Skeleton height={64} />
        <Skeleton height={40} />
      </Stack>
    );
  const chosen = candidates.data?.find(
    (candidate) => candidate.structureId === form.values.structureId
  );
  const disabled =
    !canManage ||
    saving.isLoading ||
    selection.isFetching ||
    candidates.isFetching ||
    Boolean(item.data.studentEnrollmentId) ||
    item.data.status === 5;
  return (
    <Stack spacing={1.5} component="form" onSubmit={form.handleSubmit}>
      {selection.data.onboardingConfirmed && (
        <Alert severity="success">
          Fee structure confirmed: {selection.data.selection?.structureName}
        </Alert>
      )}
      {!candidates.data?.length && (
        <Alert severity="info">
          No published fee structure matches this student&apos;s academic year and Class. Ask
          Finance to publish the matching structure.
        </Alert>
      )}
      <CustomSelect
        label="Fee structure"
        size="small"
        required
        fullWidth
        isSearch
        value={form.values.structureId}
        options={(candidates.data ?? []).map((candidate) => ({
          value: candidate.structureId,
          label: `${candidate.structureName} · Revision ${candidate.revisionNumber}`,
        }))}
        disabled={disabled || !candidates.data?.length}
        onChange={(value) => {
          setFieldValue('structureId', String(value));
          setFieldValue('optionalHeadIds', []);
        }}
        error={Boolean(form.touched.structureId && form.errors.structureId)}
        helperText={form.touched.structureId ? form.errors.structureId : undefined}
      />
      {chosen && (
        <>
          <Typography variant="subtitle2">Included fee heads</Typography>
          {chosen.heads
            .filter((head) => !head.isOptional)
            .map((head) => (
              <Typography variant="body2" key={head.feeHeadId}>
                {head.feeHeadName}
              </Typography>
            ))}
          {chosen.heads.some((head) => head.isOptional) && (
            <CustomSelect
              label="Optional fee heads"
              size="small"
              multiple
              fullWidth
              value={form.values.optionalHeadIds}
              options={chosen.heads
                .filter((head) => head.isOptional)
                .map((head) => ({ value: head.feeHeadId, label: head.feeHeadName }))}
              disabled={disabled}
              onChange={(value) => setFieldValue('optionalHeadIds', value)}
            />
          )}
        </>
      )}
      {form.status && <Alert severity="error">{form.status}</Alert>}
      <Button
        type="submit"
        size="small"
        variant="contained"
        loading={saving.isLoading}
        disabled={disabled || !chosen}
        sx={{ alignSelf: 'flex-end' }}
      >
        Confirm fee structure
      </Button>
    </Stack>
  );
}
