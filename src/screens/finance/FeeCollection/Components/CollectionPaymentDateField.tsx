import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';

import { parseCollectionPaymentDate, getCollectionPaymentDateError } from './collectionPaymentDate';

type Props = {
  name: string;
  label: string;
  value: unknown;
  required?: boolean;
  error?: string;
  onChange: (value: Dayjs | null) => void;
  onBlur: () => void;
};

export default function CollectionPaymentDateField({
  name,
  label,
  value,
  required = false,
  error,
  onChange,
  onBlur,
}: Props) {
  const [edited, setEdited] = useState(false);
  const date = parseCollectionPaymentDate(value);
  const validation =
    (edited ? getCollectionPaymentDateError(value, label, required) : undefined) || error;

  return (
    <DatePicker
      label={label}
      format="DD/MM/YYYY"
      value={date}
      minDate={dayjs().startOf('day')}
      onChange={(next) => {
        setEdited(true);
        onChange(next);
      }}
      slotProps={{
        textField: {
          name,
          required,
          size: 'small',
          fullWidth: true,
          onBlur,
          error: Boolean(validation),
          helperText: validation || 'DD/MM/YYYY',
        },
      }}
    />
  );
}
