'use client';

import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Skeleton, Typography, CircularProgress } from '@mui/material';

import type { ClassShiftInfo } from '../utils/classShiftTiming';

interface ClassTimingStatusProps {
  isLoading: boolean;
  message: string;
  shift: ClassShiftInfo | null;
}

export default function ClassTimingStatus({ isLoading, message, shift }: ClassTimingStatusProps) {
  return (
    <Alert
      severity={isLoading || shift ? 'info' : 'warning'}
      icon={
        isLoading ? (
          <CircularProgress size={20} color="inherit" aria-hidden="true" />
        ) : (
          <Iconify icon={shift ? 'mdi:clock-check-outline' : 'mdi:clock-alert-outline'} />
        )
      }
      aria-busy={isLoading}
      sx={{
        minHeight: 68,
        borderRadius: 1.5,
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      <Typography variant="body2" fontWeight={600}>
        Class Timing
      </Typography>
      {isLoading ? (
        <Stack spacing={0.25} role="status" aria-live="polite">
          <Typography variant="caption" color="text.secondary">
            Refreshing class timing…
          </Typography>
          <Skeleton variant="text" sx={{ width: { xs: '80%', sm: 280 } }} />
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          {message}
        </Typography>
      )}
    </Alert>
  );
}
