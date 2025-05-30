import React from 'react';

import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

import { Iconify } from 'src/components/iconify';

import { AppWidgetSummary } from './app-widget-summary';

import type { StudentTabsComponentType } from '.';

const StudentDashboard = (props: StudentTabsComponentType) => {
  const { tabs, student } = props;
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
              height: '100%',
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
            color="error.main"
            total={
              <Box display="flex" flexDirection="column" gap={0.5}>
                {/* First Row: Current Percentage and Change */}
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    component="span"
                    fontSize="24px"
                    fontWeight={700}
                    color="text.primary"
                  >
                    89%
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Iconify icon="mdi:arrow-up-bold" color="#4CAF50" width={18} height={18} />
                  </Box>
                </Box>

                {/* Second Row: Description */}

                <Typography
                  component="span"
                  fontSize="14px"
                  fontWeight={500}
                  color="text.secondary"
                >
                  +2% Higher than previous term
                </Typography>
              </Box>
            }
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              height: '100%',
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
            title="Fee Status"
            icon={<Iconify icon="solar:dollar-bold" />}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              height: '100%',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
            }}
            color="secondary.main"
            onClick={() => tabs?.setValue('finance')}
            total={
              <Box display="flex" flexDirection="column" gap={0.5}>
                {/* Total in First Row */}
                <Typography component="span" fontSize="24px" fontWeight={700}>
                  Total: ₹ 30,000
                </Typography>

                {/* Paid and Pending in Second Row */}
                <Box display="flex" flexDirection="row" gap={1}>
                  <Typography
                    component="span"
                    fontSize="15px"
                    fontWeight={600}
                    color="success.main"
                  >
                    Paid: ₹ 25,000
                  </Typography>
                  <Typography component="span" fontSize="15px" fontWeight={600} color="error.main">
                    Pending: ₹ 5,000
                  </Typography>
                </Box>
              </Box>
            }
          />
        </Grid>
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Documents"
            icon={<Iconify icon="solar:document-bold" />}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              height: '100%',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
            }}
            onClick={() => tabs?.setValue('documents')}
            total={
              <Box display="flex" flexDirection="column" gap={0.5}>
                {/* First Row: Total */}
                <Typography component="span" fontSize="16px" fontWeight={600}>
                  Total: 08
                </Typography>

                {/* Second Row: Uploaded and Pending side-by-side */}
                <Box display="flex" flexDirection="row" gap={2}>
                  <Typography
                    component="span"
                    fontSize="16px"
                    fontWeight={600}
                    color="success.main"
                  >
                    Uploaded: 06
                  </Typography>
                  <Typography
                    component="span"
                    fontSize="16px"
                    fontWeight={600}
                    color="warning.main"
                  >
                    Pending: 02
                  </Typography>
                </Box>
              </Box>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
