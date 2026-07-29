'use client';

import type { Division, Standards } from 'src/types/school';

import { Card, Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import type { StudentOption } from '../utils';

type Student360FilterBarProps = {
  classItems: Standards[];
  selectedClassId: string;
  divisionOptions: Division[];
  selectedDivisionId: string;
  studentOptions: StudentOption[];
  selectedStudentId: string;
  isStudentsLoading: boolean;
  onClassChange: (value: string) => void;
  onDivisionChange: (value: string) => void;
  onStudentChange: (value: string) => void;
};

export function Student360FilterBar({
  classItems,
  selectedClassId,
  divisionOptions,
  selectedDivisionId,
  studentOptions,
  selectedStudentId,
  isStudentsLoading,
  onClassChange,
  onDivisionChange,
  onStudentChange,
}: Student360FilterBarProps) {
  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
        <CustomSelect
          label="Class"
          options={classItems}
          labelKey="name"
          valueKey="id"
          onChange={(val) => onClassChange(val as string)}
          value={selectedClassId}
          formControlProps={{ sx: { maxWidth: { md: 220 } } }}
        />
        <CustomSelect
          label="Division"
          disabled={!selectedClassId}
          labelKey="name"
          valueKey="id"
          options={divisionOptions}
          value={selectedDivisionId}
          onChange={(val) => onDivisionChange(val as string)}
          formControlProps={{ sx: { maxWidth: { md: 220 } } }}
        />
        <CustomSelect
          label="Student"
          options={studentOptions}
          value={selectedStudentId}
          isSearch
          isLoading={isStudentsLoading}
          disabled={!selectedDivisionId || isStudentsLoading}
          onChange={(val) => onStudentChange(val as string)}
          noOptionsMessage={
            selectedDivisionId
              ? 'No students found in this division'
              : 'Select a class and division first'
          }
          formControlProps={{ sx: { maxWidth: { md: 320 } } }}
        />
      </Stack>
    </Card>
  );
}
