'use client';

import type { Division, Standards } from 'src/types/school';

import CustomSelect from 'src/components/custom-select';
import { Box, Card, Divider, Typography } from '@mui/material';

import type { StudentElectiveRow } from '../types';

interface ElectiveContextBarProps {
  allClass: Standards[];
  classes: string;
  onClassChange: (value: string) => void;

  allDivision: Division[];
  division: string;
  onDivisionChange: (value: string) => void;

  electiveGroups: { id: string; name: string }[];
  electiveGroupId: string;
  onElectiveGroupChange: (value: string) => void;

  isLoading?: boolean;
  students: StudentElectiveRow[];
}

export default function ElectiveContextBar({
  allClass,
  classes,
  onClassChange,
  allDivision,
  division,
  onDivisionChange,
  electiveGroups,
  electiveGroupId,
  onElectiveGroupChange,
  isLoading,
  students,
}: ElectiveContextBarProps) {
  const subjectNames = students[0]?.selectableSubjects?.map((s) => s.subjectName) ?? [];
  const groupName = electiveGroups.find((g) => g.id === electiveGroupId)?.name;

  return (
    <Card sx={{ p: 2, mb: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <CustomSelect
          label="Class"
          options={allClass}
          value={classes}
          labelKey="name"
          valueKey="id"
          onChange={(v) => onClassChange(v as string)}
          formControlProps={{ sx: { minWidth: '200px' } }}
        />

        <CustomSelect
          label="Division"
          options={allDivision}
          value={division}
          labelKey="name"
          valueKey="id"
          isLoading={isLoading}
          disabled={!classes}
          onChange={(v) => onDivisionChange(v as string)}
          formControlProps={{ sx: { minWidth: '200px' } }}
        />

        <CustomSelect
          label="Elective Group"
          value={electiveGroupId}
          onChange={(v) => onElectiveGroupChange(v as string)}
          labelKey="name"
          valueKey="id"
          isLoading={isLoading}
          options={electiveGroups}
          disabled={!division}
          formControlProps={{ sx: { minWidth: '220px' } }}
        />
      </Box>

      {groupName && subjectNames.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="body2" color="text.secondary">
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {groupName}
            </Box>{' '}
            · {students.length} student{students.length === 1 ? '' : 's'} · Subjects:{' '}
            {subjectNames.join(', ')}
          </Typography>
        </>
      )}
    </Card>
  );
}
