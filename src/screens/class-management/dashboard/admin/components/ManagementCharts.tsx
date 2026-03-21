import React, { useState } from 'react';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Stack, CardHeader } from '@mui/material';

// ----------------------------------------------------------------------

export default function ManagementCharts() {
  const [strengthClass, setStrengthClass] = useState('All');
  const [attendanceClass, setAttendanceClass] = useState('Class 1');
  const [attendanceDivision, setAttendanceDivision] = useState('A');

  const classOptions = [
    { id: 'All', name: 'All Classes' },
    { id: 'Class 1', name: 'Class 1' },
    { id: 'Class 2', name: 'Class 2' },
    { id: 'Class 3', name: 'Class 3' },
    { id: 'Class 4', name: 'Class 4' },
    { id: 'Class 5', name: 'Class 5' },
  ];

  const divisionOptions = [
    { id: 'A', name: 'A' },
    { id: 'B', name: 'B' },
    { id: 'C', name: 'C' },
    { id: 'D', name: 'D' },
  ];

  // Logic for Class Strength Chart
  const strengthChartData =
    strengthClass === 'All'
      ? {
          categories: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
          series: [{ data: [180, 200, 190, 210, 220] }], // Total strength per class
        }
      : {
          categories: ['Div A', 'Div B', 'Div C', 'Div D'], // Divisions for selected class
          series: [{ data: [45, 42, 48, 45] }], // Mock data for divisions
        };

  const strengthChartOptions = useChart({
    plotOptions: {
      bar: {
        columnWidth: '45%',
        distributed: true,
      },
    },
    xaxis: {
      categories: strengthChartData.categories,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} Students`,
      },
    },
  });

  const attendanceChartOptions = useChart({
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}%`,
      },
    },
  });

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card dir="ltr">
          <CardHeader
            title="Class Strength Distribution"
            subheader={
              strengthClass === 'All'
                ? 'Total students per class'
                : `Division-wise breakdown for ${strengthClass}`
            }
            action={
              <Stack direction="row" spacing={1} alignItems="center">
                <CustomSelect
                  name="strengthClass"
                  label="Class"
                  value={strengthClass}
                  onChange={(v) => setStrengthClass(v as string)}
                  options={classOptions}
                  valueKey="id"
                  labelKey="name"
                  formControlProps={{ size: 'small', sx: { width: 180, flexShrink: 0 } }}
                />
              </Stack>
            }
          />
          <Box sx={{ p: 3, pb: 1 }}>
            <Chart
              dir="ltr"
              type="bar"
              series={strengthChartData.series}
              options={strengthChartOptions}
              width="100%"
              height={364}
            />
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card dir="ltr">
          <CardHeader
            title="Monthly Attendance Trend"
            subheader="(+5%) than last month"
            action={
              <Stack direction="row" spacing={1} alignItems="center">
                <CustomSelect
                  name="attendanceClass"
                  label="Class"
                  value={attendanceClass}
                  onChange={(v) => setAttendanceClass(v as string)}
                  options={classOptions.filter((c) => c.id !== 'All')}
                  valueKey="id"
                  labelKey="name"
                  formControlProps={{ size: 'small', sx: { width: 180, flexShrink: 0 } }}
                />
                <CustomSelect
                  name="attendanceDivision"
                  label="Division"
                  value={attendanceDivision}
                  onChange={(v) => setAttendanceDivision(v as string)}
                  options={divisionOptions}
                  valueKey="id"
                  labelKey="name"
                  formControlProps={{ size: 'small', sx: { width: 100, flexShrink: 0 } }}
                />
              </Stack>
            }
          />
          <Box sx={{ p: 3, pb: 1 }}>
            <Chart
              dir="ltr"
              type="line"
              series={[
                {
                  name: 'Current Year',
                  data: [85, 88, 86, 89, 90, 92, 91, 93, 94, 92, 95, 96],
                },
                {
                  name: 'Previous Year',
                  data: [80, 82, 84, 85, 87, 88, 89, 90, 91, 88, 89, 90],
                },
              ]}
              options={attendanceChartOptions}
              width="100%"
              height={364}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
