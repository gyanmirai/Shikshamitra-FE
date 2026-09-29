'use client';

import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Alert,
  Stack,
  Button,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useSetStudentOnboardingPlacementMutation,
  useGetAvailableStudentIdentifierSeriesQuery,
  useGetStudentOnboardingPlacementOptionsQuery,
  useAllocateStudentOnboardingIdentifierMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import type { StudentOnboardingItem } from './student-onboarding-model';
import type { StudentAssignmentType } from './student-assignment-dialog';

type StudentOnboardingOperationDialogProps = {
  assignmentType: StudentAssignmentType | null;
  student: StudentOnboardingItem | null;
  onClose: () => void;
};

export default function StudentOnboardingOperationDialog({
  assignmentType,
  student,
  onClose,
}: StudentOnboardingOperationDialogProps) {
  const open = Boolean(assignmentType && student);
  const isPlacement = assignmentType === 'division';
  const placementQuery = useGetStudentOnboardingPlacementOptionsQuery(student?.id ?? '', {
    skip: !open || !isPlacement,
  });
  const seriesQuery = useGetAvailableStudentIdentifierSeriesQuery(student?.id ?? '', {
    skip: !open || isPlacement,
  });
  const [setPlacement, placementState] = useSetStudentOnboardingPlacementMutation();
  const [allocateIdentifier, identifierState] = useAllocateStudentOnboardingIdentifierMutation();
  const [divisionId, setDivisionId] = useState('');
  const [numberSeriesId, setNumberSeriesId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [manualValue, setManualValue] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    if (!open) return;

    setDivisionId(student?.divisionId ?? '');
    setNumberSeriesId('');
    setRollNumber(student?.rollNo ? String(student.rollNo) : '');
    setManualValue('');
    setOverrideReason('');
  }, [open, student?.divisionId, student?.id, student?.rollNo]);

  const selectedPlacement = useMemo(
    () => placementQuery.data?.find((option) => option.id === divisionId),
    [divisionId, placementQuery.data]
  );
  const selectedSeries = useMemo(
    () => seriesQuery.data?.find((series) => series.id === numberSeriesId),
    [numberSeriesId, seriesQuery.data]
  );
  const parsedRollNumber = Number(rollNumber);
  const canSubmit = isPlacement
    ? Boolean(divisionId && selectedPlacement && !selectedPlacement.isFull)
    : Boolean(
        numberSeriesId &&
        Number.isInteger(parsedRollNumber) &&
        parsedRollNumber > 0 &&
        (!manualValue.trim() || overrideReason.trim())
      );
  const isSaving = placementState.isLoading || identifierState.isLoading;

  const handleSubmit = async () => {
    if (!student || !assignmentType || !canSubmit) return;

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
      } else {
        await allocateIdentifier({
          id: student.id,
          concurrencyStamp: student.concurrencyStamp,
          numberSeriesId,
          rollNumber: parsedRollNumber,
          manualValue: manualValue.trim() || undefined,
          overrideReason: overrideReason.trim() || undefined,
        }).unwrap();
        shikshaMitraToast.success({
          message: `Identifiers prepared for ${student.studentName}.`,
        });
      }
      onClose();
    } catch {
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
      handleClose={() => { if (!isSaving) onClose(); }}
      title={isPlacement ? 'Assign division' : 'Prepare identifiers'}
      maxWidth="sm"
      fullWidth
    >
      <DialogScrollContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">{student?.studentName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {student?.applicationNumber} · {student?.standardName}
            </Typography>
          </Box>

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
                options={(placementQuery.data ?? []).map(option => ({ value: option.id, label: `${option.name} · ${option.availableSeats} available` }))}
                disabledValues={(placementQuery.data ?? []).filter(option => option.isFull).map(option => option.id)}
                disabledLabel="Full"
                disabled={placementQuery.isFetching || isSaving}
                helperText={
                  selectedPlacement
                    ? `${selectedPlacement.availableSeats} of ${selectedPlacement.capacity} seats available`
                    : 'Select a division with live capacity.'
                }
              />
              {student?.divisionId && divisionId !== student.divisionId && <TextField fullWidth size="small"
                label="Placement change reason" value={overrideReason} disabled={isSaving}
                onChange={event => setOverrideReason(event.target.value)} inputProps={{ maxLength: 1000 }}
                helperText="Required when the saved placement rule requires a reason. Approval may also be required." />}
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
              <CustomSelect
                fullWidth
                size="small"
                label="Identifier series"
                value={numberSeriesId}
                onChange={(value) => setNumberSeriesId(String(value))}
                options={(seriesQuery.data ?? []).map(series => ({ value: series.id, label: `${series.name} · ${series.nextPreview}` }))}
                disabled={seriesQuery.isFetching || isSaving}
                helperText={
                  selectedSeries
                    ? `Next value: ${selectedSeries.nextPreview}`
                    : 'Select an active series for this academic context.'
                }
              />
              <NumericFormatCustom
                fullWidth
                required
                size="small"
                prefix=""
                thousandSeparator={false}
                decimalScale={0}
                label="Roll number"
                disabled={isSaving}
                value={rollNumber}
                onValueChange={(values) => setRollNumber(values.value)}
                inputProps={{ min: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Manual identifier override"
                disabled={isSaving}
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
                  disabled={isSaving}
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
        <Button size="small" color="inherit" disabled={isSaving} onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<Iconify icon={isPlacement ? 'mdi:seat' : 'mdi:identifier'} width={18} />}
          disabled={!canSubmit || isSaving}
          onClick={handleSubmit}
        >
          {isSaving ? 'Saving...' : isPlacement ? 'Reserve division' : 'Prepare identifiers'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
