import type { SxProps, SelectProps, FormControlProps } from '@mui/material';

import React from 'react';
import {
  Chip,
  Select,
  MenuItem,
  Checkbox,
  Skeleton,
  InputLabel,
  Typography,
  FormControl,
  ListItemText,
  FormHelperText,
} from '@mui/material';

export type CustomSelectProps<T extends string, J extends boolean> = Omit<
  SelectProps<J extends true ? string[] | number[] : string | number>,
  'onChange' | 'value'
> & {
  options: { [K in T]: string | number }[];
  label?: string;
  multiple?: J;
  value: J extends true ? string[] | number[] : string | number;
  onChange: (value: J extends true ? string[] | number[] : string | number) => void;
  error?: boolean;
  helperText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  noOptionsMessage?: string;
  sx?: SxProps;
  labelKey?: T;
  valueKey?: T;
  formControlProps?: FormControlProps;
  isSearch?: boolean;
  addOtherItemText?: string;
  addOtherItemOnClick?: () => void;
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
  disabled = false,
  noOptionsMessage = 'No data available',
  sx = {},
  labelKey = 'label' as T,
  valueKey = 'value' as T,
  formControlProps,
  isSearch = false,
  addOtherItemText = '',
  addOtherItemOnClick,
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
    <FormControl
      size="small"
      error={error}
      sx={{
        width: '100%',
        position: 'relative',
        '& .Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: 'error.main !important',
        },
        '& .Mui-disabled.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: 'error.main !important',
        },
        '& .MuiOutlinedInput-root.Mui-disabled.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: 'error.main !important',
        },
        '& .Mui-error .MuiInputLabel-root': {
          color: 'error.main !important',
        },
        '& .Mui-error.Mui-disabled .MuiInputLabel-root': {
          color: 'error.main !important',
        },
        '& .MuiInputLabel-root.Mui-disabled.Mui-error': {
          color: 'error.main !important',
        },
        '& .Mui-error .MuiFormHelperText-root': {
          color: 'error.main !important',
        },
        ...sx,
      }}
      {...formControlProps}
    >
      {isLoading ? (
        <Skeleton variant="rectangular" height={40} />
      ) : (
        <>
          <InputLabel size="small">{label}</InputLabel>
          <Select
            multiple={multiple}
            value={value}
            onChange={handleChange}
            size="small"
            label={label}
            disabled={disabled}
            renderValue={
              multiple
                ? (selected: string | string[] | number | number[]) => (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(Array.isArray(selected) ? selected : [selected]).map((val, index) => (
                        <Chip
                          key={index}
                          size="small"
                          disabled={disabled}
                          variant="soft"
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
            {options?.length === 0 ? (
              <MenuItem disabled>{noOptionsMessage}</MenuItem>
            ) : (
              options.map((option) => (
                <MenuItem key={option[valueKey]} value={option[valueKey]}>
                  {multiple && (
                    <Checkbox
                      checked={(value as string[])?.indexOf(option[valueKey] as string) > -1}
                    />
                  )}
                  <ListItemText primary={option[labelKey]} />
                </MenuItem>
              ))
            )}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}

          {addOtherItemText !== '' && (
            <Typography
              component="span"
              fontWeight={500}
              textAlign="right"
              color="primary.main"
              fontSize={12}
              sx={{ cursor: 'pointer', position: 'absolute', bottom: '-20px', right: '0' }}
              onClick={addOtherItemOnClick}
            >
              {addOtherItemText}
            </Typography>
          )}
        </>
      )}
    </FormControl>
  );
};

export default CustomSelect;
