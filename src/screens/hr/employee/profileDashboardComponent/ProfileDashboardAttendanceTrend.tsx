import React from 'react';
import { Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const ProfileDashboardAttendanceTrend = () => {
  const theme = useTheme();
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
        chart={{
          categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          series: [
            { name: 'Present', data: [25, 20, 26, 24, 28, 22, 27, 25, 26, 24, 25, 20] },
            { name: 'Half-Day', data: [2, 3, 1, 2, 0, 4, 2, 1, 2, 3, 2, 5] },
            { name: 'Absent', data: [4, 5, 4, 4, 3, 4, 2, 5, 2, 4, 3, 6] },
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
