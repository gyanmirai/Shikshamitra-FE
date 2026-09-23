'use client';

import type { ReactNode } from 'react';
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Box, Stack, Typography, LinearProgress } from '@mui/material';

import type { DetailSectionAccent } from './LessonDiaryDetailSection';

export function DetailTileGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 1,
      }}
    >
      {children}
    </Box>
  );
}

type DetailTileProps = {
  label: string;
  value?: string | number | null;
  wide?: boolean;
};

export function DetailTile({ label, value, wide = false }: DetailTileProps) {
  const displayValue = value === null || value === undefined || value === '' ? '-' : value;

  return (
    <Box
      role="group"
      aria-label={label}
      sx={{
        p: 1.25,
        minHeight: 64,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        gridColumn: { sm: wide ? '1 / -1' : 'auto' },
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'pre-wrap' }}>
        {displayValue}
      </Typography>
    </Box>
  );
}

type ProgressTileProps = {
  label: string;
  value?: number | null;
  accent?: DetailSectionAccent;
};

export function ProgressTile({ label, value, accent = 'primary' }: ProgressTileProps) {
  return (
    <Box
      role="group"
      aria-label={label}
      sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} color={`${accent}.dark`}>
          {value ?? 0}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value ?? 0}
        color={accent}
        sx={{ height: 6, borderRadius: 1, bgcolor: 'action.hover' }}
      />
    </Box>
  );
}

const getStatusColor = (status: string): LabelColor => {
  const normalizedStatus = status.toLowerCase().replaceAll(' ', '');

  if (['approved', 'submitted', 'completed', 'conducted'].includes(normalizedStatus)) {
    return 'success';
  }
  if (['rejected', 'failed', 'missed'].includes(normalizedStatus)) return 'error';
  if (['pending', 'draft', 'changesrequested', 'inreview'].includes(normalizedStatus)) {
    return 'warning';
  }

  return 'default';
};

export function StatusBadge({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Label variant="soft" color={getStatusColor(value)}>
        {value}
      </Label>
    </Stack>
  );
}
