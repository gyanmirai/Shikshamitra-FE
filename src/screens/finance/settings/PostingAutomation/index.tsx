'use client';

import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export default function PostingAutomation() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Accounts posting setup"
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Accounts settings' }]}
      />
    </Box>
  );
}
