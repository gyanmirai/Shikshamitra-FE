'use client';

import type { DateValidationError } from '@mui/x-date-pickers';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import {
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  Divider,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { FieldLabel, InfoTooltipIcon } from './HRPolicySharedUI';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// ─── ManualHolidayDialog ──────────────────────────────────────────────────────

export function ManualHolidayDialog({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    formError,
    calendarForm,
    manualHolidayForm,
    setManualHolidayForm,
    manualHolidayDialogOpen,
    editingManualHolidayIndex,
    manualHolidayConflict,
    manualHolidayConflictMessage,
    closeManualHolidayDialog,
    saveManualHoliday,
  } = ctx;

  const isEdit = editingManualHolidayIndex !== null;
  const errorMessage = manualHolidayConflictMessage || formError;

  const [fromDateError, setFromDateError] = useState<DateValidationError | null>(null);
  const [toDateError, setToDateError] = useState<DateValidationError | null>(null);
  const hasDateError = Boolean(fromDateError) || Boolean(toDateError);

  return (
    <Dialog
      open={manualHolidayDialogOpen}
      onClose={closeManualHolidayDialog}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ p: 2 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography variant="h6">
            {isEdit ? 'Edit Manual Holiday' : 'Add Manual Holiday'}
          </Typography>
          <InfoTooltipIcon title="Add dates that should be treated as holidays in this work calendar." />
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pb: 2 }}>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          <TextField
            fullWidth
            size="small"
            label={<FieldLabel label="Holiday name *" />}
            value={manualHolidayForm.holidayName}
            onChange={(event) =>
              setManualHolidayForm((current) => ({
                ...current,
                holidayName: event.target.value,
              }))
            }
          />
          <DatePicker
            label={<FieldLabel label="From date *" />}
            value={manualHolidayForm.fromDate ? dayjs(manualHolidayForm.fromDate) : null}
            onChange={(val) => {
              if (!val?.isValid()) return;
              const formatted = val.format('YYYY-MM-DD');
              setManualHolidayForm((current) => ({
                ...current,
                fromDate: formatted,
                toDate: current.toDate || formatted,
              }));
            }}
            onError={(err) => setFromDateError(err)}
            format="DD/MM/YYYY"
            minDate={
              calendarForm.effectiveFrom ? dayjs(calendarForm.effectiveFrom) : dayjs('1900-01-01')
            }
            maxDate={
              calendarForm.effectiveTo ? dayjs(calendarForm.effectiveTo) : dayjs('2099-12-31')
            }
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                error: Boolean(fromDateError),
                helperText: fromDateError
                  ? 'Enter a valid date within the calendar range.'
                  : undefined,
              },
            }}
          />
          <DatePicker
            label={<FieldLabel label="To date *" />}
            value={manualHolidayForm.toDate ? dayjs(manualHolidayForm.toDate) : null}
            onChange={(val) => {
              if (!val?.isValid()) return;
              setManualHolidayForm((current) => ({
                ...current,
                toDate: val.format('YYYY-MM-DD'),
              }));
            }}
            onError={(err) => setToDateError(err)}
            format="DD/MM/YYYY"
            minDate={
              calendarForm.effectiveFrom ? dayjs(calendarForm.effectiveFrom) : dayjs('1900-01-01')
            }
            maxDate={
              calendarForm.effectiveTo ? dayjs(calendarForm.effectiveTo) : dayjs('2099-12-31')
            }
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                error: Boolean(toDateError),
                helperText: toDateError
                  ? 'Enter a valid date within the calendar range.'
                  : undefined,
              },
            }}
          />
          <Paper variant="outlined" sx={{ px: 1.5, py: 1, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary">
              Days
            </Typography>
            <Typography variant="body2">
              {manualHolidayForm.fromDate &&
              manualHolidayForm.toDate &&
              !dayjs(manualHolidayForm.toDate).isBefore(dayjs(manualHolidayForm.fromDate), 'day')
                ? dayjs(manualHolidayForm.toDate).diff(dayjs(manualHolidayForm.fromDate), 'day') + 1
                : '-'}
            </Typography>
          </Paper>
          <TextField
            fullWidth
            size="small"
            label={<FieldLabel label="Notes" />}
            value={manualHolidayForm.notes}
            onChange={(event) =>
              setManualHolidayForm((current) => ({ ...current, notes: event.target.value }))
            }
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={closeManualHolidayDialog}
          size="small"
          startIcon={<Iconify icon="eva:close-outline" />}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={Boolean(manualHolidayConflict) || hasDateError}
          onClick={saveManualHoliday}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
