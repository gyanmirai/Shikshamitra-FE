import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

const Dashboard = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Dashboard"
      links={[
        { name: 'Academic and Assignment' },
        { name: 'Curriculum Management' },
        { name: 'Dashboard' },
      ]}
      sx={{ px: 1, mb: 2 }}
      action={
        <DashBoardQuickAction
          actions={[
            {
              icon: 'mdi:plus',
              label: 'Add New Subject',
              href: '/academic/curriculum-management/subjects',
              color: 'primary',
            },
            {
              icon: 'mdi:pencil',
              label: 'Edit Curriculum',
              href: '/academic/curriculum-management/curriculumOverview',
              color: 'warning',
            },
            {
              icon: 'simple-icons:googledocs',
              label: 'General Reports',
              href: '/academic/curriculum-management/reports',
              color: 'secondary',
            },
          ]}
        />
      }
    />
    <Grid2 container spacing={3}>
      <Grid2 lg={4}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
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
            {/* Number and Dot Box */}
            <Box display="flex" alignItems="flex-start">
              <Typography
                sx={{ fontSize: '32px', lineHeight: '32px', pr: 1, pt: '5px' }}
                gutterBottom
              >
                •
              </Typography>
              <Typography sx={{ fontSize: '32px' }} gutterBottom>
                20
              </Typography>
            </Box>

            {/* Curriculum Text */}
            <Typography sx={{ pl: '20px', mt: '-10px' }}>Curriculums</Typography>
          </Box>
        </Card>
      </Grid2>
      <Grid2 lg={4}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Typography component="span" variant="h6" gutterBottom>
            Subjects/Streams Managed
          </Typography>

          <Box display="flex" alignItems="flex-start">
            <Typography sx={{ fontSize: '16px', lineHeight: '16px', pr: 1 }} gutterBottom>
              •
            </Typography>
            <Typography sx={{ fontSize: '16px' }} gutterBottom>
              08 Subject Managed
            </Typography>
          </Box>
        </Card>
      </Grid2>
      <Grid2 lg={4}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Typography component="span" variant="h6" gutterBottom>
            Grade Levels Managed
          </Typography>

          <Box display="flex" alignItems="flex-start">
            <Typography sx={{ fontSize: '16px', lineHeight: '16px', pr: 1 }} gutterBottom>
              •
            </Typography>
            <Typography sx={{ fontSize: '16px' }} gutterBottom>
              08 Subject Managed
            </Typography>
          </Box>
        </Card>
      </Grid2>
    </Grid2>
  </Box>
);

export default Dashboard;
