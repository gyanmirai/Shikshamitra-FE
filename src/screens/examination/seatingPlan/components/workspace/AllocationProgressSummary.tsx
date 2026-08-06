import { Iconify } from 'src/components/iconify';
import { Box, Typography, LinearProgress } from '@mui/material';

interface Stat {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}

interface Props {
  totalStudents: number;
  allocatedCount: number;
  pendingCount: number;
  emptySeats: number;
  roomsUsed: number;
  utilization: number;
  conflicts: number;
  progress: number;
}

export default function AllocationProgressSummary({
  totalStudents,
  allocatedCount,
  pendingCount,
  emptySeats,
  roomsUsed,
  utilization,
  conflicts,
  progress,
}: Props) {
  const stats: Stat[] = [
    { label: 'Total Students', value: totalStudents, icon: 'mdi:account-group-outline', color: 'text.primary' },
    { label: 'Allocated', value: allocatedCount, icon: 'mdi:check-circle-outline', color: 'success.main' },
    { label: 'Pending', value: pendingCount, icon: 'mdi:clock-outline', color: 'warning.main' },
    { label: 'Empty Seats', value: emptySeats, icon: 'mdi:seat-outline', color: 'text.secondary' },
    { label: 'Rooms Used', value: roomsUsed, icon: 'mdi:door-open', color: 'text.secondary' },
    { label: 'Utilization', value: `${utilization}%`, icon: 'mdi:gauge', color: 'info.main' },
    {
      label: 'Conflicts',
      value: conflicts,
      icon: 'mdi:alert-circle-outline',
      color: conflicts > 0 ? 'error.main' : 'success.main',
    },
  ];

  const progressColor = conflicts > 0 ? 'error' : progress === 100 ? 'success' : 'warning';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexWrap: 'wrap',
      }}
    >
      {/* Metric badges container */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flex: 1 }}>
        {stats.map((s) => (
          <Box
            key={s.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.25,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Iconify icon={s.icon} width={16} sx={{ color: s.color }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {s.label}:
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: s.color }}>
              {s.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Explicitly labeled Progress Bar container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          minWidth: 240,
          maxWidth: 380,
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <Iconify icon="mdi:chart-donut" width={16} sx={{ color: 'primary.main' }} />
          <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ whiteSpace: 'nowrap' }}>
            Allocation Progress:
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 70 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progress))}
            color={progressColor as any}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          {allocatedCount}/{totalStudents} ({progress}%)
        </Typography>
      </Box>
    </Box>
  );
}
