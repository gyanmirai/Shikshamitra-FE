import React from 'react';
import { useTheme } from '@mui/material/styles';
import { fNumber } from 'src/utils/format-number';
import { Grid, Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

// Mock data for Principal chart
const mockMonthlyTrend = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    { name: 'Books Issued', data: [245, 280, 310, 295, 320, 350, 365, 342, 328, 315, 298, 340] },
    { name: 'Books Returned', data: [230, 265, 295, 285, 310, 335, 350, 330, 315, 305, 285, 325] },
  ],
};

// Monthly Issue/Return Trend Chart
export const MonthlyIssuReturnChart = () => {
  const theme = useTheme();

  const chartColors = [theme.palette.primary.main, theme.palette.success.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: mockMonthlyTrend.categories },
    stroke: { width: 3, curve: 'smooth' },
    markers: { size: 6 },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${fNumber(value)} books`,
      },
    },
    yaxis: {
      title: { text: 'Number of Books' },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
  });

  return (
    <Card>
      <CardHeader title="Monthly Issue/Return Trend" subheader="Student engagement over the year" />
      <Chart
        type="line"
        series={mockMonthlyTrend.series}
        options={chartOptions}
        height={400}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
};

// Main Principal Charts Component
const PrincipalCharts = () => (
  <Grid container spacing={3}>
    {/* Monthly Issue/Return Trend */}
    <Grid size={{ xs: 12 }}>
      <MonthlyIssuReturnChart />
    </Grid>
  </Grid>
);

export default PrincipalCharts;
