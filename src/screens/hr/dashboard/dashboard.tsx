'use client';

import React from 'react';
// import Chart from 'react-apexcharts';

import type { LabelColor } from 'src/components/label';

import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';

import { Box, Grid, Card, useTheme, Typography, CardContent } from '@mui/material';

import { fNumber } from 'src/utils/format-number';
import { formatCurrency } from 'src/utils/cureencyFormater';

import { varAlpha } from 'src/theme/styles';

import { Chart } from 'src/components/chart';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useCarousel } from 'src/components/carousel';

import { CalendarView } from 'src/sections/calendar/view';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';
import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

// Sample data
const stats = {
  totalEmployees: 120,
  attendance: { present: 85, absent: 20, onLeave: 15 },
  newJoiners: 5,
  pendingLeaveRequests: 3,
  payroll: {
    total: formatCurrency(50000),
    pending: formatCurrency(10000),
    discrepancies: formatCurrency(200),
  },
};

// Icons
const icons = {
  employees: 'mdi:account-multiple',
  attendance: 'mdi:calendar-check',
  newJoiners: 'mdi:account-plus',
  leaveRequests: 'mdi:clock-alert',
  payroll: 'mdi:wallet',
};

const Dashboard = () => {
  const theme = useTheme();
  const carousel = useCarousel({ loop: true }, [
    Autoplay({ playOnInit: true, delay: 2000, stopOnMouseEnter: true }),
  ]);
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <EmployeeDashboardCard
            title="Total Employees"
            icon={icons.employees}
            value={stats.totalEmployees}
            labels={[
              { name: 'Teaching: 70', color: 'info' },
              { name: 'Non-teaching: 50', color: 'secondary' },
              { name: 'Male: 80', color: 'success' },
              { name: 'Female: 40', color: 'warning' },
            ]}
            color="primary.main"
            href="/hr/employee"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <EmployeeDashboardCard
            title="Attendance Overview"
            icon={icons.attendance}
            value={`${stats.attendance.present}%`}
            labels={[
              { name: 'Present: 100', color: 'success' },
              { name: 'Absent: 2', color: 'error' },
              { name: 'On Leave: 5', color: 'warning' },
            ]}
            color="secondary.main"
            href="/hr/attendance-tracking"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <EmployeeDashboardCard
            title="New Joiners"
            icon={icons.newJoiners}
            value={stats.newJoiners}
            labels={[{ name: 'This Month', color: 'info' }]}
            color="warning.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <EmployeeDashboardCard
            title="Pending Leave Requests"
            icon={icons.leaveRequests}
            value={stats.pendingLeaveRequests}
            color="warning.main"
            href="/hr/leave-requests/?tab=leaveHistory"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <EmployeeDashboardCard
            title="Payroll Summary"
            icon={icons.payroll}
            value={stats.payroll.total}
            labels={[{ name: `Pending: ${stats.payroll.pending}`, color: 'warning' }]}
            color="info.main"
            href="/hr/payroll/pay-process"
          />
        </Grid>

        {/* Graphs and Charts */}
        <Grid item xs={12} md={6}>
          <AppCurrentDownload
            title="Employee Count by Group"
            subheader=""
            chart={{
              series: [
                { label: 'Non-teaching Staff', value: 1224 },
                { label: 'Teaching Staff', value: 53345 },
              ],
              colors: [theme.palette.primary.light, theme.palette.primary.darker],
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <EcommerceYearlySales
            id="demo__4"
            title="Attendance Trends"
            subheader=""
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
                {
                  name: '2024',
                  data: [
                    {
                      name: 'Total Attendance',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'Primary',
                      data: [10, 41, 35, 69, 91, 148, 35, 51, 49, 62, 51, 49],
                    },
                  ],
                },
                {
                  name: '2023',
                  data: [
                    {
                      name: 'Total Attendance',
                      data: [91, 148, 35, 51, 49, 10, 41, 35, 51, 49, 62, 69],
                    },
                    {
                      name: 'Primary',
                      data: [49, 62, 69, 91, 10, 41, 35, 51, 148, 35, 51, 49],
                    },
                  ],
                },
              ],
              colors: [
                theme.palette.primary.main,
                varAlpha(theme.palette.warning.mainChannel, 0.5),
              ],
            }}
            sx={{ height: 1 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <AnalyticsCurrentVisits
            title="Leave Analysis"
            chart={{
              series: [
                { label: 'Sick Leave', value: 40 },
                { label: 'Casual Leave', value: 30 },
                { label: 'Maternity', value: 20 },
                { label: 'Other', value: 10 },
              ],
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <AnalyticsWebsiteVisits
            title="Payroll Distribution"
            subheader=""
            chart={{
              categories: ['Admin', 'Teaching', 'Non-teaching', 'Support', 'Other'],
              series: [{ name: 'Payroll', data: [15000, 12000, 8000, 10000, 5000] }],
              options: {
                yaxis: {
                  labels: {
                    formatter: (value: number) => `${formatCurrency(value)}`,
                  },
                },
                tooltip: {
                  y: {
                    formatter: (value: number) => `${formatCurrency(value)}`,
                  },
                },
              },
            }}
            sx={{ height: '100%' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6">Employee Retention Ratio</Typography>
              <Chart
                type="area"
                series={[{ name: 'Turnover Rate', data: [3, 5, 2, 4, 3, 2, 6] }]}
                options={{
                  xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
                  colors: ['#FFA600'],
                  chart: {
                    toolbar: {
                      show: false,
                    },
                  },
                }}
                height="100%"
              />
            </CardContent>
          </Card>
        </Grid>
        {/* <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              // height: '100%',
              display: 'flex',
              flexDirection: 'column',

              borderRadius: '16px',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Iconify
                icon="mdi:cake-variant"
                width={32}
                height={32}
                sx={{ color: 'primary.main' }}
              />
              <Typography variant="h5" sx={{ ml: 2, fontWeight: 'bold' }}>
                Employee Birthdays & Anniversary
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Todays Birthday & Anniversary
              </Typography>

              <Card sx={{ bgcolor: 'background.neutral' }}>
                <CarouselDotButtons
                  scrollSnaps={carousel.dots.scrollSnaps}
                  selectedIndex={carousel.dots.selectedIndex}
                  onClickDot={carousel.dots.onClickDot}
                  sx={{
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    position: 'absolute',
                    color: 'primary.dark',
                  }}
                />

                <CarouselArrowBasicButtons
                  {...carousel.arrows}
                  options={carousel.options}
                  sx={{ top: 8, right: 8, position: 'absolute', color: 'common.black' }}
                />

                <Carousel carousel={carousel}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'primary.lighter',
                      p: 2,
                      borderRadius: '8px',
                    }}
                  >
                    <UserHoverProfile
                      avatarComp={
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            mr: 2,
                            width: 56,
                            height: 56,
                            cursor: 'pointer',
                          }}
                        >
                          JD
                        </Avatar>
                      }
                      user={{
                        name: 'John Doe',
                        avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                        role: 'Student',
                        email: 'john.doe@example.com',
                        class: '10th',
                        division: 'A',
                        board: 'CBSE',
                        medium: 'English',
                        organization: 'Higher Secondary',
                      }}
                    />

                    <Box>
                      <Typography color="primary" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        John Doe
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Turning 20 today
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'primary.lighter',
                      p: 2,
                      borderRadius: '8px',
                    }}
                  >
                    <UserHoverProfile
                      avatarComp={
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                          JD
                        </Avatar>
                      }
                      user={{
                        name: 'John Doe',
                        avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                        role: 'Student',
                        email: 'john.doe@example.com',
                        class: '10th',
                        division: 'A',
                        board: 'CBSE',
                        medium: 'English',
                        organization: 'Higher Secondary',
                      }}
                    />

                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        John Doe
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Turning 30 today
                      </Typography>
                    </Box>
                  </Box>
                </Carousel>
              </Card>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Upcoming Birthdays & Anniversary
              </Typography>
              <Scrollbar sx={{ height: 300 }}>
                <List>
                  {[
                    { name: 'Jane Smith', date: 'May 15', age: 19 },
                    { name: 'Mike Johnson', date: 'May 18', age: 21 },
                    { name: 'Sarah Brown', date: 'May 20', age: 20 },
                  ].map((student, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: '8px',
                        p: 2,
                        boxShadow: 2,
                        my: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <UserHoverProfile
                          avatarComp={
                            <Avatar
                              sx={{
                                bgcolor: 'secondary.main',
                                width: 48,
                                height: 48,
                                cursor: 'pointer',
                              }}
                            >
                              {student.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </Avatar>
                          }
                          user={{
                            name: student.name,
                            avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                            role: 'Student',
                            email: 'john.doe@example.com',
                            class: '10th',
                            division: 'A',
                            board: 'CBSE',
                            medium: 'English',
                            organization: 'Higher Secondary',
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {student.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2">{`${student.date} (Turning ${student.age})`}</Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Scrollbar>
            </Box>
          </Card>
        </Grid> */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Events & Holidays</Typography>
              <CalendarView />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

interface DashboardCardProps {
  title: string;
  icon: string;
  value?: number | string;
  labels?: { name: string; color: LabelColor }[];
  color: string;
  href?: string;
}

export const EmployeeDashboardCard = ({
  title,
  icon,
  value,
  labels = [],
  href = '',
  color,
}: DashboardCardProps) => (
  <Box component={Link} href={href} sx={{ textDecoration: 'none' }}>
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 'var(--shadows-8)',
          scale: 1.03,
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Box sx={{ typography: 'subtitle1' }}>{title}</Box>
            {/* <Typography variant="h6">Total Employees</Typography> */}
          </Box>
          {typeof value === 'number' && (
            <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{fNumber(value)}</Box>
          )}
          {typeof value === 'string' && (
            <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{value}</Box>
          )}
          {/* <Typography variant="h4">{stats.totalEmployees}</Typography> */}
          <Box
            sx={{
              mt: 1.5,
              mb: 1,
              typography: 'subtitle2',
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {labels.map((label, index) => (
              <Label color={label.color || 'success'}>{label.name}</Label>
            ))}
          </Box>
        </Box>
        <Iconify icon={icon} sx={{ width: 50, height: 50, color }} />
        {/* <Typography variant="body2"></Typography> */}
      </CardContent>
    </Card>
  </Box>
);
