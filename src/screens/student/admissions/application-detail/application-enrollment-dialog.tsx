'use client';

import type { AdmissionEnrollmentOptions } from 'src/redux/student/admissions/admission-applications-api';

import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Alert,
  Stack,
  Button,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

type Props = {
  open: boolean;
  busy: boolean;
  options?: AdmissionEnrollmentOptions;
  loading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onClose: () => void;
  onSubmit: (divisionId?: string) => Promise<boolean>;
};

export function ApplicationEnrollmentDialog({
  open,
  busy,
  options,
  loading,
  hasError,
  onRetry,
  onClose,
  onSubmit,
}: Props) {
  const [divisionId, setDivisionId] = useState('');

  useEffect(() => {
    if (open) setDivisionId('');
  }, [open]);

  const selectedDivision = options?.divisions.find((item) => item.id === divisionId);
  const cannotSubmit =
    busy || loading || hasError || !options || Boolean(selectedDivision && !selectedDivision.isAvailable);

  return (
    <CustomDialog open={open} handleClose={onClose} title="Complete enrollment" maxWidth="sm">
      <DialogScrollContent>
        <Stack spacing={2}>
          <Alert severity="info" icon={<Iconify icon="mdi:school-outline" />}>
            This creates the student and academic-year enrollment record. The action is permanent; division assignment can be completed later.
          </Alert>
          {loading && <Skeleton variant="rounded" height={56} />}
          {hasError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={onRetry}>
                  Retry
                </Button>
              }
            >
              Enrollment options could not be loaded. Retry before continuing so seat availability can be verified.
            </Alert>
          )}
          {!loading && !hasError && options && options.divisions.length === 0 && (
            <Alert severity="warning">
              No divisions are configured for this class. The student will be enrolled without a division.
            </Alert>
          )}
          {!loading && !hasError && options && options.divisions.length > 0 && (
            <TextField
              select
              fullWidth
              size="small"
              label="Division"
              value={divisionId}
              onChange={(event) => setDivisionId(event.target.value)}
              helperText="Optional. Choose a division with available seats, or assign one later."
            >
              <MenuItem value="">Assign division later</MenuItem>
              {options.divisions.map((division) => (
                <MenuItem key={division.id} value={division.id} disabled={!division.isAvailable}>
                  {division.name} · {division.isAvailable ? `${division.availableSeats} seats available` : 'Full'}
                </MenuItem>
              ))}
            </TextField>
          )}
          {selectedDivision && !selectedDivision.isAvailable && (
            <Typography variant="caption" color="error.main">
              This division became full. Choose another division or assign one later.
            </Typography>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button variant="outlined" size="small" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="success"
          size="small"
          loading={busy}
          disabled={cannotSubmit}
          startIcon={<Iconify icon="mdi:check-circle-outline" />}
          onClick={async () => {
            const success = await onSubmit(divisionId || undefined);
            if (success) onClose();
          }}
        >
          Enroll applicant
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
