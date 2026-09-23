'use client';

import type { ReactNode } from 'react';
import type { Division, Standards } from 'src/types/school';

import { Box, Card } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

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
  actions?: ReactNode;
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
  actions,
}: ElectiveContextBarProps) {
  return (
    <Card variant="outlined" sx={{ p: 1, mb: 1, boxShadow: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', lg: 'center' },
          gap: 1,
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: 1, lg: 'auto' },
            flexShrink: 0,
          }}
        >
          <CustomSelect
            label="Class"
            options={allClass}
            value={classes}
            labelKey="name"
            valueKey="id"
            onChange={(v) => onClassChange(v as string)}
            formControlProps={{ sx: { minWidth: { xs: 1, sm: 180 } } }}
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
            formControlProps={{ sx: { minWidth: { xs: 1, sm: 180 } } }}
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
            formControlProps={{ sx: { minWidth: { xs: 1, sm: 210 } } }}
          />
        </Box>

        {actions && (
          <Box
            role="group"
            aria-label="Elective assignment context actions"
            sx={{
              display: 'flex',
              flex: 1,
              minWidth: 0,
              justifyContent: 'flex-end',
              width: { xs: 1, lg: 'auto' },
              ml: { lg: 'auto' },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Card>
  );
}
