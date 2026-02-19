import { useTheme } from '@mui/material/styles';
import { fNumber } from 'src/utils/format-number';
import React, { useState, useCallback } from 'react';
import { Box, Card, Grid, CardHeader } from '@mui/material';
import { Chart, useChart, ChartSelect } from 'src/components/chart';

// ----------------------------------------------------------------------

// Mock data for Monthly Circulation Trend (Last 12 Months)
const mockMonthlyCirculation = {
  series: [
    {
      name: '2023',
      data: [
        {
          name: 'Average',
          data: [2100, 2400, 2200, 2600, 2800, 2500, 2700, 2900, 3100, 3000, 3200, 3450],
        },
      ],
    },
    {
      name: '2022',
      data: [
        {
          name: 'Average',
          data: [1800, 2000, 1900, 2100, 2300, 2200, 2400, 2500, 2600, 2700, 2800, 3000],
        },
      ],
    },
  ],
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

// Mock data for Category Distribution (Top 5)
const mockCategoryData = [
  { label: 'Fiction', value: 4500 },
  { label: 'Academic', value: 3800 },
  { label: 'Science', value: 2100 },
  { label: 'History', value: 1200 },
  { label: 'Reference', value: 850 },
];

export default function PrincipalCharts() {
  const theme = useTheme();
  const [selectedYear, setSelectedYear] = useState('2023');

  const handleChangeYear = useCallback((newValue: string) => {
    setSelectedYear(newValue);
  }, []);

  const currentYearSeries =
    mockMonthlyCirculation.series.find((s) => s.name === selectedYear)?.data[0].data || [];

  const chartOptions = useChart({
    colors: [theme.palette.primary.main, theme.palette.warning.main],
    stroke: { width: 3, curve: 'smooth' },
    xaxis: {
      categories: mockMonthlyCirculation.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } }, // Clean grid like Admin
    },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: () => 'Books Issued: ' },
      },
    },
  });

  // Horizontal Bar Chart for Categories
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
      categories: mockCategoryData.map((c) => c.label),
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${fNumber(val)} books`,
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
      {/* Monthly Circulation Trend */}
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
            title="Monthly Circulation Trend"
            subheader="Comparison of books issued over the last 12 months"
            action={
              <ChartSelect
                options={mockMonthlyCirculation.series.map((item) => item.name)}
                value={selectedYear}
                onChange={handleChangeYear}
              />
            }
            sx={{ mb: 3 }}
          />

          <Box sx={{ pb: 3, px: 1 }} dir="ltr">
            <Chart
              type="line"
              series={[{ name: 'Issued', data: currentYearSeries }]}
              options={chartOptions}
              height={320}
            />
          </Box>
        </Card>
      </Grid>

      {/* Top 5 Categories */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            height: '100%',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <CardHeader title="Top 5 Categories" subheader="By volume" sx={{ mb: 2 }} />

          <Box sx={{ pb: 3, px: 1 }} dir="ltr">
            <Chart
              type="bar"
              series={[{ name: 'Count', data: mockCategoryData.map((c) => c.value) }]}
              options={barChartOptions}
              height={320}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
