import { TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

export function LoanMaintenanceReason({
  name,
  label,
  value,
  disabled,
  required = false,
  error,
  onChange,
  onBlur,
}: {
  name: string;
  label: string;
  value: string;
  disabled: boolean;
  required?: boolean;
  error?: string | false;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <ShakingTextField error={Boolean(error)}>
      <TextField
        name={name}
        label={label}
        value={value}
        disabled={disabled}
        required={required}
        size="small"
        fullWidth
        multiline
        minRows={2}
        inputProps={{ maxLength: 500 }}
        error={Boolean(error)}
        helperText={error}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    </ShakingTextField>
  );
}
