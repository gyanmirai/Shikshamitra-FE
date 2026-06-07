import type { AutocompleteChangeReason, AutocompleteChangeDetails } from '@mui/material';

import { Box, Checkbox, TextField, Typography, Autocomplete } from '@mui/material';

export const statusOptions: string[] = ['ALL', 'Active', 'Upcoming', 'Completed'];

export interface Filters {
  eventType: string[];
  holidayType: string[];
  status: string[];
}

interface FilterControlsProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  eventTypeOptions: string[];
  holidayTypeOptions: string[];
  getOptionLabel?: (value: string) => string;
}

const FilterControls = ({
  filters,
  onChange,
  eventTypeOptions,
  holidayTypeOptions,
  getOptionLabel = (value) => value,
}: FilterControlsProps) => {
  const normalize = (
    selected: string[],
    options: string[],
    reason: AutocompleteChangeReason,
    details: AutocompleteChangeDetails<string> | undefined
  ) => {
    if (details?.option === 'ALL' && reason === 'selectOption') {
      return ['ALL'];
    }
    if (details?.option === 'ALL' && reason === 'removeOption') {
      return ['ALL'];
    }

    const concreteSelected = selected.filter((value) => value !== 'ALL');
    if (!concreteSelected.length) {
      return ['ALL'];
    }

    const concreteOptions = options.filter((value) => value !== 'ALL');
    if (concreteOptions.length > 0 && concreteSelected.length === concreteOptions.length) {
      return ['ALL'];
    }

    return concreteSelected;
  };

  const countSelected = (selected: string[], options: string[]) => {
    if (selected.includes('ALL')) return options.filter((value) => value !== 'ALL').length;
    return selected.filter((value) => value !== 'ALL').length;
  };

  const makeDisplayValue = (selected: string[], options: string[]) => {
    if (selected.includes('ALL')) return 'All';
    const count = countSelected(selected, options);
    return count ? `(${count}) selected` : '';
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
        gap: 2,
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Autocomplete
        multiple
        size="small"
        disableCloseOnSelect
        options={eventTypeOptions}
        value={filters.eventType}
        getOptionLabel={getOptionLabel}
        onChange={(_, value, reason, details) =>
          onChange({
            ...filters,
            eventType: normalize(value, eventTypeOptions, reason, details),
          })
        }
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
            {getOptionLabel(option)}
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Event Type" />}
        renderTags={() => (
          <Typography ml={1} variant="body2">
            {makeDisplayValue(filters.eventType, eventTypeOptions)}
          </Typography>
        )}
        sx={{ width: '100%' }}
      />

      <Autocomplete
        multiple
        size="small"
        disableCloseOnSelect
        options={holidayTypeOptions}
        value={filters.holidayType}
        getOptionLabel={getOptionLabel}
        onChange={(_, value, reason, details) =>
          onChange({
            ...filters,
            holidayType: normalize(value, holidayTypeOptions, reason, details),
          })
        }
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
            {getOptionLabel(option)}
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Holiday Type" />}
        renderTags={() => (
          <Typography variant="body2">
            {makeDisplayValue(filters.holidayType, holidayTypeOptions)}
          </Typography>
        )}
        sx={{ width: '100%' }}
      />

      <Autocomplete
        multiple
        size="small"
        disableCloseOnSelect
        options={statusOptions}
        value={filters.status}
        onChange={(_, value, reason, details) =>
          onChange({
            ...filters,
            status: normalize(value, statusOptions, reason, details),
          })
        }
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
            {option}
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Status" />}
        renderTags={() => (
          <Typography variant="body2">{makeDisplayValue(filters.status, statusOptions)}</Typography>
        )}
        sx={{ width: '100%' }}
      />
    </Box>
  );
};

export default FilterControls;
