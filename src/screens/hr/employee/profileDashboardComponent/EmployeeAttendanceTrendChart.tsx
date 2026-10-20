import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import {
  Box,
  Paper,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

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
        <TableContainer>
          <Table size="small" aria-label="Monthly attendance data">
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                {chart.series.map((series) => (
                  <TableCell key={series.name} align="right">
                    {series.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {chart.categories.map((month, index) => (
                <TableRow key={month}>
                  <TableCell component="th" scope="row">
                    {month}
                  </TableCell>
                  {chart.series.map((series) => (
                    <TableCell key={series.name} align="right">
                      {series.data[index]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
}
