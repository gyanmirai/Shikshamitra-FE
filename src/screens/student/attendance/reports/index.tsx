'use client';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Paper, Stack, Alert, Button, TextField, LinearProgress } from '@mui/material';
import { useGetAttendanceRegisterQuery } from 'src/redux/student/attendance-management/api';
import {
  attendanceError,
  isAttendanceRange,
  attendancePercentage,
} from 'src/redux/student/attendance-management/types';

import { AttendanceAiReportButton } from './components/AttendanceAiReportButton';
import { useAttendanceContext, AttendanceClassFilters } from '../setting/attendance-context';

export default function AttendanceReportScreen() {
  const context = useAttendanceContext();
  const startDate = context.params.get('from') || dayjs().startOf('month').format('YYYY-MM-DD');
  const endDate = context.params.get('to') || dayjs().format('YYYY-MM-DD');
  const page = Math.max(0, Number(context.params.get('page')) || 0);
  const valid = isAttendanceRange(startDate, endDate);
  const query = useGetAttendanceRegisterQuery(
    {
      academicYearId: context.currentYear?.id ?? '',
      standardId: context.standardId || undefined,
      divisionId: context.divisionId || undefined,
      startDate,
      endDate,
      skipCount: page * 50,
      maxResultCount: 50,
    },
    { skip: !context.currentYear?.id || !valid }
  );
  const rows = (query.currentData?.rows ?? []).map((row) => ({
    ...row,
    percentageLabel: attendancePercentage(row.percentage),
    completion: `${row.recordedDays}/${row.expectedDays}`,
    calculationState: row.isProvisional
      ? 'Provisional'
      : row.expectedDays === 0
        ? 'Not expected'
        : 'Complete',
    targetState:
      row.isBelowThreshold === true
        ? 'Below school target'
        : row.isBelowThreshold === false && row.percentage != null
          ? 'Meets school target'
          : '—',
  }));
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Attendance Reports"
        description="Review attendance credit and recording completeness for eligible school days. Provisional percentages exclude unmarked days."
        links={[
          { name: 'Student', href: '/student/dashboard' },
          { name: 'Attendance', href: '/student/attendance/take-attendance' },
          { name: 'Reports' },
        ]}
        action={<AttendanceAiReportButton />}
      />
      <AttendanceClassFilters context={context} />
      <Paper variant="outlined" sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="From"
            slotProps={{ inputLabel: { shrink: true } }}
            value={startDate}
            onChange={(event) => context.update({ from: event.target.value, page: undefined })}
          />
          <TextField
            fullWidth
            size="small"
            type="date"
            label="To"
            slotProps={{ inputLabel: { shrink: true } }}
            value={endDate}
            onChange={(event) => context.update({ to: event.target.value, page: undefined })}
          />
        </Stack>
      </Paper>
      {!context.currentYear?.id && (
        <Alert severity="info">Select an academic year to view attendance.</Alert>
      )}
      {!valid && <Alert severity="warning">Select a valid date range with From before To.</Alert>}
      {query.isError && (
        <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
          {attendanceError(query.error, 'Attendance report could not be loaded.')}
        </Alert>
      )}
      {query.isFetching && !query.isLoading && (
        <LinearProgress aria-label="Refreshing attendance register" />
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="attendance-canonical-register"
          tableTitle="Eligible attendance register"
          exportLabel="Attendance register (current page)"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          data={rows}
          isLoading={query.isLoading}
          noDataText="No eligible students match this date range and class scope."
          serverSidePagination
          isSearch={false}
          isFilter={false}
          page={page}
          rowsPerPage={50}
          rowsPerPageOptions={[50]}
          totalCount={query.currentData?.totalCount ?? 0}
          onServerPagination={(nextPage) =>
            context.update({ page: String(Math.max(0, nextPage - 1)) })
          }
          columns={[
            { id: 'rollNo', label: 'Roll no.', filterType: 'number' },
            { id: 'fullName', label: 'Student', minWidth: 200, filterType: 'string' },
            { id: 'expectedDays', label: 'Expected days', filterType: 'number' },
            { id: 'recordedDays', label: 'Recorded days', filterType: 'number' },
            { id: 'missingDays', label: 'Unmarked days', filterType: 'number' },
            { id: 'presentCredit', label: 'Present credit', filterType: 'number' },
            { id: 'percentageLabel', label: 'Attendance', isFilter: false },
            { id: 'completion', label: 'Completion', isFilter: false },
            {
              id: 'targetState',
              label: 'School target',
              isSort: false,
              isFilter: false,
              render: (value, row) => (
                <Label
                  color={row.isBelowThreshold === true ? 'warning' : 'default'}
                  title={
                    row.lowAttendanceThreshold == null
                      ? undefined
                      : `School attendance target: ${row.lowAttendanceThreshold}%`
                  }
                >
                  {value}
                </Label>
              ),
            },
            {
              id: 'calculationState',
              label: 'State',
              sticky: true,
              render: (value) => (
                <Label
                  color={
                    value === 'Provisional'
                      ? 'warning'
                      : value === 'Complete'
                        ? 'success'
                        : 'default'
                  }
                >
                  {value}
                </Label>
              ),
            },
          ]}
        />
      </Box>
    </Box>
  );
}
