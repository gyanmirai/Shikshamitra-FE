import React from 'react';
import { Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const ProfileDashboardAttendanceTrend = () => {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%' }}>
      <AnalyticsWebsiteVisits
        title="Attendance Trend"
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          series: [
            {
              name: 'Present',
              data: [40, 58, 27, 45, 48, 50, 90],
            },
            {
              name: 'Half-Day',
              data: [30, 45, 40, 30, 20, 10, 57],
            },
            {
              name: 'Absent',
              data: [35, 20, 45, 22, 20, 30, 35],
            },
          ],
          colors: [
            theme.palette.success.main, // Green for Present
            theme.palette.warning.main, // Yellow/Orange for Half-Day
            theme.palette.error.main, // Red/Pink for Absent
          ],
        }}
        sx={{ height: '100%', boxShadow: 'none' }}
      />
    </Card>
  );
};

export default ProfileDashboardAttendanceTrend;
