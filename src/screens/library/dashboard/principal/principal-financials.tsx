import React from 'react';
import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import { alpha, useTheme } from '@mui/material/styles';
import { linearProgressClasses } from '@mui/material/LinearProgress';
import { Box, Card, Stack, Divider, Typography, LinearProgress } from '@mui/material';

// ----------------------------------------------------------------------

export default function PrincipalFinancials() {
  const theme = useTheme();

  // Mock Data
  const collectionRate = 85;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* TOP ROW: REVENUE VS METRICS */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={3}
        >
          {/* LEFT: REVENUE */}
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.1 }}
            >
              Monthly Fine Revenue
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: -1 }}>
              {fCurrency(12500)}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
              <Iconify icon="solar:arrow-up-bold" width={16} sx={{ color: 'success.main' }} />
              <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 700 }}>
                +12%
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                vs last month
              </Typography>
            </Stack>
          </Box>

          {/* RIGHT: METRICS SNAPSHOT */}
          <Stack
            direction="row"
            spacing={3}
            divider={
              <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />
            }
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                85%
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Collection Rate
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                15%
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Pending Ratio
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* BOTTOM: PROGRESS GOAL */}
        <Box sx={{ mt: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Collection Efficiency Goal
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {collectionRate}% / 100%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={collectionRate}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.grey[500], 0.08),
              [`& .${linearProgressClasses.bar}`]: {
                borderRadius: 4,
                bgcolor: 'success.main',
              },
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}
