import type { LabelColor } from 'src/components/label';

import { Box, Stack } from '@mui/material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import type { Academic360Kpi, Academic360Health } from '../types';

type StudentAcademicHeaderBadgesProps = {
  health?: Academic360Health | null;
  kpis?: Academic360Kpi[];
};

const trendMeta = (trend?: string): { icon: string; color: LabelColor; label: string } => {
  const normalized = (trend || '').toLowerCase();
  if (normalized.includes('improv') || normalized.includes('up')) {
    return { icon: 'mdi:trending-up', color: 'success', label: 'Improving' };
  }
  if (normalized.includes('declin') || normalized.includes('down') || normalized.includes('drop')) {
    return { icon: 'mdi:trending-down', color: 'error', label: 'Declining' };
  }
  return { icon: 'mdi:trending-neutral', color: 'default', label: trend || 'Monitoring' };
};

const badgeSx = {
  height: 'auto',
  minHeight: 28,
  px: 1,
  py: 0.5,
  fontSize: 12,
  lineHeight: 1.5,
  borderRadius: 1,
  gap: 0.5,
};

export function StudentAcademicHeaderBadges({ health, kpis }: StudentAcademicHeaderBadgesProps) {
  const attendance = kpis?.find((kpi) => kpi.key === 'attendance')?.displayValue || 'No data';
  const trend = trendMeta(health?.trend);
  const healthStatusColor: LabelColor =
    health?.status?.toLowerCase().includes('support') || health?.status?.toLowerCase().includes('urgent')
      ? 'warning'
      : health?.score && health.score >= 75
        ? 'success'
        : 'info';

  return (
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
      <Label
        variant="soft"
        color="default"
        startIcon={<Iconify icon="mdi:calendar-check-outline" />}
        sx={badgeSx}
      >
        <Box component="span" sx={{ fontWeight: 500 }}>Attendance:</Box>
        <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{attendance}</Box>
      </Label>
      <Label
        variant="soft"
        color={trend.color}
        startIcon={<Iconify icon={trend.icon} />}
        sx={badgeSx}
      >
        <Box component="span" sx={{ fontWeight: 500 }}>Trend:</Box>
        <Box component="span" sx={{ fontWeight: 600, ...(trend.color === 'default' && { color: 'text.primary' }) }}>
          {health?.trend || trend.label}
        </Box>
      </Label>
      {health?.status && (
        <Label
          variant="soft"
          color={healthStatusColor}
          startIcon={<Iconify icon="mdi:heart-pulse" />}
          sx={{ ...badgeSx, fontWeight: 600 }}
        >
          {health.status}
        </Label>
      )}
    </Stack>
  );
}
