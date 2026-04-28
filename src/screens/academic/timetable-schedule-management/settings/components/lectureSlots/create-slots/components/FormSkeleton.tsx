import React from 'react';
import { Box, Grid, Stack, Divider, Skeleton } from '@mui/material';

const FormSkeleton: React.FC = () => (
  <Box
    sx={{
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      p: 2,
      pb: 10,
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 200px)',
      position: 'relative',
    }}
  >
    <Box sx={{ width: '100%', mb: 2 }}>
      <Skeleton variant="text" width={200} height={32} />
    </Box>

    <Grid container spacing={2}>
      {[0, 1, 2].map((i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <Skeleton variant="rounded" height={40} />
        </Grid>
      ))}
    </Grid>

    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 1 }}>
      <Skeleton variant="rounded" width={90} height={32} />
    </Box>

    {[0, 1].map((i) => (
      <Box
        key={i}
        sx={{
          boxShadow: 1,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          mt: 2,
          p: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          sx={{ flexWrap: 'wrap', width: '100%', mb: 2 }}
        >
          {[120, 140, 160].map((w, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: w }}>
              <Skeleton variant="circular" width={18} height={18} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={14} />
                <Skeleton variant="text" width="80%" height={18} />
              </Box>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                px: 2,
                pt: 1,
                pb: 2,
                borderRadius: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                  }`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={100} height={20} />
              </Box>
              <Skeleton variant="rounded" height={20} sx={{ mt: 2 }} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Skeleton variant="rounded" height={40} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={200} />
          </Grid>
        </Grid>
      </Box>
    ))}
  </Box>
);

export default FormSkeleton;
