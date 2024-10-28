import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Typography } from '@mui/material';

const PastFeedback = (props: TabComponentType) => (
  <Box sx={{ flexGrow: 1, p: 3 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h6">Past Feedback</Typography>
    </Box>
  </Box>
);

export default PastFeedback;
