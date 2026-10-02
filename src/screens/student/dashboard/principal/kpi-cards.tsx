import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import {
  useGetStudentDashboardSummaryQuery,
  useGetStudentAttendanceDashboardSummaryQuery,
} from 'src/redux/student';

import CompactKPICard from './kpi-card-item';
import {
  attendanceCompletionLabel,
  attendancePercentageLabel,
} from '../../attendance/dashboard/attendance-dashboard-metrics';

type KpiStatus = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';

const PrincipalKPICards = () => {
  const year = useSelector((state: RootState) => state.globalState.currentYear);
  const { data: summary } = useGetStudentDashboardSummaryQuery(undefined);
  const { data: attendanceSummary } = useGetStudentAttendanceDashboardSummaryQuery({
    academicYearId: year?.id,
  });

  const items: {
    id: string;
    title: string;
    value: string | number;
    tooltip: string;
    status: KpiStatus;
    path: string;
  }[] = [
    {
      id: 'students-total',
      title: 'Total Students',
      value: summary?.totalStudents ?? '-',
      tooltip: 'Total number of currently enrolled students in the institution.',
      status: 'info',
      path: studentPaths.records.studentList,
    },
    {
      id: 'students-male',
      title: 'Male Students',
      value: summary?.maleStudents ?? '-',
      tooltip: 'Currently enrolled students with male gender recorded.',
      status: 'primary',
      path: studentPaths.records.studentList,
    },
    {
      id: 'students-female',
      title: 'Female Students',
      value: summary?.femaleStudents ?? '-',
      tooltip: 'Currently enrolled students with female gender recorded.',
      status: 'success',
      path: studentPaths.records.studentList,
    },
    {
      id: 'attendance-average',
      title: attendanceSummary?.isProvisional ? 'Attendance · Provisional' : 'Attendance',
      value: attendancePercentageLabel(attendanceSummary?.schoolAttendancePercentage),
      tooltip: attendanceSummary
        ? attendanceCompletionLabel(attendanceSummary)
        : 'Attendance summary is unavailable.',
      status: attendanceSummary?.isProvisional ? 'warning' : 'info',
      path: studentPaths.attendance.reports,
    },
  ];

  return (
    <Box>
      <Grid container spacing={1}>
        {items.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
            <CompactKPICard
              title={item.title}
              value={item.value}
              status={item.status}
              path={item.path}
              tooltip={item.tooltip}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PrincipalKPICards;
