import React from 'react';

import { Label } from '@mui/icons-material';
import { Box, Card, Grid, Button, Typography, useTheme, Tooltip, Chip } from '@mui/material';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { EcommerceWidgetSummary } from 'src/sections/overview/e-commerce/ecommerce-widget-summary';

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
      <Grid container spacing={2} >
  <Grid item md={6}>
  <Box
          sx={{
            width: 1,
            display: 'flex',
            gap: { xs: 1, md: 2.5 },
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            bgcolor: 'background.paper', // Background color
            borderRadius: 2, // Rounded corners
            boxShadow: 1, // Box shadow for elevation
            p: 2, // Padding
            position: 'relative',
          }}
        >
           <Chip
    label="10%" 
    size="small"
   
    sx={{
      position: 'absolute',
      top: 8,
      right: 8,
      bgcolor: 'orange',
      color: 'white', 
      fontWeight: 'bold',
      zIndex: 1, 
    }}
  />
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: '50%',
              alignItems: 'center',
              color: 'primary.lighter',
              justifyContent: 'center',
              bgcolor: 'primary.darker',
              display: { xs: 'none', md: 'inline-flex' },
            }}
          >
            <Iconify
              width={24}
              icon='eva:diagonal-arrow-left-down-fill'
            />
          </Box>

          <div>
            <Box
              sx={{
                mb: 1,
                gap: 0.5,
                display: 'flex',
                alignItems: 'center',
                typography: 'subtitle2',
              }}
            >
              <Typography variant="subtitle1">Income</Typography>
              <Tooltip title="Income" placement="top">
                <Iconify width={16} icon="eva:info-outline" sx={{ color: 'text.disabled' }} />
              </Tooltip>
            </Box>

            <Box sx={{ typography: 'h4' }}>3998</Box>
          </div>
        </Box>
  </Grid>

        <Grid item md={6}>
        <Box
          sx={{
            width: 1,
            display: 'flex',
            gap: { xs: 1, md: 2.5 },
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            bgcolor: 'background.paper', // Background color
            borderRadius: 2,
            boxShadow: 1, 
            p: 2, 
            position: 'relative', 
          }}
        >
          <Chip
    label="10%" 
    size="small"
   
    sx={{
      position: 'absolute',
      top: 8,
      right: 8,
      bgcolor: 'orange',
      color: 'white', 
      fontWeight: 'bold',
      zIndex: 1, 
    }}
  />
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: '50%',
              alignItems: 'center',
              color: 'primary.lighter',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 165, 0, 0.2)', 
              display: { xs: 'none', md: 'inline-flex' },
            }}
          >
            <Iconify
              width={24}
              icon='eva:diagonal-arrow-right-up-fill'
              sx={{ color: 'orange' }} 
            />
          </Box>

          <div>
            <Box
              sx={{
                mb: 1,
                gap: 0.5,
                display: 'flex',
                alignItems: 'center',
                typography: 'subtitle2',
              }}
            >
              <Typography variant="subtitle1">Expense</Typography>
              <Tooltip title="Expense" placement="top">
                <Iconify width={16} icon="eva:info-outline" sx={{ color: 'text.disabled' }} />
              </Tooltip>
            </Box>

            <Box sx={{ typography: 'h4' }}>3998</Box>
          </div>
        </Box>

      </Grid>

        </Grid>

        <Box pb="20px"/>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Income vs. Expenses Over Time</Typography>
            </Box>
            <Box pt="15px" display="flex" flexDirection="row" gap={1}>
                <CustomSelect
                    label="Organizer"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
               
                <CustomSelect
                    label="Year"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
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
        </Grid>

        <Grid item xs={12} md={4}>
          <EcommerceWidgetSummary
            title="Largest Income Source"
            percent={2.6}
            total={765}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        {/* <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
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
          </Card>
        </Grid> */}
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
  );
};

export default FinanceNetbalanceAnalyticsTab;
