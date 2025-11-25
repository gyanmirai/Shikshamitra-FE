import React from 'react';
import { Chart, useChart } from 'src/components/chart';
import { Box, Grid, Card, CardHeader } from '@mui/material';

const TeacherCharts = () => {
  // My Class Attendance Trend (Line Chart)
  const attendanceTrendOptions = useChart({
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
      x: {
        format: 'dd/MM/yy HH:mm',
      },
    },
  });

  const attendanceTrendSeries = [
    {
      name: 'Attendance %',
      data: [95, 96, 94, 98, 97, 95, 96, 94, 98, 97, 96, 95],
    },
  ];

  // Section-wise Strength (Pie Chart) - Renamed to Student Distribution for clarity in pie chart context
  const studentDistributionOptions = useChart({
    labels: ['Boys', 'Girls'],
    stroke: {
      colors: ['#fff'],
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value}`,
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
  });

  const studentDistributionSeries = [25, 20];

  // My Class Performance Trend (Bar Chart)
  const classPerformanceOptions = useChart({
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: ['Math', 'Science', 'English', 'History', 'Geography'],
    },
  });

  const classPerformanceSeries = [
    {
      name: 'Avg Score',
      data: [85, 78, 92, 88, 76],
    },
  ];

  return (
    <Grid container spacing={3}>
      {/* My Class Attendance Trend - Full Width */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title="My Class Attendance Trend" />
          <Box sx={{ p: 3, pb: 1 }} dir="ltr">
            <Chart
              dir="ltr"
              type="area"
              series={attendanceTrendSeries}
              options={attendanceTrendOptions}
              height={364}
            />
          </Box>
        </Card>
      </Grid>

      {/* Student Distribution - Half Width */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title="Student Distribution" />
          <Box sx={{ p: 3, pb: 1 }} dir="ltr">
            <Chart
              dir="ltr"
              type="pie"
              series={studentDistributionSeries}
              options={studentDistributionOptions}
              height={300}
            />
          </Box>
        </Card>
      </Grid>

      {/* My Class Performance Trend - Half Width */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title="Subject Performance" />
          <Box sx={{ p: 3, pb: 1 }} dir="ltr">
            <Chart
              dir="ltr"
              type="bar"
              series={classPerformanceSeries}
              options={classPerformanceOptions}
              height={300}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TeacherCharts;
