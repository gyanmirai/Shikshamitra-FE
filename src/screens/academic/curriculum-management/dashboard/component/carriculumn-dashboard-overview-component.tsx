import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

const CarriculumnDashboardOverviewComponent = (props: TabComponentType) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [classes1, setClasses1] = useState('all');
  const [classes2, setClasses2] = useState('all');

  const classOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption, ...(classData?.items || [])];
  }, [classData]);

  return (
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
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography
                component="span"
                sx={{ fontSize: '18px', fontWeight: '600' }}
                gutterBottom
              >
                Subjects Managed
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
              p: 3,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography component="span" variant="h6" gutterBottom color="error.main">
                Teacher Managed
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
