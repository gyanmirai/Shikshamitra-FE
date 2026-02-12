import React, { useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { studentPaths } from 'src/constants/student-menu';
import CustomTooltip from 'src/components/custom-tooltip';
import { academicPaths } from 'src/constants/academic-menu';
import {
  Box,
  Card,
  Grid,
  Stack,
  Divider,
  CardHeader,
  Typography,
  CircularProgress,
} from '@mui/material';

const renderInfoTooltip = (title: string, tooltipText: string) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box component="span">{title}</Box>
    <CustomTooltip title={tooltipText} arrow placement="top">
      <Iconify
        icon="eva:info-outline"
        width={18}
        sx={{ color: 'text.disabled', cursor: 'pointer' }}
      />
    </CustomTooltip>
  </Stack>
);

export const AttendanceTrend = () => {
  const theme = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    router.push(studentPaths.attendance.markAttendance);
  };

  const attendanceOptions = useChart({
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} students`,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    legend: {
      show: false,
    },
    colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
    grid: {
      strokeDashArray: 3,
    },
  });

  const attendanceSeries = [
    {
      name: 'Present',
      data: [42, 44, 41, 43, 42],
    },
    {
      name: 'Leave',
      data: [5, 3, 2, 4, 3],
    },
    {
      name: 'Absent',
      data: [3, 1, 4, 2, 3],
    },
  ];

  return (
    <Card
      onClick={handleClick}
      sx={{
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)',
            borderRadius: 2,
          }}
        >
          <CircularProgress color="primary" size={32} />
        </Box>
      )}

      <CardHeader
        title={renderInfoTooltip('Attendance Trend', 'Daily attendance for the last 5 days.')}
        subheader="Last 5 Days"
        sx={{ mb: 1, mt: -1, ml: -1 }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box dir="ltr" sx={{ py: 3, px: 3 }}>
        <Chart type="area" series={attendanceSeries} options={attendanceOptions} height={280} />
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction="row" alignItems="center" justifyContent="center" spacing={3} sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
          <Typography variant="subtitle2" component="span">
            Present
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
          <Typography variant="subtitle2" component="span">
            Leave
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
          <Typography variant="subtitle2" component="span">
            Absent
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

export const SubjectPerformance = () => {
  const theme = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    router.push(academicPaths.examination.recordMarks);
  };

  const subjectOptions = useChart({
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 4,
        distributed: true,
      },
    },
    xaxis: {
      categories: ['Math', 'Sci', 'Eng', 'Hist', 'Geog', 'Arts'],
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.error.main,
      theme.palette.primary.main,
      theme.palette.primary.main,
      theme.palette.primary.main,
      theme.palette.primary.main,
    ],
    legend: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
      marker: { show: false },
    },
  });

  const subjectSeries = [
    {
      name: 'Average Score',
      data: [78, 45, 82, 75, 88, 92],
    },
  ];

  return (
    <Card
      onClick={handleClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)',
            borderRadius: 2,
          }}
        >
          <CircularProgress color="primary" size={32} />
        </Box>
      )}

      <CardHeader
        title={renderInfoTooltip(
          'Subject Performance',
          'Average score per subject. Red indicates weak performance.'
        )}
        subheader="Term 1 Average"
        sx={{ mb: 2, mt: -1, ml: -1 }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box dir="ltr" sx={{ flexGrow: 1, py: 2, px: 2 }}>
        <Chart type="bar" series={subjectSeries} options={subjectOptions} height={260} />
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction="row" alignItems="center" justifyContent="center" spacing={3} sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />
          <Typography variant="subtitle2" component="span">
            Good
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
          <Typography variant="subtitle2" component="span">
            Weak (&lt;50%)
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

export const HomeworkStatus = () => {
  const theme = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    router.push(academicPaths.homework.learningTasks);
  };

  const homeworkOptions = useChart({
    labels: ['Submitted', 'Pending', 'Overdue'],
    stroke: {
      colors: [theme.palette.background.paper],
    },
    legend: {
      show: false,
    },
    colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
    },
    tooltip: {
      fillSeriesColor: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => '45',
            },
          },
        },
      },
    },
  });

  const homeworkSeries = [30, 10, 5];

  return (
    <Card
      onClick={handleClick}
      sx={{
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)',
            borderRadius: 2,
          }}
        >
          <CircularProgress color="primary" size={32} />
        </Box>
      )}

      <CardHeader
        title={renderInfoTooltip('Homework Status', 'Current assignment submission status.')}
        sx={{ mb: 2, mt: -1, ml: -1 }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box dir="ltr" sx={{ py: 3, px: 3, display: 'flex', justifyContent: 'center' }}>
        <Chart
          type="donut"
          series={homeworkSeries}
          options={homeworkOptions}
          height={280}
          width={300}
        />
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
          <Typography variant="subtitle2" component="span">
            Submitted
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
          <Typography variant="subtitle2" component="span">
            Pending
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
          <Typography variant="subtitle2" component="span">
            Overdue
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

const TeacherCharts = () => (
  <Grid container spacing={1}>
    <Grid size={{ xs: 12, md: 4 }}>
      <AttendanceTrend />
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <SubjectPerformance />
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <HomeworkStatus />
    </Grid>
  </Grid>
);

export default TeacherCharts;
