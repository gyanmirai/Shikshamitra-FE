'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { libraryPaths } from 'src/constants/library-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Alert, Stack, Button, Typography } from '@mui/material';

import { useReceivingHistory } from './useReceivingHistory';
import { ReceivingHistoryFilters } from './ReceivingHistoryFilters';
import { receivingHistoryColumns } from './receiving-history-columns';

export default function ReceivingHistoryWorkspace({ copyId }: { copyId?: string }) {
  const { access, query, criteria, update, paginate } = useReceivingHistory(copyId);
  const data = query.isError ? undefined : query.currentData;
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Stock Receiving"
        description="Review recorded receipts across school years. Search matches stored supplier or donor names and external references."
        links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Stock Receiving' }]}
        sx={{ px: 1 }}
        action={
          access.canRead && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ rowGap: 1 }}>
              <Button
                component={RouterLink}
                href={libraryPaths.receivingImports}
                variant="outlined"
                color="inherit"
                size="small"
              >
                Stock imports
              </Button>
              {access.canReceive && (
                <Button
                  component={RouterLink}
                  href={libraryPaths.receivingNew}
                  variant="contained"
                  color="inherit"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                >
                  Receive copies
                </Button>
              )}
            </Stack>
          )
        }
      />
      {copyId && (
        <Stack direction="row" spacing={1} sx={{ px: 1, py: 1, minWidth: 0 }}>
          <Chip label={`Copy ID: ${copyId}`} size="small" />
          <Button component={RouterLink} href={libraryPaths.receiving} size="small" color="inherit">
            All receipts
          </Button>
        </Stack>
      )}
      <ReceivingHistoryFilters criteria={criteria} update={update} />
      <Typography variant="caption" color="text.secondary" sx={{ px: 1, pb: 1 }}>
        Receipt dates are school calendar dates. Recorded instants are shown in UTC.
      </Typography>
      {!access.canRead ? (
        <Alert severity="info">
          Receiving and catalogue read access are required to view the register.
        </Alert>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <CustomizableTable
            tableId="library-receiving-history"
            columns={receivingHistoryColumns}
            data={data?.items || []}
            wrapperProps={{ sx: { height: 1 } }}
            tableContainerProps={{ sx: { height: 1 } }}
            isLoading={query.isFetching && !data}
            isRefreshing={query.isFetching && Boolean(data)}
            error={query.isError ? 'Could not load receiving history.' : undefined}
            onRetry={() => query.refetch()}
            noDataText="No receiving records match these filters."
            isFilter={false}
            showExport={false}
            serverSidePagination
            page={criteria.page - 1}
            rowsPerPage={criteria.pageSize}
            totalCount={data?.totalCount || 0}
            onServerPagination={paginate}
            maxServerRowsPerPage={100}
            serverSideSearch
            searchTerm={criteria.search || ''}
            onServerSearch={(search) => update({ search: search || undefined })}
          />
        </Box>
      )}
    </Box>
  );
}
