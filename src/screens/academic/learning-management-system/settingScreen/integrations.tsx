'use client';

import React from 'react';
import { Box, Button, Switch, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const Integrations = () => (
  <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
    <CustomBreadcrumbs
      heading="Integrations"
      description="Manage integrations for the learning management system."
      links={[
        { name: 'Academics', href: '/academic/dashboard' },
        {
          name: 'Learning Management System',
          href: '/academic/lmsDashboard/',
        },
        { name: 'Settings' },

        { name: 'Integrations' },
      ]}
    />
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
