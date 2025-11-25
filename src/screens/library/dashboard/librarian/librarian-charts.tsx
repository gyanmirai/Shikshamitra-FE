import { useTheme } from '@mui/material/styles';
import { fNumber } from 'src/utils/format-number';
import React, { useState, useCallback } from 'react';
import { Grid, Card, CardHeader } from '@mui/material';
import { Chart, useChart, ChartSelect } from 'src/components/chart';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

// Mock data for charts
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

const mockBookCategories = [
  { label: 'Fiction', value: 450 },
  { label: 'Non-Fiction', value: 280 },
  { label: 'Textbooks', value: 520 },
  { label: 'Reference', value: 350 },
  { label: 'Magazines', value: 180 },
  { label: 'Comics', value: 120 },
];

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

// Weekly Circulation Chart
export const WeeklyCirculationChart = () => {
  const theme = useTheme();
  const [selectedWeek, setSelectedWeek] = useState('Week 1');

  const chartColors = [theme.palette.primary.main, theme.palette.success.main];

  const currentWeekData = mockWeeklyCirculation.series.find((w) => w.name === selectedWeek);

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: mockWeeklyCirculation.categories },
    stroke: { width: 3, curve: 'smooth' },
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
      <Chart
        type="line"
        series={currentWeekData?.data}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
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

// Main Librarian Charts Component
const LibrarianCharts = () => (
  <Grid container spacing={3}>
    {/* Weekly Circulation Chart */}
    <Grid size={{ xs: 12 }}>
      <WeeklyCirculationChart />
    </Grid>

    {/* Book Categories Breakdown */}
    <Grid size={{ xs: 12, md: 6 }}>
      <AnalyticsCurrentVisits
        title="Book Categories Breakdown"
        chart={{ series: mockBookCategories }}
      />
    </Grid>

    {/* Section-wise Book Count */}
    <Grid size={{ xs: 12, md: 6 }}>
      <SectionBooksChart />
    </Grid>
  </Grid>
);

export default LibrarianCharts;
