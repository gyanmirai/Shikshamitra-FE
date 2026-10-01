'use client';

import { Box, Alert } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export default function PostingAutomation() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Accounting mappings unavailable"
        description="Accounting rules cannot be edited until backend posting and audit controls are ready."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Accounts settings' },
          { name: 'Accounting mappings' },
        ]}
      />
      <Alert severity="info">
        No accounting mapping changes can be saved here yet. Existing Fees and Accounts transactions
        continue to use their current behavior; this page does not change postings.
      </Alert>
    </Box>
  );
}
