import React from 'react';
import { Chart, useChart } from 'src/components/chart';
import { Box, Grid, Card, CardHeader } from '@mui/material';

const PrincipalCharts = () => {
  // Monthly Attendance Trend (Line Chart)
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
      data: [90, 92, 95, 88, 91, 94, 96, 93, 92, 95, 90, 92],
    },
  ];

  // Gender Ratio (Pie Chart)
  const genderRatioOptions = useChart({
    labels: ['Male', 'Female'],
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
        formatter: (value: number) => `${value}%`,
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

  const genderRatioSeries = [55, 45];

  // Class-wise Academic Performance (Bar Chart)
  const classPerformanceOptions = useChart({
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

  const classPerformanceSeries = [
    {
      name: 'Avg Score',
      data: [7.5, 8.2, 7.8, 8.5, 7.2],
    },
  ];

  return (
    <Grid container spacing={3}>
      {/* Monthly Attendance Trend - Full Width */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title="Monthly Attendance Trend" />
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

      {/* Gender Ratio - Half Width */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title="Gender Ratio" />
          <Box sx={{ p: 3, pb: 1 }} dir="ltr">
            <Chart
              dir="ltr"
              type="pie"
              series={genderRatioSeries}
              options={genderRatioOptions}
              height={300}
            />
          </Box>
        </Card>
      </Grid>

      {/* Class-wise Academic Performance - Half Width */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title="Class-wise Academic Performance" />
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

export default PrincipalCharts;
