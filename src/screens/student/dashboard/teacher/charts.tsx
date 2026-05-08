import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Grid, Stack, Divider, CardHeader, Typography } from '@mui/material';

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

  // Class & Division state (same pattern as SubjectPassFailChart)
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    const currentClass = allClass.find((org: Standards) => org?.id === classes);
    setAllDivision(currentClass?.divisions || []);
    setDivision(currentClass?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  const isLight = theme.palette.mode === 'light';

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
    colors: [
      isLight ? theme.palette.primary.main : theme.vars.palette.success.main,
      isLight ? theme.palette.warning.main : theme.vars.palette.warning.main,
      isLight ? theme.palette.error.main : theme.vars.palette.error.main,
    ],
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
      sx={{
        height: '100%',
        width: '100%',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      <CardHeader
        title={renderInfoTooltip('Attendance Trend', 'Daily attendance for the last 5 days.')}
        subheader="Last 5 Days"
        sx={{ mb: 1, mt: -1, ml: -1 }}
        action={
          <Box sx={{ display: 'flex', gap: 2, mr: 1 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px' } }}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px' } }}
              disabled={!classes}
            />
          </Box>
        }
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box dir="ltr" sx={{ py: 3, px: 3 }}>
        <Chart type="area" series={attendanceSeries} options={attendanceOptions} />
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction="row" alignItems="center" justifyContent="center" spacing={3} sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: isLight ? 'primary.main' : 'success.main',
            }}
          />
          <Typography variant="subtitle2" component="span">
            Present
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: isLight ? 'warning.main' : 'warning.main',
            }}
          />
          <Typography variant="subtitle2" component="span">
            Leave
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: isLight ? 'error.main' : 'error.main',
            }}
          />
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

  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    const currentClass = allClass.find((org: Standards) => org?.id === classes);
    setAllDivision(currentClass?.divisions || []);
    setDivision(currentClass?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

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
      theme.vars.palette.primary.main,
      theme.vars.palette.error.main,
      theme.vars.palette.primary.main,
      theme.vars.palette.primary.main,
      theme.vars.palette.primary.main,
      theme.vars.palette.primary.main,
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
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      <CardHeader
        title={renderInfoTooltip(
          'Subject Performance',
          'Average score per subject. Red indicates weak performance.'
        )}
        sx={{ mb: 2, mt: -1, ml: -1 }}
        action={
          <Box sx={{ display: 'flex', gap: 2, mr: 1 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px' } }}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px' } }}
              disabled={!classes}
            />
          </Box>
        }
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box dir="ltr" sx={{ flexGrow: 1, py: 2, px: 2 }}>
        <Chart type="bar" series={subjectSeries} options={subjectOptions} />
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

  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const [subject, setSubject] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    const currentClass = allClass.find((org: Standards) => org?.id === classes);
    setAllDivision(currentClass?.divisions || []);
    setDivision(currentClass?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  const subjectOptions = [
    { id: '', name: 'All' },
    { id: 'english', name: 'English' },
    { id: 'math', name: 'Math' },
    { id: 'science', name: 'Science' },
    { id: 'history', name: 'History' },
  ];

  const homeworkOptions = useChart({
    labels: ['Submitted', 'Pending', 'Overdue'],
    stroke: {
      colors: [theme.vars.palette.background.paper],
    },
    legend: {
      show: false,
    },
    colors: [
      theme.vars.palette.success.main,
      theme.vars.palette.warning.main,
      theme.vars.palette.error.main,
    ],
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
            name: {
              color: theme.vars.palette.text.secondary,
            },
            value: {
              color: theme.vars.palette.text.primary,
            },
            total: {
              show: true,
              label: 'Total',
              color: theme.vars.palette.text.primary,
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
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      <CardHeader
        title={renderInfoTooltip(
          'Homework Status',
          'Current assignment submission status overall subject wise.'
        )}
        sx={{ mb: 2, mt: -1, ml: -1 }}
        action={
          <Box sx={{ display: 'flex', gap: 2, mr: 1 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px' } }}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px' } }}
              disabled={!classes}
            />
            <CustomSelect
              options={subjectOptions}
              label="Subject"
              value={subject}
              onChange={(val) => setSubject(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '110px' } }}
            />
          </Box>
        }
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box dir="ltr" sx={{ py: 3, px: 3, display: 'flex', justifyContent: 'center' }}>
        <Chart
          type="donut"
          series={homeworkSeries}
          options={homeworkOptions}
          height="100%"
          width="80%"
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
