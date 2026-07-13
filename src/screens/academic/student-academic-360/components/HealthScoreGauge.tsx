'use client';

import { Box, Typography, CircularProgress } from '@mui/material';

type HealthScoreGaugeProps = {
  score?: number | null;
  size?: number;
  thickness?: number;
};

const scoreColor = (score?: number | null): 'success' | 'warning' | 'error' | 'inherit' => {
  if (score === null || score === undefined) return 'inherit';
  if (score >= 75) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
};

export function HealthScoreGauge({ score, size = 88, thickness = 4.5 }: HealthScoreGaugeProps) {
  const hasScore = score !== null && score !== undefined;
  const color = scoreColor(score);

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: (theme) => theme.palette.grey[500], opacity: 0.16 }}
      />
      <CircularProgress
        variant="determinate"
        value={hasScore ? Math.min(100, Math.max(0, score as number)) : 0}
        size={size}
        thickness={thickness}
        color={color === 'inherit' ? undefined : color}
        sx={{
          position: 'absolute',
          left: 0,
          ...(color === 'inherit' && { color: 'text.disabled' }),
          '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" sx={{ lineHeight: 1 }}>
          {hasScore ? score : '-'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
          / 100
        </Typography>
      </Box>
    </Box>
  );
}
