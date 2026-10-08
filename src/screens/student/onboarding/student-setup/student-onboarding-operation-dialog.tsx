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
import {
  Box,
  Alert,
  Paper,
  Radio,
  Stack,
  Button,
  TextField,
  Typography,
  RadioGroup,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
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
  const [overrideOpen, setOverrideOpen] = useState(false);
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
      manualValue: Yup.string(),
      overrideReason: Yup.string()
        .max(1000)
        .when('manualValue', ([manual], schema) =>
          isPlacement || (!student?.rollNo && !String(manual ?? '').trim())
            ? schema
            : schema.trim().required('Enter an override reason.')
        ),
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
  const { resetForm } = form;

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
    setOverrideOpen(false);
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
  const requiresOverrideReason = Boolean(manualValue.trim() || student?.rollNo);
  const hasNumberingChoice = Boolean(numberSeriesId && rollAssignmentMode);
  const showOverrideFields =
    hasNumberingChoice &&
    (overrideOpen || Boolean(student?.rollNo || manualValue.trim() || overrideReason.trim()));
  const canPreview =
    canAllocate &&
    Boolean(student?.divisionId) &&
    Boolean(selectedSeries) &&
    !seriesQuery.isFetching &&
    !seriesQuery.isError &&
    selectedModeMatchesSchool &&
    Boolean(rollAssignmentMode) &&
    (!requiresOverrideReason || Boolean(overrideReason.trim())) &&
    (rollAssignmentMode === 'automatic' ||
      (Number.isInteger(parsedRollNumber) && parsedRollNumber > 0));
  const canSubmit = isPlacement
    ? Boolean(
        divisionId &&
        selectedPlacement &&
        !selectedPlacement.isFull &&
        !placementQuery.isFetching &&
        !placementQuery.isError
      )
    : Boolean(
        selectedSeries &&
        canAllocate &&
        !seriesQuery.isFetching &&
        !seriesQuery.isError &&
        selectedModeMatchesSchool &&
        currentPreview &&
        Number.isInteger(currentPreview.proposedRollNumber) &&
        currentPreview.proposedRollNumber > 0 &&
        (!requiresOverrideReason || overrideReason.trim())
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
      if (isPlacement) {
        setFailure('The division could not be reserved. Check the live seat count and try again.');
      } else {
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
      title={isPlacement ? 'Assign Division' : 'Prepare Identifiers'}
      maxWidth={isPlacement ? 'xs' : 'sm'}
      fullWidth
      hasUnsavedChanges={form.dirty}
      disableClose={isSaving}
    >
      <DialogScrollContent dividers>
        <Stack spacing={1.75}>
          <Box sx={isPlacement ? undefined : { pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2">{student?.studentName}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {student?.applicationNumber} · {student?.standardName}
            </Typography>
          </Box>
          {failure && <Alert severity="error">{failure}</Alert>}

          {isPlacement ? (
            <>
              <Stack spacing={1}>
                <CustomSelect
                  fullWidth
                  size="small"
                  label="Division"
                  required
                  value={divisionId}
                  onChange={(value) => {
                    setFailure(null);
                    setDivisionId(String(value));
                  }}
                  renderValue={(selected) => selectedPlacement?.name ?? String(selected)}
                  options={(placementQuery.data ?? []).map((option) => ({
                    value: option.id,
                    label: `${option.name} · ${option.availableSeats} of ${option.capacity} seats available`,
                  }))}
                  disabledValues={(placementQuery.data ?? [])
                    .filter((option) => option.isFull)
                    .map((option) => option.id)}
                  disabledLabel="Full"
                  disabled={
                    placementQuery.isFetching ||
                    placementQuery.isError ||
                    !placementQuery.data?.length ||
                    isSaving
                  }
                />
                {selectedPlacement && (
                  <Stack direction="row" justifyContent="space-between" aria-live="polite">
                    <Typography variant="caption" color="text.secondary">
                      Available seats
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color={selectedPlacement.isFull ? 'error.main' : 'text.primary'}
                    >
                      {selectedPlacement.availableSeats} of {selectedPlacement.capacity}
                    </Typography>
                  </Stack>
                )}
              </Stack>
              {student?.divisionId && divisionId !== student.divisionId && (
                <TextField
                  fullWidth
                  size="small"
                  label="Placement change reason"
                  value={overrideReason}
                  disabled={isSaving}
                  onChange={(event) => setOverrideReason(event.target.value)}
                  inputProps={{ maxLength: 1000 }}
                />
              )}
              {placementQuery.isError ? (
                <Alert severity="error">
                  Division capacity could not be loaded. Close this dialog and try again.
                </Alert>
              ) : !placementQuery.isFetching && !placementQuery.data?.length ? (
                <Alert severity="info">No divisions are available for this student.</Alert>
              ) : null}
            </>
          ) : (
            <>
              {!student?.divisionId && (
                <Alert severity="warning">
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
                disabled={seriesQuery.isFetching || seriesQuery.isError || isSaving || !canAllocate}
                helperText={form.touched.numberSeriesId ? form.errors.numberSeriesId : undefined}
                error={Boolean(form.touched.numberSeriesId && form.errors.numberSeriesId)}
              />
              {!canAllocate && (
                <Alert severity="info">
                  Your role can view this case. Preparing identifiers requires the onboarding
                  identifier permission.
                </Alert>
              )}
              {seriesQuery.isError ? (
                <Alert severity="error">
                  Identifier series could not be loaded. Close this dialog and try again.
                </Alert>
              ) : !seriesQuery.isFetching && !seriesQuery.data?.length ? (
                <Alert severity="info">No identifier series are available for this student.</Alert>
              ) : null}
              <Stack spacing={1.25} sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2">
                    Numbering method
                    {schoolMode === 'both' && (
                      <Box component="span" color="error.main">
                        {' '}
                        *
                      </Box>
                    )}
                  </Typography>
                  {schoolMode !== 'both' && (
                    <Typography variant="body2" fontWeight={600}>
                      {schoolMode === 'automatic' ? 'Automatic' : 'Manual'}
                    </Typography>
                  )}
                </Stack>
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
                  <RadioGroup
                    aria-label="Roll number assignment"
                    aria-required="true"
                    value={rollAssignmentMode}
                    onChange={(_, value) => {
                      form.setFieldValue('rollAssignmentMode', value);
                      setRollNumber('');
                    }}
                    sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}
                  >
                    {[
                      { value: 'manual', title: 'Manual' },
                      { value: 'automatic', title: 'Automatic' },
                    ].map((mode) => (
                      <FormControlLabel
                        key={mode.value}
                        value={mode.value}
                        disabled={isSaving || !canAllocate}
                        control={<Radio size="small" />}
                        label={
                          <Typography variant="body2" fontWeight={600}>
                            {mode.title}
                          </Typography>
                        }
                        sx={{
                          m: 0,
                          px: 1.25,
                          py: 0.5,
                          flex: 1,
                          minWidth: 0,
                          minHeight: 44,
                          border: 1,
                          borderColor:
                            rollAssignmentMode === mode.value ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          bgcolor:
                            rollAssignmentMode === mode.value
                              ? 'action.selected'
                              : 'background.paper',
                        }}
                      />
                    ))}
                  </RadioGroup>
                )}
                {rollAssignmentMode === 'manual' ? (
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
                ) : null}
              </Stack>
              {hasNumberingChoice && (
                <Stack spacing={1.25} sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                  {student?.rollNo && (
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="subtitle2">Replacing an existing assignment</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Current roll: {student.rollNo}
                      </Typography>
                    </Stack>
                  )}
                  {showOverrideFields && overrideOpen && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Manual identifier override"
                      disabled={isSaving || !canAllocate}
                      value={manualValue}
                      onChange={(event) => setManualValue(event.target.value)}
                    />
                  )}
                  {!overrideOpen && (
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<Iconify icon="mdi:plus" width={16} />}
                      sx={{ alignSelf: 'flex-start', px: 0.5 }}
                      disabled={isSaving || !canAllocate}
                      onClick={() => setOverrideOpen(true)}
                    >
                      Add manual identifier override
                    </Button>
                  )}
                  {showOverrideFields && requiresOverrideReason && (
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={2}
                      size="small"
                      label="Override reason"
                      name="overrideReason"
                      disabled={isSaving || !canAllocate}
                      value={overrideReason}
                      onChange={(event) => setOverrideReason(event.target.value)}
                      onBlur={form.handleBlur}
                      error={Boolean(form.touched.overrideReason && form.errors.overrideReason)}
                      helperText={
                        form.touched.overrideReason ? form.errors.overrideReason : undefined
                      }
                      inputProps={{ maxLength: 1000 }}
                    />
                  )}
                </Stack>
              )}
              <Stack spacing={1.25}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ alignSelf: { xs: 'stretch', sm: 'flex-end' } }}
                  disabled={!canPreview || isSaving}
                  loading={previewState.isLoading}
                  onClick={handlePreview}
                >
                  Preview roll number
                </Button>
                {preview && !currentPreview && (
                  <Alert severity="info">
                    The identifier details changed. Preview the roll number again before preparing.
                  </Alert>
                )}
                {currentPreview && (
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2">Roll number preview ready</Typography>
                        <Typography variant="h6">{currentPreview.proposedRollNumber}</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {selectedSeries?.name}
                      </Typography>
                      {manualValue.trim() && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Manual identifier override
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {manualValue.trim()}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" width={16} />}
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
