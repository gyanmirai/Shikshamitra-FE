import type { IColumn } from 'src/components/customizabaleTable/types';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { GlobalIcons } from 'src/utils/icons';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Paper, Stack, Button, Typography } from '@mui/material';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import {
  useGetStudentRecordsDirectoryQuery,
  useGetStudentRecordsDirectoryOptionsQuery,
} from 'src/redux/student/records/student-records-api';

import { directoryScope } from './student-directory-scope';
import { directoryStudentName } from './student-directory-columns';
import { recordsQueryUrl, positivePageValue } from './records-url-state';
import StudentDirectoryAcademicFilters from './student-directory-academic-filters';
import {
  directoryTableFilters,
  directoryColumnFilters,
  serializeDirectoryFilters,
} from './student-directory-column-filters';

type Props = {
  academicYearId: string;
  canGenerateForStudent: (row: StudentDirectoryItem) => boolean;
  onGenerate: (row: StudentDirectoryItem) => void;
  historyHref: (studentId: string) => string;
};

export default function CertificateStudentRoster({
  academicYearId,
  canGenerateForStudent,
  onGenerate,
  historyHref,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const options = useGetStudentRecordsDirectoryOptionsQuery({ academicYearId });
  const scope = directoryScope(new URLSearchParams(params.toString()), options.currentData);
  const ready = scope.ready && !options.isError;
  const page = positivePageValue(params.get('page'), 0, 100000);
  const pageSize = Math.max(10, positivePageValue(params.get('pageSize'), 25, 100));
  const search = params.get('search') ?? '';
  const sort = params.get('sort');
  const sorting =
    sort && ['name asc', 'name desc', 'grNumber asc', 'grNumber desc'].includes(sort)
      ? sort
      : undefined;
  const columnFilters = directoryColumnFilters(params.get('columnFilters')).filter(
    ({ column }) => column === 'name' || column === 'grNumber' || column === 'rollNo'
  );
  const query = useGetStudentRecordsDirectoryQuery(
    {
      academicYearId,
      boardId: scope.board || undefined,
      mediumId: scope.medium || undefined,
      standardId: scope.classes[0],
      divisionId: scope.divisions[0],
      population: 'All',
      includeActiveStudentList: true,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
      search: search.trim() || undefined,
      sorting,
      columnFilters: columnFilters.length ? columnFilters : undefined,
    },
    { skip: !ready }
  );
  const update = (changes: Record<string, string | number | undefined>) => {
    const current = params.toString();
    const target = recordsQueryUrl(pathname, current, {
      ...changes,
      student: undefined,
      year: undefined,
      type: undefined,
      certificate: undefined,
    });
    if (target !== `${pathname}${current ? `?${current}` : ''}`) {
      router.push(target, { scroll: false });
    }
  };
  const resetScope = () =>
    update({
      board: scope.board,
      medium: scope.medium,
      class: undefined,
      division: undefined,
      columnFilters: undefined,
      page: undefined,
    });
  const rows = ready && !query.isError ? (query.currentData?.items ?? []) : [];
  const loadingOptions = options.isLoading || (options.isFetching && !options.currentData);
  const hasClassFilters = !!(params.get('class') || params.get('division'));
  const needsReset = !!options.currentData && !scope.ready && !!scope.board && !!scope.medium;
  const columns: IColumn[] = [
    {
      id: 'grNumber',
      label: 'GR number',
      minWidth: 115,
      filterType: 'string',
      isSort: true,
      render: (value, row) => value || (row.grNo ?? '—'),
    },
    {
      id: 'name',
      label: 'Student name',
      minWidth: 180,
      rowHeader: true,
      filterType: 'string',
      isSort: true,
      render: (_, row) => directoryStudentName(row as StudentDirectoryItem),
    },
    {
      id: 'rollNo',
      label: 'Roll number',
      filterType: 'number',
      isSort: false,
      render: (value) => value ?? '—',
    },
    {
      id: 'standardName',
      label: 'Class',
      isFilter: false,
      isSort: false,
      render: (value) => value || '—',
    },
    {
      id: 'divisionName',
      label: 'Division',
      isFilter: false,
      isSort: false,
      render: (value) => value || '—',
    },
    {
      id: 'actions',
      label: 'Actions',
      isSort: false,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right',
      width: 112,
      minWidth: 112,
      excludeFromExport: true,
      render: (_, row) => {
        const student = row as StudentDirectoryItem;
        if (student.maskedFields.includes('Identity')) return '—';
        const name = directoryStudentName(student);
        return (
          <AdaptiveThreeDotsActions
            directActionLimit={2}
            collapseOnOverflow={false}
            placement="right-top"
            sx={{ justifyContent: 'flex-end' }}
            actions={[
              ...(canGenerateForStudent(student)
                ? [
                    {
                      id: 'generate-certificate',
                      label: `Generate certificate for ${name}`,
                      icon: GlobalIcons.documentIcon,
                      onClick: () => onGenerate(student),
                    },
                  ]
                : []),
              {
                id: 'certificate-history',
                label: `View certificate history for ${name}`,
                icon: GlobalIcons.history,
                href: historyHref(student.studentId),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <>
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}>
        <StudentDirectoryAcademicFilters
          scope={scope}
          options={options.currentData}
          isLoading={loadingOptions}
          disabled={options.isError || loadingOptions}
          onChange={(changes) => update({ ...changes, page: undefined })}
        />
      </Paper>
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="student-certificate-roster"
          tableTitle="Students"
          columns={columns}
          data={rows}
          isSearch
          serverSideSearch
          searchTerm={search}
          searchFieldProps={{
            placeholder: 'Search name, GR or admission number',
            inputProps: { 'aria-label': 'Search certificate students', maxLength: 150 },
          }}
          onServerSearch={(value) => {
            if (value !== search) update({ search: value || undefined, page: undefined });
          }}
          isFilter={false}
          showColumns
          showExport={false}
          showFullScreen
          isPagination
          serverSidePagination
          serverSideSort
          serverSideFilter
          filters={directoryTableFilters(columnFilters)}
          onServerFilter={(filters) =>
            update({ columnFilters: serializeDirectoryFilters(filters), page: undefined })
          }
          onClearCriteria={() =>
            update({ search: undefined, columnFilters: undefined, page: undefined })
          }
          serverSideSortMode="single"
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 25, 50, 100]}
          totalCount={ready && !query.isError ? (query.currentData?.totalCount ?? 0) : 0}
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
          onServerSort={(_column, sorts) =>
            update({
              sort: sorts.length ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
              page: undefined,
            })
          }
          onServerPagination={(nextPage, nextSize) =>
            update({
              page: nextSize === pageSize ? Math.max(0, nextPage - 1) : undefined,
              pageSize: nextSize,
            })
          }
          isLoading={
            loadingOptions ||
            (ready && (query.isLoading || (query.isFetching && !query.currentData)))
          }
          isRefreshing={ready && query.isFetching && !!query.currentData && !query.isError}
          errorContent={
            options.isError || query.isError ? (
              <StudentFeedback
                notificationKey={
                  options.isError
                    ? 'certificate-roster-options-failed'
                    : 'certificate-roster-read-failed'
                }
                presentation="toast"
                severity="error"
                toastAction={
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => (options.isError ? options.refetch() : query.refetch())}
                  >
                    {options.isError ? 'Retry filters' : 'Retry students'}
                  </Button>
                }
              >
                {options.isError
                  ? 'Academic filters could not be loaded.'
                  : 'The student roster could not be loaded.'}
              </StudentFeedback>
            ) : undefined
          }
          noDataText={
            <Stack component="span" alignItems="center" spacing={1} sx={{ color: 'text.primary' }}>
              <Typography component="span" variant="body2">
                {needsReset
                  ? 'Some academic filters are unavailable in this year.'
                  : !ready
                    ? 'Choose an available board and medium to view students.'
                    : page > 0
                      ? 'There are no students on this page.'
                      : search.trim()
                        ? 'No students match your search in the selected academic filters.'
                        : 'No students match the selected academic filters.'}
              </Typography>
              {(needsReset || hasClassFilters) && (
                <Button size="small" variant="outlined" color="inherit" onClick={resetScope}>
                  Clear filters
                </Button>
              )}
              {ready && page > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => update({ page: undefined })}
                >
                  First page
                </Button>
              )}
            </Stack>
          }
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 }, 'aria-label': 'Certificate student roster' }}
        />
      </Box>
    </>
  );
}
