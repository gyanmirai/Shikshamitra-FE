import type { AdmissionFeeSelection } from 'src/redux/student/admissions/admission-fee-selection-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { fNumber, fCurrency } from 'src/utils/format-number';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Alert, Stack, Button, Skeleton, Typography, CircularProgress } from '@mui/material';
import {
  useSaveAdmissionFeeSelectionMutation,
  useGetAdmissionFeeSelectionCandidatesQuery,
} from 'src/redux/student/admissions/admission-fee-selection-api';

import { useAdmissionUnsavedChanges } from '../use-admission-unsaved-changes';

export type AdmissionFeeSelectionEditorState = { dirty: boolean; busy: boolean };
type Props = {
  state: AdmissionFeeSelection;
  disabled?: boolean;
  onClose: () => void;
  onEditorStateChange?: (state: AdmissionFeeSelectionEditorState) => void;
};

export function AdmissionFeeSelectionEditor({
  state,
  disabled = false,
  onClose,
  onEditorStateChange,
}: Props) {
  const candidates = useGetAdmissionFeeSelectionCandidatesQuery(state.applicationId, {
    refetchOnMountOrArgChange: true,
  });
  const [save, saving] = useSaveAdmissionFeeSelectionMutation();
  const [saveError, setSaveError] = useState<string>();
  const [discard, setDiscard] = useState(false);
  const formik = useFormik({
    initialValues: {
      structureId: state.selection?.structureId ?? '',
      optionalHeadIds:
        state.selection?.heads.filter((head) => head.isOptional).map((head) => head.feeHeadId) ??
        [],
      concurrencyStamp: state.concurrencyStamp,
    },
    validationSchema: Yup.object({
      structureId: Yup.string().required('Select a fee structure.'),
      optionalHeadIds: Yup.array()
        .of(Yup.string().required())
        .max(100, 'Select up to 100 optional fee heads.'),
    }),
    onSubmit: async (values) => {
      if (disabled) return;
      setSaveError(undefined);
      if (!candidates.currentData?.some((item) => item.structureId === values.structureId)) {
        setSaveError(
          'The selected structure is no longer available. Choose a published structure from the current list.'
        );
        return;
      }
      const structure = candidates.currentData.find(
        (item) => item.structureId === values.structureId
      )!;
      if (
        !structure.heads.some(
          (head) => !head.isOptional || values.optionalHeadIds.includes(head.feeHeadId)
        )
      ) {
        formik.setFieldError(
          'optionalHeadIds',
          'Select at least one optional fee head. This structure has no mandatory heads.'
        );
        return;
      }
      try {
        await save({ applicationId: state.applicationId, ...values }).unwrap();
        shikshaMitraToast.success({ message: 'Fee structure saved with the application.' });
        onClose();
      } catch (error) {
        setSaveError(
          parseApiProblemDetail(error).detail ||
            'The selection could not be saved. Reload and try again.'
        );
      }
    },
  });
  useAdmissionUnsavedChanges(true, formik.dirty);
  const chosen = candidates.currentData?.find(
    (item) => item.structureId === formik.values.structureId
  );
  const busy = saving.isLoading || formik.isSubmitting;
  useEffect(() => {
    onEditorStateChange?.({ dirty: formik.dirty, busy });
  }, [formik.dirty, busy, onEditorStateChange]);
  useEffect(
    () => () => {
      onEditorStateChange?.({ dirty: false, busy: false });
    },
    [onEditorStateChange]
  );
  const noCandidates = candidates.currentData?.length === 0;

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{ position: 'relative' }}
      aria-busy={busy}
    >
      <Stack spacing={1.5}>
        {candidates.isLoading && <Skeleton height={80} />}
        {candidates.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" disabled={busy} onClick={() => candidates.refetch()}>
                Retry
              </Button>
            }
          >
            Published fee structures could not be loaded.
          </Alert>
        )}
        {noCandidates && (
          <Alert severity="info">
            No published fee structure matches this application&apos;s academic year and class. Ask
            Finance to publish the matching structure.
          </Alert>
        )}
        {!candidates.isError && !candidates.isLoading && !noCandidates && (
          <>
            <CustomSelect
              label="Fee structure *"
              isSearch
              value={formik.values.structureId}
              disabled={disabled || busy || candidates.isFetching}
              options={(candidates.currentData ?? []).map((item) => ({
                value: item.structureId,
                label: `${item.structureName} · Revision ${item.revisionNumber}`,
              }))}
              onChange={(value) => {
                formik.setFieldValue('structureId', String(value));
                formik.setFieldValue('optionalHeadIds', []);
              }}
              error={Boolean(formik.touched.structureId && formik.errors.structureId)}
              helperText={
                formik.touched.structureId
                  ? formik.errors.structureId
                  : 'Published structures matching the application year and class.'
              }
            />
            {chosen && (
              <>
                <Typography variant="subtitle2">Mandatory fee heads</Typography>
                {chosen.heads
                  .filter((head) => !head.isOptional)
                  .map((head) => (
                    <Typography key={head.feeHeadId} variant="body2">
                      {head.feeHeadName} ·{' '}
                      {state.currency
                        ? fCurrency(head.configuredAmount, { currency: state.currency })
                        : fNumber(head.configuredAmount)}
                    </Typography>
                  ))}
                {chosen.heads.some((head) => head.isOptional) && (
                  <CustomSelect
                    label="Optional fee heads"
                    multiple
                    isSearch
                    value={formik.values.optionalHeadIds}
                    disabled={disabled || busy || candidates.isFetching}
                    options={chosen.heads
                      .filter((head) => head.isOptional)
                      .map((head) => ({
                        value: head.feeHeadId,
                        label: `${head.feeHeadName} · ${state.currency ? fCurrency(head.configuredAmount, { currency: state.currency }) : fNumber(head.configuredAmount)}`,
                      }))}
                    onChange={(value) => formik.setFieldValue('optionalHeadIds', value)}
                    error={Boolean(formik.errors.optionalHeadIds)}
                    helperText={
                      typeof formik.errors.optionalHeadIds === 'string'
                        ? formik.errors.optionalHeadIds
                        : undefined
                    }
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  Mandatory heads are included automatically. This saves the selection; it does not
                  assign Finance dues or collect payment.
                </Typography>
              </>
            )}
          </>
        )}
        {saveError && <Alert severity="error">{saveError}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            color="inherit"
            disabled={busy}
            onClick={() => (formik.dirty ? setDiscard(true) : onClose())}
          >
            Cancel
          </Button>
          <Button
            size="small"
            type="submit"
            variant="contained"
            disabled={
              disabled ||
              busy ||
              candidates.isFetching ||
              candidates.isError ||
              !candidates.currentData?.length
            }
          >
            {busy ? 'Saving…' : 'Save fee structure'}
          </Button>
        </Stack>
      </Stack>
      <ConfirmDialog
        open={discard}
        onClose={() => setDiscard(false)}
        title="Discard unsaved changes?"
        icon="warning"
        content="Your saved fee selection remains available. Unsaved changes will be discarded."
        action={
          <Button size="small" color="error" variant="contained" disabled={busy} onClick={onClose}>
            Discard changes
          </Button>
        }
      />
      {busy && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'action.disabledBackground',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1,
          }}
          role="status"
          aria-label="Saving fee structure"
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
}
