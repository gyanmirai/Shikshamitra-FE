'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Button, TextField, InputAdornment } from '@mui/material';

import type { AssignmentFilterValue } from '../types';

interface AssignmentToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  statusFilter: AssignmentFilterValue;
  onStatusFilterChange: (value: AssignmentFilterValue) => void;
  onClearFilters: () => void;
  disabled?: boolean;
}

const filterOptions: { value: AssignmentFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'preferenceMismatch', label: 'Preference Mismatch' },
];

export default function AssignmentToolbar({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  disabled,
}: AssignmentToolbarProps) {
  const hasActiveFilters = !!searchTerm || statusFilter !== 'all';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        mb: 1.5,
      }}
    >
      <TextField
        size="small"
        placeholder="Search by name or roll no."
        value={searchTerm}
        disabled={disabled}
        onChange={(e) => onSearchTermChange(e.target.value)}
        sx={{ minWidth: 240 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ rowGap: 0.75 }}>
        {filterOptions.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            size="small"
            variant={statusFilter === opt.value ? 'filled' : 'outlined'}
            color={statusFilter === opt.value ? 'primary' : 'default'}
            onClick={() => (disabled ? undefined : onStatusFilterChange(opt.value))}
            sx={{ cursor: disabled ? 'default' : 'pointer' }}
          />
        ))}
      </Stack>

      {hasActiveFilters && (
        <Button
          size="small"
          color="inherit"
          startIcon={<Iconify icon="ic:round-clear" />}
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  );
}
