import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useId } from 'react';

export function TestClockField({
  value,
  disabled,
  onChange,
}: {
  value: Dayjs | null;
  disabled?: boolean;
  onChange: (value: Dayjs | null) => void;
}) {
  const id = useId();
  return (
    <label htmlFor={id}>
      Clock time
      <input
        id={id}
        type="time"
        disabled={disabled}
        value={value?.isValid() ? value.format('HH:mm') : ''}
        onChange={(event) =>
          onChange(event.target.value ? dayjs(`2000-01-01T${event.target.value}`) : null)
        }
      />
    </label>
  );
}
