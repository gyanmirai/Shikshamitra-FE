'use client';

import { Box, Alert } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export default function DraftPostingQueue() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Posting exceptions unavailable"
        description="An accounting exception queue will appear after automatic journals are implemented."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Accounts' },
          { name: 'Posting exceptions' },
        ]}
      />
      <Alert severity="info">
        There is no live draft-posting or exception API for this screen. No posting can be finalised
        here. Continue using the existing Fees and Accounts workflows until the journal service is
        released.
      </Alert>
    </Box>
  );
}
