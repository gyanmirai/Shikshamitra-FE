'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

const CarriculumnDashboardOverviewComponent = (props: TabComponentType) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [classes1, setClasses1] = useState('All');
  const [classes2, setClasses2] = useState('All');

  const classOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption, ...(classData?.items || [])];
  }, [classData]);

  return (
    <Box sx={{ mb: 3 }}>
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
      <Grid2 container spacing={2} alignItems="stretch">
        <Grid2 xs={12} md={6} lg={6} xl={4}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.1),
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
              cursor: 'pointer',
            }}
          >
            {' '}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography
                component="span"
                sx={{ fontSize: '18px', fontWeight: '600' }}
                gutterBottom
              >
                Total Curriculum
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }} display="flex" flexDirection="column" alignItems="start">
              <Box display="flex" alignItems="flex-start">
                <Typography variant="h4" gutterBottom>
                  20
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
                Subjects
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
                08
              </Typography>
            </Box>
          </Card>
        </Grid2>
        <Grid2 xs={12} md={6} lg={6} xl={4}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
              cursor: 'pointer',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography component="span" variant="h6" gutterBottom>
                Teacher
              </Typography>
              <CustomSelect
                label="class"
                options={classOptions}
                value={classes2}
                labelKey="name"
                valueKey="name"
                onChange={(val) => {
                  setClasses2(val as string);
                }}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
            <Box display="flex" alignItems="flex-start" mt={2}>
              <Typography variant="h4" gutterBottom>
                20
              </Typography>
            </Box>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
};
export default CarriculumnDashboardOverviewComponent;
