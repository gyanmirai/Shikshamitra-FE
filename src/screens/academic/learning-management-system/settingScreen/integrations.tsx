'use client';

import React from 'react';
import { Box, Button, Switch, Typography } from '@mui/material';

const Integrations = () => (
  <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Typography variant="h6">Integrations</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Switch />
      <Typography>Google Classroom</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Switch />
      <Typography>Microsoft Teams</Typography>
    </Box>
    <Button color="secondary" variant="contained" sx={{ maxWidth: '250px', width: '100%' }}>
      Add Integration
    </Button>
  </Box>
);

export default Integrations;
