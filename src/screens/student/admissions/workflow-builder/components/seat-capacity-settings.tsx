import type { AdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';

import { Stack, Switch, MenuItem, TextField, Typography, FormControlLabel } from '@mui/material';

type Props = { policy: AdmissionSeatPolicy; disabled: boolean; onChange: (value: Partial<AdmissionSeatPolicy>) => void };

export function SeatCapacitySettings({ policy, disabled, onChange }: Props) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Capacity and reservation</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField size="small" type="number" label="Default capacity *" value={policy.defaultCapacity}
          disabled={disabled} inputProps={{ min: 1, max: 100000 }}
          onChange={(event) => onChange({ defaultCapacity: Number(event.target.value) })} />
        <TextField select size="small" label="Reservation timing *" value={policy.reservationMode}
          disabled={disabled} onChange={(event) => onChange({ reservationMode: event.target.value as AdmissionSeatPolicy['reservationMode'] })}>
          <MenuItem value="manual">Staff reserves manually</MenuItem>
          <MenuItem value="onEntry">Reserve when applicant enters this stage</MenuItem>
        </TextField>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField size="small" type="number" label="Default hold (hours) *" value={policy.reservationDurationHours}
          disabled={disabled} inputProps={{ min: 1, max: 2160 }} onChange={(event) => {
            const value = Number(event.target.value);
            onChange({ reservationDurationHours: value,
              minimumDurationHours: policy.allowDurationOverride ? policy.minimumDurationHours : value,
              maximumDurationHours: policy.allowDurationOverride ? policy.maximumDurationHours : value });
          }} />
        <TextField size="small" type="number" label="Minimum hours *" value={policy.minimumDurationHours}
          disabled={disabled || !policy.allowDurationOverride} inputProps={{ min: 1, max: 2160 }}
          onChange={(event) => onChange({ minimumDurationHours: Number(event.target.value) })} />
        <TextField size="small" type="number" label="Maximum hours *" value={policy.maximumDurationHours}
          disabled={disabled || !policy.allowDurationOverride} inputProps={{ min: 1, max: 2160 }}
          onChange={(event) => onChange({ maximumDurationHours: Number(event.target.value) })} />
      </Stack>
      <FormControlLabel label="Allow staff to choose a different reservation expiry"
        control={<Switch size="small" disabled={disabled} checked={policy.allowDurationOverride}
          onChange={(_, checked) => onChange({ allowDurationOverride: checked,
            minimumDurationHours: checked ? Math.min(policy.minimumDurationHours, policy.reservationDurationHours) : policy.reservationDurationHours,
            maximumDurationHours: checked ? Math.max(policy.maximumDurationHours, policy.reservationDurationHours) : policy.reservationDurationHours })} />} />
    </Stack>
  );
}
