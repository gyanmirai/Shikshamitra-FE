import type { Dayjs } from 'dayjs';
import type { InputProps } from '@mui/material';

import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import { useRef, useState, useEffect } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import type { DateRange } from './types';

dayjs.extend(customParseFormat);

// ----------------------------------------------------------------------

type RangeFieldProps = {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onChange?: (range: DateRange) => void;
  validateDate?: (date: Dayjs | null) => string | null;
  allowManualInput?: boolean;
  singleInput?: boolean;
  label?: string;
  name?: string;
  required?: boolean;
  startLabel?: string;
  endLabel?: string;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  dateFormat?: string;
  InputProps?: Partial<InputProps>;
  sx?: any;
};

export function RangeField({
  startDate,
  endDate,
  onOpen,
  onChange,
  validateDate,
  allowManualInput = false,
  singleInput,
  label,
  name,
  required,
  startLabel = 'Start date',
  endLabel = 'End date',
  placeholder,
  readOnly,
  disabled,
  error,
  helperText,
  dateFormat = 'MM/DD/YYYY',
  InputProps,
  sx,
}: RangeFieldProps) {
  // Format values
  const startStr = startDate ? startDate.format(dateFormat) : '';
  const endStr = endDate ? endDate.format(dateFormat) : '';
  const formattedRange =
    startStr && endStr ? `${startStr} - ${endStr}` : startStr ? `${startStr} - ` : '';
  const rangeKey = `${startStr}|${endStr}`;
  const lastInputRange = useRef(rangeKey);
  const [inputText, setInputText] = useState(formattedRange);
  const [inputError, setInputError] = useState<string | null>(null);
  const editable = allowManualInput && singleInput && !readOnly;

  // Own changes must preserve a partially typed draft; calendar/template changes replace it.
  useEffect(() => {
    if (rangeKey !== lastInputRange.current) {
      lastInputRange.current = rangeKey;
      setInputText(formattedRange);
      setInputError(null);
    }
  }, [rangeKey, formattedRange]);

  const parseInput = (text: string): { range: DateRange; error: string | null } => {
    if (!text.trim()) return { range: [null, null], error: null };
    const parts = text.trim().split(/\s+[-–]\s+/);
    const start = dayjs(parts[0], dateFormat, true);
    const end = dayjs(parts[1] ?? '', dateFormat, true);
    if (parts.length !== 2 || !start.isValid() || !end.isValid()) {
      return { range: [null, null], error: `Enter dates as ${dateFormat} - ${dateFormat}` };
    }
    if (end.isBefore(start, 'day')) {
      return { range: [null, null], error: 'End date must be on or after start date' };
    }
    const validationError = validateDate?.(start) || validateDate?.(end) || null;
    return { range: validationError ? [null, null] : [start, end], error: validationError };
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    const parsed = parseInput(text);
    lastInputRange.current = parsed.range.map((date) => date?.format(dateFormat) ?? '').join('|');
    setInputError(parsed.error);
    // Clear invalid drafts from the form so an earlier valid range cannot be saved silently.
    onChange?.(parsed.range);
  };

  if (singleInput) {
    return (
      <TextField
        required={required}
        fullWidth
        label={label || 'Date Range'}
        name={name}
        value={editable ? inputText : formattedRange}
        placeholder={placeholder || 'DD/MM/YYYY - DD/MM/YYYY'}
        onClick={!editable && !readOnly ? onOpen : undefined}
        onChange={editable ? (event) => handleInputChange(event.target.value) : undefined}
        onBlur={editable ? () => setInputError(parseInput(inputText).error) : undefined}
        onKeyDown={
          editable
            ? (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  setInputError(parseInput(inputText).error);
                }
              }
            : undefined
        }
        size="small"
        slotProps={{
          input: {
            readOnly: !editable,
            endAdornment: (
              <InputAdornment position="end">
                {editable ? (
                  <IconButton
                    aria-label={`Open calendar for ${label || 'Date Range'}`}
                    size="small"
                    disabled={disabled}
                    onClick={onOpen}
                  >
                    <Iconify icon="mdi:calendar" />
                  </IconButton>
                ) : (
                  <Iconify icon="eva:calendar-fill" sx={{ color: 'text.disabled' }} />
                )}
              </InputAdornment>
            ),
            ...InputProps,
          },
        }}
        disabled={disabled}
        error={error || Boolean(editable && inputError)}
        helperText={(editable && inputError) || helperText}
        sx={sx}
      />
    );
  }

  return (
    <Stack direction="row" spacing={2} sx={sx}>
      <TextField
        required={required}
        fullWidth
        label={startLabel}
        value={startStr}
        placeholder={placeholder || 'DD/MM/YYYY'}
        onClick={onOpen}
        size="small"
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="eva:calendar-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            ...InputProps,
          },
        }}
        disabled={disabled}
        error={error}
        helperText={helperText}
      />

      <TextField
        required={required}
        fullWidth
        label={endLabel}
        value={endStr}
        placeholder={placeholder || 'DD/MM/YYYY'}
        onClick={onOpen}
        size="small"
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="eva:calendar-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            ...InputProps,
          },
        }}
        disabled={disabled}
        error={error}
        // We only show helper text on the last field or handle it jointly?
        // For simplicity, let's show it on the second one if provided, or rely on parent validation display.
      />
    </Stack>
  );
}
