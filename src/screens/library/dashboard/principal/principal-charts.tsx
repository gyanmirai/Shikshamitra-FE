import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { useTheme } from '@mui/material/styles';
import { fNumber } from 'src/utils/format-number';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, Grid, CardHeader, Typography } from '@mui/material';

export default function PrincipalCharts({ overview }: { overview?: LibraryDashboardOverview }) {
  const theme = useTheme();
  const weeklyPoints = overview?.weeklyCirculation || [];
  const categories = overview?.categoryDistribution || [];

  const lineChartOptions = useChart({
    colors: [theme.palette.primary.main, theme.palette.warning.main],
    stroke: { width: 3, curve: 'smooth' },
    xaxis: {
      categories: weeklyPoints.length ? weeklyPoints.map((point: any) => point.label) : [],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: () => 'Transactions: ' },
      },
    },
  });

  const barChartOptions = useChart({
    colors: [theme.palette.info.main],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '45%',
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: categories.map((category: any) => category.categoryName),
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${fNumber(val)} copies`,
        title: { formatter: () => '' },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
  });

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Card
          sx={{
            height: '100%',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <CardHeader
            title="Weekly Circulation Trend"
            subheader="Books issued and returned over the selected academic week"
            sx={{ mb: 3 }}
          />

          <Box sx={{ pb: 3, px: 1 }} dir="ltr">
            {weeklyPoints.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                No circulation trend data available.
              </Typography>
            ) : (
              <Chart
                type="line"
                series={[
                  { name: 'Issued', data: weeklyPoints.map((point: any) => point.issued) },
                  { name: 'Returned', data: weeklyPoints.map((point: any) => point.returned) },
                ]}
                options={lineChartOptions}
                height={320}
              />
            )}
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            height: '100%',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <CardHeader title="Top Categories" subheader="By copy volume" sx={{ mb: 2 }} />

          <Box sx={{ pb: 3, px: 1 }} dir="ltr">
            {categories.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                No category distribution data available.
              </Typography>
            ) : (
              <Chart
                type="bar"
                series={[
                  { name: 'Copies', data: categories.map((category: any) => category.copyCount) },
                ]}
                options={barChartOptions}
                height={320}
              />
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
