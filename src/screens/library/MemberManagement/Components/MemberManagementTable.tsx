import { useMemo } from 'react';
import { Box, Alert } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { useMemberRosterPage } from './useMemberRosterPage';
import { memberRosterColumns } from './member-roster-columns';

import type { IMemberTableProps } from './type';

export default function MemberManagementTable({ onView }: IMemberTableProps) {
  const roster = useMemberRosterPage();
  /**
   * Memoization Justification: Stable definitions avoid restarting the shared
   * table's column reconciliation and width measurements on request updates.
   */
  const columns = useMemo(() => memberRosterColumns(onView), [onView]);
  if (!roster.canView)
    return <Alert severity="info">Library member access is required to view this roster.</Alert>;
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomizableTable
        tableId="member-table"
        tableTitle="Library Members"
        columns={columns}
        data={roster.currentData?.items || []}
        wrapperProps={{ sx: { height: 1 } }}
        tableContainerProps={{ sx: { height: 1 } }}
        noDataText="No Library members match this search."
        isLoading={roster.loading}
        isRefreshing={roster.refreshing}
        error={roster.error}
        onRetry={roster.retry}
        serverSidePagination
        page={roster.page - 1}
        rowsPerPage={roster.pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        maxServerRowsPerPage={100}
        totalCount={roster.currentData?.totalCount || 0}
        onServerPagination={roster.onPage}
        paginationDisabled={roster.paginationDisabled}
        serverSideSearch
        searchTerm={roster.search}
        onSearchInputChange={roster.onSearch}
        searchFieldProps={{ placeholder: 'First/last name or contact' }}
        isFilter={false}
        showColumns
        showFullScreen
        showExport={false}
      />
    </Box>
  );
}
