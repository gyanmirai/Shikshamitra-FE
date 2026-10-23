import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { Box, Paper, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { buildEmployeeAttendanceChart } from '../employee-dashboard-utils';

export default function EmployeeAttendanceTrendChart({ data }: { data: EmployeeDashboardData }) {
  const theme = useTheme();
  const chart = useMemo(() => buildEmployeeAttendanceChart(data), [data]);
  const options = useChart({
    colors: [
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
    ],
    chart: { stacked: true },
    xaxis: { categories: chart.categories },
    yaxis: { min: 0, title: { text: 'Days' } },
    legend: { show: true, position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (value: number) => `${value} ${value === 1 ? 'day' : 'days'}` } },
  });

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Attendance trend"
      sx={{ p: 2, borderRadius: 2, minWidth: 0 }}
    >
      <Typography variant="subtitle2" component="h3">
        Attendance trend
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 0.5, mb: 1 }}
      >
        {data.academicYearName ? `${data.academicYearName} · ` : ''}Monthly attendance and approved
        leave, in days
      </Typography>
      <Chart type="bar" series={chart.series} options={options} height={240} />
      <Box
        component="details"
        sx={{
          mt: 1,
          typography: 'caption',
          '& summary': {
            cursor: 'pointer',
            color: 'text.secondary',
            width: 'fit-content',
            '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
          },
        }}
      >
        <summary>View monthly attendance data</summary>
        <CustomizableTable
          tableId="hr-monthly-attendance-data"
          tableTitle="Monthly attendance data"
          variant="embedded"
          exportScope="all"
          showColumns
          showExport
          showFullScreen
          isPagination={false}
          isSearch={false}
          columns={[
            { id: 'month', label: 'Month' },
            ...chart.series.map((series, index) => ({
              id: `series${index}`,
              label: series.name,
              filterType: 'number' as const,
              align: 'right' as const,
            })),
          ]}
          data={chart.categories.map((month, index) => ({
            id: month,
            month,
            ...Object.fromEntries(
              chart.series.map((series, seriesIndex) => [
                `series${seriesIndex}`,
                series.data[index],
              ])
            ),
          }))}
          tableContainerProps={{ sx: { maxHeight: 360 } }}
          noDataText="No monthly attendance data."
        />
      </Box>
    </Paper>
  );
}
