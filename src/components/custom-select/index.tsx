import type { SxProps, SelectProps, FormControlProps, FormHelperTextProps } from '@mui/material';

import React, { useId, useState } from 'react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import {
  Chip,
  Select,
  Tooltip,
  MenuItem,
  Checkbox,
  Skeleton,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  ListItemText,
  ListSubheader,
  InputAdornment,
  FormHelperText,
} from '@mui/material';

import { SearchHeader } from './search-header';
import { useSearchMenu } from './use-search-menu';

export type CustomSelectProps<T extends string, J extends boolean> = Omit<
  SelectProps<J extends true ? string[] | number[] : string | number>,
  'onChange' | 'value'
> & {
  options: { [K in NoInfer<T>]: string | number }[];
  label?: string;
  multiple?: J;
  allowSelectAll?: boolean;
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
  searchPlaceholder?: string;
  addOtherItemText?: string;
  addOtherItemOnClick?: () => void;
  disabledValues?: (string | number)[];
  disabledLabel?: string;
  /** Visible explanation for each disabled option; falls back to disabledLabel. */
  disabledReasonKey?: T;
  /** Optional guidance for menu options and the selected value. */
  optionDescriptionKey?: T;
  /** Group contiguous options under non-selectable headings (for example, class → structure). */
  groupKey?: T;
};

