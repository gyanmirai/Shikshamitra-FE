import React from 'react';
import { Box, Paper, Stack, Skeleton } from '@mui/material';

const FeeStructureSkeleton = () => (
  <Stack spacing={1} sx={{ width: '100%' }}>
    {Array.from(new Array(3)).map((_, index) => (
      <Paper
        key={index}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 1.5,
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
        </Box>
        <Stack spacing={1}>
          <Skeleton variant="rectangular" width="100%" height={40} />
          <Skeleton variant="rectangular" width="100%" height={40} />
        </Stack>
      </Paper>
    ))}
  </Stack>
);

export default FeeStructureSkeleton;
