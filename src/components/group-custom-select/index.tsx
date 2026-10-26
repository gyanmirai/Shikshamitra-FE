import type { SxProps, FormControlProps } from '@mui/material';

import React from 'react';
import {
  Chip,
  Select,
  MenuItem,
  Checkbox,
  InputLabel,
  FormControl,
  ListItemText,
  ListSubheader,
  FormHelperText,
  CircularProgress,
} from '@mui/material';

type OptionGroup<T extends string> = {
  label: string;
  group: true;
  items: OptionItem<T>[];
};

type OptionItem<T extends string> = { [K in T]: string | number };

type GroupSelectProps<T extends string> = {
  options: OptionGroup<T>[];
  label: string;
  value: string[] | number[];
  onChange: (value: string[] | number[]) => void;
  error?: boolean;
  helperText?: string;
  isLoading?: boolean;
  noOptionsMessage?: string;
  sx?: SxProps;
  labelKey?: T;
  valueKey?: T;
  formControlProps?: FormControlProps;
};

const GroupCustomSelect = <T extends string>({
  options,
  label,
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
}: GroupSelectProps<T>): React.ReactElement => {
  const handleChange = (event: any) => {
    const selectedValue: string[] | number[] = event.target.value;
    onChange(selectedValue);
  };
  const handleDelete = (itemToDelete: string | number) => {
    const newValue = (value as (string | number)[]).filter((item) => item !== itemToDelete);

    if (typeof itemToDelete === 'string') {
      onChange(newValue.filter((v): v is string => typeof v === 'string') as string[]);
    } else {
      onChange(newValue.filter((v): v is number => typeof v === 'number') as number[]);
    }
  };

  return (
    <FormControl error={error} sx={{ width: '100%' }} {...formControlProps}>
      <InputLabel size="small" sx={{ fontSize: '14px' }}>
        {label}
      </InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        size="small"
        label={label}
        renderValue={(selected) => (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {(selected as (string | number)[]).map((val) => {
              const matchingOption = options
                .flatMap((group) => group.items)
                .find((item) => item[valueKey as keyof OptionItem<T>] === val);

              return (
                <Chip
                  key={val}
                  size="small"
                  label={matchingOption ? matchingOption[labelKey as keyof OptionItem<T>] : val}
                  onDelete={() => handleDelete(val)}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                />
              );
            })}
          </div>
        )}
        {...props}
      >
        {isLoading ? (
          <MenuItem disabled>
            <CircularProgress size={24} />
          </MenuItem>
        ) : options.length === 0 ? (
          <MenuItem disabled>{noOptionsMessage}</MenuItem>
        ) : (
          options.flatMap((group, groupIndex) => [
            <ListSubheader key={`group-${groupIndex}`}>{group.label}</ListSubheader>,
            ...group.items.map((item) => (
              <MenuItem
                key={item[valueKey] as string | number}
                value={item[valueKey] as string | number}
              >
                <Checkbox
                  checked={(value as (string | number)[]).includes(
                    item[valueKey as keyof OptionItem<T>] as string | number
                  )}
                />
                <ListItemText primary={item[labelKey]} />
              </MenuItem>
            )),
          ])
        )}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default GroupCustomSelect;
