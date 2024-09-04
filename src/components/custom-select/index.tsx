import type { SxProps, SelectProps, FormControlProps, SelectChangeEvent } from '@mui/material';

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

type CustomSelectProps<T extends string> = Omit<SelectProps<string>, 'onChange'> & {
  options: { [K in T]: string }[];
  label: string;
  multiple?: boolean;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: boolean;
  helperText?: string;
  isLoading?: boolean;
  noOptionsMessage?: string;
  sx?: SxProps;
  labelKey?: T;
  valueKey?: T;
  formControlProps?: FormControlProps;
};

const CustomSelect = <T extends string>({
  options,
  label,
  multiple = false,
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
  ...props
}: CustomSelectProps<T>): React.ReactElement => {
  const handleChange = (event: SelectChangeEvent<typeof value>) => {
    const selectedValue = event.target.value;
    onChange(selectedValue);
  };

  const handleDelete = (itemToDelete: string) => {
    const newValue = (value as string[]).filter((item) => item !== itemToDelete);
    onChange(newValue);
  };

  return (
    <FormControl error={error} {...formControlProps}>
      <InputLabel size="small">{label}</InputLabel>
      <Select
        multiple={multiple}
        value={value}
        onChange={handleChange}
        size="small"
        label={label}
        renderValue={
          multiple
            ? (selected) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(selected as string[]).map((val) => (
                    <Chip
                      key={val}
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
                <Checkbox checked={(value as string[]).indexOf(option[valueKey]) > -1} />
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
