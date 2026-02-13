import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomTooltip from 'src/components/custom-tooltip';
import { fNumber, fPercent } from 'src/utils/format-number';
import { Box, Grid, Card, Stack, CardHeader, ToggleButton, ToggleButtonGroup } from '@mui/material';

const AdminCharts = () => {
  // ------------------------------------
  // 1. Enrollment Trend (Enhanced)
  // ------------------------------------
  const [enrollmentPeriod, setEnrollmentPeriod] = useState('monthly');

  const handlePeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string) => {
    if (newPeriod !== null) {
      setEnrollmentPeriod(newPeriod);
    }
  };

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
      y: {
        formatter: (value: number) => fNumber(value),
      },
    },
  });

  // Mock data changing based on period
  const enrollmentData = {
    monthly: [
      { name: 'Current Year', data: [31, 40, 28, 51, 42, 109, 100, 120, 80, 50, 30, 40] },
      { name: 'Previous Year', data: [28, 32, 25, 45, 38, 95, 90, 110, 75, 45, 25, 35] }, // Comparison
    ],
    quarterly: [
      { name: 'Current Year', data: [99, 121, 329, 120] },
      { name: 'Previous Year', data: [85, 108, 295, 105] },
    ],
    yearly: [
      { name: 'Current Year', data: [669] },
      { name: 'Previous Year', data: [593] },
    ],
  };

  const getEnrollmentSeries = () => {
    if (enrollmentPeriod === 'quarterly') return enrollmentData.quarterly;
    if (enrollmentPeriod === 'yearly') return enrollmentData.yearly;
    return enrollmentData.monthly;
  };

  // ------------------------------------
  // 2. Entrance Exam Status (Enhanced)
  // ------------------------------------
  const examStatusOptions = useChart({
    labels: ['Passed', 'Failed', 'Awaiting Result'],
    stroke: {
      colors: ['#fff'],
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      formatter(val, opts) {
        return `${val} - ${opts.w.globals.series[opts.seriesIndex]}`;
      },
    },
    dataLabels: {
      enabled: true,
      formatter(val, opts) {
        return fPercent(Number(val));
      },
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => fNumber(value),
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return fNumber(total);
              },
            },
          },
        },
      },
    },
  });

  const examStatusSeries = [45, 25, 30];

  // ------------------------------------
  // 3. Class-wise Participation (Enhanced)
  // ------------------------------------
  const classParticipationOptions = useChart({
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 4,
        dataLabels: {
          position: 'top', // top, center, bottom
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter(val) {
        return fNumber(Number(val));
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#304758'],
      },
    },
    xaxis: {
      categories: [
        'Class 1',
        'Class 2',
        'Class 3',
        'Class 4',
        'Class 5',
        'Class 6',
        'Class 7',
        'Class 8',
        'Class 9',
        'Class 10',
        'Class 11',
        'Class 12',
      ],
    },
    tooltip: {
      y: {
        formatter: (val, { dataPointIndex }) => {
          const rank = dataPointIndex === 3 ? '1st' : dataPointIndex === 1 ? '2nd' : '3rd'; // Mock ranking logic
          return `${val} (${rank})`;
        },
      },
    },
  });

  const classParticipationSeries = [
    {
      name: 'Students',
      data: [44, 55, 41, 67, 22, 12, 34, 56, 78, 90, 12, 34],
    },
  ];

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

  return (
    <Grid container spacing={1}>
      {/* Enrollment Trend - Full Width */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ pr: 2, ml: -1, mt: -1 }}
          >
            <CardHeader
              title={renderTitleWithTooltip(
                'Enrollment Trend',
                'Displays student admission growth over time.'
              )}
              subheader="Compared to previous year"
            />
            <ToggleButtonGroup
              value={enrollmentPeriod}
              exclusive
              onChange={handlePeriodChange}
              size="small"
              aria-label="enrollment period"
            >
              <ToggleButton value="monthly">Month</ToggleButton>
              <ToggleButton value="quarterly">Quarter</ToggleButton>
              <ToggleButton value="yearly">Year</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Box dir="ltr">
            <Chart
              dir="ltr"
              type="area" // Using Area for better visualization of trend
              series={getEnrollmentSeries()}
              options={{
                ...enrollmentTrendOptions,
                xaxis: {
                  ...enrollmentTrendOptions.xaxis,
                  categories:
                    enrollmentPeriod === 'quarterly'
                      ? ['Q1', 'Q2', 'Q3', 'Q4']
                      : enrollmentPeriod === 'yearly'
                        ? ['2024']
                        : [
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
              }}
              height={364}
            />
          </Box>
        </Card>
      </Grid>

      {/* Entrance Exam Status - Half Width */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader
            sx={{ mt: -1, ml: -1 }}
            title={renderTitleWithTooltip(
              'Entrance Exam Status',
              'Breakdown of entrance exam results (Passed/Failed/Awaiting).'
            )}
          />
          <Box sx={{ p: 3, pb: 1 }} dir="ltr">
            <Chart
              dir="ltr"
              type="donut" // Upgrade to Donut for center text
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
          <CardHeader
            sx={{ mt: -1, ml: -1 }}
            title={renderTitleWithTooltip(
              'Class-wise Participation',
              'Student participation metrics across different classes.'
            )}
          />
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
