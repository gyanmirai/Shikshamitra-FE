import { Alert, TextField } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export function WorkflowPaymentSettings({ available }: { available: boolean }) {
  return (
    <FormSectionCard
      icon="mdi:cash-check"
      title="Fee structure confirmation"
      descriptionTooltip="Applicants confirm the applicable published Finance fee structure before continuing. Confirmation does not record a payment. Fee assignment and collection remain in Finance after admission."
    >
      <TextField
        fullWidth
        size="small"
        label="Completion requirement"
        value="Confirmed Finance fee structure"
        slotProps={{ input: { readOnly: true } }}
      />
      {!available && (
        <Alert severity="warning">
          Fee structure confirmation is not available in this environment.
        </Alert>
      )}
    </FormSectionCard>
  );
}
