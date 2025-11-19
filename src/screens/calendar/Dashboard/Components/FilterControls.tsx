import type { AutocompleteChangeReason, AutocompleteChangeDetails } from '@mui/material';

import React, { useState } from 'react';
import { Box, Checkbox, TextField, Typography, Autocomplete } from '@mui/material';

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
 * Inline filter controls using MUI Autocomplete (multiple + searchable).
 * Replaces the previous drawer-based filter dialog.
 */
const FilterControls: React.FC<FilterControlsProps> = ({ filters, onChange }) => {
  // Derived counts for resetting / UX (optional future use)

  // Normalize selection with simpler ALL toggle logic:
  // Behavior:
  // 1. Clicking ALL alone selects all options (returns full array including ALL).
  // 2. When ALL is part of a multi-selection and the user toggles ALL off, we remove ALL but keep others.
  // 3. Selecting all individual items except ALL no longer auto-adds ALL (allows unchecking ALL cleanly).
  // 4. We don't auto-promote subsets to ALL; ALL only appears if explicitly chosen or via rule #1.
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

  const DROPDOWN_WIDTH = 300;

  // Track search input text separately so we can show counts when not searching
  const [search, setSearch] = useState({ eventType: '', holidayType: '', status: '' });

  const makeDisplayValue = (selected: string[], options: string[]) => {
    const fullSelected = selected.includes('ALL') && selected.length === options.length;
    const count = countSelected(selected, options);
    if (search.eventType || search.holidayType || search.status) return undefined; // per-field handled below
    if (fullSelected) return 'All selected';
    return count ? `(${count}) selected` : '';
  };

  // Compute display counts (exclude 'ALL' meta).
  const countSelected = (arr: string[], options: string[]) => {
    const fullSelected = arr.includes('ALL') && arr.length === options.length;
    if (fullSelected) return options.length - 1; // exclude ALL from count
    return arr.filter((v) => v !== 'ALL').length;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'flex-start',
        // Ensure children (dropdowns + button) wrap nicely and chips outside adapt.
      }}
    >
      <Autocomplete
        multiple
        size="small"
        disableCloseOnSelect
        options={eventTypesOptions}
        value={filters.eventType}
        // inputValue={
        //   search.eventType || makeDisplayValue(filters.eventType, eventTypesOptions) || ''
        // }
        onChange={(_, value, reason, details) => {
          console.log('🚀 ~ FilterControls ~ details:', details);

          console.log('🚀 ~ FilterControls ~ reason:', reason);
          return onChange({
            ...filters,
            eventType: normalize(value, eventTypesOptions, reason, details),
          });
        }}
        // onInputChange={(_, value, reason) => {
        //   if (reason === 'input') setSearch((prev) => ({ ...prev, eventType: value }));
        //   if (reason === 'clear') setSearch((prev) => ({ ...prev, eventType: '' }));
        // }}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
            {option}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Event Type"
            placeholder={search.eventType ? 'Search…' : ''}
          />
        )}
        renderTags={() => (
          <Typography ml={1}>{makeDisplayValue(filters.eventType, eventTypesOptions)}</Typography>
        )}
        sx={{ width: DROPDOWN_WIDTH }}
      />
      <Autocomplete
        multiple
        size="small"
        disableCloseOnSelect
        options={holidayTypesOptions}
        value={filters.holidayType}
        // inputValue={
        //   search.holidayType || makeDisplayValue(filters.holidayType, holidayTypesOptions) || ''
        // }
        onChange={(_, value, reason, details) =>
          onChange({
            ...filters,
            holidayType: normalize(value, holidayTypesOptions, reason, details),
          })
        }
        // onInputChange={(_, value, reason) => {
        //   if (reason === 'input') setSearch((prev) => ({ ...prev, holidayType: value }));
        //   if (reason === 'clear') setSearch((prev) => ({ ...prev, holidayType: '' }));
        // }}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
            {option}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Holiday Type"
            placeholder={search.holidayType ? 'Search…' : ''}
          />
        )}
        renderTags={() => (
          <Typography>{makeDisplayValue(filters.holidayType, holidayTypesOptions)}</Typography>
        )}
        sx={{ width: DROPDOWN_WIDTH }}
      />
      <Autocomplete
        multiple
        size="small"
        disableCloseOnSelect
        options={statusOptions}
        value={filters.status}
        // inputValue={search.status || makeDisplayValue(filters.status, statusOptions) || ''}
        onChange={(_, value, reason, details) =>
          onChange({
            ...filters,
            status: normalize(value, statusOptions, reason, details),
          })
        }
        // onInputChange={(_, value, reason) => {
        //   if (reason === 'input') setSearch((prev) => ({ ...prev, status: value }));
        //   if (reason === 'clear') setSearch((prev) => ({ ...prev, status: '' }));
        // }}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
            {option}
          </li>
        )}
        renderInput={(params) => (
          <TextField {...params} label="Status" placeholder={search.status ? 'Search…' : ''} />
        )}
        renderTags={() => (
          <Typography>{makeDisplayValue(filters?.status, statusOptions)}</Typography>
        )}
        sx={{ width: DROPDOWN_WIDTH }}
      />
    </Box>
  );
};

export default FilterControls;
