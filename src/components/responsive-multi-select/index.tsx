import type { AutocompleteRenderOptionState } from '@mui/material';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useRef, useState, useLayoutEffect } from 'react';
import { Box, Chip, Checkbox, TextField, Autocomplete } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import CustomTooltip from '../custom-tooltip';

type ResponsiveMultiSelectProps<T> = {
  label?: string;
  options: T[];
  value: T[] | string[]; // support string[] or object[]
  onChange: (value: string[]) => void;
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  isLoading?: boolean;
};

export function ResponsiveMultiSelect<T>({
  label = 'Select',
  options,
  value,
  onChange,
  getOptionLabel = (opt: any) => opt.label || opt.name || opt.title,
  getOptionValue = (opt: any) => opt.value || opt.id,
  disabled,
  error,
  helperText,
  isLoading,
}: ResponsiveMultiSelectProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setMaxVisibleChips] = useState(1);

  const selectedOptions = options.filter((opt) =>
    (value as string[]).includes(getOptionValue(opt))
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) {
      const chipWidth = 100;
      const count = Math.floor(container.offsetWidth / chipWidth);
      setMaxVisibleChips(count || 1);
    }
  }, [value]);

  const handleDelete = (optionToDelete: T) => {
    const valueToDelete = getOptionValue(optionToDelete);
    const newValues = (value as string[]).filter((v) => v !== valueToDelete);
    onChange(newValues);
  };

  return (
    <Box ref={containerRef}>
      <Autocomplete
        multiple
        disabled={disabled}
        options={options}
        disableCloseOnSelect
        getOptionLabel={getOptionLabel}
        value={selectedOptions}
        loading={isLoading}
        onChange={(_, newValue) => {
          onChange(newValue.map(getOptionValue));
        }}
        isOptionEqualToValue={(option, val) => getOptionValue(option) === getOptionValue(val)}
        renderOption={(props, option, { selected }: AutocompleteRenderOptionState) => {
          const { key, ...safeProps } = props;
          return (
            <li key={key} {...safeProps}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {getOptionLabel(option)}
            </li>
          );
        }}
        renderTags={(tagValue: T[]) => {
          const container = containerRef.current;
          const containerWidth = container?.offsetWidth || 0;

          const CHIP_MARGIN = 8;
          const CHIP_PADDING = 16;

          // Estimate total width used by chips
          let usedWidth = 0;
          const visibleTags: T[] = [];
          const hiddenTags: T[] = [];

          for (let i = 0; i < tagValue.length; i += 1) {
            const labelLength = getOptionLabel(tagValue[i]).length;
            const estimatedWidth = labelLength * 8 + CHIP_PADDING + CHIP_MARGIN;

            if (usedWidth + estimatedWidth < containerWidth - 60) {
              visibleTags.push(tagValue[i]);
              usedWidth += estimatedWidth;
            } else {
              hiddenTags.push(tagValue[i]);
            }
          }

          return [
            ...visibleTags.map((item) => (
              <Chip
                key={getOptionValue(item)}
                label={getOptionLabel(item)}
                onDelete={disabled ? undefined : () => handleDelete(item)}
                sx={{ ml: 0.5, whiteSpace: 'nowrap' }}
                size="small"
                variant="soft"
              />
            )),
            hiddenTags.length > 0 && (
              <OverflowChipPopover
                key="more-count"
                data={hiddenTags}
                count={hiddenTags.length}
                getLabel={getOptionLabel}
                getKey={getOptionValue}
                onDelete={disabled ? undefined : handleDelete}
              />
            ),
          ];
        }}
        sx={{
          '& .MuiAutocomplete-tag': {
            margin: '2px 4px 2px 0',
            maxHeight: '24px',
          },
          '& .MuiAutocomplete-inputRoot': {
            alignItems: 'center',
            flexWrap: 'nowrap',
            paddingTop: '4px',
            paddingBottom: '4px',
            minHeight: '40px',
          },
          '& .MuiAutocomplete-input': {
            padding: '0 !important',
            margin: '0 !important',
            paddingLeft: '14px !important',
            lineHeight: 1.5,
            flexGrow: 1,
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            size="small"
            error={error}
            helperText={helperText}
            sx={(theme) => ({
              ...(error &&
                disabled && {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${theme.palette.error.main} !important`,
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: `${theme.palette.error.main} !important`,
                  },
                }),
              '& .MuiInputBase-root': {
                alignItems: 'center',
                minHeight: '40px',
                padding: '0px',
                flexWrap: 'nowrap',
              },
              '& .MuiInputBase-input': {
                padding: '0px !important',
                margin: '0px !important',
                height: '24px',
                paddingLeft: '7px !important',
                lineHeight: 1.5,
              },
              '& .MuiFormHelperText-root': {
                marginLeft: 0,
                marginTop: '2px',
                color: error ? 'error' : undefined,
              },
            })}
          />
        )}
      />
    </Box>
  );
}

type OverflowChipPopoverProps<T> = {
  data: T[];
  count: number;
  getLabel: (item: T) => string;
  getKey?: (item: T) => string | number;
  onDelete?: (item: T) => void;
};

export const OverflowChipPopover = <T,>({
  data,
  count,
  getLabel,
  getKey = (item: T) => String(item),
  onDelete,
}: OverflowChipPopoverProps<T>) => (
  <CustomTooltip
    title={
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 1,
          maxHeight: '150px',
          overflowY: 'auto',
        }}
      >
        {data.map((item, idx) => (
          <Chip
            key={getKey(item)}
            label={getLabel(item)}
            onDelete={onDelete ? () => onDelete(item) : undefined}
            size="small"
            variant="soft"
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
    }
    placement="bottom-start"
    arrow
  >
    <Chip label={`+${count}`} sx={{ ml: 0.5, cursor: 'pointer' }} size="small" variant="soft" />
  </CustomTooltip>
);
