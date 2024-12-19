import type { ChartOptions } from 'src/components/chart';
import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import { Box, Card, Grid, useTheme } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';
import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const ExaminationDashboardOverviewComponent = (props: TabComponentType) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const theme = useTheme();
  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes, setSearchParams]);
  const pendingExams = [
    '08 Subject Managed',
    '05 Subject Pending',
    // '03 Subject in Progress',
    // '08 Subject Managed',
    // '05 Subject Pending',
    // '03 Subject in Progress',
    // '08 Subject Managed',
    // '05 Subject Pending',
    // '03 Subject in Progress',
    // '08 Subject Managed',
    // '05 Subject Pending',
    // '03 Subject in Progress',
    // Add more items as needed
  ];

  // const totalExams = ["6"]

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            // formik.setFieldValue('class', selectedClass?.name || '');
            setSearchParams?.({
              classId: val as string,
            });
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          value={classes}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Division"
          disabled={!classes}
          labelKey="name"
          valueKey="id"
          options={divisionOptions}
          value={division}
          onChange={(val) => {
            // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
            // formik.setFieldValue('division', selectedDivision?.name || '');
            setDivision(val as string);
          }}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
      </Box>
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={3}>
          <EmployeeDashboardCard
            title="Total Exam"
            icon="ph:exam"
            value={18}
            labels={[
              { name: 'Scheduled : 03', color: 'info' },
              { name: 'Completed : 15', color: 'primary' },
            ]}
            color="primary.main"
            // href="/academic/homework-assignment-management/?tab=homeworkCreation"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EmployeeDashboardCard
            title="Total Assessment"
            icon="ic:baseline-assessment"
            value={21}
            labels={[
              { name: 'Pending : 03', color: 'warning' },
              { name: 'Under Review : 03', color: 'info' },
              { name: 'Completed : 15', color: 'primary' },
            ]}
            color="secondary.main"
            // href="/academic/homework-assignment-management/?tab=homeworkCreation"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EmployeeDashboardCard
            title="Total Rubric"
            icon="material-symbols:rubric"
            value={16}
            labels={[]}
            color="warning.main"
            // href="/academic/homework-assignment-management/?tab=homeworkCreation"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
            }}
          >
            <AppWidget
              title="Class Performance"
              icon="solar:user-rounded-bold"
              chart={{ series: 60 }}
            />
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <PerformanceOverTime
              id="demo__4"
              title="Exams Over Time"
              //   subheader="(+43%) than last year"
              chart={{
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
                series: [
                  {
                    name: 'Scores',
                    data: [5, 10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                  },
                  {
                    name: 'Participation',
                    data: [40, 60, 47, 55, 59, 49, 69, 69, 91, 18, 35, 51, 50],
                  },
                ],
                options: {
                  legend: {
                    show: true,
                    position: 'top',
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <AnalyticsWebsiteVisits
            title="Student engagement across different courses"
            chart={{
              categories: ['Math', 'English', 'Science', 'Gujarati'],
              series: [{ name: '', data: [65, 70, 40, 55] }],
            }}
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
      {/* <Grid2 container spacing={3}>
        <Grid2 xs={12} md={6} lg={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography component="span" variant="h6" gutterBottom>
              Total Number of Scheduled Exams
            </Typography>

            <Box display="flex" alignItems="flex-center">
              <Typography
                sx={{ fontSize: '25px', lineHeight: '25px', pr: 1, pt: '5px' }}
                gutterBottom
              >
                •
              </Typography>
              <Typography sx={{ fontSize: '25px' }} gutterBottom>
                {' '}
                30
              </Typography>
            </Box>
          </Card> */}
      {/* <ScrollableCard fontSize='30px' showFilter = {false} title="Total Number of Scheduled Exams" content={totalExams} />         */}
      {/* </Grid2>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard showFilter title="Upcoming Exams" content={pendingExams} />{' '}
        </Grid2>
      </Grid2>
      <Grid2 container spacing={3}>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard showFilter={false} title="Completed Exams" content={pendingExams} />
        </Grid2>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard showFilter={false} title="Pending Exams" content={pendingExams} />{' '}
        </Grid2>
      </Grid2>

      <Box display="flex" flexDirection="row" gap={3} sx={{ pb: '20px', pt: '20px' }}>
        <CustomSelect
          label="Class"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Subject"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
      </Box>
      <Grid2 lg={12}>
        <CalendarView />
      </Grid2> */}
    </Box>
  );
};

export default ExaminationDashboardOverviewComponent;

interface AppWidgetProps {
  title: string;
  total?: number;
  icon: string;
  chart: {
    colors?: string[];
    series: number;
    options?: ChartOptions;
  };
}

const AppWidget: React.FC<AppWidgetProps> = ({ title, total, icon, chart }) => {
  const theme = useTheme();
  const chartColors = chart.colors ?? [theme.palette.primary.light, theme.palette.primary.main];
  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    fill: {
      type: 'solid',
      colors: chartColors,
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 6,
            color: 'black',
            fontSize: theme.typography.subtitle2.fontSize as string,
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Box
      sx={{
        p: 3,
        gap: 3,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        bgcolor: 'common.white',
        color: 'common.black',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Chart
          type="radialBar"
          series={[chart.series]}
          options={chartOptions}
          width={80}
          height={80}
          sx={{ zIndex: 1 }}
          mt={2}
        />
        <SvgColor
          src={`${CONFIG.site.basePath}/assets/background/shape-circle-3.svg`}
          sx={{
            width: 200,
            height: 200,
            opacity: 0.08,
            position: 'absolute',
            color: 'primary.light',
          }}
        />
      </Box>
      <div>
        <Box sx={{ typography: 'subtitle2' }}>{title}</Box>
      </div>
    </Box>
  );
};
