import type { LibraryNamedOption } from 'src/redux/library/policy-types';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';
import type { LibraryCalendarClosure } from 'src/redux/library/calendar-types';

import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

export function ClosureTable({
  items,
  sections,
  canEdit,
  totalCount,
  page,
  pageSize,
  loading,
  refreshing,
  onPage,
  onEdit,
  onDelete,
}: {
  items: LibraryCalendarClosure[];
  sections: LibraryNamedOption[];
  canEdit: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  refreshing: boolean;
  onPage: (page: number, size: number) => void;
  onEdit: (item: LibraryCalendarClosure) => void;
  onDelete: (item: LibraryCalendarClosure) => void;
}) {
  const columns: IColumn[] = [
    { id: 'fromDate', label: 'Closed from', render: (value) => fDate(value) },
    { id: 'toDate', label: 'Closed through', render: (value) => fDate(value) },
    {
      id: 'sectionId',
      label: 'Library section',
      render: (id) => (id ? sections.find((section) => section.id === id)?.name || id : 'All'),
    },
    { id: 'reason', label: 'Reason', rowHeader: true },
    ...(canEdit
      ? [
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            excludeFromExport: true,
            sticky: true,
            stickyPosition: 'right' as const,
            render: (_: unknown, row: IData) => (
              <AdaptiveThreeDotsActions
                directActionLimit={2}
                collapseOnOverflow={false}
                moreLabel={`More actions for closure ${row.reason}`}
                sx={{ justifyContent: 'flex-end' }}
                actions={[
                  {
                    id: 'edit',
                    label: `Edit closure ${row.reason}`,
                    icon: GlobalIcons.edit,
                    onClick: () => onEdit(row as LibraryCalendarClosure),
                  },
                  {
                    id: 'delete',
                    label: `Delete closure ${row.reason}`,
                    icon: GlobalIcons.delete,
                    color: 'error.main',
                    onClick: () => onDelete(row as LibraryCalendarClosure),
                  },
                ]}
              />
            ),
          },
        ]
      : []),
  ];
  return (
    <CustomizableTable
      tableId="library-calendar-closures"
      data={items}
      columns={columns.map((column) => ({ ...column, isSort: false, isFilter: false }))}
      totalCount={totalCount}
      serverSidePagination
      page={page - 1}
      rowsPerPage={pageSize}
      onServerPagination={onPage}
      isLoading={loading}
      isRefreshing={refreshing}
      isSearch={false}
      isFilter={false}
      showExport={false}
      noDataText="No dated Library closures have been configured."
    />
  );
}
