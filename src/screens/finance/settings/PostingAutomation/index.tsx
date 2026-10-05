'use client';

import { Box, Alert } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export default function PostingAutomation() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Accounts posting setup"
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Accounts settings' }]}
      />
      <Alert severity="info">
        Manage Income Categories, Expense Categories and Bank Accounts in Accounts settings. Select
        payment accounts on collections and refund approval. General journal posting is currently
        unavailable.
      </Alert>
    </Box>
  );
}
