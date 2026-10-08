import { useBoolean } from 'src/hooks/use-boolean';
import CustomAccordion from 'src/components/custom-accordian';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Switch, TextField, FormControlLabel } from '@mui/material';

export function ReviewTimingSettings({
  value,
  disabled,
  onChange,
}: {
  value: number | null;
  disabled: boolean;
  onChange: (value: number | null) => void;
}) {
  const timing = useBoolean();
  const invalid = value != null && (!Number.isInteger(value) || value < 1 || value > 365);
  return (
    <FormSectionCard
      icon="mdi:clock-outline"
      title="Advanced settings"
      descriptionTooltip="Set a due date and show overdue status in the review queue."
    >
      <CustomAccordion
        title="Review timing"
        expanded={timing.value || invalid}
        onChange={timing.onToggle}
        content={
          <Stack spacing={1.5}>
            <FormControlLabel
              label="Set a review due date"
              control={
                <Switch
                  size="small"
                  disabled={disabled}
                  checked={value != null}
                  onChange={(_, checked) => onChange(checked ? 3 : null)}
                />
              }
            />
            {value != null && (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Days after entering Review *"
                value={value}
                disabled={disabled}
                error={invalid}
                helperText={invalid ? 'Enter a whole number from 1 to 365.' : undefined}
                onChange={(event) => onChange(Number(event.target.value))}
                slotProps={{ htmlInput: { min: 1, max: 365, step: 1 } }}
              />
            )}
          </Stack>
        }
      />
    </FormSectionCard>
  );
}
