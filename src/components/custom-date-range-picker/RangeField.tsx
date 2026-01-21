import type { Dayjs } from 'dayjs';
import type { InputProps } from '@mui/material';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import InputAdornment from '@mui/material/InputAdornment';

// ----------------------------------------------------------------------

type RangeFieldProps = {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onOpen: (event: React.MouseEvent<HTMLElement>) => void;
  singleInput?: boolean;
  label?: string;
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
  singleInput,
  label,
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

  const handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    // Prevent focus if readOnly/picker mode
    if (!readOnly) {
      event.preventDefault();
      onOpen(event);
    }
  };

  if (singleInput) {
    const value = startStr && endStr ? `${startStr} - ${endStr}` : startStr ? `${startStr} - ` : '';

    return (
      <TextField
        fullWidth
        label={label || 'Date Range'}
        value={value}
        placeholder={placeholder || 'DD/MM/YYYY - DD/MM/YYYY'}
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
        sx={sx}
      />
    );
  }

  return (
    <Stack direction="row" spacing={2} sx={sx}>
      <TextField
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
