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

const ScheduleExamKpiStrip = ({ summary, rows = [] }: ScheduleExamKpiStripProps) => {
  const nextSevenDays = dayjs().add(7, 'day').endOf('day');
  const upcomingFallback = rows.filter((row) => {
    if (!row.startDate) return false;
    const startDate = dayjs(row.startDate);
    return !startDate.isBefore(dayjs().startOf('day')) && startDate.isBefore(nextSevenDays);
  }).length;

  const cards = [
    {
      label: 'Draft Exams',
      value: summary?.pendingCount ?? rows.filter((row) => row.status === examScheduledStatus.Pending).length,
      icon: 'solar:document-text-bold-duotone',
      color: 'warning.main',
    },
    {
      label: 'Published',
      value: summary?.publishedCount ?? rows.filter((row) => row.status === examScheduledStatus.Published).length,
      icon: 'solar:cloud-upload-bold-duotone',
      color: 'info.main',
    },
    {
      label: 'Upcoming 7 Days',
      value: summary?.upcomingCount ?? upcomingFallback,
      icon: 'solar:calendar-mark-bold-duotone',
      color: 'primary.main',
    },
    {
      label: 'Unassigned Rooms',
      value: summary?.unassignedRoomsCount ?? rows.filter((row) => row.missingRoomAssignmentCount > 0).length,
      icon: 'fluent:conference-room-24-filled',
      color: 'error.main',
    },
    {
      label: 'Needs Attention',
      value: summary?.needsAttentionCount ?? rows.filter((row) => row.issueCount > 0).length,
      icon: 'solar:danger-triangle-bold-duotone',
      color: 'error.main',
    },
    {
      label: 'Completed',
      value: summary?.completedCount ?? rows.filter((row) => row.status === examScheduledStatus.Completed).length,
      icon: 'solar:verified-check-bold-duotone',
      color: 'success.main',
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
      {cards.map((card) => (
        <Card key={card.label} sx={kpiCardSx}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
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
