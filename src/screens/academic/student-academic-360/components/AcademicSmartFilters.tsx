'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Button, Typography } from '@mui/material';

import type { AcademicSmartFilter } from '../listUtils';

type AcademicSmartFiltersProps = {
  counts: Record<AcademicSmartFilter, number>;
  activeFilter: AcademicSmartFilter;
  onFilterChange: (filter: AcademicSmartFilter) => void;
};

const filters: { key: AcademicSmartFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'mdi:account-group-outline' },
  { key: 'needsAttention', label: 'Needs Attention', icon: 'mdi:alert-circle-outline' },
  { key: 'lowAttendance', label: 'Low Attendance', icon: 'mdi:calendar-alert-outline' },
  { key: 'overdueHomework', label: 'Overdue Homework', icon: 'mdi:clipboard-alert-outline' },
  { key: 'performanceDecline', label: 'Performance Decline', icon: 'mdi:trending-down' },
  { key: 'noData', label: 'No Academic Data', icon: 'mdi:database-alert-outline' },
  { key: 'activeIntervention', label: 'Active Intervention', icon: 'mdi:hand-heart-outline' },
];

export function AcademicSmartFilters({
  counts,
  activeFilter,
  onFilterChange,
}: AcademicSmartFiltersProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ overflowX: 'auto', py: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
        Smart filters
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, minWidth: 0 }}>
        {filters.map((filter) => (
          <Chip
            key={filter.key}
            icon={<Iconify icon={filter.icon} />}
            label={`${filter.label} ${counts[filter.key]}`}
            color={activeFilter === filter.key ? 'primary' : 'default'}
            variant={activeFilter === filter.key ? 'filled' : 'outlined'}
            onClick={() => onFilterChange(filter.key)}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Box>
      {activeFilter !== 'all' && (
        <Button size="small" onClick={() => onFilterChange('all')} sx={{ flexShrink: 0 }}>
          Clear
        </Button>
      )}
    </Stack>
  );
}
