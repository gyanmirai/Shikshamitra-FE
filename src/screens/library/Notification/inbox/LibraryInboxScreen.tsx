'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Box, Alert } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { LibraryInboxContent } from './LibraryInboxContent';

export function LibraryInboxScreen() {
  const { user, sessionContext } = useSelector((state: RootState) => state.auth);
  const viewer =
    sessionContext?.accountMode === 'tenant' &&
    sessionContext.tenantId &&
    typeof user?.sub === 'string'
      ? `${sessionContext.tenantId}:${user.sub}`
      : null;
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Library Inbox"
        description="Read Library messages delivered to your verified school account associations."
        links={[{ name: 'Library Inbox' }]}
        sx={{ px: 1 }}
      />
      {viewer ? (
        <LibraryInboxContent key={viewer} viewer={viewer} />
      ) : (
        <Alert severity="info">Select a school account to use the Library inbox.</Alert>
      )}
    </Box>
  );
}
