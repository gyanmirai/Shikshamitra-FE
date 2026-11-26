import type { AdmissionFeeSelection } from 'src/redux/student/admissions/admission-fee-selection-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { createPortal } from 'react-dom';
import { Iconify } from 'src/components/iconify';
import { useId, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { EmptyContent } from 'src/components/empty-content';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Stack, Button, Skeleton, Typography } from '@mui/material';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import {
  FeeStructureSelect,
  FeeHeadSelectionRow,
  FeeHeadSelectionGroup,
  FeeHeadSelectionAmount,
} from 'src/components/fee-structure-selection';
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
  actionsElement?: HTMLElement | null;
};

export function AdmissionFeeSelectionEditor({
  state,
  disabled = false,
  onClose,
  onEditorStateChange,
  compact = false,
  actionsElement,
}: Props) {
  const formId = useId();
  const candidates = useGetAdmissionFeeSelectionCandidatesQuery(state.applicationId, {
    refetchOnMountOrArgChange: true,
  });
  const [save, saving] = useSaveAdmissionFeeSelectionMutation();
  const [saveError, setSaveError] = useState<string>();
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
  const { resetForm, dirty } = formik;
  const currentStructureId = formik.values.structureId;
  useEffect(() => {
    if (!currentStructureId && !dirty && candidates.currentData?.length === 1) {
      resetForm({
        values: { ...formik.initialValues, structureId: candidates.currentData[0].structureId },
      });
    }
  }, [candidates.currentData, currentStructureId, dirty, resetForm, formik.initialValues]);
  const chosen = candidates.currentData?.find(
    (item) => item.structureId === formik.values.structureId
  );
  const busy = saving.isLoading || formik.isSubmitting;
  const closeGuard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    guardContextChanges: true,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { busy }),
  });
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
    !candidates.isError &&
    !candidates.isLoading &&
    !candidates.isFetching &&
    candidates.currentData?.length === 0;
  const loadingCandidates = candidates.isLoading || candidates.isFetching;
  const fieldsDisabled = disabled || busy || candidates.isFetching;
  const structureOptions = (candidates.currentData ?? []).map((item) => ({
    value: item.structureId,
    label: `${item.structureName} · Revision ${item.revisionNumber}`,
  }));
  const changeStructure = (value: string | number) => {
    formik.setFieldValue('structureId', String(value));
    formik.setFieldValue('optionalHeadIds', []);
  };
  const structureError = formik.touched.structureId ? formik.errors.structureId : undefined;
  const optionalError =
    typeof formik.errors.optionalHeadIds === 'string' ? formik.errors.optionalHeadIds : undefined;
  const mandatoryHeads = chosen?.heads.filter((head) => !head.isOptional) ?? [];
  const optionalHeads = chosen?.heads.filter((head) => head.isOptional) ?? [];
  const selectedOptionalIds = formik.values.optionalHeadIds;

  const renderActions = (actions: React.ReactNode) =>
    actionsElement ? createPortal(actions, actionsElement) : actions;

  return (
    <Box
      component="form"
      id={formId}
      noValidate
      onSubmit={formik.handleSubmit}
      sx={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}
      aria-busy={busy || candidates.isFetching}
    >
      <FormBusyRegion busy={busy} label="Saving Fee Structure" fillContent>
        <Stack spacing={compact ? 1 : 1.5} useFlexGap sx={{ flex: 1 }}>
          {loadingCandidates && (
            <Stack
              role="status"
              aria-label="Loading Published Fee Structures"
              aria-busy
              spacing={1.5}
            >
              <Skeleton variant="text" width={160} height={24} />
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="text" width={180} height={24} />
              {[0, 1, 2].map((row) => (
                <Stack key={row} direction="row" justifyContent="space-between" spacing={2}>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="20%" height={32} />
                </Stack>
              ))}
            </Stack>
          )}
          {candidates.isError && (
            <StudentFeedback
              notificationKey="STU-0342"
              presentation="toast"
              severity="error"
              toastAction={
                <Button size="small" disabled={busy} onClick={() => candidates.refetch()}>
                  Retry
                </Button>
              }
            >
              Published fee structures could not be loaded.
            </StudentFeedback>
          )}
          {noCandidates && (
            <EmptyContent
              title={
                <Stack component="span" spacing={1.5} alignItems="center">
                  <Iconify
                    icon="mdi:file-search-outline"
                    width={32}
                    sx={{ color: 'text.disabled' }}
                  />
                  <Typography component="span" variant="subtitle2" color="text.primary">
                    No Matching Fee Structure
                  </Typography>
                </Stack>
              }
              description="No published structure for this class and academic year."
              sx={{ py: 3, height: 'auto', flex: 1, minWidth: 0 }}
              slotProps={{
                img: { display: 'none' },
                description: { maxWidth: 600, color: 'text.secondary', typography: 'body2' },
              }}
            />
          )}
          {!candidates.isError && !candidates.isLoading && !noCandidates && (
            <Box
              sx={{
                display: loadingCandidates ? 'none' : 'grid',
                gridTemplateColumns: compact
                  ? 'minmax(0, 1fr)'
                  : { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.2fr) minmax(0, 1fr)' },
                gap: 1.5,
              }}
            >
              <Stack
                spacing={1.5}
                sx={{
                  p: compact ? 0 : 2,
                  border: compact ? 0 : 1,
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  minWidth: 0,
                }}
              >
                {!compact && <Typography variant="subtitle2">Select Fee Structure</Typography>}
                <FeeStructureSelect
                  label={compact ? undefined : 'Fee Structure *'}
                  required={compact}
                  value={formik.values.structureId}
                  disabled={fieldsDisabled}
                  options={structureOptions}
                  onChange={changeStructure}
                  error={Boolean(structureError)}
                  helperText={
                    structureError ||
                    (compact
                      ? undefined
                      : 'Published structures matching the application year and class.')
                  }
                />
                {compact && chosen && (
                  <>
                    <FeeHeadSelectionGroup>
                      {mandatoryHeads.length ? (
                        mandatoryHeads.map((head) => (
                          <FeeHeadSelectionRow
                            key={head.feeHeadId}
                            name={head.feeHeadName}
                            amount={
                              <FeeHeadSelectionAmount deferred={head.isVariable}>
                                {formatAdmissionFeeHeadAmount(head, state.currency)}
                              </FeeHeadSelectionAmount>
                            }
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          This structure has no mandatory fee heads.
                        </Typography>
                      )}
                    </FeeHeadSelectionGroup>
                    {optionalHeads.length > 0 && (
                      <FeeHeadSelectionGroup optional error={optionalError}>
                        {optionalHeads.map((head) => (
                          <FeeHeadSelectionRow
                            key={head.feeHeadId}
                            name={head.feeHeadName}
                            selection={{
                              checked: selectedOptionalIds.includes(head.feeHeadId),
                              disabled: fieldsDisabled,
                              onChange: (checked) =>
                                formik.setFieldValue(
                                  'optionalHeadIds',
                                  checked
                                    ? [...selectedOptionalIds, head.feeHeadId]
                                    : selectedOptionalIds.filter((id) => id !== head.feeHeadId)
                                ),
                            }}
                            amount={
                              <FeeHeadSelectionAmount deferred={head.isVariable}>
                                {formatAdmissionFeeHeadAmount(head, state.currency)}
                              </FeeHeadSelectionAmount>
                            }
                          />
                        ))}
                      </FeeHeadSelectionGroup>
                    )}
                  </>
                )}
                {!compact && chosen && (
                  <>
                    <Typography variant="subtitle2">Mandatory Fee Heads</Typography>
                    {mandatoryHeads.length > 0 ? (
                      <AdmissionFeeHeads
                        label="Mandatory Fee Heads"
                        heads={mandatoryHeads}
                        currency={state.currency}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        This structure has no mandatory fee heads.
                      </Typography>
                    )}
                    {optionalHeads.length > 0 && (
                      <CustomSelect
                        label="Optional Fee Heads"
                        multiple
                        isSearch
                        value={formik.values.optionalHeadIds}
                        disabled={fieldsDisabled}
                        options={optionalHeads.map((head) => ({
                          value: head.feeHeadId,
                          label: `${head.feeHeadName} · ${formatAdmissionFeeHeadAmount(head, state.currency)}`,
                        }))}
                        onChange={(value) => formik.setFieldValue('optionalHeadIds', value)}
                        error={Boolean(formik.errors.optionalHeadIds)}
                        helperText={optionalError}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Mandatory heads are included automatically. This saves the selection; it does
                      not assign Finance dues or collect payment.
                    </Typography>
                  </>
                )}
              </Stack>
              <AdmissionFeeSelectionSummary
                selection={
                  chosen && {
                    structureName: chosen.structureName,
                    revisionNumber: chosen.revisionNumber,
                    currency: state.currency,
                    heads: chosen.heads.filter(
                      (head) =>
                        !head.isOptional || formik.values.optionalHeadIds.includes(head.feeHeadId)
                    ),
                  }
                }
              />
            </Box>
          )}
          {saveError && (
            <StudentFeedback notificationKey="STU-0344" presentation="persistent" severity="error">
              {saveError}
            </StudentFeedback>
          )}
          {renderActions(
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              justifyContent="flex-end"
              sx={actionsElement ? undefined : { mt: 'auto', pt: 1.5 }}
            >
              <Button
                size="small"
                color="inherit"
                variant="outlined"
                startIcon={<Iconify icon="mdi:close" width={16} />}
                disabled={busy}
                onClick={() => closeGuard.requestNavigation(onClose)}
              >
                Cancel
              </Button>
              {noCandidates ? (
                <Button
                  size="small"
                  variant="contained"
                  disabled={busy || disabled || candidates.isFetching}
                  onClick={() => candidates.refetch()}
                  startIcon={<Iconify icon="mdi:refresh" width={16} />}
                >
                  {candidates.isFetching ? 'Checking…' : 'Check Again'}
                </Button>
              ) : (
                <Button
                  size="small"
                  type="submit"
                  form={formId}
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
                  {busy ? 'Saving…' : 'Confirm Fee Structure'}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </FormBusyRegion>
      {closeGuard.confirmation}
    </Box>
  );
}
