'use client';

import dayjs from 'dayjs';
import { Box, Chip } from '@mui/material';

import type { AuditFilterValues } from '../types/financeAudit.types';

interface AuditActiveFiltersProps {
  filters: AuditFilterValues;
  onFilterChange: <K extends keyof AuditFilterValues>(key: K, value: AuditFilterValues[K]) => void;
  onClearStudent: () => void;
}

const AuditActiveFilters = ({
  filters,
  onFilterChange,
  onClearStudent,
}: AuditActiveFiltersProps) => {
  const chips: { key: string; label: string; onDelete: () => void }[] = [];

  if (filters.selectedStudentLabel) {
    chips.push({
      key: 'student',
      label: `Student: ${filters.selectedStudentLabel}`,
      onDelete: onClearStudent,
    });
  }

  if (filters.search.trim()) {
    chips.push({
      key: 'keyword',
      label: `Keyword: "${filters.search.trim()}"`,
      onDelete: () => onFilterChange('search', ''),
    });
  }

  if (filters.subModule && filters.subModule !== 'All Modules') {
    chips.push({
      key: 'subModule',
      label: `Module: ${filters.subModule}`,
      onDelete: () => onFilterChange('subModule', ''),
    });
  }

  if (filters.action && filters.action !== 'All Actions') {
    chips.push({
      key: 'action',
      label: `Action: ${filters.action}`,
      onDelete: () => onFilterChange('action', ''),
    });
  }

  if (filters.startDate) {
    chips.push({
      key: 'startDate',
      label: `From: ${dayjs(filters.startDate).format('DD/MM/YYYY')}`,
      onDelete: () => onFilterChange('startDate', null),
    });
  }

  if (filters.endDate) {
    chips.push({
      key: 'endDate',
      label: `To: ${dayjs(filters.endDate).format('DD/MM/YYYY')}`,
      onDelete: () => onFilterChange('endDate', null),
    });
  }

  if (filters.correlationId) {
    chips.push({
      key: 'correlation',
      label: `Thread: ${filters.correlationId.slice(0, 8)}…`,
      onDelete: () => onFilterChange('correlationId', ''),
    });
  }

  if (chips.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          size="small"
          onDelete={chip.onDelete}
          color={chip.key === 'student' ? 'primary' : 'default'}
          variant="soft"
        />
      ))}
    </Box>
  );
};

export default AuditActiveFilters;
