'use client';

import { CalendarAuditAction, CALENDAR_AUDIT_ACTION_LABELS } from 'src/enums/academic-calendar';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Stack, Box, Typography } from '@mui/material';

/** Action icon + color mapping (kept consistent with the legacy screen). */
const ACTION_META: Record<
  CalendarAuditAction,
  {
    icon: string;
    colorKey: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'default';
  }
> = {
  [CalendarAuditAction.CalendarCreated]: { icon: 'mdi:calendar-plus', colorKey: 'success' },
  [CalendarAuditAction.CalendarUpdated]: { icon: 'mdi:calendar-edit', colorKey: 'info' },
  [CalendarAuditAction.CalendarPublished]: { icon: 'mdi:publish', colorKey: 'primary' },
  [CalendarAuditAction.CalendarArchived]: { icon: 'mdi:archive', colorKey: 'warning' },
  [CalendarAuditAction.DayAdded]: { icon: 'mdi:calendar-check', colorKey: 'success' },
  [CalendarAuditAction.DayUpdated]: { icon: 'mdi:calendar-edit', colorKey: 'info' },
  [CalendarAuditAction.DayDeleted]: { icon: 'mdi:calendar-remove', colorKey: 'error' },
  [CalendarAuditAction.EmergencyClosureDeclared]: { icon: 'mdi:alert-octagon', colorKey: 'error' },
  [CalendarAuditAction.ImpactResolved]: { icon: 'mdi:check-circle', colorKey: 'success' },
  [CalendarAuditAction.OverrideApplied]: { icon: 'mdi:shield-check', colorKey: 'secondary' },
};

interface Props {
  action: CalendarAuditAction;
  variant?: 'chip' | 'inline';
}

/** Action badge with icon + colored label. */
const AuditActionBadge = ({ action, variant = 'chip' }: Props) => {
  const theme = useTheme();
  const meta = ACTION_META[action] ?? { icon: 'mdi:history', colorKey: 'default' };
  const label = CALENDAR_AUDIT_ACTION_LABELS[action] ?? 'Unknown';
  const color =
    meta.colorKey === 'default' ? theme.palette.text.secondary : theme.palette[meta.colorKey].main;

  if (variant === 'inline') {
    return (
      <Stack direction="row" alignItems="center" gap={1.25}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            backgroundColor: alpha(color, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Iconify icon={meta.icon} width={18} sx={{ color }} />
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ color }}>
          {label}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 1.5,
        backgroundColor: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.18)}`,
        width: 'fit-content',
      }}
    >
      <Iconify icon={meta.icon} width={14} sx={{ color }} />
      <Typography variant="caption" fontWeight={700} sx={{ color }}>
        {label}
      </Typography>
    </Stack>
  );
};

export default AuditActionBadge;
