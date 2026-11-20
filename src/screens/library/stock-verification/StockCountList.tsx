'use client';

import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { RouterLink } from 'src/routes/components';
import { formatDateOnly } from 'src/utils/date-only';
import { Box, Chip, Link, Button } from '@mui/material';
import { libraryPaths } from 'src/constants/library-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetStockCountsQuery } from 'src/redux/library/stock-verification-api';

import { stockCountStatus } from './stock-verification-labels';
import { useStockVerificationAccess } from './useStockVerificationAccess';

const columns: IColumn[] = [
  {
    id: 'name',
    label: 'Count',
    minWidth: 210,
    render: (value: string, row: IData) => (
      <Link
        component={RouterLink}
        href={`${libraryPaths.stockVerification}/${encodeURIComponent(row.id)}`}
      >
        {value}
      </Link>
    ),
  },
  { id: 'schoolDate', label: 'School date', render: (value: string) => formatDateOnly(value) },
  { id: 'expectedCopyCount', label: 'Expected copies' },
  { id: 'observationCount', label: 'Scans recorded' },
  {
    id: 'status',
    label: 'Status',
    render: (value: number) => <Chip size="small" label={stockCountStatus(value)} />,
  },
].map((column) => ({ ...column, isSort: false, isFilter: false }));

export default function StockCountList() {
  const access = useStockVerificationAccess();
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
  const query = useGetStockCountsQuery(pagination, {
    skip: !access.canRead,
    refetchOnMountOrArgChange: true,
  });
  const data = query.isError ? undefined : query.currentData;

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Stock Verification"
        links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Stock Verification' }]}
        action={
          access.canOpen && (
            <Button
              component={RouterLink}
              href={libraryPaths.stockVerificationNew}
              size="small"
              variant="contained"
            >
              Open a count
            </Button>
          )
        }
        sx={{ px: 1 }}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="library-stock-counts"
          columns={columns}
          data={data?.items || []}
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={query.isFetching && !data}
          isRefreshing={query.isFetching && Boolean(data)}
          error={query.isError ? 'Could not load stock counts.' : undefined}
          onRetry={() => query.refetch()}
          noDataText="There are no stock counts in your assigned scope."
          isFilter={false}
          isSearch={false}
          showExport={false}
          serverSidePagination
          page={pagination.page - 1}
          rowsPerPage={pagination.pageSize}
          totalCount={data?.totalCount || 0}
          onServerPagination={(page, pageSize) => setPagination({ page, pageSize })}
          maxServerRowsPerPage={100}
        />
      </Box>
    </Box>
  );
}
