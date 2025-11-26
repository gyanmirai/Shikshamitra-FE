import { useTheme } from '@mui/material/styles';
import { fNumber } from 'src/utils/format-number';
import React, { useState, useCallback } from 'react';
import { Grid, Card, CardHeader } from '@mui/material';
import { Chart, useChart, ChartSelect } from 'src/components/chart';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

// Reuse Weekly Circulation from Librarian
import { WeeklyCirculationChart } from '../librarian/librarian-charts';

// Mock data for Admin-specific charts
const mockCategoryRatio = [
  { label: 'Fiction', value: 450 },
  { label: 'Non-Fiction', value: 280 },
  { label: 'Textbooks', value: 520 },
  { label: 'Reference', value: 350 },
  { label: 'Magazines', value: 180 },
  { label: 'Comics', value: 120 },
];

const mockMemberActivity = {
  series: [
    {
      name: '2023',
      data: [
        {
          name: 'Books Issued',
          data: [120, 150, 180, 210, 195, 225, 240, 230, 215, 200, 185, 220],
        },
      ],
    },
    {
      name: '2024',
      data: [
        {
          name: 'Books Issued',
          data: [135, 165, 195, 225, 210, 245, 260, 250, 235, 220, 205, 240],
        },
      ],
    },
  ],
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

// Member Activity Trend Chart
export const MemberActivityChart = () => {
  const theme = useTheme();
  const [selectedYear, setSelectedYear] = useState('2024');

  const chartColors = [theme.palette.primary.main];

  const currentYearData = mockMemberActivity.series.find((y) => y.name === selectedYear);

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: mockMemberActivity.categories },
    stroke: { width: 3, curve: 'smooth' },
    markers: { size: 5 },
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
  });

  const handleChangeYear = useCallback((newValue: string) => {
    setSelectedYear(newValue);
  }, []);

  return (
    <Card>
      <CardHeader
        title="Member Activity Trend"
        subheader="Monthly borrowing activity"
        action={
          <ChartSelect
            options={mockMemberActivity.series.map((item) => item.name)}
            value={selectedYear}
            onChange={handleChangeYear}
          />
        }
      />
      <Chart
        type="line"
        series={currentYearData?.data}
        options={chartOptions}
        height={340}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
};

// Main Admin Charts Component
const AdminCharts = () => (
  <Grid container spacing={3}>
    {/* Category-wise Books Ratio */}
    <Grid size={{ xs: 12, md: 4 }}>
      <AnalyticsCurrentVisits
        title="Category-wise Books Ratio"
        chart={{ series: mockCategoryRatio }}
      />
    </Grid>

    {/* Member Activity Trend */}
    <Grid size={{ xs: 12, md: 8 }}>
      <MemberActivityChart />
    </Grid>

    {/* Weekly Circulation (Reused from Librarian) */}
    <Grid size={{ xs: 12 }}>
      <WeeklyCirculationChart />
    </Grid>
  </Grid>
);

export default AdminCharts;
