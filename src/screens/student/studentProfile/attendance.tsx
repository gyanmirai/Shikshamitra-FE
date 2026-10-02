'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetAttendanceSummaryQuery } from 'src/redux/student/attendance-management/api';
import { Box, Stack, Paper, Alert, Button, Skeleton, TextField, Typography } from '@mui/material';
import {
  attendanceError,
  attendanceStatus,
  attendancePercentage,
} from 'src/redux/student/attendance-management/types';

import type { StudentTabsComponentType } from '.';

export const Dot = ({
  children,
  color = 'primary.main',
}: {
  children?: React.ReactNode;
  color?: string;
}) => (
  <Stack direction="row" spacing={1}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, alignSelf: 'center' }} />
    <Typography variant="body2">{children}</Typography>
  </Stack>
);
export default function Attendance({ student }: StudentTabsComponentType) {
  const year = useSelector((state: RootState) => state.globalState.currentYear);
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const month = params.get('attendanceMonth') || dayjs().format('YYYY-MM');
  const setMonth = (value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set('attendanceMonth', value);
    router.push(`${pathname}?${next.toString()}`);
  };
  const query = useGetAttendanceSummaryQuery(
    {
      studentId: student?.studentId ?? student?.id ?? '',
      academicYearId: year?.id ?? '',
      startDate: dayjs(`${month}-01`).startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD'),
    },
    { skip: !(student?.studentId || student?.id) || !year?.id || !dayjs(`${month}-01`).isValid() }
  );
  const metrics = query.currentData;
  const rows = (metrics?.daily ?? []).map((row) => ({
    ...row,
    statusLabel: attendanceStatus(row.status, row.expected),
    detail:
      row.exclusionReason ||
      [row.late ? 'Late' : '', row.halfDay ? 'Half-day' : ''].filter(Boolean).join(', ') ||
      '—',
  }));
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1 }}>
      <Paper variant="outlined" sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            size="small"
            type="month"
            label="Attendance month"
            slotProps={{ inputLabel: { shrink: true } }}
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
          {query.isLoading ? (
            <Skeleton width={240} />
          ) : (
            metrics && (
              <Typography variant="body2">
                Attendance {attendancePercentage(metrics.percentage)} · Recorded{' '}
                {metrics.recordedDays}/{metrics.expectedDays} · Unmarked {metrics.missingDays}{' '}
                <Label color={metrics.isProvisional ? 'warning' : 'default'}>
                  {metrics.expectedDays === 0
                    ? 'Not expected'
                    : metrics.isProvisional
                      ? 'Provisional'
                      : 'Complete'}
                </Label>
              </Typography>
            )
          )}
        </Stack>
      </Paper>
      {!year?.id && (
        <Alert severity="info">Select an academic year to view this student’s attendance.</Alert>
      )}
      {query.isError && (
        <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
          {attendanceError(query.error, 'Attendance summary could not be loaded.')}
        </Alert>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="student-canonical-attendance"
          tableTitle="Daily attendance history"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={query.isLoading}
          data={rows}
          noDataText="No eligible attendance days in this month."
          columns={[
            { id: 'date', label: 'Date', filterType: 'date' },
            {
              id: 'statusLabel',
              label: 'Attendance',
              render: (value) => (
                <Label
                  color={
                    value === 'Present'
                      ? 'success'
                      : value === 'Absent'
                        ? 'error'
                        : value === 'Unmarked'
                          ? 'warning'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              ),
            },
            { id: 'detail', label: 'Details', minWidth: 180 },
            { id: 'remarks', label: 'Remarks', minWidth: 200 },
          ]}
        />
      </Box>
    </Box>
  );
}
