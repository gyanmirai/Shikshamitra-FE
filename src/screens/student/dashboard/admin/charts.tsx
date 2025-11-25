import React from 'react';
import { Chart, useChart } from 'src/components/chart';
import { Box, Grid, Card, CardHeader } from '@mui/material';

const AdminCharts = () => {
  // Enrollment Trend (Line Chart)
  const enrollmentTrendOptions = useChart({
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

  const enrollmentTrendSeries = [
    {
      name: 'Enrollment',
      data: [31, 40, 28, 51, 42, 109, 100, 120, 80, 50, 30, 40],
    },
    {
      name: 'Inquiries',
      data: [11, 32, 45, 32, 34, 52, 41, 80, 90, 30, 20, 10],
    },
  ];

  // Entrance Exam Status (Pie Chart)
  const examStatusOptions = useChart({
    labels: ['Passed', 'Failed', 'Awaiting Result'],
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

  const examStatusSeries = [45, 25, 30];

  // Class-wise Participation (Bar Chart)
  const classParticipationOptions = useChart({
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    },
  });

  const classParticipationSeries = [
    {
      name: 'Students',
      data: [44, 55, 41, 67, 22],
    },
  ];

  return (
    <Grid container spacing={3}>
      {/* Enrollment Trend - Full Width */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title="Enrollment Trend" />
          <Box sx={{ p: 3, pb: 1 }} dir="ltr">
            <Chart
              dir="ltr"
              type="area"
              series={enrollmentTrendSeries}
              options={enrollmentTrendOptions}
              height={364}
            />
          </Box>
        </Card>
      </Grid>

      {/* Entrance Exam Status - Half Width */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title="Entrance Exam Status" />
          <Box sx={{ p: 3, pb: 1 }} dir="ltr">
            <Chart
              dir="ltr"
              type="pie"
              series={examStatusSeries}
              options={examStatusOptions}
              height={300}
            />
          </Box>
        </Card>
      </Grid>

      {/* Class-wise Participation - Half Width */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title="Class-wise Participation" />
          <Box sx={{ p: 3, pb: 1 }} dir="ltr">
            <Chart
              dir="ltr"
              type="bar"
              series={classParticipationSeries}
              options={classParticipationOptions}
              height={300}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminCharts;
