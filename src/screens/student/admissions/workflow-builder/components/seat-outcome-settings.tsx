import type { AdmissionSeatPolicy, AdmissionSeatOutcome } from 'src/redux/student/admissions/admission-seat-policy';

import { Stack, Switch, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';

type Props = { policy: AdmissionSeatPolicy; disabled: boolean; onChange: (value: Partial<AdmissionSeatPolicy>) => void };
const OUTCOMES: { value: AdmissionSeatOutcome; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' }, { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'released', label: 'Released' }, { value: 'expired', label: 'Expired' },
];

export function SeatOutcomeSettings({ policy, disabled, onChange }: Props) {
  const toggleOutcome = (value: AdmissionSeatOutcome, checked: boolean) => onChange({
    allowedCompletionOutcomes: checked ? [...policy.allowedCompletionOutcomes, value]
      : policy.allowedCompletionOutcomes.filter((item) => item !== value),
  });
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Exceptions and Completion</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <FormControlLabel label="Allow Reservation Renewal" control={<Switch size="small" disabled={disabled}
          checked={policy.allowRenewal} onChange={(_, checked) => onChange({ allowRenewal: checked,
            maximumRenewals: checked ? Math.max(1, policy.maximumRenewals) : 0 })} />} />
        <TextField size="small" type="number" label="Maximum Renewals" value={policy.maximumRenewals}
          disabled={disabled || !policy.allowRenewal} inputProps={{ min: 0, max: 20 }}
          onChange={(event) => onChange({ maximumRenewals: Number(event.target.value) })} />
      </Stack>
      <FormControlLabel label="Allow a FIFO Waitlist When Capacity Is Full" control={<Switch size="small" disabled={disabled}
        checked={policy.allowWaitlist} onChange={(_, checked) => onChange({ allowWaitlist: checked,
          allowedCompletionOutcomes: checked ? policy.allowedCompletionOutcomes : policy.allowedCompletionOutcomes.filter((item) => item !== 'waitlisted') })} />} />
      <FormControlLabel label="Allow Authorized Staff to Change or Exceed Capacity" control={<Switch size="small" disabled={disabled}
        checked={policy.allowCapacityOverride} onChange={(_, checked) => onChange({ allowCapacityOverride: checked })} />} />
      <FormControlLabel label="Require a Reason When a Seat Is Released" control={<Switch size="small" disabled={disabled}
        checked={policy.requireReleaseReason} onChange={(_, checked) => onChange({ requireReleaseReason: checked })} />} />
      <Typography variant="body2" color="text.secondary">Outcomes That May Complete This Stage</Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
        {OUTCOMES.map((item) => <FormControlLabel key={item.value} label={item.label} control={<Checkbox size="small"
          disabled={disabled || item.value === 'confirmed' || (item.value === 'waitlisted' && !policy.allowWaitlist)}
          checked={policy.allowedCompletionOutcomes.includes(item.value)}
          onChange={(_, checked) => toggleOutcome(item.value, checked)} />} />)}
      </Stack>
      <FormControlLabel label="Continue Automatically After Seat Confirmation" control={<Switch size="small" disabled={disabled}
        checked={policy.autoAdvanceOnConfirmation} onChange={(_, checked) => onChange({ autoAdvanceOnConfirmation: checked })} />} />
    </Stack>
  );
}
