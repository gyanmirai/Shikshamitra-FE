import type { MemberChargePage } from 'src/redux/library/libraryMembers/member-charge-types';

import { Box, Alert, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { memberChargeColumns } from './member-charge-columns';

export function MemberChargeTable({
  query,
  pagination,
}: {
  query: {
    currentData?: MemberChargePage;
    isFetching: boolean;
    isError: boolean;
    error?: unknown;
    refetch: () => unknown;
  };
  pagination: {
    canView: boolean;
    skip: boolean;
    page: number;
    pageSize: number;
    onPage: (page: number, pageSize: number) => void;
  };
}) {
  if (!pagination.canView)
    return <Alert severity="info">You do not have permission to view member records.</Alert>;
  if (pagination.skip)
    return <Alert severity="info">Select a saved member to view these records.</Alert>;
  const data = query.isError ? undefined : query.currentData;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ pb: 1 }}>
        History spans authorized recorded academic years. Local declarations do not prove
        settlement.
      </Typography>
      <CustomizableTable
        tableId="library-member-charge-records"
        tableTitle="Member Charge History"
        variant="embedded"
        columns={memberChargeColumns}
        data={data?.items || []}
        wrapperProps={{ sx: { height: 1 } }}
        tableContainerProps={{ sx: { height: 1 } }}
        page={pagination.page - 1}
        rowsPerPage={pagination.pageSize}
        totalCount={data?.totalCount || 0}
        serverSidePagination
        onServerPagination={pagination.onPage}
        isLoading={query.isFetching && !data}
        isRefreshing={query.isFetching && Boolean(data)}
        error={query.error}
        onRetry={() => query.refetch()}
        noDataText="No visible member charge records were found."
        isSearch={false}
        isFilter
        showExport={false}
      />
    </Box>
  );
}
