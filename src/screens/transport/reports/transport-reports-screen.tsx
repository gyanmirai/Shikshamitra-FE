'use client';

import React from 'react';

import { Box, Card, Grid, List, ListItem, useTheme, Typography } from '@mui/material';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const TransportReportsScreen = () => {
  const theme = useTheme();
  return (
    <Grid container spacing={2}>
      <Grid item sm={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Trip Summary
            </Typography>
          </Box>
          <List>
            <ListItem>
              <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
              Total trips completed - 25
            </ListItem>
            <ListItem>
              <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
              Average trip duration - 1 hour 15 min
            </ListItem>
            <ListItem>
              <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
              Fuel consumption - 120 liters
            </ListItem>
          </List>
        </Card>
      </Grid>
      <Grid item sm={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Vehicle Usage Report
            </Typography>
          </Box>
          <List>
            <ListItem>
              <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
              Frequency of usage - Bus A: 20 trips this week
            </ListItem>
            <ListItem>
              <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
              Total distance covered - 1200 km
            </ListItem>
            <ListItem>
              <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
              Frequency of usage - Bus A: 20 trips this week
            </ListItem>
          </List>
        </Card>
      </Grid>

      <Grid item sm={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Route Efficiency
            </Typography>
          </Box>
          <List>
            <ListItem>
              <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
              Time spent per route - Route A: 45 min vs Route B: 1 hour
            </ListItem>
            <ListItem>
              <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
              Distance per route - Route A: 10 km, Route B: 12 km
            </ListItem>
          </List>
        </Card>
      </Grid>
      <Grid item sm={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="subtitle1" sx={{ pt: 2 }}>
              Trip Summary
            </Typography>
            <CustomSelect
              label="Organization"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { maxWidth: 125 } }}
            />
            <AnalyticsWebsiteVisits
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                series: [
                  { name: 'Total trips', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                  { name: 'Fuel Consumed', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                ],
                colors: [theme.palette.primary.dark, theme.palette.warning.main],
              }}
              sx={{ height: '100%' }}
            />
          </Box>
        </Card>
      </Grid>

      <Grid item sm={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="subtitle1" sx={{ pt: 2 }}>
              Vehicle Usage Frequency
            </Typography>
            <CustomSelect
              label="Organization"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { maxWidth: 125 } }}
            />
            <AnalyticsCurrentVisits
              chart={{
                series: [
                  { label: 'Daily', value: 3500 },
                  { label: 'Weekly', value: 2500 },
                  { label: 'Monthly', value: 2500 },
                ],
              }}
              sx={{ height: '100%' }}
            />
          </Box>
        </Card>
      </Grid>
      <Grid item sm={12} md={6}>
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
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 125 } }}
              />
              <CustomSelect
                label="Class"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 125 } }}
              />
            </Box>
            <PerformanceOverTime
              id="demo__4"
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
                    name: 'Fee Collection Progress',
                    data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                  },
                ],
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TransportReportsScreen;
