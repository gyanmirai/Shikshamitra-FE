'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { RouterLink } from 'src/routes/components';
import { formatDateOnly } from 'src/utils/date-only';
import { studentPaths } from 'src/constants/student-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Paper, Button, LinearProgress } from '@mui/material';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { readDashboardAcademicScope } from 'src/utils/student-dashboard-drilldown';
import { useGetAttendanceContextQuery } from 'src/redux/student/take-attendance/take-attendace-api';
import StudentDirectoryFilterFields from 'src/screens/student/records/student-directory-filter-fields';
import { useGetAttendanceRegisterQueueQuery } from 'src/redux/student/take-attendance/attendance-register-queue-api';

const statusLabels = { missing: 'Not started', draft: 'Draft', review: 'Needs review' };

export default function AttendanceRegisterQueue() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const scope = readDashboardAcademicScope(params);
  const academicYearId = scope.academicYearId || currentYearId || '';
  const requestedPage = Number(params.get('page'));
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0;
  const requestedSize = Number(params.get('size'));
  const size = [10, 25, 50, 100].includes(requestedSize) ? requestedSize : 25;
  const context = useGetAttendanceContextQuery({ academicYearId }, { skip: !academicYearId });
  const query = useGetAttendanceRegisterQueueQuery(
    { ...scope, academicYearId, skipCount: page * size, maxResultCount: size },
    {
      skip: !academicYearId,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key)
    );
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  const data = query.isError ? undefined : query.currentData;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1 }}>
      <CustomBreadcrumbs
        heading="Pending attendance registers"
        description="Open an expected class and division register that has not been submitted, or needs review."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Attendance', href: studentPaths.attendance.root },
          { name: 'Pending registers' },
        ]}
      />
      <Paper variant="outlined" sx={{ p: 1 }}>
        <StudentDirectoryFilterFields
          values={{
            board: scope.boardId || '',
            medium: scope.mediumId || '',
            class: scope.standardId || '',
            division: scope.divisionId || '',
          }}
          options={context.isError ? undefined : context.currentData?.options}
          isLoading={context.isFetching}
          disabled={!academicYearId || context.isError}
          onChange={(changes) => update({ ...changes, page: undefined })}
        />
      </Paper>
      {!academicYearId && (
        <Alert severity="info">Select an academic year to view pending registers.</Alert>
      )}
      {context.isError && (
        <Alert severity="error" action={<Button onClick={() => context.refetch()}>Retry</Button>}>
          Academic filters could not be loaded.
        </Alert>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
        {data && query.isFetching && <LinearProgress aria-label="Refreshing pending registers" />}
        <CustomizableTable
          tableId="student-attendance-pending-registers"
          tableTitle="Pending attendance registers"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={[
            { id: 'className', label: 'Class', isSort: false, isFilter: false },
            { id: 'divisionName', label: 'Division', isSort: false, isFilter: false },
            {
              id: 'date',
              label: 'Date',
              isSort: false,
              isFilter: false,
              render: (value) => formatDateOnly(value),
            },
            {
              id: 'status',
              label: 'Register status',
              isSort: false,
              isFilter: false,
              render: (value: keyof typeof statusLabels) => (
                <Label color={value === 'review' ? 'warning' : 'info'}>{statusLabels[value]}</Label>
              ),
            },
            {
              id: 'actions',
              label: 'Actions',
              isSort: false,
              isFilter: false,
              align: 'right',
              excludeFromExport: true,
              render: (_value, row) => (
                <Button component={RouterLink} href={row.href}>
                  Open register
                </Button>
              ),
            },
          ]}
          data={data?.items ?? []}
          totalCount={data?.totalCount ?? 0}
          isLoading={Boolean(academicYearId) && (query.isLoading || (query.isFetching && !data))}
          isSearch={false}
          isFilter={false}
          serverSidePagination
          page={page}
          rowsPerPage={size}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onServerPagination={(next, nextSize) =>
            update({ page: String(nextSize === size ? next : 0), size: String(nextSize) })
          }
          noDataText={
            academicYearId
              ? 'No pending registers in the selected scope.'
              : 'Select an academic year.'
          }
          errorContent={
            query.isError ? (
              <Alert
                severity="error"
                action={<Button onClick={() => query.refetch()}>Retry</Button>}
              >
                Pending registers could not be loaded. Check your access or retry.
              </Alert>
            ) : undefined
          }
        />
      </Box>
    </Box>
  );
}
