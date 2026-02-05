import { useTheme } from '@mui/material/styles';
import { fNumber } from 'src/utils/format-number';
import React, { useState, useCallback } from 'react';
import { Box, Grid, Card, CardHeader } from '@mui/material';
import { Chart, useChart, ChartSelect } from 'src/components/chart';

// Mock data for Admin-specific charts
const mockCategoryDistribution = {
  series: [
    {
      name: 'Books',
      data: [
        450, 280, 520, 350, 180, 120, 300, 250, 400, 150, 100, 200, 320, 210, 190, 140, 160, 220,
        270, 310, 330, 360, 380, 410, 430, 460, 480, 500,
      ],
    },
  ],
  categories: [
    'Fiction',
    'Non-Fiction',
    'Textbooks',
    'Reference',
    'Magazines',
    'Comics',
    'Biography',
    'History',
    'Science',
    'Technology',
    'Art',
    'Music',
    'Sports',
    'Travel',
    'Cooking',
    'Health',
    'Business',
    'Economics',
    'Politics',
    'Law',
    'Religion',
    'Philosophy',
    'Psychology',
    'Sociology',
    'Education',
    'Literature',
    'Poetry',
    'Drama',
  ],
};

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

// Mock data from Librarian
const mockWeeklyCirculation = {
  series: [
    {
      name: 'Week 1',
      data: [
        { name: 'Issued', data: [45, 38, 52, 41, 48, 35, 42] },
        { name: 'Returned', data: [38, 42, 45, 39, 44, 38, 40] },
      ],
    },
    {
      name: 'Week 2',
      data: [
        { name: 'Issued', data: [42, 40, 48, 45, 50, 38, 44] },
        { name: 'Returned', data: [40, 38, 46, 42, 48, 36, 42] },
      ],
    },
    {
      name: 'Week 3',
      data: [
        { name: 'Issued', data: [50, 45, 55, 48, 52, 42, 48] },
        { name: 'Returned', data: [48, 43, 52, 46, 50, 40, 46] },
      ],
    },
  ],
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

const mockSectionBooks = {
  series: [
    {
      name: 'Section A',
      data: [
        { name: 'Shelf 1', data: [45] },
        { name: 'Shelf 2', data: [52] },
        { name: 'Shelf 3', data: [38] },
        { name: 'Shelf 4', data: [48] },
        { name: 'Shelf 5', data: [42] },
      ],
    },
    {
      name: 'Section B',
      data: [
        { name: 'Shelf 1', data: [38] },
        { name: 'Shelf 2', data: [45] },
        { name: 'Shelf 3', data: [42] },
        { name: 'Shelf 4', data: [40] },
        { name: 'Shelf 5', data: [35] },
      ],
    },
    {
      name: 'Section C',
      data: [
        { name: 'Shelf 1', data: [50] },
        { name: 'Shelf 2', data: [48] },
        { name: 'Shelf 3', data: [55] },
        { name: 'Shelf 4', data: [52] },
        { name: 'Shelf 5', data: [46] },
      ],
    },
  ],
};

// Category Distribution Chart (Horizontal Bar)
export const CategoryDistributionChart = () => {
  const theme = useTheme();

  // Limit to top 10 categories for clarity
  const topCategories = mockCategoryDistribution.categories.slice(0, 10);
  const topSeriesData = mockCategoryDistribution.series[0].data.slice(0, 10);

  const chartColors = [theme.palette.info.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories: topCategories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true, // Switched to horizontal for better label readability
        barHeight: '60%',
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: { colors: ['#fff'] },
      formatter: (val, opt) => (Number(val) > 0 ? `${val}` : ''),
      offsetX: 0,
    },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
  });

  return (
    <Card
      sx={{
        height: '100%', // Ensure equal height in grid
        boxShadow: theme.customShadows?.z1 || theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader title="Top Book Categories" subheader="Highest inventory counts" />
      <Chart
        type="bar"
        series={[{ name: 'Books', data: topSeriesData }]}
        options={chartOptions}
        height={340} // Match other charts
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
};

// Member Activity Trend Chart
export const MemberActivityChart = () => {
  const theme = useTheme();
  const [selectedYear, setSelectedYear] = useState('2024');

  const chartColors = [theme.palette.primary.main];

  const currentYearData = mockMemberActivity.series.find((y) => y.name === selectedYear);

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories: mockMemberActivity.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    stroke: { width: 3, curve: 'smooth' },
    markers: { size: 4, strokeColors: theme.palette.background.paper, strokeWidth: 2 },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${fNumber(value)} books`,
      },
    },
    yaxis: {
      title: { text: undefined }, // Clean look
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
  });

  const handleChangeYear = useCallback((newValue: string) => {
    setSelectedYear(newValue);
  }, []);

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: theme.customShadows?.z1 || theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        title="Member Activity Trend"
        subheader="Books issued over time"
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

// Weekly Circulation Chart
export const WeeklyCirculationChart = () => {
  const theme = useTheme();
  const [selectedWeek, setSelectedWeek] = useState('Week 1');

  // Blue for Issued (Action), Green for Returned (Completion/Good)
  const chartColors = [theme.palette.primary.main, theme.palette.success.main];

  const currentWeekData = mockWeeklyCirculation.series.find((w) => w.name === selectedWeek);

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories: mockWeeklyCirculation.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    stroke: { width: 2, curve: 'smooth' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.1 } }, // Lighter fill
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => fNumber(value),
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } },
    },
  });

  const handleChangeWeek = useCallback((newValue: string) => {
    setSelectedWeek(newValue);
  }, []);

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: theme.customShadows?.z1 || theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        title="Weekly Circulation"
        subheader="Issued vs Returned"
        action={
          <ChartSelect
            options={mockWeeklyCirculation.series.map((item) => item.name)}
            value={selectedWeek}
            onChange={handleChangeWeek}
          />
        }
      />
      <Box sx={{ mt: 3, mx: 3 }} dir="ltr">
        <Chart type="area" series={currentWeekData?.data} options={chartOptions} height={340} />
      </Box>
    </Card>
  );
};

// Section-wise Book Count Chart
export const SectionBooksChart = () => {
  const theme = useTheme();
  const [selectedSection, setSelectedSection] = useState('Section A');

  const chartColors = [theme.palette.secondary.main]; // Use secondary for variety

  const currentSectionData = mockSectionBooks.series.find((s) => s.name === selectedSection);

  const categories = currentSectionData?.data.map((item) => item.name) || [];
  const seriesData = currentSectionData?.data.map((item) => item.data[0]) || [];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary, fontWeight: 500 } },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '40%', // Slimmer bars
      },
    },
    dataLabels: {
      enabled: false, // Cleaner look without numbering every bar
    },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } },
    },
  });

  const handleChangeSection = useCallback((newValue: string) => {
    setSelectedSection(newValue);
  }, []);

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: theme.customShadows?.z1 || theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        title="Shelf Occupancy"
        subheader="Book count per shelf"
        action={
          <ChartSelect
            options={mockSectionBooks.series.map((item) => item.name)}
            value={selectedSection}
            onChange={handleChangeSection}
          />
        }
      />
      <Chart
        type="bar"
        series={[{ name: 'Books', data: seriesData }]}
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
    {/* Row 1: Circulation & Quick Stats have priority */}
    <Grid size={{ xs: 12, md: 8 }}>
      <WeeklyCirculationChart />
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      {/* This spot is perfect for the new Quick Actions card, but it's passed in parent usually. 
           Here we define the charts only. We'll adjust index.tsx to handle layout. 
           For this file, I'll export components individually if needed, but the default export is the Grid.
           Actually, the Implementation Plan says "Reorder layout in index.tsx".
           So I should just export these individual charts or keep the Grid structure here but maybe minimal.
           
           Let's change AdminCharts to just export the individual components so index.tsx has full control?
           Refactoring: I'll export individual components as named exports (already done) and keep AdminCharts as a default composition 
           BUT I will update AdminCharts to reflect a good default layout if used alone.
       */}
      <MemberActivityChart />
    </Grid>

    {/* Row 2: Inventory Analysis */}
    <Grid size={{ xs: 12, md: 6 }}>
      <CategoryDistributionChart />
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <SectionBooksChart />
    </Grid>
  </Grid>
);

export default AdminCharts;
