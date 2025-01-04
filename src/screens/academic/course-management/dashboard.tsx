import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import { color } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CourseHoursSpent } from 'src/screens/hr/dashboard/course-hours-spent';

import { SvgColor } from 'src/components/svg-color';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const Dashboard = (props: TabComponentType) => {
  const theme = useTheme();
  const [classes1, setClasses1] = useState<string>('All');
  const [classes2, setClasses2] = useState<string>('All');
  const [classes3, setClasses3] = useState<string>('');
  const [classes4, setClasses4] = useState<string>('');
  const [classes5, setClasses5] = useState<string>('All');

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const classOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption, ...(classData?.items || [])];
  }, [classData]);

  useEffect(() => {
    if (classData?.items?.length) {
      if (!classes3 || !classes4) {
        const firstClass = classData.items[0];
        setClasses3(firstClass?.id);
        setClasses4(firstClass?.id);
      }
    }
  }, [classData, classes3, classes4]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Course Management' },
          { name: 'Dashboard' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:plus',
                label: 'Add New Course',
                href: '/academic/course-management/subjects',
                color: 'primary',
              },
              {
                icon: 'mdi:progress-helper',
                label: 'Course Progress',
                href: '/academic/course-management/courseProgress',
                color: 'warning',
              },
              {
                icon: 'simple-icons:googledocs',
                label: 'General Reports',
                href: '/academic/course-management/reports',
                color: 'secondary',
              },
            ]}
          />
        }
      />
      <Grid2 container spacing={3} mt={2}>
        <Grid2 xs={12} md={4}>
          <Card
            sx={{
              ...bgGradient({
                color: `135deg, ${varAlpha(theme.vars.palette.secondary.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.secondary.lightChannel, 0.48)}`,
              }),
              p: 3,
              boxShadow: 'none',
              position: 'relative',
              color: `${color}.darker`,
              backgroundColor: 'common.white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
              cursor: 'pointer',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography
                component="span"
                sx={{ fontSize: '18px', fontWeight: '600' }}
                gutterBottom
              >
                Total Courses
              </Typography>
              <CustomSelect
                label="Class"
                name="className"
                options={classOptions}
                labelKey="name"
                valueKey="name"
                value={classes1}
                onChange={(value) => setClasses1(value as string)}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
            <Box display="flex" alignItems="flex-start" mt={2}>
              <Typography variant="h4" gutterBottom>
                56
              </Typography>
            </Box>

            <SvgColor
              src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
              sx={{
                top: 0,
                left: -20,
                width: 240,
                zIndex: -1,
                height: 240,
                opacity: 0.24,
                position: 'absolute',
                color: `${color}.main`,
              }}
            />
          </Card>
        </Grid2>
        <Grid2 xs={12} md={4}>
          <Card
            sx={{
              ...bgGradient({
                color: `135deg, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.primary.lightChannel, 0.48)}`,
              }),
              p: 3,
              boxShadow: 'none',
              position: 'relative',
              color: `${color}.darker`,
              backgroundColor: 'common.white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
              cursor: 'pointer',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography
                component="span"
                sx={{ fontSize: '18px', fontWeight: '600' }}
                gutterBottom
              >
                Active Courses
              </Typography>
              <CustomSelect
                label="Class"
                name="className"
                options={classOptions}
                labelKey="name"
                valueKey="name"
                value={classes2}
                onChange={(value) => setClasses2(value as string)}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
            <Box display="flex" alignItems="flex-start" mt={2}>
              <Typography variant="h4" gutterBottom>
                30
              </Typography>
            </Box>

            <SvgColor
              src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
              sx={{
                top: 0,
                left: -20,
                width: 240,
                zIndex: -1,
                height: 240,
                opacity: 0.24,
                position: 'absolute',
                color: `${color}.main`,
              }}
            />
          </Card>
        </Grid2>
      </Grid2>
      <Grid2 container spacing={3}>
        <Grid2 xs={12} sm={6}>
          <Card
            sx={{
              alignItems: 'center',
              p: 3,
              height: '100%',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
              <CustomSelect
                options={classData?.items}
                value={classes3}
                onChange={(val) => {
                  setClasses3(val as string);
                }}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title="Student engagement across different courses"
              chart={{
                categories: ['A course', 'B course', 'C course', 'D course'],
                series: [{ name: '', data: [65, 70, 40, 55] }],
              }}
              sx={{ height: '100%', marginTop: 5 }}
            />
          </Card>
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Card
            sx={{
              alignItems: 'center',
              p: 3,
              height: '100%',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
              <CustomSelect
                options={classData?.items}
                value={classes4}
                onChange={(val) => {
                  setClasses4(val as string);
                }}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>

            <AnalyticsCurrentVisits
              title="Class Wise Performance"
              chart={{
                series: [
                  { label: 'Course 1', value: 35 },
                  { label: 'Course 2', value: 25 },
                  { label: 'Course 3', value: 15 },
                  { label: 'Course 4', value: 50 },
                ],
              }}
              sx={{ boxShadow: 'none' }}
            />
          </Card>
        </Grid2>
        <Grid2 xs={12}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: varAlpha(theme.palette.secondary.mainChannel, 0.1),
            }}
          >
            <CourseHoursSpent
              title="Student Performance Trends Across Different Subjects"
              selected="Class1"
              chart={{
                series: [
                  {
                    name: 'Class1',
                    categories: ['Eng', 'GUj', 'Hin', 'Maths', 'Sci'],
                    data: [{ data: [10, 41, 35, 151, 49] }],
                  },
                  {
                    name: 'Class2',
                    categories: ['Eng', 'GUj', 'Hin', 'Maths', 'Sci'],
                    data: [{ data: [83, 112, 119, 88, 103] }],
                  },
                  {
                    name: 'Class3',
                    categories: ['Eng', 'GUj', 'Hin', 'Maths', 'Sci'],
                    data: [{ data: [24, 72, 64, 96, 76] }],
                  },
                ],
              }}
            />
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default Dashboard;
