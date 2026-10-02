'use client';

import type { AcademicYear } from 'src/types/school';
import type {
  AdmissionCycle,
  CloneAdmissionCycle,
  ScheduleAdmissionCycle,
  UpdateAdmissionCycleWindow,
} from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { LoadingButton } from 'src/components/loading-button';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { Grid, Alert, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { suggestCloneName } from './admission-cycle-model';
import { AdmissionDialogTitle } from './admission-dialog-title';
import { ADMISSION_DATE_FORMAT, ADMISSION_DATE_TIME_FORMAT } from './admission-date-formats';

export type CycleConfigurationMode = 'clone' | 'window' | 'schedule';

type Payload = CloneAdmissionCycle | UpdateAdmissionCycleWindow | ScheduleAdmissionCycle;
type Props = {
  mode: CycleConfigurationMode | null;
  cycle: AdmissionCycle | null;
  academicYears: AcademicYear[];
  busy: boolean;
  onClose: () => void;
  onConfirm: (payload: Payload) => Promise<void>;
};

const titles: Record<CycleConfigurationMode, string> = {
  clone: 'Clone Admission Cycle',
  window: 'Revise Application Window',
  schedule: 'Schedule Admission Cycle',
};

const descriptions: Record<CycleConfigurationMode, string> = {
  clone:
    'Create a new draft cycle from this configuration without copying offerings or applications.',
  window: 'Change the application window while keeping linked offering dates within the cycle.',
  schedule: 'Choose future publish and close times using the institution timezone.',
};

export function AdmissionCycleConfigurationDialog({
  mode,
  cycle,
  academicYears,
  busy,
  onClose,
  onConfirm,
}: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [dismissedNotice, setDismissedNotice] = useState<CycleConfigurationMode | null>(null);

  useEffect(() => {
    if (!cycle || !mode) return;
    setName(mode === 'clone' ? suggestCloneName(cycle) : cycle.name);
    setDescription(cycle.description ?? '');
    setAcademicYearId(cycle.academicYearId);
    setStartDate(cycle.startDate.slice(0, 10));
    setEndDate(cycle.endDate.slice(0, 10));
    setReason('');
    setPublishAt(cycle.scheduledPublishAt?.slice(0, 16) ?? '');
    setCloseAt(cycle.scheduledCloseAt?.slice(0, 16) ?? '');
    setDismissedNotice(null);
  }, [cycle, mode]);

  if (!mode || !cycle) return null;

  const datesInvalid = !startDate || !endDate || !dayjs(endDate).isAfter(dayjs(startDate), 'day');
  const scheduleInvalid =
    (!publishAt && !closeAt) ||
    Boolean(publishAt && !dayjs(publishAt).isAfter(dayjs())) ||
    Boolean(closeAt && !dayjs(closeAt).isAfter(dayjs())) ||
    Boolean(publishAt && closeAt && !dayjs(closeAt).isAfter(dayjs(publishAt)));
  const disabled =
    busy ||
    (mode === 'clone' && (!name.trim() || !academicYearId || datesInvalid)) ||
    (mode === 'window' && (datesInvalid || !reason.trim())) ||
    (mode === 'schedule' && scheduleInvalid);

  const submit = async () => {
    if (mode === 'clone') {
      await onConfirm({
        sourceCycleId: cycle.id,
        name: name.trim(),
        code: '',
        description: description.trim() || null,
        academicYearId,
        startDate,
        endDate,
      });
    } else if (mode === 'window') {
      await onConfirm({
        concurrencyStamp: cycle.concurrencyStamp,
        startDate,
        endDate,
        reason: reason.trim(),
      });
    } else {
      await onConfirm({
        concurrencyStamp: cycle.concurrencyStamp,
        publishAt: publishAt ? dayjs(publishAt).toISOString() : null,
        closeAt: closeAt ? dayjs(closeAt).toISOString() : null,
      });
    }
  };

  return (
    <CustomDialog
      open
      handleClose={busy ? () => undefined : onClose}
      title={
        <AdmissionDialogTitle
          title={titles[mode]}
          helpText={descriptions[mode]}
          helpLabel={`${titles[mode]} information`}
        />
      }
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Grid container spacing={1.5}>
          {mode === 'clone' && (
            <>
              {dismissedNotice !== 'clone' && (
                <Grid size={{ xs: 12 }}>
                  <Alert
                    severity="info"
                    onClose={() => setDismissedNotice('clone')}
                    closeText="Dismiss copy information"
                  >
                    The copy is created as a draft. Offerings and applications are not copied.
                  </Alert>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Cycle name"
                  value={name}
                  onChange={(event) => setName(event.target.value.slice(0, 128))}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomSelect
                  label="Academic year"
                  name="academicYearId"
                  value={academicYearId}
                  options={academicYears.map((year) => ({ value: year.id, label: year.name }))}
                  onChange={(value) => setAcademicYearId(String(value))}
                  formControlProps={{ required: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Description (optional)"
                  value={description}
                  onChange={(event) => setDescription(event.target.value.slice(0, 1000))}
                />
              </Grid>
            </>
          )}

          {(mode === 'clone' || mode === 'window') && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Applications open"
                  format={ADMISSION_DATE_FORMAT}
                  value={startDate ? dayjs(startDate) : null}
                  onChange={(value) =>
                    setStartDate(value?.isValid() ? value.format('YYYY-MM-DD') : '')
                  }
                  slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Applications close"
                  format={ADMISSION_DATE_FORMAT}
                  value={endDate ? dayjs(endDate) : null}
                  onChange={(value) =>
                    setEndDate(value?.isValid() ? value.format('YYYY-MM-DD') : '')
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      size: 'small',
                      error: datesInvalid,
                      helperText: datesInvalid ? 'Close date must be after open date' : undefined,
                    },
                  }}
                />
              </Grid>
            </>
          )}

          {mode === 'window' && (
            <Grid size={{ xs: 12 }}>
              {dismissedNotice !== 'window' && (
                <Alert
                  severity="warning"
                  onClose={() => setDismissedNotice('window')}
                  closeText="Dismiss window warning"
                >
                  Linked offering dates must remain inside the revised cycle window.
                </Alert>
              )}
              <TextField
                sx={{ mt: 1.5 }}
                fullWidth
                required
                multiline
                minRows={2}
                size="small"
                label="Reason for revising the window"
                value={reason}
                onChange={(event) => setReason(event.target.value.slice(0, 500))}
                helperText={`${reason.length}/500 characters`}
              />
            </Grid>
          )}

          {mode === 'schedule' && (
            <>
              {cycle.status === 0 && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DateTimePicker
                    label="Publish at"
                    format={ADMISSION_DATE_TIME_FORMAT}
                    value={publishAt ? dayjs(publishAt) : null}
                    onChange={(value) => {
                      setPublishAt(value?.isValid() ? value.format('YYYY-MM-DDTHH:mm') : '');
                      setDismissedNotice(null);
                    }}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <DateTimePicker
                  label="Close at"
                  format={ADMISSION_DATE_TIME_FORMAT}
                  value={closeAt ? dayjs(closeAt) : null}
                  onChange={(value) => {
                    setCloseAt(value?.isValid() ? value.format('YYYY-MM-DDTHH:mm') : '');
                    setDismissedNotice(null);
                  }}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              {scheduleInvalid && dismissedNotice !== 'schedule' && (
                <Grid size={{ xs: 12 }}>
                  <Alert
                    severity="warning"
                    onClose={() => setDismissedNotice('schedule')}
                    closeText="Dismiss schedule warning"
                  >
                    Choose a future time. Close time must be later than publish time.
                  </Alert>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <LoadingButton
          size="small"
          variant="outlined"
          onClick={onClose}
          disabled={busy}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          size="small"
          variant="contained"
          onClick={submit}
          loading={busy}
          disabled={disabled}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          {mode === 'clone'
            ? 'Create draft copy'
            : mode === 'window'
              ? 'Update window'
              : 'Save schedule'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
