import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';

type ScheduleExamKpiStripProps = {
  summary?: any;
  rows?: any[];
};

const kpiCardSx = {
  minWidth: 180,
  flex: '1 1 180px',
  p: 1.5,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none',
};

const parseDate = (dateStr: any) => {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && /^\d{2}-\d{2}-\d{4}/.test(dateStr)) {
    const parts = dateStr.split('-');
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    if (year > 1000 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const parsed = dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      return parsed.isValid() ? parsed : null;
    }
  }
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed : null;
};

const ScheduleExamKpiStrip = ({ summary, rows = [] }: ScheduleExamKpiStripProps) => {
  const todayStart = dayjs().startOf('day');
  const nextSevenDays = dayjs().add(7, 'day').endOf('day');

  const upcomingFallback = rows.filter((row) => {
    const startDate = parseDate(row.startDate);
    if (!startDate) return false;
    return !startDate.isBefore(todayStart) && startDate.isBefore(nextSevenDays);
  }).length;

  const unassignedRoomsFallback = rows.filter(
    (row) => (row.missingRoomAssignmentCount ?? 0) > 0
  ).length;

  const needsAttentionFallback = rows.filter(
    (row) => (row.issueCount ?? 0) > 0 || (row.missingRoomAssignmentCount ?? 0) > 0
  ).length;

  const getMetricValue = (apiCount: any, fallbackCount: number) => {
    if (typeof apiCount === 'number') {
      return apiCount;
    }
    return fallbackCount;
  };

  const cards = [
    {
      label: 'Draft Exams',
      value: getMetricValue(
        summary?.pendingCount,
        rows.filter((row) => row.status === examScheduledStatus.Pending).length
      ),
      icon: 'solar:document-text-bold-duotone',
      color: 'warning.main',
    },
    {
      label: 'Published',
      value: getMetricValue(
        summary?.publishedCount,
        rows.filter((row) => row.status === examScheduledStatus.Published).length
      ),
      icon: 'solar:cloud-upload-bold-duotone',
      color: 'info.main',
    },
    {
      label: 'Upcoming 7 Days',
      value: getMetricValue(summary?.upcomingCount, upcomingFallback),
      icon: 'solar:calendar-mark-bold-duotone',
      color: 'primary.main',
    },
    {
      label: 'Unassigned Rooms',
      value: getMetricValue(summary?.unassignedRoomsCount, unassignedRoomsFallback),
      icon: 'fluent:conference-room-24-filled',
      color: 'error.main',
    },
    {
      label: 'Needs Attention',
      value: getMetricValue(summary?.needsAttentionCount, needsAttentionFallback),
      icon: 'solar:danger-triangle-bold-duotone',
      color: 'error.main',
    },
    {
      label: 'Completed',
      value: getMetricValue(
        summary?.completedCount,
        rows.filter((row) => row.status === examScheduledStatus.Completed).length
      ),
      icon: 'solar:verified-check-bold-duotone',
      color: 'success.main',
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pb: 0.5 }}>
      {cards.map((card) => (
        <Card key={card.label} sx={kpiCardSx}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'background.neutral',
                color: card.color,
                flexShrink: 0,
              }}
            >
              <Iconify icon={card.icon} width={20} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ lineHeight: 1 }}>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {card.label}
              </Typography>
            </Box>
          </Stack>
        </Card>
      ))}
    </Box>
  );
};

export default ScheduleExamKpiStrip;
