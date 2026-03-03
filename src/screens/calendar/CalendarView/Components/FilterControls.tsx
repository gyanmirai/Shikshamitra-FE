import type { AutocompleteChangeReason, AutocompleteChangeDetails } from '@mui/material';

import React from 'react';
import { Box, Checkbox, Typography } from '@mui/material';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import type { Filters } from './FilterDialog';

// Keeping the original static option sets (duplicated so this component is independent of the drawer implementation)
export const eventTypesOptions: string[] = [
  'ALL',
  'Meeting',
  'Sports Event',
  'Academic',
  'Workshop',
  'Cultural Event',
  'Holiday',
];
export const holidayTypesOptions: string[] = [
  'ALL',
  'Sports Event',
  'Academic',
  'Workshop',
  'Cultural Event',
  'Holiday',
];
export const statusOptions: string[] = ['ALL', 'Active', 'Upcoming', 'Completed'];

interface FilterControlsProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

/**
 * Inline filter controls using PaginatedSearchSelect (multiple + searchable).
 * Replaces the previous drawer-based filter dialog.
 */
const FilterControls: React.FC<FilterControlsProps> = ({ filters, onChange }) => {
  // Normalize selection with simpler ALL toggle logic:
  const normalize = (
    selected: string[],
    options: string[],
    reason: AutocompleteChangeReason,
    details: AutocompleteChangeDetails<string> | undefined
  ) => {
    if (details?.option === 'ALL' && reason === 'removeOption') {
      return [];
    }
    if (details?.option === 'ALL' && reason === 'selectOption') {
      return options;
    }
    if (selected.length === options.length - 1 && selected.includes('ALL')) {
      return selected.filter((v) => v !== 'ALL');
    }
    if (selected.length === options.length - 1 && !selected.includes('ALL')) {
      selected.push('ALL');
      return selected;
    }

    return selected;
  };

  const makeDisplayValue = (selected: string[], options: string[]) => {
    const fullSelected = selected.includes('ALL') && selected.length === options.length;
    const count = countSelected(selected, options);
    if (fullSelected) return 'All selected';
    return count ? `(${count}) selected` : '';
  };

  const countSelected = (arr: string[], options: string[]) => {
    const fullSelected = arr.includes('ALL') && arr.length === options.length;
    if (fullSelected) return options.length - 1;
    return arr.filter((v) => v !== 'ALL').length;
  };

  const makeFetchOptions = (allOptions: string[]) => async (query: string, page: number) => {
    const filtered = allOptions.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
    const pageSize = 10;
    const start = (page - 1) * pageSize;
    return {
      data: filtered.slice(start, start + pageSize),
      hasMore: start + pageSize < filtered.length,
    };
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
      <PaginatedSearchSelect
        multiple
        size="small"
        disableCloseOnSelect
        label="Event Type"
        noOptionsText="No Event Type Found"
        minChars={0}
        fetchOptions={makeFetchOptions(eventTypesOptions)}
        value={filters.eventType}
        onChange={(_, value: any, reason: any, details: any) =>
          onChange({
            ...filters,
            eventType: normalize(value, eventTypesOptions, reason, details),
          })
        }
        getOptionLabel={(option: any) => option || ''}
        isOptionEqualToValue={(option: any, value: any) => option === value}
        renderOption={(props: any, option: any, { selected }: any) => (
          <li {...props} key={option}>
            <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
            {option}
          </li>
        )}
        renderTags={() => (
          <Typography ml={1} variant="body2">
            {makeDisplayValue(filters.eventType, eventTypesOptions)}
          </Typography>
        )}
        sx={{ width: '100%' }}
      />

      <PaginatedSearchSelect
        multiple
        size="small"
        disableCloseOnSelect
        label="Holiday Type"
        noOptionsText="No Holiday Type Found"
        minChars={0}
        fetchOptions={makeFetchOptions(holidayTypesOptions)}
        value={filters.holidayType}
        onChange={(_, value: any, reason: any, details: any) =>
          onChange({
            ...filters,
            holidayType: normalize(value, holidayTypesOptions, reason, details),
          })
        }
        getOptionLabel={(option: any) => option || ''}
        isOptionEqualToValue={(option: any, value: any) => option === value}
        renderOption={(props: any, option: any, { selected }: any) => (
          <li {...props} key={option}>
            <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
            {option}
          </li>
        )}
        renderTags={() => (
          <Typography variant="body2">
            {makeDisplayValue(filters.holidayType, holidayTypesOptions)}
          </Typography>
        )}
        sx={{ width: '100%' }}
      />

      <PaginatedSearchSelect
        multiple
        size="small"
        disableCloseOnSelect
        label="Status"
        noOptionsText="No Status Found"
        minChars={0}
        fetchOptions={makeFetchOptions(statusOptions)}
        value={filters.status}
        onChange={(_, value: any, reason: any, details: any) =>
          onChange({
            ...filters,
            status: normalize(value, statusOptions, reason, details),
          })
        }
        getOptionLabel={(option: any) => option || ''}
        isOptionEqualToValue={(option: any, value: any) => option === value}
        renderOption={(props: any, option: any, { selected }: any) => (
          <li {...props} key={option}>
            <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
            {option}
          </li>
        )}
        renderTags={() => (
          <Typography variant="body2">
            {makeDisplayValue(filters?.status, statusOptions)}
          </Typography>
        )}
        sx={{ width: '100%' }}
      />
    </Box>
  );
};

export default FilterControls;
