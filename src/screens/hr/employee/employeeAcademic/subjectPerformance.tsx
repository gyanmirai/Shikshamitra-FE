'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Alert, Stack, Typography } from '@mui/material';

const CourseProgress = () => (
  <Box>
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Iconify icon="solar:chart-2-linear" width={24} />
        <Box>
          <Typography variant="subtitle2">Subject performance is not connected.</Typography>
          <Alert severity="info" sx={{ mt: 1 }}>
            Staff subject performance will appear here after it is backed by a real academic
            performance API.
          </Alert>
        </Box>
      </Stack>
    </Card>
  </Box>
);

export default CourseProgress;
