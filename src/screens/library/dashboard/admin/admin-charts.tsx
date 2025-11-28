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

  const chartColors = [theme.palette.primary.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories: mockCategoryDistribution.categories,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '80%',
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px', // Reduce font size to fit many categories
        },
      },
    },
    grid: {
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
  });

  return (
    <Card>
      <CardHeader title="Book Category Distribution" subheader="Total books per category" />
      <Chart
        type="bar"
        series={mockCategoryDistribution.series}
        options={{
          ...chartOptions,
          plotOptions: {
            bar: {
              horizontal: false, // Changed to vertical
              columnWidth: '70%', // Use columnWidth for vertical bars
              borderRadius: 2,
            },
          },
          xaxis: {
            categories: mockCategoryDistribution.categories,
            labels: {
              style: {
                fontSize: '11px', // Adjust font size for x-axis categories
              },
            },
          },
          yaxis: {
            labels: {
              style: {
                fontSize: '12px', // Default font size for y-axis values
              },
            },
          },
          grid: {
            ...(chartOptions?.grid || {}),
            xaxis: {
              lines: {
                show: false, // Hide vertical grid lines for vertical bars
              },
            },
            yaxis: {
              lines: {
                show: true, // Show horizontal grid lines for vertical bars
              },
            },
          },
        }}
        height={400} // Adjust height for vertical chart
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

// Weekly Circulation Chart
export const WeeklyCirculationChart = () => {
  const theme = useTheme();
  const [selectedWeek, setSelectedWeek] = useState('Week 1');

  const chartColors = [theme.palette.success.main, theme.palette.error.main];

  const currentWeekData = mockWeeklyCirculation.series.find((w) => w.name === selectedWeek);

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: mockWeeklyCirculation.categories },
    stroke: { width: 2, curve: 'smooth' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => fNumber(value),
      },
    },
  });

  const handleChangeWeek = useCallback((newValue: string) => {
    setSelectedWeek(newValue);
  }, []);

  return (
    <Card>
      <CardHeader
        title="Weekly Issue/Return Circulation"
        subheader="Last 7 days book circulation activity"
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

  const chartColors = [theme.palette.info.main];

  const currentSectionData = mockSectionBooks.series.find((s) => s.name === selectedSection);

  const categories = currentSectionData?.data.map((item) => item.name) || [];
  const seriesData = currentSectionData?.data.map((item) => item.data[0]) || [];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: '12px', fontWeight: 'bold' },
    },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
      },
    },
  });

  const handleChangeSection = useCallback((newValue: string) => {
    setSelectedSection(newValue);
  }, []);

  return (
    <Card>
      <CardHeader
        title="Section-wise Book Count"
        subheader="Books distribution across shelves"
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
    {/* Category Distribution Chart */}
    <Grid size={{ xs: 12 }}>
      <CategoryDistributionChart />
    </Grid>

    {/* Member Activity Trend */}
    <Grid size={{ xs: 12, md: 6 }}>
      <MemberActivityChart />
    </Grid>

    {/* Weekly Circulation */}
    <Grid size={{ xs: 12, md: 6 }}>
      <WeeklyCirculationChart />
    </Grid>

    {/* Section-wise Book Count */}
    <Grid size={{ xs: 12 }}>
      <SectionBooksChart />
    </Grid>
  </Grid>
);

export default AdminCharts;
