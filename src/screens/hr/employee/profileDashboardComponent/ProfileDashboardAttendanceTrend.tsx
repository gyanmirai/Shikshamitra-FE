import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import dayjs from 'dayjs';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Card, Skeleton, Typography } from '@mui/material';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { useGetCurrentEmployeeQuery, useGetEmployeeDashboardQuery } from 'src/redux/hr/employeeApi';

import { buildEmployeeAttendanceChart } from '../employee-dashboard-utils';

const ProfileDashboardAttendanceTrend = ({
  data: providedData,
}: {
  data?: EmployeeDashboardData;
}) => {
  const theme = useTheme();
  const { data: currentEmployee, isLoading: isEmployeeLoading } = useGetCurrentEmployeeQuery(
    undefined,
    { skip: Boolean(providedData) }
  );
  const employeeId = currentEmployee?.id as string | undefined;
  const { data: currentDashboard, isLoading: isDashboardLoading } = useGetEmployeeDashboardQuery(
    { employeeId: employeeId ?? '', date: dayjs().format('YYYY-MM-DD') },
    { skip: Boolean(providedData) || !employeeId }
  );
  const data = providedData ?? currentDashboard;

  if ((isEmployeeLoading || isDashboardLoading) && !data) {
    return <Skeleton variant="rounded" height={320} />;
  }

  if (!data) {
    return (
      <Card
        sx={{
          minHeight: 240,
          display: 'grid',
          placeItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Attendance trend is unavailable for this account.
        </Typography>
      </Card>
    );
  }

  const chart = buildEmployeeAttendanceChart(data);
  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
      }}
    >
      <AnalyticsWebsiteVisits
        title="Attendance Trend"
        subheader={
          data.academicYearName
            ? `${data.academicYearName} · ${data.recordedAttendanceDays} recorded days`
            : 'No academic year selected'
        }
        chart={{
          categories: chart.categories,
          series: chart.series,
          colors: [
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main,
            theme.palette.secondary.main,
            theme.palette.info.main,
          ],
        }}
        sx={{ height: '100%', boxShadow: 'none' }}
      />
    </Card>
  );
};

export default ProfileDashboardAttendanceTrend;
