import React from 'react'

import { Box, Card, Grid, alpha, Button, useTheme, Typography } from '@mui/material';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import CustomSelect from 'src/components/custom-select';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';




const FinanceNetbalanceAnalyticsTab = () => {
  const theme = useTheme();
  return (

    <>
      <CustomSelect
        label="Date Range"
        options={[]}
        onChange={() => { }}
        value=""
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      />
      <Box pt="20px" pb="20px" display="flex" flexDirection="column">
        <Typography variant="subtitle1">Total Net Balance</Typography>
        <Typography variant="h5">$36,963</Typography>

      </Box>
      <Grid item xs={12}>
        <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Income vs. Expenses Over Time</Typography>

          </Box>
          <PerformanceOverTime
            id="demo__4"
            // title="Income vs. Expenses Over Time"
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
                  name: 'Income',
                  data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                },
                {
                  name: 'Expense',
                  data: [49, 51, 35, 10, 41, 35, 51, 49, 62, 69, 91, 148],
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
        <Box pb="15px" />
        <AnalyticsWebsiteVisits
          title="Highest Expense Categories"
          //   subheader="(+43%) than last year"
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            series: [
              { name: 'Salaries', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
              { name: 'Maintenance', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
            ],
            colors: [
              alpha(theme.palette.primary.dark, 0.8),
              alpha(theme.palette.warning.main, 0.8),
            ],
          }}
          sx={{ height: '100%' }}
        />
        <Box pb="15px" />
        <AnalyticsCurrentVisits
          title="Largest Income Source"
          chart={{
            series: [
              { label: 'Salaries', value: 3500 },
              { label: 'Maintenance', value: 2500 },
              { label: 'Utilities', value: 1500 },

            ],
          }}
          sx={{ height: '100%' }}
        />


      </Grid>
      <Box py="15px" gap={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" size="small">
          Export to PDF
        </Button>
        <Button variant="contained" size="small">
          Export to Excel
        </Button>
      </Box>
    </>
  )
}

export default FinanceNetbalanceAnalyticsTab