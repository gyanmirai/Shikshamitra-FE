import type { SxProps, SelectProps, FormControlProps } from '@mui/material';

import React from 'react';

import {
  Chip,
  Select,
  MenuItem,
  Checkbox,
  InputLabel,
  FormControl,
  ListItemText,
  FormHelperText,
  CircularProgress,
} from '@mui/material';

type CustomSelectProps<T extends string, J extends boolean> = Omit<
  SelectProps<J extends true ? string[] | number[] : string | number>,
  'onChange' | 'value'
> & {
  options: { [K in T]: string | number }[];
  label: string;
  multiple?: J;
  value: J extends true ? string[] | number[] : string | number;
  onChange: (value: J extends true ? string[] | number[] : string | number) => void;
  error?: boolean;
  helperText?: string;
  isLoading?: boolean;
  noOptionsMessage?: string;
  sx?: SxProps;
  labelKey?: T;
  valueKey?: T;
  formControlProps?: FormControlProps;
  isSearch?: boolean;
};

const CustomSelect = <T extends string, J extends boolean>({
  options,
  label,
  multiple = false as J,
  value,
  onChange,
  error = false,
  helperText,
  isLoading = false,
  noOptionsMessage = 'No data available',
  sx = {},
  labelKey = 'label' as T,
  valueKey = 'value' as T,
  formControlProps,
  isSearch = false,
  ...props
}: CustomSelectProps<T, J>): React.ReactElement => {
  const handleChange = (event: any) => {
    const selectedValue: J extends true ? string[] | number[] : string | number =
      event.target.value;
    onChange(selectedValue);
  };

  const handleDelete = (itemToDelete: string | number) => {
    if (multiple) {
      const newValue = (value as string[]).filter((item) => item !== itemToDelete);
      onChange(newValue as J extends true ? string[] | number[] : string | number);
    }
  };

  return (
    <FormControl size="small" error={error} sx={{ width: '100%' }} {...formControlProps}>
      <InputLabel size="small" sx={{ fontSize: '14px' }}>
        {label}
      </InputLabel>
      <Select
        multiple={multiple}
        value={value}
        onChange={handleChange}
        size="small"
        label={label}
        // sx={{ fontSize: '12px' }}
        renderValue={
          multiple
            ? (selected: string | string[] | number | number[]) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(Array.isArray(selected) ? selected : [selected]).map((val) => (
                    <Chip
                      key={val}
                      size="small"
                      label={options.find((option) => option[valueKey] === val)?.[labelKey]}
                      onDelete={() => handleDelete(val)}
                      onMouseDown={(event) => {
                        event.stopPropagation();
                      }}
                    />
                  ))}
                </div>
              )
            : undefined
        }
        {...props}
      >
        {isLoading ? (
          <MenuItem disabled>
            <CircularProgress size={24} />
          </MenuItem>
        ) : options.length === 0 ? (
          <MenuItem disabled>{noOptionsMessage}</MenuItem>
        ) : (
          options.map((option) => (
            <MenuItem key={option[valueKey]} value={option[valueKey]}>
              {multiple && (
                <Checkbox checked={(value as string[]).indexOf(option[valueKey] as string) > -1} />
              )}
              <ListItemText primary={option[labelKey]} />
            </MenuItem>
          ))
        )}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default CustomSelect;
