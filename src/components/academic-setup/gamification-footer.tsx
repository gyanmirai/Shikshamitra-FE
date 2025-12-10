import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Paper, Typography, LinearProgress } from '@mui/material';

import { Iconify } from '../iconify';

interface GamificationFooterProps {
  overallProgress: number;
  incompleteStandards: number;
  streakDays: number;
}

export const GamificationFooter: React.FC<GamificationFooterProps> = ({
  overallProgress,
  incompleteStandards,
  streakDays,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderRadius: 0,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        px: 3,
        py: 1.5,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={4}>
        {/* Overall Progress */}
        <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="subtitle2" color="text.primary">
              Overall Academic Readiness
            </Typography>
            <Typography variant="subtitle2" color="success.main" fontWeight="bold">
              {overallProgress}% ✅
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            color="success"
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: varAlpha(theme.palette.success.mainChannel, 0.16),
            }}
          />
        </Box>

        {/* Stats & Badges */}
        <Stack direction="row" spacing={3} alignItems="center">
          {/* Incomplete Standards */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="eva:alert-triangle-fill" color="warning.main" width={24} />
            <Box>
              <Typography variant="h6" lineHeight={1}>
                {incompleteStandards}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Incomplete Standards
              </Typography>
            </Box>
          </Box>

          {/* Streak Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: 2,
              bgcolor: varAlpha(theme.palette.error.mainChannel, 0.08),
              border: `1px solid ${varAlpha(theme.palette.error.mainChannel, 0.24)}`,
            }}
          >
            <Iconify icon="solar:fire-bold" color="error.main" width={20} />
            <Typography variant="subtitle2" color="error.main">
              {streakDays}-Day Setup Streak
            </Typography>
          </Box>

          {/* Completion Badge */}
          {overallProgress === 100 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.5,
                borderRadius: 2,
                bgcolor: varAlpha(theme.palette.warning.mainChannel, 0.08),
                border: `1px solid ${varAlpha(theme.palette.warning.mainChannel, 0.24)}`,
              }}
            >
              <Iconify icon="solar:cup-star-bold" color="warning.main" width={20} />
              <Typography variant="subtitle2" color="warning.main">
                All Set!
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
