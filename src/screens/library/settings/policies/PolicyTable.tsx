import type { IColumn } from 'src/components/customizabaleTable/types';
import type { LibraryPolicyVersion } from 'src/redux/library/policy-types';

import { fDate } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';

import { PolicyStatus } from './PolicyStatus';
import { PolicyRowActions } from './PolicyRowActions';

import type { PolicyActionProps } from './PolicyRowActions';

export function PolicyTable({
  items,
  totalCount,
  page,
  pageSize,
  loading,
  refreshing,
  onPage,
  ...actions
}: PolicyActionProps & {
  items: LibraryPolicyVersion[];
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  refreshing: boolean;
  onPage: (page: number, size: number) => void;
}) {
  const columns: IColumn[] = [
    { id: 'name', label: 'Policy name', rowHeader: true },
    { id: 'role', label: 'Member role', render: (value) => (value === 0 ? 'Student' : 'Staff') },
    { id: 'version', label: 'Version', align: 'left', cellSx: { textAlign: 'right' } },
    {
      id: 'status',
      label: 'Status',
      render: (value: 0 | 1 | 2) => <PolicyStatus status={value} />,
    },
    { id: 'effectiveFrom', label: 'Effective from', render: (value) => fDate(value) },
    {
      id: 'effectiveTo',
      label: 'Effective through',
      render: (value) => (value ? fDate(value) : 'No end date'),
    },
    {
      id: 'actions',
      label: 'Actions',
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_, row) => <PolicyRowActions item={row as LibraryPolicyVersion} {...actions} />,
    },
  ];
  return (
    <CustomizableTable
      tableId="library-borrowing-policies"
      columns={columns.map((column) => ({ ...column, isSort: false, isFilter: false }))}
      data={items}
      serverSidePagination
      totalCount={totalCount}
      page={page - 1}
      rowsPerPage={pageSize}
      onServerPagination={onPage}
      isLoading={loading}
      isRefreshing={refreshing}
      isSearch={false}
      isFilter={false}
      showExport={false}
      noDataText="No borrowing policy versions for this academic year."
      getRowAction={(row) => ({
        label: `View ${row.name} version ${row.version}`,
        onClick: () => actions.onOpen(row.id, false),
      })}
    />
  );
}
