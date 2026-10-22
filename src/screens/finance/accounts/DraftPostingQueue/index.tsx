'use client';

import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export default function DraftPostingQueue() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        description="An accounting exception queue will appear after automatic journals are implemented."
        heading="Posting exceptions unavailable"

        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Accounts' },
          { name: 'Posting exceptions' },
        ]}
      />
    </Box>
  );
}
