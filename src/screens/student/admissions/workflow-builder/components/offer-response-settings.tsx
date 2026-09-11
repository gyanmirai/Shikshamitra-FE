import type { AdmissionOfferPolicy, AdmissionOfferOutcome } from 'src/redux/student/admissions/admission-offer-policy';

import { Stack, Switch, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';

type Props = { policy: AdmissionOfferPolicy; disabled: boolean; onChange: (value: Partial<AdmissionOfferPolicy>) => void };
const OUTCOMES: { value: AdmissionOfferOutcome; label: string }[] = [
  { value: 'accepted', label: 'Accepted' }, { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' }, { value: 'withdrawn', label: 'Withdrawn' },
];

export function OfferResponseSettings({ policy, disabled, onChange }: Props) {
  const toggleOutcome = (value: AdmissionOfferOutcome, checked: boolean) => onChange({
    allowedCompletionOutcomes: checked ? [...policy.allowedCompletionOutcomes, value]
      : policy.allowedCompletionOutcomes.filter((item) => item !== value),
  });
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Validity and response controls</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField size="small" type="number" label="Default validity (days) *" value={policy.validityDays}
          disabled={disabled} inputProps={{ min: 1, max: 365 }} onChange={(event) => onChange({ validityDays: Number(event.target.value) })} />
        <TextField size="small" type="number" label="Minimum days *" value={policy.minimumValidityDays}
          disabled={disabled || !policy.allowExpiryOverride} inputProps={{ min: 1, max: 365 }} onChange={(event) => onChange({ minimumValidityDays: Number(event.target.value) })} />
        <TextField size="small" type="number" label="Maximum days *" value={policy.maximumValidityDays}
          disabled={disabled || !policy.allowExpiryOverride} inputProps={{ min: 1, max: 365 }} onChange={(event) => onChange({ maximumValidityDays: Number(event.target.value) })} />
      </Stack>
      <FormControlLabel label="Allow staff to override the expiry date" control={<Switch size="small" disabled={disabled}
        checked={policy.allowExpiryOverride} onChange={(_, checked) => onChange({ allowExpiryOverride: checked,
          minimumValidityDays: checked ? policy.minimumValidityDays : policy.validityDays,
          maximumValidityDays: checked ? policy.maximumValidityDays : policy.validityDays })} />} />
      <FormControlLabel label="Require confirmation that terms were accepted" control={<Switch size="small" disabled={disabled}
        checked={policy.requireTermsAcceptance} onChange={(_, checked) => onChange({ requireTermsAcceptance: checked })} />} />
      {policy.offerType === 'conditional' && <FormControlLabel label="Require confirmation that offer conditions were satisfied"
        control={<Switch size="small" disabled={disabled} checked={policy.requireConditionsConfirmation}
          onChange={(_, checked) => onChange({ requireConditionsConfirmation: checked })} />} />}
      <FormControlLabel label="Require a reason when an offer is declined" control={<Switch size="small" disabled={disabled}
        checked={policy.requireDeclineReason} onChange={(_, checked) => onChange({ requireDeclineReason: checked })} />} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <FormControlLabel label="Allow expiry extension" control={<Switch size="small" disabled={disabled}
          checked={policy.allowExtension} onChange={(_, checked) => onChange({ allowExtension: checked, maximumExtensions: checked ? Math.max(1, policy.maximumExtensions) : 0 })} />} />
        <TextField size="small" type="number" label="Maximum extensions" value={policy.maximumExtensions}
          disabled={disabled || !policy.allowExtension} inputProps={{ min: 0, max: 20 }} onChange={(event) => onChange({ maximumExtensions: Number(event.target.value) })} />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <FormControlLabel label="Allow reissue" control={<Switch size="small" disabled={disabled}
          checked={policy.allowReissue} onChange={(_, checked) => onChange({ allowReissue: checked, maximumReissues: checked ? Math.max(1, policy.maximumReissues) : 0 })} />} />
        <TextField size="small" type="number" label="Maximum reissues" value={policy.maximumReissues}
          disabled={disabled || !policy.allowReissue} inputProps={{ min: 0, max: 10 }} onChange={(event) => onChange({ maximumReissues: Number(event.target.value) })} />
      </Stack>
      <Typography variant="body2" color="text.secondary">Outcomes that may complete this stage</Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
        {OUTCOMES.map((item) => <FormControlLabel key={item.value} label={item.label} control={<Checkbox size="small"
          disabled={disabled} checked={policy.allowedCompletionOutcomes.includes(item.value)}
          onChange={(_, checked) => toggleOutcome(item.value, checked)} />} />)}
      </Stack>
      <FormControlLabel label="Continue automatically after acceptance" control={<Switch size="small" disabled={disabled}
        checked={policy.autoAdvanceOnAcceptance} onChange={(_, checked) => onChange({ autoAdvanceOnAcceptance: checked })} />} />
    </Stack>
  );
}
