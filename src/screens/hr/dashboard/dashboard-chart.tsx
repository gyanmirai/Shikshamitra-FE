import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Chart } from 'src/components/chart';
import { useTheme } from '@mui/material/styles';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { Card, Grid, Typography, CardContent } from '@mui/material';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';
import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const DashboardChart = () => {
  const theme = useTheme();
  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <AppCurrentDownload
          title="Staff Count by Group"
          subheader=""
          chart={{
            series: [
              { label: 'Non-teaching Staff', value: 50 },
              { label: 'Teaching Staff', value: 70 },
            ],
            colors: [theme.vars.palette.primary.light, theme.vars.palette.primary.darker],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
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
                  { name: 'Primary', data: [10, 41, 35, 69, 91, 148, 35, 51, 49, 62, 51, 49] },
                ],
              },
              {
                name: '2023',
                data: [
                  {
                    name: 'Total Attendance',
                    data: [91, 148, 35, 51, 49, 10, 41, 35, 51, 49, 62, 69],
                  },
                  { name: 'Primary', data: [49, 62, 69, 91, 10, 41, 35, 51, 148, 35, 51, 49] },
                ],
              },
            ],
            colors: [
              theme.palette.primary.main,
              varAlpha(theme.vars.palette.warning.mainChannel, 0.5),
            ],
          }}
          sx={{ height: 1 }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
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

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <AnalyticsWebsiteVisits
            title="Payroll Distribution"
            subheader=""
            chart={{
              categories: ['Admin', 'Teaching', 'Non-teaching', 'Support', 'Other'],
              series: [{ name: 'Payroll', data: [15000, 12000, 8000, 10000, 5000] }],
              options: {
                yaxis: { labels: { formatter: (value: number) => `${formatCurrency(value)}` } },
                tooltip: { y: { formatter: (value: number) => `${formatCurrency(value)}` } },
              },
            }}
            sx={{ height: '100%' }}
          />
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ height: '100%' }}>
            <Typography variant="h6">Staff Retention Ratio</Typography>
            <Chart
              type="area"
              series={[{ name: 'Turnover Rate', data: [3, 5, 2, 4, 3, 2, 6] }]}
              options={{
                xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
                colors: ['#FFA600'],
                chart: { toolbar: { show: false } },
              }}
              height="100%"
            />
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default DashboardChart;
