import type { AdmissionPaymentPolicy } from 'src/redux/student/admissions/admission-payment-policy';

import { Stack, MenuItem, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';

type Props = {
  policy: AdmissionPaymentPolicy;
  disabled: boolean;
  onChange: (value: Partial<AdmissionPaymentPolicy>) => void;
};

export function PaymentPurposeSettings({ policy, disabled, onChange }: Props) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Payment details</Typography>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            disabled={disabled}
            checked={policy.requiresFeeStructureSelection}
            onChange={(_, checked) => onChange({ requiresFeeStructureSelection: checked })}
          />
        }
        label="Require fee structure selection"
      />
      <Typography variant="caption" color="text.secondary">
        Require a saved fee structure before collecting this fee or completing the first Offer or
        Payment step.
      </Typography>
      <TextField
        size="small"
        label="Purpose name *"
        value={policy.purposeName}
        disabled={disabled}
        onChange={(event) => onChange({ purposeName: event.target.value })}
        helperText="Shown to staff and on the admission receipt."
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          fullWidth
          size="small"
          label="Purpose code *"
          value={policy.purposeCode}
          disabled={disabled}
          onChange={(event) =>
            onChange({ purposeCode: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })
          }
        />
        <TextField
          select
          fullWidth
          size="small"
          label="Payer *"
          value={policy.payer}
          disabled={disabled}
          onChange={(event) =>
            onChange({ payer: event.target.value as AdmissionPaymentPolicy['payer'] })
          }
        >
          <MenuItem value="applicant">Applicant</MenuItem>
          <MenuItem value="guardian">Guardian</MenuItem>
          <MenuItem value="either">Applicant or guardian</MenuItem>
        </TextField>
      </Stack>
      <Stack direction="row" spacing={1.5}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Required amount *"
          value={policy.amount}
          disabled={disabled}
          inputProps={{ min: 0.01, max: 10000000, step: 0.01 }}
          onChange={(event) => onChange({ amount: Number(event.target.value) })}
        />
        <TextField
          sx={{ width: 140 }}
          size="small"
          label="Currency *"
          value={policy.currency}
          disabled={disabled}
          inputProps={{ maxLength: 3 }}
          onChange={(event) =>
            onChange({ currency: event.target.value.toUpperCase().replace(/[^A-Z]/g, '') })
          }
        />
      </Stack>
    </Stack>
  );
}
