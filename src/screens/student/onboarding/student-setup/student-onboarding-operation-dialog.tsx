'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  usePreviewStudentOnboardingRollMutation,
  useSetStudentOnboardingPlacementMutation,
  useGetAvailableStudentIdentifierSeriesQuery,
  useGetStudentOnboardingPlacementOptionsQuery,
  useAllocateStudentOnboardingIdentifierMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import type { StudentOnboardingItem } from './student-onboarding-model';

export type StudentAssignmentType = 'division' | 'gr-number' | 'roll-number';

type StudentOnboardingOperationDialogProps = {
  assignmentType: StudentAssignmentType | null;
  student: StudentOnboardingItem | null;
  onClose: () => void;
};

type OperationFormValues = {
  divisionId: string;
  numberSeriesId: string;
  rollNumber: string;
  manualValue: string;
  overrideReason: string;
  rollAssignmentMode: '' | 'manual' | 'automatic';
};

export default function StudentOnboardingOperationDialog({
  assignmentType,
  student,
  onClose,
}: StudentOnboardingOperationDialogProps) {
  const open = Boolean(assignmentType && student);
  const isPlacement = assignmentType === 'division';
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAllocate = hasGrantedPermission(permissions, 'Students.Onboarding.Add');
  const placementQuery = useGetStudentOnboardingPlacementOptionsQuery(student?.id ?? '', {
    skip: !open || !isPlacement,
  });
  const seriesQuery = useGetAvailableStudentIdentifierSeriesQuery(student?.id ?? '', {
    skip: !open || isPlacement || !canAllocate,
  });
  const [setPlacement, placementState] = useSetStudentOnboardingPlacementMutation();
  const [allocateIdentifier, identifierState] = useAllocateStudentOnboardingIdentifierMutation();
  const [previewRoll, previewState] = usePreviewStudentOnboardingRollMutation();
  const schoolMode = student?.rollAssignmentMode ?? 'manual';
  const [preview, setPreview] = useState<{
    signature: string;
    proposedRollNumber: number;
    concurrencyStamp: string;
    rollAssignmentMode: 'manual' | 'automatic';
  } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const form = useFormik<OperationFormValues>({
    initialValues: {
      divisionId: '',
      numberSeriesId: '',
      rollNumber: '',
      manualValue: '',
      overrideReason: '',
      rollAssignmentMode: '' as '' | 'manual' | 'automatic',
    },
    validationSchema: Yup.object({
      numberSeriesId: isPlacement
        ? Yup.string()
        : Yup.string().required('Choose an identifier series.'),
      rollAssignmentMode: isPlacement
        ? Yup.string()
        : Yup.string()
            .oneOf(['manual', 'automatic'])
            .required('Choose manual or automatic numbering.'),
      rollNumber: isPlacement
        ? Yup.string()
        : Yup.string().when('rollAssignmentMode', {
            is: 'manual',
            then: (field) =>
              field
                .required('Enter a roll number.')
                .test(
                  'positive-integer',
                  'Enter a positive whole number.',
                  (value) => Number.isInteger(Number(value)) && Number(value) > 0
                ),
          }),
      overrideReason: Yup.string().max(1000),
    }),
    onSubmit: async (): Promise<void> => handleSubmit(),
  });
  const {
    divisionId,
    numberSeriesId,
    rollNumber,
    manualValue,
    overrideReason,
    rollAssignmentMode,
  } = form.values;
  const setDivisionId = (value: string) => form.setFieldValue('divisionId', value);
  const setNumberSeriesId = (value: string) => form.setFieldValue('numberSeriesId', value);
  const setRollNumber = (value: string) => form.setFieldValue('rollNumber', value);
  const setManualValue = (value: string) => form.setFieldValue('manualValue', value);
  const setOverrideReason = (value: string) => form.setFieldValue('overrideReason', value);
  const {resetForm} = form;

  useEffect(() => {
    if (!open) return;

    resetForm({
      values: {
        divisionId: student?.divisionId ?? '',
        numberSeriesId: '',
        rollNumber: student?.rollNo ? String(student.rollNo) : '',
        manualValue: '',
        overrideReason: '',
        rollAssignmentMode: schoolMode === 'both' ? '' : schoolMode,
      },
    });
    setPreview(null);
    setFailure(null);
    // Source refresh invalidates the bound preview without discarding entered details.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student?.id, resetForm]);

  const selectedPlacement = useMemo(
    () => placementQuery.data?.find((option) => option.id === divisionId),
    [divisionId, placementQuery.data]
  );
  const selectedSeries = useMemo(
    () => seriesQuery.data?.find((series) => series.id === numberSeriesId),
    [numberSeriesId, seriesQuery.data]
  );
  const parsedRollNumber = Number(rollNumber);
  const signature = JSON.stringify({
    values: form.values,
    stamp: student?.concurrencyStamp,
    schoolMode,
  });
  const currentPreview = preview?.signature === signature ? preview : null;
  const selectedModeMatchesSchool = schoolMode === 'both' || rollAssignmentMode === schoolMode;
  const canPreview =
    canAllocate &&
    Boolean(student?.divisionId) &&
    selectedModeMatchesSchool &&
    Boolean(rollAssignmentMode) &&
    (rollAssignmentMode === 'automatic' ||
      (Number.isInteger(parsedRollNumber) && parsedRollNumber > 0));
  const canSubmit = isPlacement
    ? Boolean(divisionId && selectedPlacement && !selectedPlacement.isFull)
    : Boolean(
        numberSeriesId &&
        canAllocate &&
        selectedModeMatchesSchool &&
        currentPreview &&
        Number.isInteger(currentPreview.proposedRollNumber) &&
        currentPreview.proposedRollNumber > 0 &&
        (!manualValue.trim() || overrideReason.trim())
      );
  const isSaving = placementState.isLoading || identifierState.isLoading || previewState.isLoading;

  const handlePreview = async () => {
    if (!student || !canPreview || isSaving) return;
    setFailure(null);
    try {
      const result = await previewRoll({
        id: student.id,
        rollAssignmentMode: rollAssignmentMode || undefined,
        rollNumber: rollAssignmentMode === 'manual' ? parsedRollNumber : undefined,
        reason: overrideReason.trim() || undefined,
      }).unwrap();
      if (
        result.concurrencyStamp !== student.concurrencyStamp ||
        result.schoolAssignmentMode !== schoolMode
      ) {
        setPreview(null);
        setFailure(
          'The onboarding case or school numbering rule changed. Close this dialog, refresh the case, and review again.'
        );
        return;
      }
      setPreview({ ...result, signature });
    } catch {
      setPreview(null);
      setFailure(
        'The roll number preview could not be prepared. Check the reserved division and numbering rules, then retry.'
      );
    }
  };

  const handleSubmit = async () => {
    if (!student || !assignmentType || !canSubmit) return;
    setFailure(null);
    try {
      if (isPlacement) {
        await setPlacement({
          id: student.id,
          concurrencyStamp: student.concurrencyStamp,
          divisionId,
          reason: overrideReason.trim() || undefined,
        }).unwrap();
        shikshaMitraToast.success({
          message: `Division reserved for ${student.studentName}.`,
        });
      } else if (currentPreview) {
        await allocateIdentifier({
          id: student.id,
          concurrencyStamp: student.concurrencyStamp,
          numberSeriesId,
          rollNumber: currentPreview.proposedRollNumber,
          rollAssignmentMode: currentPreview.rollAssignmentMode,
          manualValue: manualValue.trim() || undefined,
          overrideReason: overrideReason.trim() || undefined,
        }).unwrap();
        shikshaMitraToast.success({
          message: `Identifiers prepared for ${student.studentName}.`,
        });
      }
      onClose();
    } catch (error) {
      if (!isPlacement) {
        setPreview(null);
        setFailure(
          'Identifiers could not be prepared. Refresh the case and review the series and roll number before retrying. Your entered details remain available.'
        );
      }
      if (
        (error as { data?: { error?: { code?: string } } })?.data?.error?.code ===
        'Students:Records:RollProposalChanged'
      ) {
        setPreview(null);
        setFailure('The proposed roll number changed. Preview again before preparing identifiers.');
      }
      shikshaMitraToast.error({
        message: isPlacement
          ? 'Division placement could not be reserved. Refresh the case and check live capacity.'
          : 'Identifiers could not be prepared. Refresh the case and verify the series and roll number.',
      });
    }
  };

  return (
    <CustomDialog
      open={open}
      handleClose={() => {
        if (!isSaving) onClose();
      }}
      title={isPlacement ? 'Assign division' : 'Prepare identifiers'}
      maxWidth="sm"
      fullWidth
      hasUnsavedChanges={form.dirty}
      disableClose={isSaving}
    >
      <DialogScrollContent dividers onSubmit={() => form.submitForm()}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">{student?.studentName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {student?.applicationNumber} · {student?.standardName}
            </Typography>
          </Box>
          {failure && <Alert severity="error">{failure}</Alert>}

          {isPlacement ? (
            <>
              <Alert severity="info" variant="outlined">
                Available seats are calculated from active enrollments and live reservations. Saving
                reserves the selected seat until activation.
              </Alert>
              <CustomSelect
                fullWidth
                size="small"
                label="Division"
                value={divisionId}
                onChange={(value) => setDivisionId(String(value))}
                options={(placementQuery.data ?? []).map((option) => ({
                  value: option.id,
                  label: `${option.name} · ${option.availableSeats} available`,
                }))}
                disabledValues={(placementQuery.data ?? [])
                  .filter((option) => option.isFull)
                  .map((option) => option.id)}
                disabledLabel="Full"
                disabled={placementQuery.isFetching || isSaving}
                helperText={
                  selectedPlacement
                    ? `${selectedPlacement.availableSeats} of ${selectedPlacement.capacity} seats available`
                    : 'Select a division with live capacity.'
                }
              />
              {student?.divisionId && divisionId !== student.divisionId && (
                <TextField
                  fullWidth
                  size="small"
                  label="Placement change reason"
                  value={overrideReason}
                  disabled={isSaving}
                  onChange={(event) => setOverrideReason(event.target.value)}
                  inputProps={{ maxLength: 1000 }}
                  helperText="Required when the saved placement rule requires a reason. Approval may also be required."
                />
              )}
              {placementQuery.isError ? (
                <Alert severity="error">Division capacity could not be loaded.</Alert>
              ) : null}
            </>
          ) : (
            <>
              <Alert severity="info" variant="outlined">
                The selected series reserves the next GR number together with the roll number. Both
                values are committed only when onboarding is activated.
              </Alert>
              {!student?.divisionId && (
                <Alert severity="info">
                  Reserve a division before previewing and preparing identifiers.
                </Alert>
              )}
              <CustomSelect
                fullWidth
                size="small"
                label="Identifier series"
                required
                value={numberSeriesId}
                onChange={(value) => setNumberSeriesId(String(value))}
                options={(seriesQuery.data ?? []).map((series) => ({
                  value: series.id,
                  label: `${series.name} · ${series.nextPreview}`,
                }))}
                disabled={seriesQuery.isFetching || isSaving || !canAllocate}
                helperText={
                  selectedSeries
                    ? `Next value: ${selectedSeries.nextPreview}`
                    : form.touched.numberSeriesId && form.errors.numberSeriesId
                      ? form.errors.numberSeriesId
                      : 'Select an active series for this academic context.'
                }
                error={Boolean(form.touched.numberSeriesId && form.errors.numberSeriesId)}
              />
              {!canAllocate && (
                <Alert severity="info">
                  Your role can view this case. Preparing identifiers requires the onboarding
                  identifier permission.
                </Alert>
              )}
              <Typography variant="body2">
                School roll numbering:{' '}
                {schoolMode === 'both'
                  ? 'Manual or automatic'
                  : schoolMode === 'automatic'
                    ? 'Automatic'
                    : 'Manual'}
                .
              </Typography>
              {!selectedModeMatchesSchool && (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      disabled={isSaving || !canAllocate}
                      onClick={() => {
                        form.setFieldValue('rollAssignmentMode', schoolMode);
                        setRollNumber('');
                      }}
                    >
                      Use school numbering
                    </Button>
                  }
                >
                  School numbering changed. Review the assignment choice before previewing.
                </Alert>
              )}
              {schoolMode === 'both' && (
                <CustomSelect
                  fullWidth
                  size="small"
                  required
                  label="Roll number assignment"
                  value={rollAssignmentMode}
                  options={[
                    { value: 'manual', label: 'Manual — enter a roll number' },
                    { value: 'automatic', label: 'Automatic — use school numbering' },
                  ]}
                  disabled={isSaving || !canAllocate}
                  onChange={(value) => {
                    form.setFieldValue('rollAssignmentMode', value);
                    setRollNumber('');
                  }}
                  error={Boolean(form.touched.rollAssignmentMode && form.errors.rollAssignmentMode)}
                  helperText={
                    form.touched.rollAssignmentMode ? form.errors.rollAssignmentMode : undefined
                  }
                />
              )}
              {rollAssignmentMode === 'automatic' ? (
                <TextField
                  fullWidth
                  size="small"
                  label="Proposed roll number"
                  value={currentPreview?.proposedRollNumber ?? ''}
                  slotProps={{ input: { readOnly: true } }}
                  helperText="Preview to review the number reserved by school numbering. It is checked again before saving."
                />
              ) : rollAssignmentMode === 'manual' ? (
                <NumericFormatCustom
                  fullWidth
                  required
                  size="small"
                  prefix=""
                  thousandSeparator={false}
                  decimalScale={0}
                  label="Roll number"
                  disabled={isSaving || !canAllocate}
                  value={rollNumber}
                  onValueChange={(values) => setRollNumber(values.value)}
                  inputProps={{ min: 1 }}
                  error={Boolean(form.touched.rollNumber && form.errors.rollNumber)}
                  helperText={form.touched.rollNumber ? form.errors.rollNumber : undefined}
                />
              ) : (
                <Typography variant="body2">
                  Choose manual or automatic numbering before previewing.
                </Typography>
              )}
              <Button
                variant="outlined"
                disabled={!canPreview || isSaving || seriesQuery.isError}
                loading={previewState.isLoading}
                onClick={handlePreview}
              >
                Preview roll number
              </Button>
              {preview && !currentPreview && (
                <Alert severity="info">
                  The identifier details changed. Preview again before saving.
                </Alert>
              )}
              <TextField
                fullWidth
                size="small"
                label="Manual identifier override"
                disabled={isSaving || !canAllocate}
                value={manualValue}
                onChange={(event) => setManualValue(event.target.value)}
                helperText="Optional. Leave blank to use the series preview. Backend permission and audit rules still apply."
              />
              {manualValue.trim() || student?.rollNo ? (
                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={2}
                  size="small"
                  label="Override reason"
                  disabled={isSaving || !canAllocate}
                  value={overrideReason}
                  onChange={(event) => setOverrideReason(event.target.value)}
                  helperText="Required for the identifier allocation audit history."
                  inputProps={{ maxLength: 1000 }}
                />
              ) : null}
              {seriesQuery.isError ? (
                <Alert severity="error">Identifier series could not be loaded.</Alert>
              ) : null}
            </>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button
          size="small"
          color="inherit"
          disabled={isSaving}
          onClick={() => {
            if (
              !form.dirty ||
              window.confirm('Discard the entered identifier or placement details?')
            )
              onClose();
          }}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<Iconify icon={isPlacement ? 'mdi:seat' : 'mdi:identifier'} width={18} />}
          disabled={!canSubmit || isSaving}
          onClick={() => form.submitForm()}
        >
          {isSaving ? 'Saving...' : isPlacement ? 'Reserve division' : 'Prepare identifiers'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
