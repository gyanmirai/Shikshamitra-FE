import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';

export function CalendarDateField({
  label,
  name,
  value,
  error,
  disabled,
  onChange,
  onBlur,
}: {
  label: string;
  name: string;
  value: string;
  error?: string | false;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
}) {
  return (
    <ShakingTextField error={Boolean(error)}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        disabled={disabled}
        onChange={(date) => onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
        slotProps={{
          textField: {
            required: true,
            fullWidth: true,
            size: 'small',
            name,
            onBlur,
            error: Boolean(error),
            helperText: error,
          },
        }}
      />
    </ShakingTextField>
  );
}
