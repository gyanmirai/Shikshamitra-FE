'use client';

import { Box, LinearProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export default function HRWorkspaceLoading({ heading = 'HR Workspace' }: { heading?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <CustomBreadcrumbs
        heading={heading}
        description="Loading your HR workspace."
        links={[{ name: heading }]}
      />
      <LinearProgress aria-label={`Loading ${heading}`} sx={{ mx: 1 }} />
    </Box>
  );
}
