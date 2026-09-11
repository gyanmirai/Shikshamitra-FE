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
  return (
    <Stack spacing={1}>
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
          onChange={(event) => onChange(Number(event.target.value))}
          slotProps={{ htmlInput: { min: 1, max: 365, step: 1 } }}
          helperText="Shows a due date and overdue status in the review queue."
        />
      )}
    </Stack>
  );
}
