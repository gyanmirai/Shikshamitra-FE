import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box, Chip, TextField, Typography, Autocomplete } from '@mui/material';

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
      renderGroup={(params) => (
        <Box component="li" key={params.key} sx={{ mb: 0.75 }}>
          <Typography
            component="div"
            variant="caption"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              px: 1.5,
              py: 0.75,
              color: 'text.secondary',
              bgcolor: 'background.neutral',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {params.group}
          </Typography>
          <Box
            component="ul"
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1.25, m: 0, listStyle: 'none' }}
          >
            {params.children}
          </Box>
        </Box>
      )}
      renderOption={(optionProps, option, { selected }) => {
        const { key, ...restProps } = optionProps;
        return (
          <Box
            component="li"
            key={key}
            {...restProps}
            sx={{
              width: 'auto !important',
              minWidth: 64,
              minHeight: 44,
              m: '0 !important',
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.25,
              py: 0.75,
              gap: 0.5,
              border: '1px solid',
              borderColor: selected ? 'primary.main' : 'divider',
              borderRadius: 1,
              bgcolor: selected ? 'action.selected' : 'background.paper',
              color: 'text.primary',
              fontWeight: selected ? 700 : 500,
              justifyContent: 'center !important',
              textAlign: 'center !important',
              transition: 'border-color 120ms ease, background-color 120ms ease',
              '&:hover, &[data-focus="true"]': {
                bgcolor: 'action.hover',
                borderColor: 'text.secondary',
              },
            }}
          >
            {selected && <CheckCircleRoundedIcon color="primary" sx={{ fontSize: 16 }} />}
            {option.roomName}
          </Box>
        );
      }}
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
