'use client';

import { libraryPaths } from 'src/constants/library-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Stack, Button, LinearProgress } from '@mui/material';
import { useGetStockImportBatchQuery } from 'src/redux/library/stock-import-api';

import { useReceivingAccess } from '../useReceivingAccess';
import { StockImportBatchView } from './StockImportBatchView';

export default function StockImportDetail({ id }: { id: string }) {
  const access = useReceivingAccess();
  const query = useGetStockImportBatchQuery(id, {
    skip: !access.canRead,
    refetchOnMountOrArgChange: true,
  });
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Stock Import Batch"
        links={[
          { name: 'Library', href: libraryPaths.dashboard },
          { name: 'Stock Receiving', href: libraryPaths.receiving },
          { name: 'Stock Imports', href: libraryPaths.receivingImports },
          { name: 'Stock Import Batch' },
        ]}
        sx={{ px: 1 }}
      />
      <Stack spacing={1} sx={{ flex: 1, p: 1, minHeight: 0, overflow: 'auto' }}>
        {query.isFetching && <LinearProgress aria-label="Loading saved stock import" />}
        {query.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Could not load this stock import.
          </Alert>
        )}
        {access.canRead && !query.isError && query.currentData && (
          <StockImportBatchView result={query.currentData} />
        )}
      </Stack>
    </Box>
  );
}
