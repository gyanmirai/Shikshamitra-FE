import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Card, Skeleton, CardContent } from '@mui/material';

export const ViewSubjectSkeleton = () => {
  const theme = useTheme();

  return (
    <Grid container spacing={1} sx={{ height: '100%' }}>
      {/* Sidebar Skeleton */}
      <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>
        <Card
          sx={{
            height: '100%',
            p: 2,
            boxShadow: 'var(--shadows-10)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              pb: 2,
              mb: 2,
              borderBottom: `1px dashed ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <Box>
                <Skeleton variant="text" width={140} height={24} />
                <Skeleton variant="text" width={180} height={20} sx={{ mt: 0.5 }} />
              </Box>
              <Skeleton variant="rounded" width={72} height={24} sx={{ borderRadius: 1 }} />
            </Box>
          </Box>

          <Skeleton variant="text" width={60} height={16} sx={{ mb: 1, px: 1 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {[...Array(4)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 1.5,
                }}
              >
                <Skeleton variant="circular" width={8} height={8} />
                <Skeleton variant="text" width={`${60 + i * 10}%`} height={20} />
              </Box>
            ))}
          </Box>
        </Card>
      </Grid>

      {/* Content Skeleton */}
      <Grid size={{ xs: 12, md: 9 }} sx={{ height: '100%' }}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadows-10)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Tabs Skeleton */}
          <Box
            sx={{
              px: 2,
              pt: 2,
              bgcolor: () => varAlpha(theme.palette.grey['500Channel'], 0.04),
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, pb: 1.5 }}>
              {[100, 80, 100].map((w, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={w}
                  height={36}
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box>
          </Box>

          {/* Overview Content Skeleton */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 3 }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ boxShadow: 'var(--shadows-10)', borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" width={140} height={28} sx={{ mb: 3 }} />
                    <Grid container spacing={1}>
                      {[...Array(4)].map((_, i) => (
                        <Grid size={{ xs: 12, sm: i < 2 ? 6 : 12 }} key={i}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Skeleton
                              variant="rounded"
                              width={40}
                              height={40}
                              sx={{ borderRadius: 1.5, flexShrink: 0 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Skeleton variant="text" width={80} height={16} sx={{ mb: 0.5 }} />
                              <Skeleton
                                variant="text"
                                width={i >= 2 ? '100%' : '70%'}
                                height={20}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ boxShadow: 'var(--shadows-10)', borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" width={120} height={28} sx={{ mb: 3 }} />

                    <Skeleton variant="text" width={100} height={14} sx={{ mb: 2 }} />
                    <Skeleton
                      variant="rounded"
                      width="100%"
                      height={52}
                      sx={{ borderRadius: 1.5, mb: 4 }}
                    />

                    <Skeleton variant="text" width={120} height={14} sx={{ mb: 2 }} />
                    <Skeleton
                      variant="rounded"
                      width="100%"
                      height={52}
                      sx={{ borderRadius: 1.5 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};
