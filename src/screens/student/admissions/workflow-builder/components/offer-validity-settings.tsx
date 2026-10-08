import type { AdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';

import { Stack } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { WorkflowSettingLabel } from './workflow-setting-label';

export function OfferValiditySettings({
  policy,
  disabled,
  onChange,
}: {
  policy: AdmissionOfferPolicy;
  disabled: boolean;
  onChange: (change: Partial<AdmissionOfferPolicy>) => void;
}) {
  const fields = [
    { key: 'validityDays', label: 'Default validity (days) *' },
    ...(policy.allowExpiryOverride
      ? [
          { key: 'minimumValidityDays', label: 'Minimum validity (days) *' },
          { key: 'maximumValidityDays', label: 'Maximum validity (days) *' },
        ]
      : []),
  ] as { key: 'validityDays' | 'minimumValidityDays' | 'maximumValidityDays'; label: string }[];
  return (
    <Stack spacing={1.5}>
      {fields.map(({ key, label }) => {
        const invalid = !Number.isInteger(policy[key]) || policy[key] < 1 || policy[key] > 365;
        return (
          <ShakingTextField key={key} error={invalid}>
            <NumericFormatCustom
              fullWidth
              size="small"
              label={
                key === 'validityDays' ? (
                  <WorkflowSettingLabel
                    label={label}
                    help="Days from issue until the offer expires."
                  />
                ) : (
                  label
                )
              }
              value={policy[key] || ''}
              slotProps={{ htmlInput: { 'aria-label': label } }}
              prefix=""
              thousandSeparator={false}
              decimalScale={0}
              disabled={disabled}
              error={invalid}
              helperText={invalid ? 'Enter a whole number from 1 to 365.' : undefined}
              onValueChange={({ floatValue }) => {
                const value = floatValue ?? 0;
                onChange({
                  [key]: value,
                  ...(key === 'validityDays' && !policy.allowExpiryOverride
                    ? { minimumValidityDays: value, maximumValidityDays: value }
                    : {}),
                });
              }}
            />
          </ShakingTextField>
        );
      })}
    </Stack>
  );
}
