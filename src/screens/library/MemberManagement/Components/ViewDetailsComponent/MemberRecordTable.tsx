import type {
  MemberRecordPage,
  MemberRecordKind,
} from 'src/redux/library/libraryMembers/member-record-types';

import { Box, Alert } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { memberRecordColumns } from './member-record-columns';

const titles = {
  borrowed: 'Borrowed Books',
  reserved: 'Reserved Books',
  history: 'Borrow History',
};
export function MemberRecordTable({
  kind,
  query,
  pagination,
}: {
  kind: MemberRecordKind;
  query: {
    currentData?: MemberRecordPage;
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
      <CustomizableTable
        tableId={`library-member-${kind}-records`}
        tableTitle={titles[kind]}
        columns={memberRecordColumns(kind)}
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
        noDataText="No visible member records were found."
        isSearch={false}
        isFilter
        showExport={false}
      />
    </Box>
  );
}
