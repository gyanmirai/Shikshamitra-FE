'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography, LinearProgress } from '@mui/material';

// ----------------------------------------------------------------------

const ATTENDANCE_DATA = {
  present: 28,
  absent: 4,
  total: 32,
  classAndSection: 'Class 10-A',
  date: 'Today',
};

// ----------------------------------------------------------------------

type AttendanceCardProps = {
  label: string;
  count: number;
  total: number;
  color: 'success' | 'error';
  icon: string;
  bgGradient: string;
};

function AttendanceCard({ label, count, total, color, icon, bgGradient }: AttendanceCardProps) {
  const theme = useTheme();
  const percentage = Math.round((count / total) * 100);
  const mainColor = theme.palette[color].main;
  const lighterColor = theme.palette[color].lighter;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          p: 2.5,
          height: '100%',
          borderRadius: '16px',
          background: bgGradient,
          border: `1px solid ${lighterColor}`,
          boxShadow: `0 4px 20px ${mainColor}1a`,
          '&:hover': { boxShadow: `0 8px 32px ${mainColor}2e`, transform: 'translateY(-2px)' },
          transition: 'all 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: `${mainColor}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon={icon} width={24} sx={{ color: mainColor }} />
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: '20px',
              bgcolor: `${mainColor}15`,
              border: `1px solid ${mainColor}40`,
            }}
          >
            <Typography variant="caption" sx={{ color: mainColor, fontWeight: 700 }}>
              {percentage}%
            </Typography>
          </Box>
        </Stack>

        {/* Count */}
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: mainColor, lineHeight: 1 }}>
            {count}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
            {label}
          </Typography>
        </Box>

        {/* Progress bar */}
        <Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={color}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: `${mainColor}18`,
              '& .MuiLinearProgress-bar': { borderRadius: 3 },
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
            out of {total} students
          </Typography>
        </Box>
      </Card>
    </motion.div>
  );
}

// ----------------------------------------------------------------------

export default function TeacherAttendanceOverview() {
  const theme = useTheme();
  const { present, absent, total, classAndSection, date } = ATTENDANCE_DATA;

  return (
    <Box>
      {/* Section label */}
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Iconify
          icon="solar:users-group-two-rounded-bold"
          width={18}
          sx={{ color: 'text.secondary' }}
        />
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {date} Attendance — {classAndSection}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <AttendanceCard
            label="Students Present"
            count={present}
            total={total}
            color="success"
            icon="solar:user-check-bold-duotone"
            bgGradient={`linear-gradient(135deg, ${theme.palette.success.lighter}40 0%, #ffffff 100%)`}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <AttendanceCard
            label="Students Absent"
            count={absent}
            total={total}
            color="error"
            icon="solar:user-cross-bold-duotone"
            bgGradient={`linear-gradient(135deg, ${theme.palette.error.lighter}40 0%, #ffffff 100%)`}
          />
        </Box>
      </Stack>
    </Box>
  );
}
