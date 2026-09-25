'use client';

import type { ReactNode } from 'react';
import type { TimetableSettingStatus } from 'src/utils/timetable-capacity';

import { alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface CapacityBannerProps {
  status: TimetableSettingStatus;
  availableCapacity: number;
  requiredLectures: number;
  hasSlots: boolean;
}

const BANNER_CONFIG: Record<
  TimetableSettingStatus,
  { color: 'success' | 'info' | 'warning' | 'error'; icon: string }
> = {
  Balanced: { color: 'success', icon: 'mdi:check-circle-outline' },
  FreeSlotsAvailable: { color: 'info', icon: 'mdi:information-outline' },
  PendingWeeklyLectures: { color: 'warning', icon: 'mdi:clock-alert-outline' },
  PendingSlotSetup: { color: 'warning', icon: 'mdi:alert-outline' },
  OverCapacity: { color: 'error', icon: 'mdi:alert-circle-outline' },
};

export function CapacityBanner({
  status,
  availableCapacity,
  requiredLectures,
  hasSlots,
}: CapacityBannerProps) {
  const { color, icon } = BANNER_CONFIG[status];
  const remaining = availableCapacity - requiredLectures;

  let message: ReactNode;
  if (!hasSlots) {
    message =
      'Lecture Slots are not configured for this class. Please configure Lecture Slots first to calculate available capacity.';
  } else if (status === 'OverCapacity') {
    message = `Over capacity by ${Math.abs(remaining)} lecture${Math.abs(remaining) === 1 ? '' : 's'}. Please reduce subject lectures or increase Lecture Slots.`;
  } else if (status === 'FreeSlotsAvailable') {
    message = `${remaining} slot${remaining === 1 ? ' is' : 's are'} still free. You can use them for PT, Library, Activity, Remedial, or Class Teacher Period.`;
  } else if (status === 'Balanced') {
    message = 'All weekly lectures are balanced with available teaching slots.';
  } else {
    message = 'Weekly lectures not configured yet.';
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: (theme) =>
          alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
        border: (theme) => `1px solid ${alpha(theme.palette[color].main, 0.35)}`,
      }}
    >
      <Iconify icon={icon} width={20} sx={{ color: `${color}.main`, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color={`${color}.main`} fontWeight={600}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
}
