'use client';

import * as Yup from 'yup';
import { useEffect } from 'react';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
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

import AdmissionFeeCollectionPanel from '../../admissions/fee-selection/admission-fee-collection-panel';

export default function StudentOnboardingFees({
  caseId,
  canManage,
}: {
  caseId: string;
  canManage: boolean;
}) {
  const item = useGetStudentOnboardingCaseQuery(caseId);
  const selection = useGetStudentOnboardingFeeStructureQuery(caseId);
  const caseState = item.currentData;
  const feeState = selection.currentData;
  const automaticallyConfirmed = feeState?.automaticallyConfirmedFromAdmissions === true;
  const lockedSnapshot = feeState?.isLocked || automaticallyConfirmed ? feeState?.selection : undefined;
  const candidates = useGetStudentOnboardingFeeCandidatesQuery(caseId, {
    skip: Boolean(lockedSnapshot),
  });
  const structures = lockedSnapshot ? [lockedSnapshot] : (candidates.currentData ?? []);
  const readError = item.isError || selection.isError || (!lockedSnapshot && candidates.isError);
  const retry = () => {
    item.refetch();
    selection.refetch();
    if (!lockedSnapshot) candidates.refetch();
  };
  const [confirm, saving] = useConfirmStudentOnboardingFeeStructureMutation();
  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      structureId: feeState?.selection?.structureId ?? '',
      optionalHeadIds:
        feeState?.selection?.heads
          .filter((head) => head.isOptional)
          .map((head) => head.feeHeadId) ?? ([] as string[]),
    },
    validationSchema: Yup.object({
      structureId: Yup.string().required('Choose a published fee structure.'),
    }),
    onSubmit: async (values) => {
      if (
        !canManage ||
        automaticallyConfirmed ||
        !caseState ||
        readError ||
        item.isFetching ||
        selection.isFetching ||
        saving.isLoading ||
        (lockedSnapshot && form.dirty)
      )
        return;
      const selected = structures.find((candidate) => candidate.structureId === values.structureId);
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
          concurrencyStamp: caseState.concurrencyStamp,
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
    if (!lockedSnapshot && !form.values.structureId && candidates.currentData?.length === 1)
      setFieldValue('structureId', candidates.currentData[0].structureId);
  }, [candidates.currentData, form.values.structureId, setFieldValue, lockedSnapshot]);
  if (readError && (!caseState || !feeState))
    return (
      <Alert
        severity="error"
        action={
          <Button size="small" onClick={retry}>
            Retry
          </Button>
        }
      >
        Fee structures could not be loaded.
      </Alert>
    );
  if (!caseState || !feeState || (!lockedSnapshot && candidates.isLoading))
    return (
      <Stack role="status" aria-label="Loading fee structures">
        <Skeleton height={64} />
        <Skeleton height={40} />
      </Stack>
    );
  const chosen = structures.find((candidate) => candidate.structureId === form.values.structureId);
  const disabled =
    !canManage ||
    readError ||
    item.isFetching ||
    saving.isLoading ||
    selection.isFetching ||
    (!lockedSnapshot && candidates.isFetching) ||
    Boolean(caseState.studentEnrollmentId) ||
    caseState.status === 5;
  return (
    <Stack spacing={1.5} component="form" onSubmit={form.handleSubmit}>
      {feeState.feeCollectionDeferral && (
        <Stack spacing={0.5}>
          <Label color="warning" sx={{ alignSelf: 'flex-start' }}>
            Collection deferred from Admissions
          </Label>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {feeState.feeCollectionDeferral.reason}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Deferred {fDateTime(feeState.feeCollectionDeferral.deferredAt)}
          </Typography>
        </Stack>
      )}
      {readError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={retry}>
              Retry
            </Button>
          }
        >
          Fee structures could not be refreshed. Retry before making changes.
        </Alert>
      )}
      {automaticallyConfirmed && (
        <Label color="success" sx={{ alignSelf: 'flex-start' }}>
          Completed in Admissions
        </Label>
      )}
      {feeState.onboardingConfirmed && !automaticallyConfirmed && (
        <Alert severity="success">
          Fee structure confirmed: {feeState.selection?.structureName}
        </Alert>
      )}
      {!structures.length && (
        <Alert severity="info">
          No published fee structure matches this student&apos;s academic year and Class. Ask
          Finance to publish the matching structure.
        </Alert>
      )}
      {automaticallyConfirmed ? (
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            Fee structure
          </Typography>
          <Typography variant="body2">
            {feeState.selection?.structureName} · Revision {feeState.selection?.revisionNumber}
          </Typography>
        </Stack>
      ) : (
        <CustomSelect
          label="Fee structure"
          size="small"
          required
          fullWidth
          isSearch
          value={form.values.structureId}
          options={structures.map((candidate) => ({
            value: candidate.structureId,
            label: `${candidate.structureName} · Revision ${candidate.revisionNumber}`,
          }))}
          disabled={disabled || feeState.isLocked || !structures.length}
          onChange={(value) => {
            setFieldValue('structureId', String(value));
            setFieldValue('optionalHeadIds', []);
          }}
          error={Boolean(form.touched.structureId && form.errors.structureId)}
          helperText={form.touched.structureId ? form.errors.structureId : undefined}
        />
      )}
      {chosen && (
        <>
          <Typography variant="subtitle2">Included fee heads</Typography>
          {chosen.heads
            .filter((head) => automaticallyConfirmed || !head.isOptional)
            .map((head) => (
              <Typography variant="body2" key={head.feeHeadId}>
                {head.feeHeadName}
              </Typography>
            ))}
          {!automaticallyConfirmed && chosen.heads.some((head) => head.isOptional) && (
            <CustomSelect
              label="Optional fee heads"
              size="small"
              multiple
              fullWidth
              value={form.values.optionalHeadIds}
              options={chosen.heads
                .filter((head) => head.isOptional)
                .map((head) => ({ value: head.feeHeadId, label: head.feeHeadName }))}
              disabled={disabled || feeState.isLocked}
              onChange={(value) => setFieldValue('optionalHeadIds', value)}
            />
          )}
        </>
      )}
      {form.status && <Alert severity="error">{form.status}</Alert>}
      {!automaticallyConfirmed && (
        <Button
          type="submit"
          size="small"
          variant="contained"
          loading={saving.isLoading}
          disabled={disabled || !chosen || (feeState.isLocked && form.dirty)}
          sx={{ alignSelf: 'flex-end' }}
        >
          Confirm fee structure
        </Button>
      )}
      {feeState.selection && caseState.applicationId && (
        <AdmissionFeeCollectionPanel
          key={caseState.applicationId}
          applicationId={caseState.applicationId}
          disabled={
            readError ||
            automaticallyConfirmed ||
            form.dirty ||
            saving.isLoading ||
            item.isFetching ||
            selection.isFetching ||
            caseState.status === 5
          }
        />
      )}
    </Stack>
  );
}
