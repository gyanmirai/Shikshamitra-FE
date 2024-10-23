'use client'

import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Typography,Grid, Box, Card, useTheme } from '@mui/material';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';

import { AnalyticsWidgetSummary } from 'src/sections/overview/analytics/analytics-widget-summary';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const TransportDashboardScreen = () => {
  const theme = useTheme();
  
  return (
    <>
      <Grid2 container spacing={3} py="14px">
        <Grid2 xs={12} md={6} lg={3}>
          <AnalyticsWidgetSummary
            title="Total Vehicles"
            percent={90}
            total={71}
            icon={<Iconify icon="solar:money" sx={{ height: '16px', width: '16px' }} />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid2>
        <Grid2 xs={12} md={6} lg={3}>
          <AnalyticsWidgetSummary
            title="Students Assigned"
            percent={77}
              color="warning"
            total={250}
            icon={<Iconify icon="solar:money" sx={{ height: '16px', width: '16px' }} />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid2>
        <Grid2 xs={12} md={6} lg={3}>
          <AnalyticsWidgetSummary
            title="Active Routes"
            percent={98}
            total={10}
              color="error"
            icon={<Iconify icon="solar:money" sx={{ height: '16px', width: '16px' }} />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid2>
        <Grid2 xs={12} md={6} lg={3}>
          <AnalyticsWidgetSummary
            title="Staff Assigned"
            percent={0}
            total={200}
            icon={<Iconify icon="solar:money" sx={{ height: '16px', width: '16px' }} />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={3} py="14px">
        <Grid2  xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="subtitle1" sx={{ pt: 2 }}>
                Route Efficiency
              </Typography>
              <Box display="flex" flexDirection="row" gap={1}>
                <CustomSelect
                  label="Organization"
                  options={[]}
                  value=""
                  onChange={() => { }}
                  formControlProps={{ sx: { minWidth: 125 } }}
                />
                <CustomSelect
                  label="Class"
                  options={[]}
                  value=""
                  onChange={() => { }}
                  formControlProps={{ sx: { minWidth: 125 } }}
                />
              </Box>
              <PerformanceOverTime
                id="demo__4"
                chart={{
                  categories: [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                  ],
                  series: [
                    {
                      name: 'Fee Collection Progress',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                  ],
                }}
                sx={{ height: '100%', boxShadow: 'none' }}
              />
            </Box>
          </Card>
        </Grid2>
        <Grid2  xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="subtitle1" sx={{ pt: 2 }}>
              Average Trip Durations
              </Typography>
              <Box display="flex" flexDirection="row" gap={1}>
                <CustomSelect
                  label="Organization"
                  options={[]}
                  value=""
                  onChange={() => { }}
                  formControlProps={{ sx: { minWidth: 125 } }}
                />
                <CustomSelect
                  label="2023"
                  options={[]}
                  value=""
                  onChange={() => { }}
                  formControlProps={{ sx: { minWidth: 125 } }}
                />
              </Box>
              <PerformanceOverTime
                id="demo__4"
                chart={{
                  categories: [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                  ],
                  series: [
                    {
                      name: 'Trip Durations',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                  ],
                }}
                sx={{ height: '100%', boxShadow: 'none' }}
              />
            </Box>
          </Card>
        </Grid2>
      </Grid2>

     
        <Grid item xl={12} sx={{pt:"15px"}}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="subtitle1" sx={{ pt: 2 }}>
              Vehicle Usage
              </Typography>
              <CustomSelect
                label="Organization"
                options={[]}
                value=""
                onChange={() => { }}
                formControlProps={{ sx: { maxWidth: 125 } }}
              />
              <AnalyticsWebsiteVisits
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                  series: [
                    { name: 'Total trips', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                  ],
                  colors: [
                    theme.palette.primary.dark,
                    theme.palette.warning.main,
                  ],
                }}
                sx={{ height: '100%' }}
              />
            </Box>
          </Card>
        </Grid>
      
    </>
  );
}

export default TransportDashboardScreen;
