import type { SxProps, SelectProps, FormControlProps, FormHelperTextProps } from '@mui/material';

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
  options: { [K in NoInfer<T>]: string | number }[];
  label?: string;
  multiple?: J;
  value: J extends true ? string[] | number[] : string | number;
  onChange: (value: J extends true ? string[] | number[] : string | number) => void;
  error?: boolean;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  isLoading?: boolean;
  disabled?: boolean;
  noOptionsMessage?: React.ReactNode;
  sx?: SxProps;
  labelKey?: T;
  valueKey?: T;
  formControlProps?: FormControlProps;
  isSearch?: boolean;
  addOtherItemText?: string;
  addOtherItemOnClick?: () => void;
  disabledValues?: (string | number)[];
  disabledLabel?: string;
};

const CustomSelect = <T extends string, J extends boolean>({
  options,
  label,
  multiple = false as J,
  value,
  onChange,
  error = false,
  helperText,
  helperTextProps,
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
  disabledValues = [],
  disabledLabel = 'Already configured',
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
      sx={[
        { width: '100%', position: 'relative' },
        ...(Array.isArray(formControlProps?.sx) ? formControlProps.sx : [formControlProps?.sx]),
        (theme) => ({
          ...(error &&
            disabled && {
              '& .MuiInputLabel-root.Mui-disabled': {
                color: `${theme.palette.error.main} !important`,
              },
            }),
        }),
      ]}
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
            sx={(theme) => ({
              ...(error &&
                disabled && {
                  '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${theme.palette.error.main} !important`,
                  },
                }),
            })}
            {...props}
          >
            {options?.length === 0 ? (
              <MenuItem
                disabled={typeof noOptionsMessage === 'string'}
                onClick={(event) => {
                  if (typeof noOptionsMessage !== 'string') {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                }}
                sx={
                  typeof noOptionsMessage === 'string'
                    ? undefined
                    : {
                        whiteSpace: 'normal',
                        alignItems: 'flex-start',
                        cursor: 'default',
                        '&:hover': { backgroundColor: 'transparent' },
                      }
                }
              >
                {noOptionsMessage}
              </MenuItem>
            ) : (
              options.map((option) => {
                const isDisabled = disabledValues.includes(option[valueKey] as string | number);
                return (
                  <MenuItem key={option[valueKey]} value={option[valueKey]} disabled={isDisabled}>
                    {multiple && (
                      <Checkbox
                        checked={(value as string[])?.indexOf(option[valueKey] as string) > -1}
                        disabled={isDisabled}
                      />
                    )}
                    <ListItemText
                      primary={option[labelKey]}
                      secondary={isDisabled ? disabledLabel : undefined}
                      secondaryTypographyProps={isDisabled ? { fontSize: '0.72rem' } : undefined}
                    />
                  </MenuItem>
                );
              })
            )}
          </Select>
          {helperText && <FormHelperText {...helperTextProps}>{helperText}</FormHelperText>}

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
