import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import ShakingTextField from 'src/components/shaking-text-field';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';

interface Props {
  value: Dayjs | null;
  label: string;
  name: string;
  error?: string;
  disabled?: boolean;
  minTime?: Dayjs | null;
  maxTime?: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  onBlur: () => void;
}

export default function SlotTimePicker({
  value,
  label,
  name,
  error,
  disabled,
  minTime,
  maxTime,
  onChange,
  onBlur,
}: Props) {
  return (
    <ShakingTextField error={Boolean(error)} sx={{ width: 1 }}>
      <TimePicker
        label={label}
        value={value?.isValid() ? value : null}
        format="hh:mm a"
        views={['hours', 'minutes']}
        disabled={disabled}
        minTime={minTime ?? undefined}
        maxTime={maxTime ?? undefined}
        ampm
        onChange={(next) => onChange(next?.isValid() ? dayjs(next) : null)}
        slotProps={{
          textField: {
            name,
            size: 'small',
            fullWidth: true,
            required: true,
            error: Boolean(error),
            helperText: error,
            onBlur,
          },
        }}
        viewRenderers={{
          hours: renderTimeViewClock,
          minutes: renderTimeViewClock,
          seconds: renderTimeViewClock,
        }}
      />
    </ShakingTextField>
  );
}
