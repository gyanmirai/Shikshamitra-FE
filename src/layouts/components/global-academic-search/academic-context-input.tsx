import { Box, TextField, Autocomplete } from '@mui/material';

import type { GlobalAcademicSearchOption } from './types';

type Props = {
  isYearOnly: boolean;
  options: GlobalAcademicSearchOption[];
  value: GlobalAcademicSearchOption | null;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (option: GlobalAcademicSearchOption | null) => Promise<void>;
};

export function AcademicContextInput({
  isYearOnly,
  options,
  value,
  open,
  onOpen,
  onClose,
  onChange,
}: Props) {
  return (
    <Autocomplete
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      options={options}
      getOptionLabel={(option) => (isYearOnly ? option.academicYear.name : option.label)}
      getOptionKey={(option) => option.value}
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      value={value}
      clearIcon={false}
      disableClearable={!!value}
      size="small"
      onChange={(_event, option) => onChange(option)}
      renderOption={(props, option) => {
        const { key, ...restProps } = props;
        return (
          <Box
            component="li"
            key={key}
            {...restProps}
            data-selected={option.value === value?.value}
          >
            {isYearOnly ? option.academicYear.name : option.label}
          </Box>
        );
      }}
      slotProps={{
        listbox: {
          sx: {
            '& .MuiAutocomplete-option.Mui-focused': { backgroundColor: 'transparent' },
            '& .MuiAutocomplete-option:hover, & .MuiAutocomplete-option.Mui-focused:hover': {
              backgroundColor: 'action.hover !important',
            },
            '& .MuiAutocomplete-option[data-selected="true"]': { backgroundColor: 'action.hover' },
          },
        },
        popper: { sx: { zIndex: '9999999999 !important' } },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          size="small"
          label={isYearOnly ? 'Academic Year' : 'Academic Year, Board and Medium'}
        />
      )}
      sx={{
        minWidth: 0,
        width: '100%',
        '& *': { fontSize: '14px !important' },
        ...(!isYearOnly && {
          '& .MuiInputLabel-root': {
            maxWidth: 'calc(100% - 32px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }),
      }}
    />
  );
}
