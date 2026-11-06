'use client';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Paper, Stack, LinearProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAttendanceRegisterQuery } from 'src/redux/student/attendance-management/api';
import {
  attendanceError,
  isAttendanceRange,
  attendancePercentage,
} from 'src/redux/student/attendance-management/types';

import { useAttendanceReportRange } from './use-attendance-report-range';
import { AttendanceAiReportButton } from './components/AttendanceAiReportButton';
import { useAttendanceContext, AttendanceClassFilters } from '../setting/attendance-context';

export default function AttendanceReportScreen() {
  const context = useAttendanceContext();
  const range = useAttendanceReportRange(
    context.params.get('from') || dayjs().startOf('month').format('YYYY-MM-DD'),
    context.params.get('to') || dayjs().format('YYYY-MM-DD'),
    context.update
  );
  const { startDate, endDate } = range;
  const page = Math.max(0, Number(context.params.get('page')) || 0);
  const valid = isAttendanceRange(startDate, endDate);
  const hasScope = Boolean(
    context.currentYear?.id && context.currentBoard?.id && context.currentMedium?.id
  );
  const query = useGetAttendanceRegisterQuery(
    {
      academicYearId: context.currentYear?.id ?? '',
      boardId: context.currentBoard?.id,
      educationMediumId: context.currentMedium?.id,
      standardId: context.standardId || undefined,
      divisionId: context.divisionId || undefined,
      startDate,
      endDate,
      skipCount: page * 50,
      maxResultCount: 50,
    },
    { skip: !hasScope || !valid }
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
          <DatePicker
            label="From"
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            value={range.fromValue}
            onChange={range.changeFrom}
          />
          <DatePicker
            label="To"
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            value={range.toValue}
            onChange={range.changeTo}
          />
        </Stack>
      </Paper>
      {!context.currentYear?.id && (
        <StudentFeedback notificationKey="STU-0630" presentation="inline" severity="info">
          Select an academic year to view attendance.
        </StudentFeedback>
      )}
      {context.currentYear?.id && !hasScope && (
        <StudentFeedback
          notificationKey="attendance-report-scope"
          presentation="inline"
          severity="info"
        >
          Select a board and medium to view attendance.
        </StudentFeedback>
      )}
      {!valid && (
        <StudentFeedback notificationKey="STU-0631" presentation="inline" severity="warning">
          Select a valid date range with From before To.
        </StudentFeedback>
      )}
      {query.isError && (
        <StudentFeedback notificationKey="STU-0632" presentation="toast" severity="error">
          {attendanceError(query.error, 'Attendance report could not be loaded.')}
        </StudentFeedback>
      )}
      {query.isFetching && !query.isLoading && (
        <LinearProgress aria-label="Refreshing attendance register" />
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="attendance-canonical-register"
          tableTitle="Eligible attendance register"
          exportLabel="Export"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          data={rows}
          isLoading={query.isLoading}
          errorContent={
            query.isError || !hasScope || !valid ? (
              <Box role="region" aria-label="Attendance report unavailable" />
            ) : undefined
          }
          noDataText="No eligible students match this date range and class scope."
          serverSidePagination
          isSearch={false}
          isFilter={false}
          showColumns
          showExport
          showFullScreen
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
