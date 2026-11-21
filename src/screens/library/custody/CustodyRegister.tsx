'use client';

import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Link, Button } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { formatDateOnly } from 'src/utils/date-only';
import { libraryPaths } from 'src/constants/library-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetCustodyListQuery } from 'src/redux/library/custody-api';

import { useCustodyAccess } from './useCustodyAccess';

const columns: IColumn[] = [
  {
    id: 'purpose',
    label: 'Handoff',
    rowHeader: true,
    render: (purpose: string, row: IData) => (
      <Link component={RouterLink} href={`${libraryPaths.custody}/${encodeURIComponent(row.id)}`}>
        {purpose}
      </Link>
    ),
  },
  { id: 'custodian', label: 'Custodian' },
  { id: 'className', label: 'Class' },
  { id: 'roomName', label: 'Room' },
  { id: 'handedOffOn', label: 'Handed off', render: (value: string) => formatDateOnly(value) },
  {
    id: 'expectedReturnOn',
    label: 'Expected return',
    render: (value: string | null) => formatDateOnly(value),
  },
  { id: 'copyCount', label: 'Copies' },
  { id: 'pendingCount', label: 'Outstanding' },
].map((column) => ({ ...column, isFilter: false, isSort: false }));

export default function CustodyRegister() {
  const access = useCustodyAccess();
  const [params, setParams] = useState({ page: 1, pageSize: 25 });
  const query = useGetCustodyListQuery(params, {
    skip: !access.canRead,
    refetchOnMountOrArgChange: true,
  });
  const data = access.canRead && !query.isError ? query.currentData : undefined;
  const scopeDenied = Boolean(query.error && 'status' in query.error && query.error.status === 403);
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Classroom Custody"
        links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Classroom Custody' }]}
        sx={{ px: 1 }}
        action={
          access.canHandoff &&
          !scopeDenied && (
            <Button
              component={RouterLink}
              href={libraryPaths.custodyNew}
              variant="contained"
              size="small"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            >
              Hand off copies
            </Button>
          )
        }
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="library-classroom-custody"
          columns={columns}
          data={
            data?.items.map(({ handoff, pendingCount }) => ({ ...handoff, pendingCount })) || []
          }
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={query.isFetching && !data}
          isRefreshing={query.isFetching && Boolean(data)}
          error={
            query.isError
              ? scopeDenied
                ? 'Reviewing classroom custody requires school-wide Library access.'
                : 'Could not load classroom custody records.'
              : undefined
          }
          onRetry={() => query.refetch()}
          noDataText="No classroom handoffs have been recorded."
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
