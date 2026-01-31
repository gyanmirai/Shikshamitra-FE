'use client';

import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { BankingBalanceStatistics } from 'src/sections/overview/banking/banking-balance-statistics';

import { DashboardKpiCard } from '../component/dashboard-kpi-card';
import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';

// ----------------------------------------------------------------------

export default function MainDashboardAdmin() {
  return (
    <Grid container spacing={1} sx={{ pl: 1 }}>
      {/* KPI Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <DashboardKpiCard
          title="Total Students"
          total={2450}
          icon="solar:users-group-rounded-bold"
          color="primary"
          trend={{ value: 12, isUp: true }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <DashboardKpiCard title="Total Teachers" total={120} icon="solar:user-bold" color="info" />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <DashboardKpiCard
          title="Active Classes"
          total={45}
          icon="streamline-plump:class-lesson"
          color="warning"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <DashboardKpiCard
          title="Attendance %"
          total="94.2%"
          icon="solar:calendar-date-bold"
          color="success"
          trend={{ value: 2.4, isUp: true }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <DashboardKpiCard
          title="Pending Fees"
          total="$12.5k"
          icon="solar:wad-of-money-bold"
          color="error"
          trend={{ value: 5.1, isUp: false }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <DashboardKpiCard title="Support Tickets" total={8} icon="solar:danger-bold" color="info" />
      </Grid>

      {/* Finance Overview */}
      <Grid size={{ xs: 12, md: 8 }}>
        <BankingBalanceStatistics
          title="Finance Overview"
          subheader="Monthly Collection vs Expenses"
          chart={{
            series: [
              {
                name: 'Weekly',
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                data: [
                  { name: 'Income', data: [10, 41, 35, 151, 49, 62, 69] },
                  { name: 'Expenses', data: [10, 34, 13, 56, 77, 88, 99] },
                ],
              },
              {
                name: 'Monthly',
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                data: [
                  { name: 'Income', data: [148, 91, 69, 222, 112, 105, 127, 139, 203] },
                  { name: 'Expenses', data: [19, 21, 88, 103, 101, 124, 105, 108, 122] },
                ],
              },
              {
                name: 'Yearly',
                categories: ['2022', '2023', '2024'],
                data: [
                  { name: 'Income', data: [148, 91, 69] },
                  { name: 'Expenses', data: [10, 34, 13] },
                ],
              },
            ],
          }}
        />
      </Grid>

      {/* Quick Actions */}
      <Grid size={{ xs: 12, md: 4 }}>
        <DashboardWidgetWrapper title="Quick Actions">
          <Stack spacing={2}>
            {[
              {
                label: 'Create Event / Holiday',
                icon: 'solar:calendar-add-bold',
                color: 'primary',
              },
              { label: 'Generate Fee Invoice', icon: 'solar:bill-list-bold', color: 'success' },
              { label: 'Upload Staff Documents', icon: 'solar:document-add-bold', color: 'info' },
              { label: 'System Configuration', icon: 'solar:settings-bold', color: 'warning' },
            ].map((action, index) => (
              <Button
                key={index}
                fullWidth
                variant="outlined"
                color="inherit"
                size="large"
                startIcon={<Iconify icon={action.icon} sx={{ color: `${action.color}.main` }} />}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  borderStyle: 'dashed',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    bgcolor: (theme: any) =>
                      `rgba(${theme.palette[action.color].mainChannel} / 0.04)`,
                    borderColor: `${action.color}.main`,
                  },
                }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        </DashboardWidgetWrapper>
      </Grid>

      {/* System Alerts */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <DashboardWidgetWrapper
          title="System Alerts"
          subheader="Items requiring immediate attention"
        >
          <Stack spacing={3}>
            {[
              {
                title: 'Failed Payments',
                desc: '4 transactions failed this morning',
                time: '10 mins ago',
                color: 'error',
              },
              {
                title: 'Unassigned Teachers',
                desc: '3 classes need teachers for Period 4',
                time: '25 mins ago',
                color: 'warning',
              },
              {
                title: 'Certificate Expiry',
                desc: '5 vehicle permits expire this week',
                time: '1 hour ago',
                color: 'info',
              },
            ].map((alert, index) => (
              <Stack key={index} direction="row" spacing={2}>
                <Box
                  sx={{ width: 8, height: 40, borderRadius: 1, bgcolor: `${alert.color}.main` }}
                />
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">{alert.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {alert.desc}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {alert.time}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </DashboardWidgetWrapper>
      </Grid>

      {/* Reports Center */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <DashboardWidgetWrapper title="Reports Center" subheader="Quick access to analytics">
          <Grid container spacing={2}>
            {[
              { title: 'Attendance Report', icon: 'gala:chart', count: '94.2%' },
              { title: 'Finance Report', icon: 'solar:graph-up-outline', count: '$45,200' },
              { title: 'Academic Report', icon: 'solar:notebook-outline', count: 'B+ Avg' },
              { title: 'Transport Report', icon: 'solar:bus-outline', count: '12 Routes' },
            ].map((report, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'center',
                    bgcolor: 'background.neutral',
                    border: '1px solid transparent',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'background.paper',
                      borderColor: 'primary.main',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <Iconify icon={report.icon} width={32} sx={{ mb: 1, color: 'text.primary' }} />
                  <Typography variant="subtitle2" noWrap>
                    {report.title}
                  </Typography>
                  <Typography variant="h6">{report.count}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DashboardWidgetWrapper>
      </Grid>
    </Grid>
  );
}
