import type { RootState } from 'src/redux/store';
import type { AdmissionFeeSelection } from 'src/redux/student/admissions/admission-fee-selection-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { EmptyContent } from 'src/components/empty-content';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import {
  Box,
  Alert,
  Stack,
  Button,
  Skeleton,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  useSaveAdmissionFeeSelectionMutation,
  useGetAdmissionFeeSelectionCandidatesQuery,
} from 'src/redux/student/admissions/admission-fee-selection-api';

import { useAdmissionUnsavedChanges } from '../use-admission-unsaved-changes';
import {
  AdmissionFeeHeads,
  AdmissionFeeSelectionSummary,
  formatAdmissionFeeHeadAmount,
} from './admission-fee-selection-summary';

export type AdmissionFeeSelectionEditorState = { dirty: boolean; busy: boolean };
type Props = {
  state: AdmissionFeeSelection;
  disabled?: boolean;
  onClose: () => void;
  onEditorStateChange?: (state: AdmissionFeeSelectionEditorState) => void;
  compact?: boolean;
};

export function AdmissionFeeSelectionEditor({
  state,
  disabled = false,
  onClose,
  onEditorStateChange,
  compact = false,
}: Props) {
  const permissions = useSelector((value: RootState) => value.auth.permissions);
  const canOpenFinance = hasGrantedPermission(
    permissions,
    financePermissions.fees.settings.feeStructureActions.view
  );
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
        shikshaMitraToast.success({ message: 'Fee structure confirmed with the application.' });
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
  const { setFieldValue } = formik;
  const currentStructureId = formik.values.structureId;
  useEffect(() => {
    if (!currentStructureId && candidates.currentData?.length === 1) {
      setFieldValue('structureId', candidates.currentData[0].structureId);
    }
  }, [candidates.currentData, currentStructureId, setFieldValue]);
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
  const noCandidates =
    !candidates.isError && !candidates.isLoading && candidates.currentData?.length === 0;

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{ position: 'relative' }}
      aria-busy={busy}
    >
      <Stack spacing={compact ? 1 : 1.5}>
        {candidates.isLoading && <Skeleton height={80} />}
        {!candidates.isLoading && candidates.isFetching && (
          <LinearProgress aria-label="Checking published fee structures" />
        )}
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
          <EmptyContent
            title={
              <Typography component="span" variant="subtitle1" color="text.primary">
                No matching fee structure
              </Typography>
            }
            description="A published fee structure is not available for this application's academic year and class. Ask Finance to publish the matching structure, then check again."
            sx={{ py: 3, height: 'auto', border: 1, borderColor: 'divider', borderRadius: 1.5 }}
            slotProps={{
              img: { maxWidth: 64 },
              description: { maxWidth: 600, color: 'text.secondary', typography: 'body2' },
            }}
            action={
              <Stack spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  justifyContent="center"
                >
                  {canOpenFinance && (
                    <Button
                      size="small"
                      variant="outlined"
                      component={RouterLink}
                      href={financePaths.fees.settings.feeStructure}
                      target="_blank"
                      rel="noopener noreferrer"
                      disabled={busy || disabled}
                      startIcon={<Iconify icon="mdi:open-in-new" width={16} />}
                    >
                      Open Finance
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="contained"
                    disabled={busy || disabled || candidates.isFetching}
                    onClick={() => candidates.refetch()}
                    startIcon={<Iconify icon="mdi:refresh" width={16} />}
                  >
                    {candidates.isFetching ? 'Checking…' : 'Check again'}
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {state.isRequired
                    ? 'Admission can continue after a matching structure is confirmed.'
                    : 'Fee structure selection is optional for this application.'}
                </Typography>
              </Stack>
            }
          />
        )}
        {!candidates.isError && !candidates.isLoading && !noCandidates && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.2fr) minmax(0, 1fr)' },
              gap: 1.5,
            }}
          >
            <Stack
              spacing={1.5}
              sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5, minWidth: 0 }}
            >
              <Typography variant="subtitle2">Select fee structure</Typography>
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
                  {chosen.heads.some((head) => !head.isOptional) ? (
                    <AdmissionFeeHeads
                      label="Mandatory fee heads"
                      heads={chosen.heads.filter((head) => !head.isOptional)}
                      currency={state.currency}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      This structure has no mandatory fee heads.
                    </Typography>
                  )}
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
                          label: `${head.feeHeadName} · ${formatAdmissionFeeHeadAmount(head, state.currency)}`,
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
                    Mandatory heads are included automatically. This saves the selection; it does
                    not assign Finance dues or collect payment.
                  </Typography>
                </>
              )}
            </Stack>
            {chosen ? (
              <AdmissionFeeSelectionSummary
                structureName={chosen.structureName}
                revisionNumber={chosen.revisionNumber}
                currency={state.currency}
                heads={chosen.heads.filter(
                  (head) =>
                    !head.isOptional || formik.values.optionalHeadIds.includes(head.feeHeadId)
                )}
              />
            ) : (
              <Stack
                sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
                spacing={1}
              >
                <Typography variant="subtitle2">Selection summary</Typography>
                <Typography variant="body2" color="text.secondary">
                  Select a published fee structure to review its fee heads.
                </Typography>
              </Stack>
            )}
          </Box>
        )}
        {saveError && <Alert severity="error">{saveError}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            disabled={busy}
            onClick={() => (formik.dirty ? setDiscard(true) : onClose())}
          >
            Cancel
          </Button>
          {!noCandidates && (
            <Button
              size="small"
              type="submit"
              variant="contained"
              startIcon={<Iconify icon="mdi:check" width={16} />}
              disabled={
                disabled ||
                busy ||
                candidates.isFetching ||
                candidates.isError ||
                !candidates.currentData?.length
              }
            >
              {busy ? 'Saving…' : 'Confirm fee structure'}
            </Button>
          )}
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
