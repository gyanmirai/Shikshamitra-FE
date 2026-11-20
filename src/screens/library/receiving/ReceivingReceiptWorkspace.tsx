'use client';

import { libraryPaths } from 'src/constants/library-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Alert, Button, LinearProgress } from '@mui/material';
import { useGetLibraryStockReceiptQuery } from 'src/redux/library/receiving-api';

import { useReceivingAccess } from './useReceivingAccess';
import { ReceivingReceiptView } from './ReceivingReceiptView';

export default function ReceivingReceiptWorkspace({ id }: { id: string }) {
  const access = useReceivingAccess();
  const query = useGetLibraryStockReceiptQuery(
    { id },
    { skip: !access.canRead, refetchOnMountOrArgChange: true }
  );
  return (
    <Box sx={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Receiving Receipt"
        description="Review the recorded stock source, receipt date and copies created by this saved receipt."
        links={[
          { name: 'Library', href: libraryPaths.dashboard },
          { name: 'Stock Receiving', href: libraryPaths.receiving },
          { name: 'Receiving Receipt' },
        ]}
        sx={{ px: 1 }}
      />
      <Stack spacing={2} sx={{ p: 1 }}>
        {query.isFetching && <LinearProgress aria-label="Loading saved receiving receipt" />}
        {!access.canRead ? (
          <Alert severity="info">
            Receiving and catalogue read access are required to view this receipt.
          </Alert>
        ) : query.isError ? (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            The saved receiving receipt could not be loaded.
          </Alert>
        ) : query.currentData ? (
          <ReceivingReceiptView receipt={query.currentData} />
        ) : null}
      </Stack>
    </Box>
  );
}
