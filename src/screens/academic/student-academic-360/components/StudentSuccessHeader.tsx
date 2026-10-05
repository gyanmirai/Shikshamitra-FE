'use client';

import type { LabelColor } from 'src/components/label';

import { Box, Stack } from '@mui/material';
import { RegistrationStatusType, RegistrationStatusTypeColor } from 'src/enums/registration-status-type';

import { StudentSuccessIdentity } from './StudentSuccessIdentity';
import { StudentSuccessNavigation } from './StudentSuccessNavigation';

import type { Academic360Kpi, Academic360Health, Academic360StudentRow } from '../types';

export type StudentSuccessHeaderProps = {
  student: Academic360StudentRow;
  health?: Academic360Health | null;
  kpis?: Academic360Kpi[];
  currentIndex: number;
  totalStudents: number;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
};

export function StudentSuccessHeader({
  student,
  health,
  kpis,
  currentIndex,
  totalStudents,
  onPrevious,
  onNext,
  onClose,
  canGoPrevious,
  canGoNext,
}: StudentSuccessHeaderProps) {
  const rawStatus = student.operationalStatus ?? student.status;
  let statusLabel = 'Active';
  let statusColor: LabelColor = 'success';

  if (rawStatus !== undefined && rawStatus !== null) {
    if (typeof rawStatus === 'number') {
      statusLabel = RegistrationStatusType[rawStatus] || 'Active';
      statusColor = (RegistrationStatusTypeColor[rawStatus as RegistrationStatusType] as LabelColor) || 'success';
    } else if (typeof rawStatus === 'string') {
      const parsed = Number(rawStatus);
      if (!Number.isNaN(parsed)) {
        statusLabel = RegistrationStatusType[parsed] || 'Active';
        statusColor = (RegistrationStatusTypeColor[parsed as RegistrationStatusType] as LabelColor) || 'success';
      } else {
        statusLabel = rawStatus;
        const found = Object.values(RegistrationStatusType).indexOf(rawStatus);
        if (found !== -1) {
          statusColor = (RegistrationStatusTypeColor[found as RegistrationStatusType] as LabelColor) || 'success';
        }
      }
    }
  }

  return (
    <Box
      sx={{
        p: 1.5,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        {/* Left: Avatar & Identity Details */}
        <StudentSuccessIdentity student={student} health={health} kpis={kpis} statusLabel={statusLabel} statusColor={statusColor} />

        {/* Right: Academic Health Gauge & Navigation Controls */}
        <StudentSuccessNavigation
          health={health}
          currentIndex={currentIndex}
          totalStudents={totalStudents}
          onPrevious={onPrevious}
          onNext={onNext}
          onClose={onClose}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      </Stack>
    </Box>
  );
}
