import type { Dayjs } from 'dayjs';

import { DatePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';

export function CirculationDateField({
  label,
  name,
  value,
  disabled,
  error,
  onChange,
  onBlur,
  required = true,
  helperText,
}: {
  label: string;
  name: string;
  value: Dayjs | null;
  disabled: boolean;
  error?: string | false;
  onChange: (value: Dayjs | null) => void;
  onBlur: () => void;
  required?: boolean;
  helperText?: string;
}) {
  return (
    <ShakingTextField error={Boolean(error)}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            name,
            required,
            fullWidth: true,
            size: 'small',
            onBlur,
            error: Boolean(error),
            helperText: error || helperText,
          },
        }}
      />
    </ShakingTextField>
  );
}
