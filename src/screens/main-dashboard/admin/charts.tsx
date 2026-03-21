'use client';

import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { AppCurrentDownload } from 'src/screens/hr/dashboard/app-current-download';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import AllInfoCalendar from './components/AllInfoCalendar';
import StudentStrengthChart from './student-strength-chart';
import TeacherWorkloadChart from './teacher-workload-chart';
import RouteVehicleUtilizationChart from './route-vehicle-utilization-chart';
import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';

// ----------------------------------------------------------------------

const MONTH_OPTIONS = [
  { value: 'apr', label: 'April' },
  { value: 'may', label: 'May' },
  { value: 'jun', label: 'June' },
  { value: 'jul', label: 'July' },
  { value: 'aug', label: 'August' },
  { value: 'sep', label: 'September' },
  { value: 'oct', label: 'October' },
  { value: 'nov', label: 'November' },
  { value: 'dec', label: 'December' },
  { value: 'jan', label: 'January' },
  { value: 'feb', label: 'February' },
  { value: 'mar', label: 'March' },
];

const ATTENDANCE_BY_MONTH: Record<string, { student: number[]; staff: number[] }> = {
  apr: { student: [88, 90, 87, 91], staff: [93, 94, 92, 95] },
  may: { student: [90, 89, 92, 91], staff: [95, 94, 96, 95] },
  jun: { student: [85, 88, 86, 89], staff: [92, 93, 91, 94] },
  jul: { student: [91, 93, 90, 94], staff: [96, 95, 97, 96] },
  aug: { student: [89, 92, 91, 93], staff: [94, 96, 95, 97] },
  sep: { student: [93, 94, 92, 95], staff: [97, 96, 98, 97] },
  oct: { student: [90, 91, 93, 92], staff: [95, 96, 97, 96] },
  nov: { student: [88, 90, 89, 91], staff: [93, 95, 94, 96] },
  dec: { student: [86, 87, 85, 88], staff: [91, 92, 90, 93] },
  jan: { student: [92, 94, 91, 95], staff: [96, 97, 95, 98] },
  feb: { student: [93, 95, 94, 96], staff: [97, 98, 96, 97] },
  mar: { student: [91, 93, 92, 94], staff: [95, 96, 94, 97] },
};

const renderTitleWithTooltip = (title: string, tooltip: string) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box component="span">{title}</Box>
    <CustomTooltip title={tooltip} arrow placement="top">
      <Iconify
        icon="eva:info-outline"
        width={18}
        sx={{ color: 'text.disabled', cursor: 'pointer' }}
      />
    </CustomTooltip>
  </Stack>
);

const AdminCharts = () => {
  const theme = useTheme();
  const [attendanceMonth, setAttendanceMonth] = useState('feb');

  return (
    <Grid container spacing={1}>
      {/* Bar Chart – Student Strength by Class */}
      <Grid size={{ xs: 12, md: 8 }}>
        <StudentStrengthChart
          title={renderTitleWithTooltip(
            'Student Strength by Class',
            'Class-wise breakdown of enrolled students by gender. Hover each bar for Boys, Girls & Total per class. ⚠ marks classes significantly below average enrollment.'
          )}
          subheader="Boys vs Girls distribution — hover bars for class totals"
          chart={{
            series: [
              {
                name: 'Yearly',
                categories: [
                  'Class 6',
                  'Class 7',
                  'Class 8',
                  'Class 9',
                  'Class 10',
                  'Class 11',
                  'Class 12',
                ],
                data: [
                  { name: 'Boys', data: [120, 135, 118, 142, 160, 98, 105] },
                  { name: 'Girls', data: [110, 125, 130, 138, 152, 88, 95] },
                ],
              },
            ],
          }}
        />
      </Grid>

      {/* Donut – Fee Collection Status */}
      <Grid size={{ xs: 12, md: 4 }}>
        <AppCurrentDownload
          title={renderTitleWithTooltip(
            'Fee Collection (This Year)',
            'Distribution of fee payments this month — paid, pending, and overdue amounts. Hover segments for student counts.'
          )}
          subheader="Paid ₹18L · Pending ₹5L · Overdue ₹2.4L"
          chart={{
            series: [
              { label: 'Paid', value: 1800000 },
              { label: 'Pending', value: 500000 },
              { label: 'Overdue', value: 240000 },
            ],
            colors: [
              theme.palette.primary.main,
              theme.palette.warning.main,
              theme.palette.error.main,
            ],
            options: {
              tooltip: {
                y: {
                  formatter: (value: number, opts: any) => {
                    const studentCounts: Record<number, string> = {
                      0: '1,430 students',
                      1: '320 students',
                      2: '180 students',
                    };
                    const idx = opts?.seriesIndex ?? -1;
                    const extra = studentCounts[idx] ? ` · ${studentCounts[idx]}` : '';
                    return `${formatNumber(value, 'INR')}${extra}`;
                  },
                },
              },
              plotOptions: {
                pie: {
                  donut: {
                    size: '72%',
                    labels: {
                      value: {
                        formatter: (value: number | string) => formatNumber(Number(value), 'INR'),
                      },
                      total: {
                        label: 'Total Fee',
                        formatter: (w: { globals: { seriesTotals: number[] } }) => {
                          const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                          return formatNumber(sum, 'INR');
                        },
                      },
                    },
                  },
                },
              },
            },
          }}
        />
      </Grid>

      {/* Line Chart – Attendance Trend */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DashboardWidgetWrapper
          title={renderTitleWithTooltip(
            'Attendance Trend',
            'Weekly attendance percentage for students and staff across the selected month.'
          )}
          subheader="Weekly student & staff attendance %"
          action={
            <CustomSelect
              label="Month"
              options={MONTH_OPTIONS}
              onChange={(e) => setAttendanceMonth(e as string)}
              value={attendanceMonth}
              formControlProps={{ sx: { minWidth: '120px' } }}
            />
          }
        >
          <AnalyticsWebsiteVisits
            title=""
            chart={{
              categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              series: [
                {
                  name: 'Student Attendance',
                  data: ATTENDANCE_BY_MONTH[attendanceMonth].student,
                },
                {
                  name: 'Staff Attendance',
                  data: ATTENDANCE_BY_MONTH[attendanceMonth].staff,
                },
              ],
              options: {
                tooltip: {
                  y: {
                    formatter: (value: number) => `${value}`,
                  },
                },
                yaxis: {
                  min: 80,
                  max: 100,
                  labels: {
                    formatter: (value: number) => `${value}`,
                  },
                },
              },
            }}
            sx={{ boxShadow: 'none' }}
          />
        </DashboardWidgetWrapper>
      </Grid>

      {/* Horizontal Bar Chart – Teacher Workload Distribution */}
      <Grid size={{ xs: 12, md: 6 }}>
        <TeacherWorkloadChart />
      </Grid>

      {/* Grouped Vertical Bar Chart – Route Vehicle Utilization */}
      <Grid size={{ xs: 12, md: 6 }}>
        <RouteVehicleUtilizationChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AllInfoCalendar />
      </Grid>
    </Grid>
  );
};

export default AdminCharts;
