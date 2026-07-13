'use client';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Button, Typography } from '@mui/material';

import type { AcademicCommandAction } from './types';

type AcademicCommandHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdatedLabel: string;
  isBusy: boolean;
  actions: AcademicCommandAction[];
  onRefresh: () => void;
};

export function AcademicCommandHeader({
  eyebrow,
  title,
  description,
  lastUpdatedLabel,
  isBusy,
  actions,
  onRefresh,
}: AcademicCommandHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      alignItems={{ xs: 'stretch', lg: 'flex-start' }}
      justifyContent="space-between"
      spacing={1.5}
    >
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip size="small" icon={<Iconify icon="mdi:school-outline" />} label={eyebrow} />
          <Chip size="small" variant="outlined" label={lastUpdatedLabel} />
        </Stack>
        <Typography variant="h4" sx={{ mt: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
          {description}
        </Typography>
      </Box>

      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" justifyContent="flex-end">
        <Button
          size="small"
          variant="outlined"
          onClick={onRefresh}
          disabled={isBusy}
          startIcon={<Iconify icon="solar:refresh-linear" />}
          sx={{ minHeight: 36 }}
        >
          {isBusy ? 'Refreshing' : 'Refresh'}
        </Button>
        {actions.map((action) => (
          <Button
            key={action.label}
            component={action.href ? Link : 'button'}
            href={action.href}
            size="small"
            variant={action.variant || 'outlined'}
            startIcon={<Iconify icon={action.icon} />}
            sx={{ minHeight: 36 }}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
