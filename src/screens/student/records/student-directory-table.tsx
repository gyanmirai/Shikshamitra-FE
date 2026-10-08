import type { useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';

import { Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { directoryColumns } from './student-directory-columns';

type Props = {
  hasFilters: boolean;
  query: ReturnType<typeof useGetStudentRecordsDirectoryQuery>;
  page: number;
  pageSize: number;
  search: string;
  sorting: string;
  update: (values: Record<string, string | number | undefined>) => void;
};
export default function StudentDirectoryTable({
  hasFilters,
  query,
  page,
  pageSize,
  search,
  sorting,
  update,
}: Props) {
  return (
    <CustomizableTable
      tableId="student-records-directory"
      tableTitle="Student Directory"
      columns={directoryColumns}
      data={query.currentData?.items ?? []}
      totalCount={query.currentData?.totalCount ?? 0}
      isLoading={query.isLoading || (query.isFetching && !query.currentData)}
      isFilter={false}
      serverSidePagination
      serverSideSearch
      serverSideSort
      serverSideSortMode="single"
      page={page}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[10, 25, 50, 100]}
      searchTerm={search}
      sorts={
        sorting
          ? [
              {
                column: sorting.startsWith('grNumber') ? 'grNumber' : 'name',
                direction: sorting.endsWith('desc') ? 'desc' : 'asc',
              },
            ]
          : []
      }
      onServerPagination={(nextPage, rowsPerPage) =>
        update({ page: rowsPerPage === pageSize ? nextPage : 0, pageSize: rowsPerPage })
      }
      onServerSearch={(value) => {
        if (value !== search) update({ search: value || undefined, page: 0 });
      }}
      onServerSort={(_column, sorts) =>
        update({
          sort: sorts.length ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
          page: 0,
        })
      }
      searchFieldProps={{
        placeholder: 'Search name or GR number',
        inputProps: { 'aria-label': 'Search student directory' },
      }}
      noDataText={
        <Typography variant="body2">
          {query.isError
            ? 'Retry to load students.'
            : hasFilters
              ? 'No students match these filters. Use Clear filters to widen this view.'
              : 'No students are available in this school scope. Complete onboarding to add them to the directory.'}
        </Typography>
      }
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 }, 'aria-label': 'Student Directory' }}
    />
  );
}
