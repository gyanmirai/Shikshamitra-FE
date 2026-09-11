import type { AdmissionPaymentMethod, AdmissionPaymentPolicy } from 'src/redux/student/admissions/admission-payment-policy';

import { STAFF_PAYMENT_METHODS } from 'src/redux/student/admissions/admission-payment-policy';
import { Alert, Stack, Switch, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';

type Props = { policy: AdmissionPaymentPolicy; disabled: boolean; onChange: (value: Partial<AdmissionPaymentPolicy>) => void };

export function PaymentCollectionSettings({ policy, disabled, onChange }: Props) {
  const toggleMethod = (method: AdmissionPaymentMethod, checked: boolean) => onChange({
    acceptedMethods: checked ? [...policy.acceptedMethods, method] : policy.acceptedMethods.filter((item) => item !== method),
  });
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Collection and controls</Typography>
      <Alert severity="info">Staff collection is ready. Online collection becomes available after a trusted tenant payment gateway is connected.</Alert>
      <Typography variant="body2" color="text.secondary">Accepted staff methods</Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5}>
        {STAFF_PAYMENT_METHODS.map((method) => (
          <FormControlLabel key={method.value} sx={{ minWidth: 150 }} label={method.label}
            control={<Checkbox size="small" disabled={disabled} checked={policy.acceptedMethods.includes(method.value)}
              onChange={(_, checked) => toggleMethod(method.value, checked)} />} />
        ))}
      </Stack>
      <Stack direction="row" spacing={1.5}>
        <TextField fullWidth size="small" type="number" label="Due after stage entry (days)" disabled={disabled}
          value={policy.dueInDays ?? ''} inputProps={{ min: 1, max: 365 }}
          onChange={(event) => onChange({ dueInDays: event.target.value ? Number(event.target.value) : null })}
          helperText="Leave blank for no deadline." />
        <FormControlLabel label="Accept after deadline" control={<Switch size="small" disabled={disabled || policy.dueInDays == null}
          checked={policy.allowLatePayment} onChange={(_, checked) => onChange({ allowLatePayment: checked })} />} />
      </Stack>
      <FormControlLabel label="Allow installments" control={<Switch size="small" disabled={disabled}
        checked={policy.allowInstallments} onChange={(_, checked) => onChange({ allowInstallments: checked, minimumInstallmentAmount: checked ? Math.min(policy.amount, policy.minimumInstallmentAmount ?? policy.amount) : null })} />} />
      {policy.allowInstallments && <TextField size="small" type="number" label="Minimum installment *" disabled={disabled}
        value={policy.minimumInstallmentAmount ?? ''} inputProps={{ min: 0.01, max: policy.amount, step: 0.01 }}
        onChange={(event) => onChange({ minimumInstallmentAmount: event.target.value ? Number(event.target.value) : null })} />}
      <FormControlLabel label="Require a second staff member to verify every payment" control={<Switch size="small" disabled={disabled}
        checked={policy.requireIndependentVerification} onChange={(_, checked) => onChange({ requireIndependentVerification: checked })} />} />
      <FormControlLabel label="Allow authorized full waiver with a reason" control={<Switch size="small" disabled={disabled}
        checked={policy.allowWaiver} onChange={(_, checked) => onChange({ allowWaiver: checked })} />} />
      <FormControlLabel label="Continue automatically after settlement" control={<Switch size="small" disabled={disabled}
        checked={policy.autoAdvanceOnSettlement} onChange={(_, checked) => onChange({ autoAdvanceOnSettlement: checked })} />} />
    </Stack>
  );
}
