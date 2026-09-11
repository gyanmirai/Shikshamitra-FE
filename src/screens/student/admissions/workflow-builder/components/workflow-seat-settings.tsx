import type { FormikProps } from 'formik';
import type { AdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import { Alert, Paper, Radio, Stack, Divider, RadioGroup, Typography, FormControlLabel } from '@mui/material';
import { DEFAULT_SEAT_POLICY, readAdmissionSeatPolicy, writeAdmissionSeatPolicy,
  getAdmissionSeatConfigurationError } from 'src/redux/student/admissions/admission-seat-policy';

import { SeatOutcomeSettings } from './seat-outcome-settings';
import { SeatCapacitySettings } from './seat-capacity-settings';

type Props = { formik: FormikProps<AdmissionWorkflowStage>; available: boolean; readOnly: boolean };

export function WorkflowSeatSettings({ formik, available, readOnly }: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionSeatPolicy(json);
  const error = getAdmissionSeatConfigurationError(json);
  const unreadable = Boolean(readStageConfiguration(json)?.seat !== undefined && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionSeatPolicy>) => formik.setFieldValue('configurationJson',
    writeAdmissionSeatPolicy(json, { ...(policy ?? DEFAULT_SEAT_POLICY), ...change }));
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}><Typography variant="subtitle1">Admission capacity</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure seat holds, expiry, renewals, waitlisting, capacity exceptions, and completion outcomes.
          </Typography></Stack>
        {!available && <Alert severity="info">Managed Seat settings are not available in this environment yet.</Alert>}
        <RadioGroup value={policy?.enabled ? 'managed' : 'basic'} onChange={(_, value) => update({ enabled: value === 'managed' })}>
          <FormControlLabel value="basic" disabled={disabled} control={<Radio size="small" />} label="Basic seat step (existing process)" />
          <FormControlLabel value="managed" disabled={disabled} control={<Radio size="small" />} label="Managed capacity, reservation, and waitlist" />
        </RadioGroup>
        {policy?.enabled && <>
          <SeatCapacitySettings policy={policy} disabled={disabled} onChange={update} /><Divider />
          <SeatOutcomeSettings policy={policy} disabled={disabled} onChange={update} />
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
            <Typography variant="overline" color="text.secondary">Capacity preview</Typography>
            <Typography variant="h5">{policy.defaultCapacity} seats</Typography>
            <Typography variant="body2" color="text.secondary">
              {policy.reservationMode === 'onEntry' ? 'Reserved automatically' : 'Reserved by staff'} · held for {policy.reservationDurationHours} hours
            </Typography>
          </Paper>
          <Alert severity="success">Capacity changes and every applicant action are audited. Confirmed admissions consume capacity until released.</Alert>
        </>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  );
}
