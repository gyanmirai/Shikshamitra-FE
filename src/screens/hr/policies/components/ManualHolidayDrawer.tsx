'use client';

import type { DateValidationError } from '@mui/x-date-pickers';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Alert, Stack, Paper, Drawer, TextField, Typography } from '@mui/material';

import { FieldLabel, PolicyDrawerLayout } from './HRPolicySharedUI';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// --- ManualHolidayDrawer ------------------------------------------------------

export function ManualHolidayDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
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
    <Drawer
      anchor="right"
      open={manualHolidayDialogOpen}
      onClose={closeManualHolidayDialog}
      PaperProps={{
        'aria-label': isEdit ? 'Edit Manual Holiday' : 'Add Manual Holiday',
        sx: { width: { xs: '100%', sm: 'min(560px, 92vw)' }, maxWidth: '100%' },
      }}
    >
      <PolicyDrawerLayout
        title={isEdit ? 'Edit Manual Holiday' : 'Add Manual Holiday'}
        helpText="Add dates that should be treated as holidays in this work calendar."
        onClose={closeManualHolidayDialog}
        onSave={saveManualHoliday}
        loading={false}
        disabled={Boolean(manualHolidayConflict) || hasDateError}
      >
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
      </PolicyDrawerLayout>
    </Drawer>
  );
}
