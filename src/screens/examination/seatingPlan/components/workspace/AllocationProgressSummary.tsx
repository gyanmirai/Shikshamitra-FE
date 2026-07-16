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
        gap: 1,
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      {stats.map((s) => (
        <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Iconify icon={s.icon} width={15} sx={{ color: s.color }} />
          <Typography variant="caption" color="text.secondary">
            {s.label}:
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: s.color }}>
            {s.value}
          </Typography>
        </Box>
      ))}

      <Box sx={{ flex: 1, minWidth: 160, maxWidth: 320, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, progress))}
          color={progressColor as any}
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          {allocatedCount}/{totalStudents} · {progress}%
        </Typography>
      </Box>
    </Box>
  );
}
