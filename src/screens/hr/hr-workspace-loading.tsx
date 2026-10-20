'use client';

import { hrPaths } from 'src/constants/hr-menus';
import { Box, LinearProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export default function HRWorkspaceLoading({ heading = 'HR/Staff' }: { heading?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <CustomBreadcrumbs
        heading={heading}
        description="Loading your HR workspace."
        links={[{ name: 'HR/Staff', href: hrPaths.dashboard }, { name: heading }]}
      />
      <LinearProgress aria-label={`Loading ${heading}`} sx={{ mx: 1 }} />
    </Box>
  );
}
