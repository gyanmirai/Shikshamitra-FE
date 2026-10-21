import { Chip, TextField, Autocomplete } from '@mui/material';

import { renderRoomGroup, renderRoomOption } from './room-option-renderers';

import type { RoomOption } from './roomOptions';

interface GroupedRoomSelectorProps {
  label: string;
  options: RoomOption[];
  value: RoomOption | RoomOption[] | null;
  multiple?: boolean;
  loading?: boolean;
  error?: boolean;
  helperText?: string;
  onChange: (value: RoomOption | RoomOption[] | null) => void;
}

export function GroupedRoomSelector({
  label,
  options,
  value,
  multiple = false,
  loading = false,
  error = false,
  helperText = '',
  onChange,
}: GroupedRoomSelectorProps) {
  return (
    <Autocomplete<RoomOption, boolean, false, false>
      fullWidth
      multiple={multiple}
      disableCloseOnSelect={multiple}
      size="small"
      loading={loading}
      options={options}
      value={value}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      onChange={(_event, nextValue) => onChange(nextValue)}
      slotProps={{
        paper: {
          sx: { mt: 0.5, border: '1px solid', borderColor: 'divider', maxHeight: 360 },
        },
      }}
      renderGroup={renderRoomGroup}
      renderOption={renderRoomOption}
      renderTags={(tagValues, getTagProps) =>
        tagValues.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return <Chip key={key} {...tagProps} label={option.roomName} size="small" />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          slotProps={{ formHelperText: { sx: { fontWeight: error ? 600 : 400 } } }}
        />
      )}
    />
  );
}
