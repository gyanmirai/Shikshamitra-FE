import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

const InventoryCategoryChart = () => {
  const theme = useTheme();
  const months = ['January', 'February', 'March', 'April'];
  const years = ['2023', '2024', '2025'];

  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');

  const dataByMonthYear: { [key: string]: { available: number[]; issued: number[] } } = {
    'April-2025': { available: [24, 41, 35, 50], issued: [12, 22, 18, 30] },
    'March-2025': { available: [20, 33, 28, 40], issued: [15, 20, 10, 25] },
  };

  const key = `${selectedMonth}-${selectedYear}`;
  const chartData = dataByMonthYear[key] || { available: [], issued: [] };

  const series = [
    { name: 'Available', data: chartData.available },
    { name: 'Issued', data: chartData.issued },
  ];

  const chartColors = [theme.vars.palette.primary.dark, theme.vars.palette.warning.main];

  const chartOptions = useChart({
    stroke: { width: 2, colors: ['transparent'] },
    colors: chartColors,
    xaxis: { categories: ['IT', 'Books', 'Sports', 'Stationary'] },
    tooltip: { y: { formatter: (value: number) => value.toString() } },
  });

  return (
    <Card>
      <CardHeader
        title=" Inventory Status by Category"
        action={
          <Box display="flex" gap={2}>
            <ChartSelect
              options={months.map((item) => item)}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e)}
            />

            <ChartSelect
              options={years.map((item) => item)}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e)}
            />
          </Box>
        }
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartColors}
        labels={['Available', 'Issued']}
        sx={{ px: 3, gap: 2, flexDirection: 'row', alignItems: 'flex-start', mb: 2, mt: -1 }}
      />

      <Chart
        options={chartOptions}
        series={series}
        type="bar"
        height={350}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
};
export default InventoryCategoryChart;
