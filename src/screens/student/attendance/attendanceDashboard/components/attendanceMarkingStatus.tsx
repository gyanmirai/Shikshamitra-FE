import React from 'react';
import { Iconify } from 'src/components/iconify';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Box, Card, Stack, Divider, Typography, LinearProgress } from '@mui/material';

const AttendanceStatusCard = () => {
  const totalClasses = 0;
  const completedClasses = 0;
  const completionPercentage =
    totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6">Attendance Marking Status</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="body2">Classes Completed </Typography>
        <strong>
          {completedClasses} of {totalClasses} ({completionPercentage}%)
        </strong>
      </Box>

      <LinearProgress
        variant="determinate"
        value={completionPercentage}
        sx={{ mt: 1, mb: 2, height: 8, borderRadius: 2 }}
        color="success"
      />

      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <SummaryCard
          title="Completed"
          count={0}
          icon="mdi:tick-circle"
          color="primary"
          labels={[
            { name: 'Boys', color: 'info' },
            { name: 'Girls', color: 'secondary' },
          ]}
        />

        <SummaryCard
          title="Pending"
          count={0}
          icon="mdi:clock"
          color="warning"
          labels={[
            { name: 'Boys', color: 'info' },
            { name: 'Girls', color: 'secondary' },
          ]}
        />
      </Stack>

      <Box
        sx={{
          mt: 2,
          p: 1.5,
          bgcolor: 'warning.lighter',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <WarningAmberRoundedIcon color="warning" fontSize="small" />
        <Typography variant="body2" color="text.secondary">
          No attendance marking summary found.
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" color="text.secondary">
        Last updated: Not available
      </Typography>
    </Card>
  );
};

export default AttendanceStatusCard;

type LabelType = {
  name: string;
  color: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'default';
};

interface SummaryCardProps {
  title: string;
  count: number | string;
  icon: string;
  color?: string;
  labels?: LabelType[];
  onClick?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  count,
  icon,
  color = 'primary.main',
  labels = [],
  onClick,
}) => (
  <Card
    onClick={onClick}
    sx={{
      p: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 5,
      flexGrow: 1,
      cursor: 'pointer',
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: 'var(--shadows-8)',
        transform: 'scale(1.03)',
      },
      bgcolor: `${color}.lighter`,
      border: `1px solid ${color}`,
    }}
  >
    <Iconify
      icon={icon}
      sx={{
        height: 46,
        width: 46,
        color: `${color}.main`,
      }}
    />
    <Box>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="h3">{count}</Typography>
    </Box>
  </Card>
);
