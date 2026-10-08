import type { AdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';

import { Stack, MenuItem, TextField } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

type Props = {
  policy: AdmissionOfferPolicy;
  disabled: boolean;
  onChange: (value: Partial<AdmissionOfferPolicy>) => void;
};

export function OfferContentSettings({ policy, disabled, onChange }: Props) {
  return (
    <FormSectionCard
      icon="mdi:text-box-outline"
      title="Offer content"
      descriptionTooltip="Write the offer message and terms. Conditional offers also require conditions to be recorded."
    >
      <Stack spacing={1.5}>
        <TextField
          select
          size="small"
          label="Offer type *"
          value={policy.offerType}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              offerType: event.target.value as AdmissionOfferPolicy['offerType'],
              conditions: event.target.value === 'conditional' ? policy.conditions : null,
              requireConditionsConfirmation:
                event.target.value === 'conditional' && policy.requireConditionsConfirmation,
            })
          }
        >
          <MenuItem value="unconditional">Unconditional</MenuItem>
          <MenuItem value="conditional">Conditional</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Offer title *"
          value={policy.title}
          disabled={disabled}
          inputProps={{ maxLength: 160 }}
          onChange={(event) => onChange({ title: event.target.value })}
        />
        <TextField
          multiline
          minRows={3}
          label="Offer message *"
          value={policy.message}
          disabled={disabled}
          inputProps={{ maxLength: 4000 }}
          onChange={(event) => onChange({ message: event.target.value })}
          helperText={
            policy.message.length >= 3600 ? `${policy.message.length}/4,000 characters` : undefined
          }
        />
        {policy.offerType === 'conditional' && (
          <TextField
            multiline
            minRows={2}
            label="Conditions *"
            value={policy.conditions ?? ''}
            disabled={disabled}
            inputProps={{ maxLength: 4000 }}
            onChange={(event) => onChange({ conditions: event.target.value })}
          />
        )}
        <TextField
          multiline
          minRows={2}
          label="Terms and conditions"
          value={policy.terms ?? ''}
          disabled={disabled}
          inputProps={{ maxLength: 8000 }}
          onChange={(event) => onChange({ terms: event.target.value || null })}
        />
      </Stack>
    </FormSectionCard>
  );
}
