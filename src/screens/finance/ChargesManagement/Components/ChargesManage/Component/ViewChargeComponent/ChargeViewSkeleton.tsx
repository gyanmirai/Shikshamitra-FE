import React from 'react';
import { Box, Grid, Paper, Stack, Skeleton } from '@mui/material';

const ChargeViewSkeleton = () => (
  <Box display="flex" flexDirection="column" gap={1} height="100%">
    <Box sx={{ height: '100%', p: 2 }}>
      <Grid container spacing={2}>
        {/* Basic Charge Accordion Skeleton */}
        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              border: '1px solid #eee',
              borderRadius: 1,
              p: 2,
              width: '100%',
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Skeleton variant="text" width="30%" height={32} />
              <Skeleton variant="circular" width={24} height={24} />
            </Box>
            <Stack spacing={1.5}>
              <Skeleton variant="rectangular" width="100%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={40} />
            </Stack>
          </Paper>
        </Grid>

        {/* Charge Details Card Skeleton */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            sx={{
              border: '1px solid #eee',
              borderRadius: 1,
              p: 2,
              width: '100%',
            }}
          >
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Skeleton variant="rectangular" width="100%" height={50} />
              <Skeleton variant="rectangular" width="100%" height={50} />
              <Skeleton variant="rectangular" width="100%" height={50} />
              <Skeleton variant="rectangular" width="100%" height={50} />
            </Stack>
          </Paper>
        </Grid>

        {/* Requestor Info Card Skeleton */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              border: '1px solid #eee',
              borderRadius: 1,
              p: 2,
              width: '100%',
            }}
          >
            <Skeleton variant="text" width="50%" height={28} sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Skeleton variant="rectangular" width="100%" height={50} />
              <Skeleton variant="rectangular" width="100%" height={50} />
              <Skeleton variant="rectangular" width="100%" height={50} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  </Box>
);

export default ChargeViewSkeleton;
