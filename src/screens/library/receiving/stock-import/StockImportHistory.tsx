'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Link, Button } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { libraryPaths } from 'src/constants/library-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetStockImportsQuery } from 'src/redux/library/stock-import-api';

import { useReceivingAccess } from '../useReceivingAccess';
import { receivingSources } from '../receiving-field-state';

const columns: IColumn[] = [
  {
    id: 'importedAt',
    label: 'Imported at (UTC)',
    render: (value: string) => new Date(value).toLocaleString(undefined, { timeZone: 'UTC' }),
  },
  {
    id: 'source',
    label: 'Stock source',
    render: (value: number) => receivingSources.find((option) => option.id === value)?.name,
  },
  { id: 'sourceName', label: 'Supplier or donor' },
  { id: 'rowCount', label: 'Copies' },
  { id: 'newTitleCount', label: 'New titles' },
  {
    id: 'id',
    label: 'Batch',
    render: (id: string) => (
      <Link
        component={RouterLink}
        href={`${libraryPaths.receivingImports}/${encodeURIComponent(id)}`}
      >
        View batch
      </Link>
    ),
  },
].map((column) => ({ ...column, isSort: false, isFilter: false }));

export default function StockImportHistory() {
  const access = useReceivingAccess();
  const [params, setParams] = useState({ page: 1, pageSize: 25 });
  const query = useGetStockImportsQuery(params, {
    skip: !access.canRead,
    refetchOnMountOrArgChange: true,
  });
  const data = access.canRead && !query.isError ? query.currentData : undefined;
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Stock Imports"
        links={[
          { name: 'Library', href: libraryPaths.dashboard },
          { name: 'Stock Receiving', href: libraryPaths.receiving },
          { name: 'Stock Imports' },
        ]}
        sx={{ px: 1 }}
        action={
          access.canReceive && (
            <Button
              component={RouterLink}
              href={libraryPaths.receivingImportNew}
              variant="contained"
              color="inherit"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            >
              Import stock
            </Button>
          )
        }
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="library-stock-import-history"
          columns={columns}
          data={data?.items || []}
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={query.isFetching && !data}
          isRefreshing={query.isFetching && Boolean(data)}
          error={query.isError ? 'Could not load stock import history.' : undefined}
          onRetry={() => query.refetch()}
          noDataText="No stock imports have been committed."
          isFilter={false}
          isSearch={false}
          showExport={false}
          serverSidePagination
          page={(data?.currentPage || params.page) - 1}
          rowsPerPage={params.pageSize}
          totalCount={data?.totalCount || 0}
          onServerPagination={(page, pageSize) => setParams({ page, pageSize })}
          maxServerRowsPerPage={100}
        />
      </Box>
    </Box>
  );
}
