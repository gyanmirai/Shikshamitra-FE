'use client';

import type { Division, Standards } from 'src/types/school';

import { Box, Card, Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import { StudentAcademicSummaryCards } from './StudentAcademicSummaryCards';

import type { Academic360ListSummary } from '../types';
import type { AcademicSmartFilter } from '../listUtils';

type Props = {
  classes: Standards[];
  divisions: Division[];
  selectedClass: string;
  selectedDivision: string;
  onClassChange: (value: string) => void;
  onDivisionChange: (value: string) => void;
  summary?: Academic360ListSummary;
  activeFilter: AcademicSmartFilter;
  onFilterChange: (filter: AcademicSmartFilter) => void;
};

export function StudentAcademic360Filters({
  classes,
  divisions,
  selectedClass,
  selectedDivision,
  onClassChange,
  onDivisionChange,
  summary,
  activeFilter,
  onFilterChange,
}: Props) {
  return (
    <Card sx={{ p: 1, mb: 1, flexShrink: 0 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ minWidth: 0 }}>
          <CustomSelect
            options={[{ id: 'ALL', name: 'All Classes' }, ...classes]}
            label="Class"
            value={selectedClass}
            onChange={(value) => onClassChange(value as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: { md: 240 } } }}
          />
          <CustomSelect
            options={[{ id: 'ALL', name: 'All Divisions' }, ...divisions]}
            label="Division"
            value={selectedDivision}
            onChange={(value) => onDivisionChange(value as string)}
            labelKey="name"
            valueKey="id"
            disabled={selectedClass === 'ALL' || divisions.length === 0}
            formControlProps={{ sx: { minWidth: { md: 220 } } }}
          />
        </Stack>
        <Box sx={{ flexShrink: 0 }}>
          <StudentAcademicSummaryCards
            summary={summary}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
          />
        </Box>
      </Stack>
    </Card>
  );
}
