import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Grid, Card, Stack, CardHeader, Typography, LinearProgress } from '@mui/material';

import ClassDivisionFilter from './class-division-filter';

// ... (existing imports)

// ... inside the component
<CardHeader
  sx={{ ml: -1, mt: -1 }}
  title={
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box component="span">Performance Extremes</Box>
      <CustomTooltip
        title="Breakdown of top and bottom performing classes based on recent exam scores."
        arrow
        placement="top"
      >
        <Iconify
          icon="eva:info-outline"
          width={18}
          sx={{ color: 'text.disabled', cursor: 'pointer' }}
        />
      </CustomTooltip>
    </Stack>
  }
  subheader="Top & Bottom 3 Classes"
/>;

const PrincipalCharts = () => {
  // 1. Monthly Attendance Trend (Line Chart)
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
      x: { show: false },
      marker: { show: false },
    },
  });

  const attendanceTrendSeries = [
    {
      name: 'Attendance %',
      data: [90, 92, 95, 88, 91, 94, 96, 93, 92, 95, 90, 92],
    },
  ];

  // 2. Exam's Pass/Fail Rate (Bar Chart)
  const examPerformanceOptions = useChart({
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Unit Test 1', 'Unit Test 2', 'Mid Term Exam', 'Final Exam'],
    },
    colors: ['#00AB55', '#FF4842'], // Success, Error
    tooltip: {
      y: {
        formatter: (val: number) => `${val} students`,
      },
    },
  });

  const examPerformanceSeries = [
    { name: 'Passed', data: [45, 52, 38, 33] },
    { name: 'Failed', data: [35, 41, 62, 13] },
  ];
  // 4. Top/Bottom Performing Classes (List/Progress)
  const classPerformance = [
    { class: 'Class 10A', score: 92, type: 'top' },
    { class: 'Class 7B', score: 89, type: 'top' },
    { class: 'Class 5C', score: 88, type: 'top' },
    { class: 'Class 8C', score: 65, type: 'bottom' },
    { class: 'Class 9A', score: 62, type: 'bottom' },
    { class: 'Class 6B', score: 58, type: 'bottom' },
  ];

  return (
    <Grid container spacing={1}>
      {/* Monthly Attendance */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            sx={{ ml: -1, mt: -1 }}
            title="Monthly Attendance Trend"
            subheader="(+4%) than last year"
            action={<ClassDivisionFilter />}
          />
          <Box sx={{ p: 3, pb: 1 }} dir="ltr">
            <Chart
              dir="ltr"
              type="area"
              series={attendanceTrendSeries}
              options={attendanceTrendOptions}
              height={320}
            />
          </Box>
        </Card>
      </Grid>

      {/* Top/Bottom Performing Classes */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            sx={{ ml: -1, mt: -1 }}
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box component="span">Performance Extremes</Box>
                <CustomTooltip
                  title="List of top 3 and bottom 3 performing classes based on recent assessment scores."
                  arrow
                  placement="top"
                >
                  <Iconify
                    icon="eva:info-outline"
                    width={18}
                    sx={{ color: 'text.disabled', cursor: 'pointer' }}
                  />
                </CustomTooltip>
              </Stack>
            }
            subheader="Top & Bottom 3 Classes"
          />
          <Stack spacing={3} sx={{ p: 3 }}>
            {classPerformance.map((item) => (
              <Box key={item.class}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{item.class}</Typography>
                  <Typography
                    variant="subtitle2"
                    color={item.type === 'top' ? 'success.main' : 'error.main'}
                  >
                    {item.score}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={item.score}
                  color={item.type === 'top' ? 'success' : 'error'}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: (theme) =>
                      item.type === 'top'
                        ? theme.palette.success.lighter
                        : theme.palette.error.lighter,
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Card>
      </Grid>

      {/* Exam's Pass/Fail Rate */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title="Exam's Pass/Fail Rate"
            subheader="Student Performance by Exam"
            sx={{ ml: -1, mt: -1 }}
            action={<ClassDivisionFilter />}
          />
          <Box sx={{ p: 3, pb: 1 }} dir="ltr">
            <Chart
              dir="ltr"
              type="bar"
              series={examPerformanceSeries}
              options={examPerformanceOptions}
              height={320}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PrincipalCharts;
