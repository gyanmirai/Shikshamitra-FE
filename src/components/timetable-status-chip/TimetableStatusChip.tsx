'use client';

import type { ChipProps } from '@mui/material';
import type { TimetableSettingStatus } from 'src/utils/timetable-capacity';

import { Chip } from '@mui/material';
import { TIMETABLE_STATUS_LABEL, normalizeTimetableStatus } from 'src/utils/timetable-capacity';

const STATUS_COLOR: Record<TimetableSettingStatus, ChipProps['color']> = {
  Balanced: 'success',
  FreeSlotsAvailable: 'info',
  PendingWeeklyLectures: 'warning',
  PendingSlotSetup: 'warning',
  OverCapacity: 'error',
};

interface TimetableStatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  /** Accepts the raw API value too — the backend enum serializes as a number. */
  status: TimetableSettingStatus | number | string;
}

export function TimetableStatusChip({ status, ...chipProps }: TimetableStatusChipProps) {
  const normalized = normalizeTimetableStatus(status);
  if (!normalized) return null;

  return (
    <Chip
      size="small"
      variant="soft"
      color={STATUS_COLOR[normalized]}
      label={TIMETABLE_STATUS_LABEL[normalized]}
      sx={{ fontWeight: 600, fontSize: '0.72rem' }}
      {...chipProps}
    />
  );
}
