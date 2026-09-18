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
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Alert, TextField, Typography, DialogActions } from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { suggestCloneCode, suggestCloneName, normalizeCycleCode } from './admission-cycle-model';

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
  clone: 'Create a new draft cycle from this configuration without copying offerings or applications.',
  window: 'Change the application window while keeping linked offering dates within the cycle.',
  schedule: 'Choose future publish and close times using the institution timezone.',
};

export function AdmissionCycleConfigurationDialog({ mode, cycle, academicYears, busy, onClose, onConfirm }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [closeAt, setCloseAt] = useState('');

  useEffect(() => {
    if (!cycle || !mode) return;
    setName(mode === 'clone' ? suggestCloneName(cycle) : cycle.name);
    setCode(mode === 'clone' ? suggestCloneCode(cycle) : cycle.code);
    setDescription(cycle.description ?? '');
    setAcademicYearId(cycle.academicYearId);
    setStartDate(cycle.startDate.slice(0, 10));
    setEndDate(cycle.endDate.slice(0, 10));
    setReason('');
    setPublishAt(cycle.scheduledPublishAt?.slice(0, 16) ?? '');
    setCloseAt(cycle.scheduledCloseAt?.slice(0, 16) ?? '');
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
    (mode === 'clone' && (!name.trim() || !code.trim() || !academicYearId || datesInvalid)) ||
    (mode === 'window' && (datesInvalid || !reason.trim())) ||
    (mode === 'schedule' && scheduleInvalid);

  const submit = async () => {
    if (mode === 'clone') {
      await onConfirm({
        sourceCycleId: cycle.id,
        name: name.trim(),
        code,
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
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">The copy is created as a draft. Offerings and applications are not copied.</Alert>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth required size="small" label="Cycle name" value={name} onChange={(event) => setName(event.target.value.slice(0, 128))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth required size="small" label="Cycle code" value={code} onChange={(event) => setCode(normalizeCycleCode(event.target.value).slice(0, 64))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
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
                <TextField fullWidth multiline minRows={2} size="small" label="Description (optional)" value={description} onChange={(event) => setDescription(event.target.value.slice(0, 1000))} />
              </Grid>
            </>
          )}

          {(mode === 'clone' || mode === 'window') && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker label="Applications open" format="DD-MM-YYYY" value={startDate ? dayjs(startDate) : null} onChange={(value) => setStartDate(value?.isValid() ? value.format('YYYY-MM-DD') : '')} slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker label="Applications close" format="DD-MM-YYYY" value={endDate ? dayjs(endDate) : null} onChange={(value) => setEndDate(value?.isValid() ? value.format('YYYY-MM-DD') : '')} slotProps={{ textField: { fullWidth: true, required: true, size: 'small', error: datesInvalid, helperText: datesInvalid ? 'Close date must be after open date' : undefined } }} />
              </Grid>
            </>
          )}

          {mode === 'window' && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">Linked offering dates must remain inside the revised cycle window.</Alert>
              <TextField sx={{ mt: 1.5 }} fullWidth required multiline minRows={2} size="small" label="Reason for revising the window" value={reason} onChange={(event) => setReason(event.target.value.slice(0, 500))} helperText={`${reason.length}/500 characters`} />
            </Grid>
          )}

          {mode === 'schedule' && (
            <>
              <Grid size={{ xs: 12 }}><Typography variant="body2" color="text.secondary">Times use your institution’s configured timezone. Leave an action blank if it should remain manual.</Typography></Grid>
              {cycle.status === 0 && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DateTimePicker
                    label="Publish at"
                    format="DD-MM-YYYY hh:mm A"
                    value={publishAt ? dayjs(publishAt) : null}
                    onChange={(value) =>
                      setPublishAt(value?.isValid() ? value.format('YYYY-MM-DDTHH:mm') : '')
                    }
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <DateTimePicker
                  label="Close at"
                  format="DD-MM-YYYY hh:mm A"
                  value={closeAt ? dayjs(closeAt) : null}
                  onChange={(value) =>
                    setCloseAt(value?.isValid() ? value.format('YYYY-MM-DDTHH:mm') : '')
                  }
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              {scheduleInvalid && <Grid size={{ xs: 12 }}><Alert severity="warning">Choose a future time. Close time must be later than publish time.</Alert></Grid>}
            </>
          )}
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <LoadingButton size="small" variant="outlined" onClick={onClose} disabled={busy} startIcon={<Iconify icon={GlobalIcons.cancel} />}>Cancel</LoadingButton>
        <LoadingButton size="small" variant="contained" onClick={submit} loading={busy} disabled={disabled} startIcon={<Iconify icon={GlobalIcons.submit} />}>
          {mode === 'clone' ? 'Create draft copy' : mode === 'window' ? 'Update window' : 'Save schedule'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
