import React from 'react';

import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

import { Iconify } from 'src/components/iconify';

import { AppWidgetSummary } from './app-widget-summary';

import type { StudentTabsComponentType } from '.';

const StudentDashboard = (props: StudentTabsComponentType) => {
  const { tabs } = props;
  return (
    <Box>
      <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Present Days"
            icon={<Iconify icon="fa6-solid:calendar-days" />}
            total="120/150"
            color="primary.main"
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
            }}
            onClick={() => tabs?.setValue('attendance')}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Current Academic Percentage"
            icon={<Iconify icon="solar:square-academic-cap-bold" />}
            total="89%"
            color="error.main"
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
            }}
            onClick={() => tabs?.setValue('academic')}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Fee status"
            icon={<Iconify icon="solar:dollar-bold" />}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
            }}
            color="secondary.main"
            onClick={() => tabs?.setValue('finance')}
            total={
              <Typography
                component="span"
                fontSize="inherit"
                fontWeight="inherit"
                fontFamily="inherit"
                color="primary.main"
              >
                Paid
              </Typography>
            }
          />
        </Grid>
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total documents"
            icon={<Iconify icon="solar:document-bold" />}
            total="08"
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
            }}
            onClick={() => tabs?.setValue('documents')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
