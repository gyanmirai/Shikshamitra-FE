import React from 'react';
import { Box, Grid, Skeleton } from '@mui/material';

export const SubjectAssignmentFormSkeleton = () => (
  <Box sx={{ p: 2 }}>
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rounded" height={40} width="100%" />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rounded" height={40} width="100%" />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Skeleton variant="rounded" height={56} width="100%" />
      </Grid>
    </Grid>
  </Box>
);
export default SubjectAssignmentFormSkeleton;
