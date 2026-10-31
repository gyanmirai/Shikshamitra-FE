import type { PaperProps } from '@mui/material/Paper';
import type { AdmissionFormOption } from 'src/redux/student/admissions/admission-forms-api';

import { Box } from '@mui/material';
import { useState, forwardRef } from 'react';
import { PopoverPaper } from '@mui/material/Popover';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { AdmissionRuntimeFieldProps } from './admission-runtime-field';

// Keep menu keyboard/focus behavior in CustomSelect; only replace the scrolling surface.
const ClassMenuPaper = forwardRef<HTMLDivElement, PaperProps>(({ children, sx, ...props }, ref) => (
  <PopoverPaper {...props} ref={ref} sx={[...(Array.isArray(sx) ? sx : [sx]), { overflow: 'hidden' }]}>
    <Scrollbar sx={{ maxHeight: 'min(320px, calc(100dvh - 64px))' }}>{children}</Scrollbar>
  </PopoverPaper>
));

type Props = Pick<
  AdmissionRuntimeFieldProps,
  'field' | 'value' | 'disabled' | 'error' | 'onChange' | 'onBlur'
> & {
  options: AdmissionFormOption[];
  loading?: boolean;
  unavailable?: boolean;
  helperText?: string;
};

/** Board is a prerequisite filter, not a second question or stored answer. */
export function AdmissionBoardClassField({
  field,
  value,
  disabled,
  error,
  onChange,
  onBlur,
  options,
  loading = false,
  unavailable = false,
  helperText,
}: Props) {
  const [chosenBoard, setChosenBoard] = useState('');
  const savedClass = options.find((option) => option.value === value);
  const boardId = (value && savedClass?.boardId) || chosenBoard;
  const boards = [
    ...new Map(
      options
        .filter((option) => option.boardId && option.boardLabel)
        .map((option) => [option.boardId!, { value: option.boardId!, label: option.boardLabel! }])
    ).values(),
  ];
  const classes = options.filter(
    (option) => option.boardId === boardId || (!option.isActive && option.value === value)
  );
  const blocked = disabled || unavailable || loading;
  const menuProps = { slots: { paper: ClassMenuPaper } };
  return (
    <Box sx={{ minWidth: 0, containerType: 'inline-size' }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: 'minmax(0, 1fr)',
          '@container (min-width: 480px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <ShakingTextField error={Boolean(error && !boardId)}>
          <CustomSelect
            name={`${field.code}__board`}
            label="Board"
            required={field.required}
            size="small"
            fullWidth
            isSearch
            searchPlaceholder="Search boards"
            value={boardId}
            options={boards}
            labelKey="label"
            valueKey="value"
            disabled={blocked || !boards.length}
            isLoading={loading}
            error={Boolean(error && !boardId)}
            helperText={
              unavailable
                ? helperText
                : !boards.length && !loading
                  ? 'No boards available for these classes.'
                  : undefined
            }
            noOptionsMessage="No boards available"
            MenuProps={menuProps}
            onChange={(next) => {
              if (String(next) === boardId) return;
              setChosenBoard(String(next));
              onChange('');
            }}
          />
        </ShakingTextField>
        <ShakingTextField error={Boolean(error)}>
          <CustomSelect
            name={field.code}
            label={field.label}
            required={field.required}
            size="small"
            fullWidth
            isSearch
            searchPlaceholder="Search classes"
            value={value}
            options={classes}
            labelKey="label"
            valueKey="value"
            disabled={blocked || !boardId}
            isLoading={loading}
            disabledValues={classes
              .filter((option) => !option.isActive)
              .map((option) => option.value)}
            disabledLabel="Unavailable"
            noOptionsMessage="No classes configured for this board"
            error={Boolean(error)}
            helperText={
              error || helperText || (!boardId && !disabled ? 'Select a board first.' : undefined)
            }
            onBlur={onBlur}
            MenuProps={menuProps}
            onChange={(next) => onChange(String(next))}
          />
        </ShakingTextField>
      </Box>
    </Box>
  );
}
