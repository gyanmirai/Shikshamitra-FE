'use client';

import type { Ref } from 'react';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useId, useRef, useState, useEffect, useImperativeHandle } from 'react';
import {
  Alert,
  Stack,
  Button,
  Skeleton,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  useGetStudentOnboardingCaseQuery,
  useGetStudentOnboardingFeeStructureQuery,
  useGetStudentOnboardingFeeCandidatesQuery,
  useConfirmStudentOnboardingFeeStructureMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import AdmissionFeeCollectionPanel from '../../admissions/fee-selection/admission-fee-collection-panel';

export type StudentOnboardingFeesHandle = {
  save: (options?: { allowIncomplete?: boolean }) => Promise<void>;
};

export type StudentOnboardingFeesState = {
  dirty: boolean;
  busy: boolean;
  loading: boolean;
  canSave: boolean;
};

export default function StudentOnboardingFees({
  caseId,
  canManage,
  editorRef,
  onStateChange,
  disabled: externallyDisabled = false,
  compact = false,
}: {
  caseId: string;
  canManage: boolean;
  editorRef?: Ref<StudentOnboardingFeesHandle>;
  onStateChange?: (state: StudentOnboardingFeesState) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const disclosureId = useId();
  const pendingSave = useRef(false);
  const [saveRequested, setSaveRequested] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const feeDetails = useBoolean();
  const paymentDetails = useBoolean();
  const item = useGetStudentOnboardingCaseQuery(caseId);
  const selection = useGetStudentOnboardingFeeStructureQuery(caseId);
  const caseState = item.currentData;
  const feeState = selection.currentData;
  const [savedDraft, setSavedDraft] = useState<{
    source: typeof feeState;
    values: { structureId: string; optionalHeadIds: string[] };
  }>();
  const automaticallyConfirmed = feeState?.automaticallyConfirmedFromAdmissions === true;
  const lockedSnapshot =
    feeState?.isLocked || automaticallyConfirmed ? feeState?.selection : undefined;
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
    initialValues:
      savedDraft && savedDraft.source === feeState
        ? savedDraft.values
        : {
            structureId: feeState?.selection?.structureId ?? '',
            optionalHeadIds:
              feeState?.selection?.heads
                .filter((head) => head.isOptional)
                .map((head) => head.feeHeadId) ?? ([] as string[]),
          },
    validationSchema: Yup.object({
      structureId: Yup.string().required('Choose a published fee structure.'),
    }),
    onSubmit: async () => {
      try {
        await save();
      } catch {
        // save() leaves the error and draft in this section for standalone and parent submission.
      }
    },
  });
  const { setFieldValue } = form;
  useEffect(() => {
    if (!lockedSnapshot && !form.values.structureId && candidates.currentData?.length === 1)
      setFieldValue('structureId', candidates.currentData[0].structureId);
  }, [candidates.currentData, form.values.structureId, setFieldValue, lockedSnapshot]);
  const loading =
    !caseState ||
    !feeState ||
    item.isFetching ||
    selection.isFetching ||
    (!lockedSnapshot && candidates.isFetching);
  const chosen = structures.find((candidate) => candidate.structureId === form.values.structureId);
  const confirmedUnchanged = Boolean(
    (feeState?.onboardingConfirmed ||
      automaticallyConfirmed ||
      (savedDraft && savedDraft.source === feeState)) &&
    !form.dirty
  );
  const busy = saveRequested || saving.isLoading || collectionOpen;
  const canSave =
    !readError &&
    !loading &&
    (confirmedUnchanged ||
      (canManage &&
        (!lockedSnapshot || !form.dirty) &&
        !caseState?.studentEnrollmentId &&
        caseState?.status !== 5 &&
        Boolean(
          chosen?.heads.some(
            (head) => !head.isOptional || form.values.optionalHeadIds.includes(head.feeHeadId)
          )
        )));

  async function save(options?: { allowIncomplete?: boolean }) {
    if (pendingSave.current || saving.isLoading || collectionOpen)
      throw new Error('Wait for the current fee action to finish.');
    pendingSave.current = true;
    setSaveRequested(true);
    try {
      if (readError || !caseState || !feeState)
        throw new Error('Refresh fee structures before saving.');
      if (confirmedUnchanged) return;
      if (options?.allowIncomplete && !form.values.structureId && !form.dirty) return;
      if (!canManage) throw new Error('You do not have permission to confirm the fee structure.');
      if (lockedSnapshot && form.dirty)
        throw new Error('The confirmed fee structure cannot be changed here.');
      const errors = await form.validateForm();
      if (Object.keys(errors).length) {
        await form.setTouched({ structureId: true });
        throw new Error(errors.structureId || 'Choose a published fee structure.');
      }
      if (!chosen)
        throw new Error(
          'The selected structure is unavailable. Refresh the list and choose again.'
        );
      if (
        !chosen.heads.some(
          (head) => !head.isOptional || form.values.optionalHeadIds.includes(head.feeHeadId)
        )
      )
        throw new Error('Select at least one fee head.');
      // Assignment saves update the same case. Read its latest stamp before confirming fees.
      const currentCase = await item.refetch().unwrap();
      if (currentCase.studentEnrollmentId || currentCase.status === 5)
        throw new Error('This student is no longer available for fee structure changes.');
      await confirm({
        id: caseId,
        concurrencyStamp: currentCase.concurrencyStamp,
        ...form.values,
      }).unwrap();
      // Keep the successful baseline while RTK refreshes the server snapshot.
      setSavedDraft({ source: feeState, values: form.values });
      form.resetForm({ values: form.values });
      form.setStatus(undefined);
      if (!compact)
        shikshaMitraToast.success({ message: 'Fee structure confirmed for onboarding.' });
    } catch (error) {
      const message =
        (error instanceof Error ? error.message : parseApiProblemDetail(error).detail) ||
        'The fee structure could not be confirmed. Refresh and retry.';
      form.setStatus(message);
      throw error;
    } finally {
      pendingSave.current = false;
      setSaveRequested(false);
    }
  }

  useImperativeHandle(editorRef, () => ({ save }));
  useEffect(() => {
    onStateChange?.({ dirty: form.dirty, busy, loading, canSave });
  }, [form.dirty, busy, loading, canSave, onStateChange]);
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
  const disabled =
    externallyDisabled ||
    busy ||
    !canManage ||
    readError ||
    item.isFetching ||
    saving.isLoading ||
    selection.isFetching ||
    (!lockedSnapshot && candidates.isFetching) ||
    Boolean(caseState.studentEnrollmentId) ||
    caseState.status === 5;
  const collectionPanel =
    feeState.selection && caseState.applicationId ? (
      <AdmissionFeeCollectionPanel
        key={caseState.applicationId}
        applicationId={caseState.applicationId}
        onOpenChange={setCollectionOpen}
        disabled={
          externallyDisabled ||
          saveRequested ||
          readError ||
          automaticallyConfirmed ||
          form.dirty ||
          saving.isLoading ||
          item.isFetching ||
          selection.isFetching ||
          caseState.status === 5
        }
      />
    ) : null;
  const includedFeeHeads = chosen?.heads
    .filter((head) => automaticallyConfirmed || !head.isOptional)
    .map((head) => (
      <Typography variant="body2" key={head.feeHeadId}>
        {head.feeHeadName}
      </Typography>
    ));
  return (
    <Stack spacing={compact ? 1 : 1.5} component="form" onSubmit={form.handleSubmit}>
      {feeState.feeCollectionDeferral && (
        <Stack spacing={0.5}>
          <Label color="warning" sx={{ alignSelf: 'flex-end' }}>
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
        <Label color="success" sx={{ alignSelf: 'flex-end' }}>
          Completed in Admissions
        </Label>
      )}
      {feeState.onboardingConfirmed &&
        !automaticallyConfirmed &&
        (compact ? (
          <Label color="success" sx={{ alignSelf: 'flex-end' }}>
            Fee structure confirmed
          </Label>
        ) : (
          <Alert severity="success">
            Fee structure confirmed: {feeState.selection?.structureName}
          </Alert>
        ))}
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
        <ShakingTextField error={Boolean(form.touched.structureId && form.errors.structureId)}>
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
              form.setStatus(undefined);
              setFieldValue('structureId', String(value));
              setFieldValue('optionalHeadIds', []);
            }}
            onBlur={() => form.setFieldTouched('structureId', true)}
            error={Boolean(form.touched.structureId && form.errors.structureId)}
            helperText={form.touched.structureId ? form.errors.structureId : undefined}
          />
        </ShakingTextField>
      )}
      {chosen && (
        <>
          {compact ? (
            <Accordion
              variant="outlined"
              disableGutters
              expanded={feeDetails.value}
              onChange={() => {
                if (!externallyDisabled && !busy) feeDetails.onToggle();
              }}
              sx={{ borderRadius: 2, boxShadow: 'none', '&::before': { display: 'none' } }}
            >
              <AccordionSummary
                id={`${disclosureId}-fee-details`}
                aria-controls={`${disclosureId}-fee-details-content`}
                expandIcon={<Iconify icon="mdi:chevron-down" width={20} />}
              >
                <Typography variant="subtitle2">Fee Details</Typography>
              </AccordionSummary>
              <AccordionDetails id={`${disclosureId}-fee-details-content`}>
                <Stack spacing={0.5}>{includedFeeHeads}</Stack>
              </AccordionDetails>
            </Accordion>
          ) : (
            <>
              <Typography variant="subtitle2">Included fee heads</Typography>
              {includedFeeHeads}
            </>
          )}
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
      {!automaticallyConfirmed && !compact && (
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
      {collectionPanel &&
        (compact ? (
          <Accordion
            variant="outlined"
            disableGutters
            expanded={paymentDetails.value}
            onChange={() => {
              if (!externallyDisabled && !busy) paymentDetails.onToggle();
            }}
            sx={{ borderRadius: 2, boxShadow: 'none', '&::before': { display: 'none' } }}
          >
            <AccordionSummary
              id={`${disclosureId}-payment-details`}
              aria-controls={`${disclosureId}-payment-details-content`}
              expandIcon={<Iconify icon="mdi:chevron-down" width={20} />}
            >
              <Typography variant="subtitle2">Payments & Receipts</Typography>
            </AccordionSummary>
            <AccordionDetails id={`${disclosureId}-payment-details-content`}>
              {collectionPanel}
            </AccordionDetails>
          </Accordion>
        ) : (
          collectionPanel
        ))}
    </Stack>
  );
}
