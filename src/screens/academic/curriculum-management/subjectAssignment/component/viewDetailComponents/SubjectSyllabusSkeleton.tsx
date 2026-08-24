import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

export const SubjectSyllabusSkeleton = () => (
  <Box sx={{ height: '100%', p: 1 }}>
    <Scrollbar sx={{ height: '100%', pb: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[...Array(5)].map((_, index) => (
          <Box
            key={index}
            sx={{
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                minHeight: 64,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton
                  variant="rounded"
                  width={40}
                  height={40}
                  sx={{ borderRadius: 1, mr: 2, flexShrink: 0 }}
                />
                <Box>
                  <Skeleton variant="text" width={80} height={16} />
                  <Skeleton variant="text" width={180} height={22} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
              <Skeleton variant="circular" width={20} height={20} />
            </Box>
          </Box>
        ))}
      </Box>
    </Scrollbar>
  </Box>
);
export default SubjectSyllabusSkeleton;
