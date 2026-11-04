import type { Dayjs } from 'dayjs';
import type { FieldRef } from '@mui/x-date-pickers/models';
import type { DateFieldProps } from '@mui/x-date-pickers/DateField';

import dayjs from 'dayjs';
import { useRef, useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

type Props = {
  value: string;
  identity: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export function ClassTeacherEffectiveDateCell({ value, identity, disabled, onChange }: Props) {
  const [dateValue, setDateValue] = useState(() => (value ? dayjs(value) : null));
  const lastEmitted = useRef(value);
  const clearing = useRef(false);
  const fieldRef = useRef<FieldRef<Dayjs | null>>(null);
  useEffect(() => {
    if (value !== lastEmitted.current) {
      setDateValue(value ? dayjs(value) : null);
      lastEmitted.current = value;
    }
  }, [value]);
  const emit = (next: string) => {
    lastEmitted.current = next;
    onChange(next);
  };
  const invalid = Boolean(value && !dayjs(value).isValid());
  const fieldProps: Pick<DateFieldProps, 'unstableFieldRef' | 'clearable' | 'onClear'> = {
    unstableFieldRef: fieldRef,
    clearable: true,
    onClear: () => {
      clearing.current = true;
      setDateValue(null);
      emit('');
    },
  };
  return (
    <DatePicker
      label="Effective from"
      disabled={disabled}
      value={dateValue}
      format="DD/MM/YYYY"
      onChange={(date, context) => {
        setDateValue(date);
        // MUI also emits null for a partially cleared date; keep that draft invalid until completed.
        emit(
          date === null && clearing.current
            ? ''
            : date && !context.validationError && date.isValid()
              ? date.format('YYYY-MM-DD')
              : 'Invalid Date'
        );
        clearing.current = false;
      }}
      slotProps={{
        field: fieldProps,
        textField: {
          size: 'small',
          fullWidth: true,
          error: invalid,
          helperText: invalid ? 'Enter a valid date (DD/MM/YYYY).' : undefined,
          inputProps: { 'aria-label': `${identity} effective from` },
          onBlur: () => {
            const sections = fieldRef.current?.getSections();
            if (sections?.every((section) => !section.value)) emit('');
            else if (sections?.some((section) => !section.value)) emit('Invalid Date');
          },
        },
        openPickerButton: { 'aria-label': `Choose effective date for ${identity}` },
      }}
    />
  );
}
