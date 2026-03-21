'use client';

import { Grid } from '@mui/material';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';
import ProfileDashboardAttendanceTrend from 'src/screens/hr/employee/profile-dashboard-component/ProfileDashboardAttendanceTrend';

import AllInfoCalendar from '../admin/components/AllInfoCalendar';

// ── component ─────────────────────────────────────────────────────────────────
const UserDashboard = () => (
  <Grid container spacing={1}>
    {/* New Announcements */}
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <CompactKPICard
        title="New Announcements"
        value={3}
        status="warning"
        tooltip="3 new announcements this week"
        chart={{
          type: 'bar',
          series: [1, 2, 1, 3, 2, 3],
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        }}
      />
    </Grid>

    {/* Today's Meetings */}
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <CompactKPICard
        title="Today's Meetings"
        value={4}
        status="info"
        tooltip="4 meetings scheduled today"
        chart={{
          type: 'bar',
          series: [2, 3, 4, 2, 4],
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        }}
      />
    </Grid>

    {/* Monthly Holidays */}
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <CompactKPICard
        title="Holidays This Month"
        value={3}
        status="primary"
        tooltip="3 holidays this month"
        chart={{
          type: 'bar',
          series: [2, 1, 3, 2, 3, 2, 4],
          labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Mar'],
        }}
      />
    </Grid>

    {/* Calendar */}
    <Grid size={12}>
      <AllInfoCalendar />
    </Grid>
    <Grid size={12}>
      <ProfileDashboardAttendanceTrend />
    </Grid>
  </Grid>
);

export default UserDashboard;
