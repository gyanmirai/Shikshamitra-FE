'use client';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Card, CardHeader } from '@mui/material';
import { DashboardCard } from 'src/components/dashboard-card';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

// Mock data for Admin Dashboard

// KPI Card Data
const TOTAL_EVENTS_THIS_MONTH = 45;
const UPCOMING_HOLIDAYS = 3;
const ACTIVE_GROUPS = 12;

// Chart Data - Event Type Breakdown (Pie Chart)
const EVENT_TYPE_DATA = [
  { label: 'Meetings', value: 25 },
  { label: 'Exams', value: 30 },
  { label: 'Cultural', value: 20 },
  { label: 'Sports', value: 15 },
  { label: 'Other', value: 10 },
];

// Monthly Event Load Trend (Line Chart)
const getLast4Weeks = () => {
  const weeks = [];
  for (let i = 3; i >= 0; i -= 1) {
    weeks.push(`Week ${4 - i}`);
  }
  return weeks;
};

const MONTHLY_EVENT_LOAD_DATA = {
  categories: getLast4Weeks(),
  series: [
    { name: 'Events Scheduled', data: [12, 15, 18, 20] },
    { name: 'Events Completed', data: [10, 12, 14, 16] },
  ],
};

// Audience Participation Trend (Bar Chart)
const AUDIENCE_PARTICIPATION_DATA = {
  categories: ['Students', 'Teachers', 'Parents', 'Staff'],
  series: [{ name: 'Participation Count', data: [450, 120, 200, 80] }],
};

// Holiday Heatmap - simplified as bar chart for now
const HOLIDAY_DISTRIBUTION_DATA = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [{ name: 'Holidays', data: [2, 1, 3, 2, 1, 0, 1, 2, 3, 4, 2, 4] }],
};

const AdminDashboard = () => {
  const theme = useTheme();

  // Monthly Event Load Trend Chart Options
  const eventLoadTrendOptions = useChart({
    colors: [theme.palette.success.main, theme.palette.warning.main],
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: MONTHLY_EVENT_LOAD_DATA.categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
        formatter: (value: number) => `${value}`,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    tooltip: {
      shared: true,
      intersect: false,
      x: {
        show: true,
      },
      y: {
        formatter: (value: number) => `${value} Events`,
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
    },
  });

  // Holiday Distribution Chart Options
  const holidayDistributionOptions = useChart({
    colors: [theme.palette.info.main],
    stroke: {
      width: 0,
    },
    xaxis: {
      categories: HOLIDAY_DISTRIBUTION_DATA.categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    grid: {
      show: false,
    },
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 4,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} Holidays`,
      },
    },
  });

  // Event Type Breakdown Chart Options (Donut)
  const eventTypeChartSeries = EVENT_TYPE_DATA.map((item) => item.value);
  const eventTypeChartColors = [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
    theme.palette.success.main,
  ];

  const eventTypeOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors: eventTypeChartColors,
    labels: EVENT_TYPE_DATA.map((item) => item.label),
    stroke: {
      colors: [theme.palette.background.paper],
    },
    legend: {
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value}`,
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* A. DASHBOARD CARDS (KPIs) */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <DashboardCard
            title="Total Events"
            value={TOTAL_EVENTS_THIS_MONTH}
            icon="mdi:calendar-multiple"
            color="primary.main"
            bgColor="primary.lighter"
            description="This Month"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <DashboardCard
            title="Upcoming Holidays"
            value={UPCOMING_HOLIDAYS}
            icon="mdi:beach"
            color="info.main"
            bgColor="info.lighter"
            description="Next 7 Days"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <DashboardCard
            title="Active Groups"
            value={ACTIVE_GROUPS}
            icon="mdi:account-group"
            color="success.main"
            bgColor="success.lighter"
            description="With Audience"
          />
        </Grid>
      </Grid>

      {/* B. CHARTS SECTION */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Holiday Distribution (Monthly) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Holiday Distribution (Monthly)" />
            <Box sx={{ p: 3, pb: 1 }}>
              <Chart
                dir="ltr"
                type="bar"
                series={HOLIDAY_DISTRIBUTION_DATA.series}
                options={holidayDistributionOptions}
                width="100%"
                height={364}
              />
            </Box>
          </Card>
        </Grid>

        {/* Audience Participation Trend */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <AnalyticsWebsiteVisits
              title="Audience Participation"
              chart={{
                categories: AUDIENCE_PARTICIPATION_DATA.categories,
                series: AUDIENCE_PARTICIPATION_DATA.series,
                colors: [
                  theme.palette.primary.main,
                  theme.palette.warning.main,
                  theme.palette.info.main,
                  theme.palette.success.main,
                ],
                options: {
                  plotOptions: {
                    bar: {
                      distributed: true,
                      borderRadius: 4,
                    },
                  },
                  legend: {
                    show: false,
                  },
                },
              }}
            />
          </Card>
        </Grid>

        {/* Monthly Event Load Trend */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Monthly Event Load Trend" />
            <Box sx={{ p: 3, pb: 1 }}>
              <Chart
                dir="ltr"
                type="area"
                series={MONTHLY_EVENT_LOAD_DATA.series}
                options={eventLoadTrendOptions}
                width="100%"
                height={364}
              />
            </Box>
          </Card>
        </Grid>

        {/* Event Type Breakdown */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title="Event Type Breakdown" />
            <Box
              sx={{
                my: 6,
                '& .apexcharts-canvas': {
                  margin: '0 auto',
                },
              }}
            >
              <Chart
                dir="ltr"
                type="donut"
                series={eventTypeChartSeries}
                options={eventTypeOptions}
                width="100%"
                height={280}
              />
            </Box>
            <ChartLegends
              labels={eventTypeOptions?.labels}
              colors={eventTypeOptions?.colors}
              sx={{ p: 3, justifyContent: 'center' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
