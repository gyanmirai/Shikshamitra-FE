'use client';

import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { Box, Link, Button } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { formatDateOnly } from 'src/utils/date-only';
import { libraryPaths } from 'src/constants/library-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetTransferRegisterQuery } from 'src/redux/library/campus-transfer-api';

import { useCampusTransferAccess } from './useCampusTransferAccess';

const columns: IColumn[] = [
  {
    id: 'reason',
    label: 'Transfer',
    rowHeader: true,
    render: (reason: string, row: IData) => (
      <Link
        component={RouterLink}
        href={`${libraryPaths.campusTransfers}/${encodeURIComponent(row.id)}`}
      >
        {reason}
      </Link>
    ),
  },
  { id: 'source', label: 'From' },
  { id: 'destination', label: 'To' },
  { id: 'dispatchedOn', label: 'Dispatched', render: (value: string) => formatDateOnly(value) },
  { id: 'copyCount', label: 'Copies' },
  { id: 'pendingCount', label: 'In transit' },
].map((column) => ({ ...column, isFilter: false, isSort: false }));

export default function CampusTransferRegister() {
  const access = useCampusTransferAccess();
  const [params, setParams] = useState({ page: 1, pageSize: 25 });
  const query = useGetTransferRegisterQuery(params, {
    skip: !access.canRead,
    refetchOnMountOrArgChange: true,
  });
  const denied = Boolean(query.error && 'status' in query.error && query.error.status === 403);
  const data = access.canRead && !query.isError ? query.currentData : undefined;
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Campus Transfers"
        links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Campus Transfers' }]}
        sx={{ px: 1 }}
        action={
          access.canDispatch &&
          !denied && (
            <Button
              component={RouterLink}
              href={libraryPaths.campusTransferNew}
              variant="contained"
              size="small"
              color="inherit"
            >
              Dispatch copies
            </Button>
          )
        }
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="library-campus-transfers"
          columns={columns}
          data={
            data?.items.map(({ transfer, pendingCount }) => ({
              ...transfer,
              source: `${transfer.source.campus} / ${transfer.source.section}`,
              destination: `${transfer.destination.campus} / ${transfer.destination.section}`,
              pendingCount,
            })) ?? []
          }
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={query.isFetching && !data}
          isRefreshing={query.isFetching && Boolean(data)}
          error={
            query.isError
              ? denied
                ? 'Campus transfers require school-wide Library access.'
                : 'Could not load campus transfers.'
              : undefined
          }
          onRetry={() => query.refetch()}
          noDataText="No campus transfers have been recorded."
          isFilter={false}
          isSearch={false}
          showExport={false}
          serverSidePagination
          page={(data?.currentPage || params.page) - 1}
          rowsPerPage={params.pageSize}
          totalCount={data?.totalCount || 0}
          onServerPagination={(page, pageSize) =>
            setParams((previous) =>
              previous.page === page && previous.pageSize === pageSize
                ? previous
                : { page, pageSize }
            )
          }
          maxServerRowsPerPage={100}
        />
      </Box>
    </Box>
  );
}
