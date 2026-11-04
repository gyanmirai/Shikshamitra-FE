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
export const AdmissionAcademicMenuPaper = forwardRef<HTMLDivElement, PaperProps>(({ children, sx, ...props }, ref) => (
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
  const [chosenMedium, setChosenMedium] = useState('');
  const savedClass = options.find((option) => option.value === value);
  const boardId = (value && savedClass?.boardId) || chosenBoard;
  const mediumId = (value && savedClass?.mediumId) || chosenMedium;
  const hasMediums = options.some(option => option.mediumId && option.mediumLabel);
  const boards = [
    ...new Map(
      options
        .filter((option) => option.boardId && option.boardLabel)
        .map((option) => [option.boardId!, { value: option.boardId!, label: option.boardLabel! }])
    ).values(),
  ];
  const mediums = [...new Map(options.filter(option => option.boardId === boardId && option.mediumId && option.mediumLabel)
    .map(option => [option.mediumId!, {value: option.mediumId!, label: option.mediumLabel!}])).values()];
  const classes = options.filter(
    (option) => (option.boardId === boardId && (!hasMediums || option.mediumId === mediumId)) || (!option.isActive && option.value === value)
  );
  const blocked = disabled || unavailable || loading;
  const menuProps = { slots: { paper: AdmissionAcademicMenuPaper } };
  return (
    <Box sx={{ minWidth: 0, containerType: 'inline-size' }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: 'minmax(0, 1fr)',
          '@container (min-width: 480px)': { gridTemplateColumns: `repeat(${hasMediums ? 3 : 2}, minmax(0, 1fr))` },
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
            searchPlaceholder="Search Boards"
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
            noOptionsMessage="No Boards Available"
            MenuProps={menuProps}
            onChange={(next) => {
              if (String(next) === boardId) return;
              setChosenBoard(String(next));
              setChosenMedium('');
              onChange('');
            }}
          />
        </ShakingTextField>
        {hasMediums && <ShakingTextField error={Boolean(error && !mediumId)}>
          <CustomSelect
            name={`${field.code}__medium`}
            label="Medium"
            required={field.required}
            size="small"
            fullWidth
            isSearch
            searchPlaceholder="Search Mediums"
            value={mediumId}
            options={mediums}
            labelKey="label"
            valueKey="value"
            disabled={blocked || !boardId}
            isLoading={loading}
            noOptionsMessage="No Mediums Available for This Board"
            MenuProps={menuProps}
            onChange={(next) => {
              if (String(next) === mediumId) return;
              setChosenBoard(boardId);
              setChosenMedium(String(next));
              onChange('');
            }}
          />
        </ShakingTextField>}
        <ShakingTextField error={Boolean(error)}>
          <CustomSelect
            name={field.code}
            label={field.label}
            required={field.required}
            size="small"
            fullWidth
            isSearch
            searchPlaceholder="Search Classes"
            value={value}
            options={classes}
            labelKey="label"
            valueKey="value"
            disabled={blocked || !boardId || (hasMediums && !mediumId)}
            isLoading={loading}
            disabledValues={classes
              .filter((option) => !option.isActive)
              .map((option) => option.value)}
            disabledLabel="Unavailable"
            noOptionsMessage="No Classes Configured for This Board"
            error={Boolean(error)}
            helperText={
              error || helperText || (!boardId && !disabled ? 'Select a board first.' : hasMediums && !mediumId && !disabled ? 'Select a medium first.' : undefined)
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
