import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import CustomSelect from 'src/components/custom-select';

const CarriculumnDashboardOverviewComponent = () => (
  <Box sx={{ mb: 3 }}>
    <Grid2 container spacing={3} alignItems="stretch">
      <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.1),
          }}
        >
          {' '}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" sx={{ fontSize: '18px', fontWeight: '600' }} gutterBottom>
              Total Curriculum
            </Typography>
            <CustomSelect
              label="class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>
          <Box sx={{ mt: 2 }} display="flex" flexDirection="column" alignItems="start">
            <Box display="flex" alignItems="flex-start">
              <Typography variant="h5" gutterBottom>
                • 20
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
          }}
        >
          {' '}
          <Typography component="span" sx={{ fontSize: '18px', fontWeight: '600' }} gutterBottom>
            Subjects/Streams Managed
          </Typography>
          <Box display="flex" alignItems="flex-start" mt={2}>
            <Typography variant="h5" gutterBottom>
              • 08 Subjects Managed
            </Typography>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.1),
          }}
        >
          {' '}
          <Typography component="span" sx={{ fontSize: '18px', fontWeight: '600' }} gutterBottom>
            Grade Levels Managed
          </Typography>
          <Box display="flex" alignItems="flex-start">
            <Typography variant="h5" gutterBottom>
              • 09 Subject Managed
            </Typography>
          </Box>
        </Card>
      </Grid2>
    </Grid2>
  </Box>
);
export default CarriculumnDashboardOverviewComponent;
