import React from 'react';

import { color } from '@mui/system';
import { Box, Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Grid2 from '@mui/material/Unstable_Grid2';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';
import { CourseHoursSpent } from 'src/screens/hr/dashboard/course-hours-spent';

import { SvgColor } from 'src/components/svg-color';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const Dashboard = () => {
  const theme = useTheme();
  return (
    <Box>
      <Grid2 container spacing={3}>
        <Grid2 xs={12} md={3}>
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
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 112 }}>
                <Box sx={{ mb: 1, typography: 'subtitle2' }}>Total Courses</Box>
                <Box sx={{ typography: 'h4' }}>120</Box>
              </Box>
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
        <Grid2 xs={12} md={3}>
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
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 112 }}>
                <Box sx={{ mb: 1, typography: 'subtitle2' }}>Active Courses</Box>
                <Box sx={{ typography: 'h4' }}>08</Box>
              </Box>
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
        <Grid2 xs={12} md={3}>
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
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 112 }}>
                <Box sx={{ mb: 1, typography: 'subtitle2' }}>Total Subjects</Box>
                <Box sx={{ typography: 'h4' }}>50</Box>
              </Box>
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
        <Grid2 xs={12} md={3}>
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
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 112 }}>
                <Box sx={{ mb: 1, typography: 'subtitle2' }}>Total Assignments</Box>
                <Box sx={{ typography: 'h4' }}>120</Box>
              </Box>
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
          <AnalyticsWebsiteVisits
            title="Student engagement across different courses"
            chart={{
              categories: ['A course', 'B course', 'C course', 'D course'],
              series: [{ name: '', data: [65, 70, 40, 55] }],
            }}
            sx={{ boxShadow: 'var(--shadows-2)', height: '100%' }}
          />
        </Grid2>
        <Grid2 xs={12} sm={6}>
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
