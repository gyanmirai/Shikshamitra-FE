'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Box, Card, Grid, Stack, Paper, Skeleton } from '@mui/material';

export const ViewSubjectSkeleton = () => {
  const theme = useTheme();

  return (
    <Grid container spacing={1.5} sx={{ height: '100%', minHeight: 0 }}>
      {/* ── LEFT PANE: Navigator Skeleton ── */}
      <Grid size={{ xs: 12, md: 3.5, lg: 3 }} sx={{ height: '100%', minHeight: 0 }}>
        <Card
          sx={{
            height: '100%',
            p: 1.5,
            boxShadow: 'var(--shadows-4)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Header & Search */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Skeleton variant="text" width={100} height={24} />
            <Skeleton variant="rounded" width={32} height={20} sx={{ borderRadius: 1 }} />
          </Stack>

          <Skeleton variant="rounded" width="100%" height={34} sx={{ mb: 2, borderRadius: 1 }} />

          {/* Core Section */}
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1, px: 1 }}>
              <Skeleton variant="text" width={80} height={16} />
              <Skeleton variant="rounded" width={20} height={16} sx={{ borderRadius: 0.5 }} />
            </Stack>
            <Stack spacing={1}>
              {[...Array(4)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1.5,
                  }}
                >
                  <Skeleton variant="circular" width={10} height={10} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={`${65 + (i % 3) * 12}%`} height={18} />
                    <Skeleton variant="text" width={40} height={12} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Elective Section */}
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1, px: 1 }}>
              <Skeleton variant="text" width={100} height={16} />
              <Skeleton variant="rounded" width={20} height={16} sx={{ borderRadius: 0.5 }} />
            </Stack>
            <Stack spacing={1}>
              {[...Array(2)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Skeleton variant="circular" width={14} height={14} />
                    <Skeleton variant="text" width={110} height={18} sx={{ flex: 1 }} />
                    <Skeleton variant="rounded" width={18} height={16} sx={{ borderRadius: 0.5 }} />
                  </Stack>
                  <Box sx={{ pl: 2 }}>
                    <Skeleton variant="text" width="80%" height={16} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Card>
      </Grid>

      {/* ── RIGHT PANE: Workspace Skeleton ── */}
      <Grid size={{ xs: 12, md: 8.5, lg: 9 }} sx={{ height: '100%', minHeight: 0 }}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadows-4)',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          }}
        >
          {/* Header Skeleton */}
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.neutral',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
              <Skeleton variant="text" width={220} height={32} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={56} height={28} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" width={76} height={32} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" width={76} height={32} sx={{ borderRadius: 1 }} />
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rounded" width={74} height={22} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rounded" width={120} height={22} sx={{ borderRadius: 1 }} />
            </Stack>
          </Box>

          {/* Tabs Skeleton */}
          <Box
            sx={{
              px: 2,
              pt: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              gap: 2,
            }}
          >
            <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: '4px 4px 0 0' }} />
            <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: '4px 4px 0 0' }} />
            <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: '4px 4px 0 0' }} />
          </Box>

          {/* Body Content Skeleton */}
          <Box sx={{ flexGrow: 1, p: 2, overflow: 'hidden' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={2}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                    <Skeleton variant="text" width={140} height={24} sx={{ mb: 1.5 }} />
                    <Grid container spacing={2}>
                      {[...Array(4)].map((_, i) => (
                        <Grid size={{ xs: 6, sm: 3 }} key={i}>
                          <Skeleton variant="text" width={60} height={14} />
                          <Skeleton variant="text" width={80} height={20} />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {[...Array(3)].map((_, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="text" width={120} height={20} />
                      </Stack>
                      <Skeleton variant="text" width="100%" height={18} />
                      <Skeleton variant="text" width="75%" height={18} />
                    </Paper>
                  ))}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                  <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
                  <Skeleton variant="rounded" width={100} height={20} sx={{ mb: 1.5, borderRadius: 1 }} />
                  <Skeleton variant="rounded" width="100%" height={64} sx={{ mb: 3, borderRadius: 1.5 }} />
                  <Skeleton variant="rounded" width={110} height={20} sx={{ mb: 1.5, borderRadius: 1 }} />
                  <Skeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: 1.5 }} />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default React.memo(ViewSubjectSkeleton);
