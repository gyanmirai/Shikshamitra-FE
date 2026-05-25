import React from 'react';
import { Box, Typography } from '@mui/material';

const KPISetup = () => (
  <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 1 }}>
    <Typography variant="subtitle1" fontWeight={600}>
      KPI setup is not available in this release.
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Professional Management currently supports review cycles, draft reviews, submitted reviews,
      and review history.
    </Typography>
  </Box>
);

export default KPISetup;
