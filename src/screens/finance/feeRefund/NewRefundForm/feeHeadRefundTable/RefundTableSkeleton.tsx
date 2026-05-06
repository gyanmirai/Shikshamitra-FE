import React from 'react';
import { Box, Stack, Skeleton } from '@mui/material';

const RefundTableSkeleton = (): React.ReactElement => (
  <Stack spacing={1.5}>
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 0.5 }} />
          <Skeleton variant="text" width={140} height={20} />
          <Skeleton variant="rectangular" width={80} height={18} sx={{ borderRadius: 0.5 }} />
          <Box flex={1} />
          <Skeleton variant="text" width={80} height={16} />
        </Box>
        {[1, 2, 3].map((j) => (
          <Box key={j} display="flex" alignItems="center" gap={1} px={1} py={0.5}>
            <Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" height={16} />
            </Box>
            {[80, 80, 80, 80, 110, 72].map((w, k) => (
              // eslint-disable-next-line react/no-array-index-key
              <Skeleton key={k} variant="text" width={w} height={16} />
            ))}
          </Box>
        ))}
      </Box>
    ))}
  </Stack>
);

export default RefundTableSkeleton;
