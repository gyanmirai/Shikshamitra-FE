import React from 'react';
import { Box } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EffectivePreviewTab } from 'src/screens/hr/policies/components/EffectivePreviewTab';

const EffectivePreviewPage = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <CustomBreadcrumbs
      heading="Policy Impact"
      description="View effective policies for employees and groups"
      links={[
        { name: 'HR/Staff', href: hrPaths.dashboard },
        { name: 'Policies & Rules' },
        { name: 'Policy Impact' },
      ]}
    />
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, mt: 1 }}>
      <EffectivePreviewTab />
    </Box>
  </Box>
);

export default EffectivePreviewPage;