const CustomSelect = <T extends string, J extends boolean>({
  options,
  label,
  multiple = false as J,
  allowSelectAll = false,
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
  searchPlaceholder,
  addOtherItemText = '',
  addOtherItemOnClick,
  disabledValues = [],
  disabledLabel = 'Already configured',
  disabledReasonKey,
  optionDescriptionKey,
  groupKey,
  inputProps,
  ...props
}: CustomSelectProps<T, J>): React.ReactElement => {
  const searchMenu = useSearchMenu(isSearch, props.MenuProps, formControlProps?.ref);
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredOptions = (options ?? []).filter(
    (option) =>
      !isSearch ||
      !normalizedSearch ||
      String(option[labelKey]).toLocaleLowerCase().includes(normalizedSearch) ||
      (groupKey && String(option[groupKey]).toLocaleLowerCase().includes(normalizedSearch)) ||
      (Array.isArray(value)
        ? value.includes(option[valueKey] as never)
        : option[valueKey] === value)
  );
  const generatedId = useId();
  const labelId = props.labelId ?? `${generatedId}-label`;
  const helperId = helperTextProps?.id ?? `${generatedId}-helper`;
  const selectedOption = options.find((option) => option[valueKey] === value);
  const selectedDescription = optionDescriptionKey && selectedOption?.[optionDescriptionKey];
  const selectedValues: (string | number)[] = Array.isArray(value) ? value : [];
  const enabledValues =
    multiple && allowSelectAll
      ? options
          .map((option) => option[valueKey])
          .filter((optionValue) => !disabledValues.includes(optionValue))
      : [];
  const allSelected =
    enabledValues.length > 0 && enabledValues.every((item) => selectedValues.includes(item));
  const someSelected = enabledValues.some((item) => selectedValues.includes(item));
  const optionInfo = (description: string | number, optionLabel: string | number) => (
    <Tooltip title={String(description)} arrow>
      <IconButton
        size="small"
        aria-label={`About ${optionLabel}`}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
        }}
        sx={{ color: 'info.main' }}
      >
        <InfoOutlined sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  );

  const handleChange = (event: any, child: React.ReactNode) => {
    if (
      multiple &&
      allowSelectAll &&
      React.isValidElement<{ 'data-select-all'?: boolean }>(child) &&
      child.props['data-select-all']
    ) {
      if (disabled || enabledValues.length === 0) return;
      const nextValues = allSelected
        ? selectedValues.filter((item) => !enabledValues.includes(item))
        : [...selectedValues, ...enabledValues.filter((item) => !selectedValues.includes(item))];
      onChange(nextValues as J extends true ? string[] | number[] : string | number);
      return;
    }
    const selectedValue: J extends true ? string[] | number[] : string | number =
      event.target.value;
    if (!multiple && disabledValues.includes(selectedValue as string | number)) return;
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
      ref={searchMenu.ref}
      required={Boolean(props.required || formControlProps?.required)}
    >
      {isLoading ? (
        <Skeleton variant="rectangular" height={40} />
      ) : (
        <>
          <InputLabel id={labelId} size="small">
            {label}
          </InputLabel>
          <Select
            labelId={labelId}
            multiple={multiple}
            value={value}
            onChange={handleChange}
            size="small"
            label={label}
            SelectDisplayProps={{
              ...props.SelectDisplayProps,
              'aria-labelledby':
                props.SelectDisplayProps?.['aria-labelledby'] ?? (label ? labelId : undefined),
            }}
            inputProps={{
              ...inputProps,
              'aria-label': inputProps?.['aria-label'] ?? label,
              'aria-describedby':
                [inputProps?.['aria-describedby'], helperText && helperId]
                  .filter(Boolean)
                  .join(' ') || undefined,
            }}
            disabled={disabled}
            endAdornment={
              selectedDescription ? (
                <InputAdornment position="end" sx={{ mr: 2.5 }}>
                  {optionInfo(selectedDescription, selectedOption![labelKey])}
                </InputAdornment>
              ) : undefined
            }
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
                : optionDescriptionKey
                  ? () => selectedOption?.[labelKey] ?? ''
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
            MenuProps={{
              ...searchMenu.menuProps,
            }}
            onClose={(event) => {
              setSearch('');
              props.onClose?.(event);
            }}
          >
            {isSearch && (
              <SearchHeader
                label={label}
                placeholder={searchPlaceholder}
                value={search}
                onChange={setSearch}
              />
            )}
            {multiple && allowSelectAll && (
              <MenuItem
                value={`${generatedId}-select-all`}
                data-select-all
                disabled={disabled || enabledValues.length === 0}
                aria-checked={someSelected && !allSelected ? 'mixed' : allSelected}
              >
                <Checkbox
                  tabIndex={-1}
                  inputProps={{ 'aria-hidden': true }}
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  disabled={disabled || enabledValues.length === 0}
                />
                <ListItemText primary={allSelected ? 'Deselect All' : 'Select All'} />
              </MenuItem>
            )}
            {filteredOptions.length === 0 ? (
              <MenuItem
                disabled={Boolean(normalizedSearch) || typeof noOptionsMessage === 'string'}
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
                {normalizedSearch ? 'No results found' : noOptionsMessage}
              </MenuItem>
            ) : (
              filteredOptions.flatMap((option, index) => {
                const isDisabled = disabledValues.includes(option[valueKey] as string | number);
                const heading =
                  groupKey &&
                  (index === 0 || filteredOptions[index - 1][groupKey] !== option[groupKey]) ? (
                    <ListSubheader key={`group-${option[valueKey]}`}>
                      {option[groupKey]}
                    </ListSubheader>
                  ) : null;
                return [
                  heading,
                  <MenuItem
                    key={option[valueKey]}
                    value={option[valueKey]}
                    disabled={isDisabled}
                    aria-label={optionDescriptionKey ? String(option[labelKey]) : undefined}
                  >
                    {multiple && (
                      <Checkbox
                        tabIndex={-1}
                        inputProps={{ 'aria-hidden': true }}
                        checked={(value as string[])?.indexOf(option[valueKey] as string) > -1}
                        disabled={isDisabled}
                      />
                    )}
                    <ListItemText
                      primary={option[labelKey]}
                      secondary={
                        isDisabled
                          ? (disabledReasonKey && option[disabledReasonKey]) || disabledLabel
                          : undefined
                      }
                      secondaryTypographyProps={
                        isDisabled
                          ? {
                              fontSize: '0.72rem',
                              whiteSpace: disabledReasonKey ? 'normal' : undefined,
                            }
                          : undefined
                      }
                    />
                    {optionDescriptionKey && option[optionDescriptionKey]
                      ? optionInfo(option[optionDescriptionKey], option[labelKey])
                      : null}
                  </MenuItem>,
                ];
              })
            )}
          </Select>
          {helperText && (
            <FormHelperText {...helperTextProps} id={helperId}>
              {helperText}
            </FormHelperText>
          )}

          {addOtherItemText !== '' && (
            <Typography
              component="button"
              type="button"
              disabled={disabled || !addOtherItemOnClick}
              fontWeight={500}
              textAlign="right"
              color="primary.main"
              fontSize={12}
              sx={{
                cursor: 'pointer',
                position: 'absolute',
                bottom: '-20px',
                right: '0',
                border: 0,
                p: 0,
                bgcolor: 'transparent',
                font: 'inherit',
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
              }}
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
