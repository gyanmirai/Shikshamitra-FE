import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Box, Card, Grid, alpha, useTheme } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const ActivityDashboardGroup = () => {
  const theme = useTheme();
  const [classes1, setClasses1] = useState<string>('');

  const [division1, setDivision1] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Grid item xs={12} md={12} sx={{ mt: 2 }}>
      <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
        <Box display="flex" alignItems="center" sx={{ mt: 2, gap: 1, mb: 2 }}>
          <CustomSelect
            label="Class"
            name="className"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            value={classes1}
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              setClasses1(val as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            formControlProps={{
              sx: { width: '100%', maxWidth: '200px' },
            }}
          />
          <CustomSelect
            label="Division"
            disabled={!classes1}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division1}
            onChange={(val) => {
              setDivision1(val as string);
            }}
            formControlProps={{
              sx: { width: '100%', maxWidth: '200px' },
            }}
          />
        </Box>
        <AnalyticsWebsiteVisits
          title="Dynamic Vs Static Group"
          //   subheader="(+43%) than last year"
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            series: [
              { name: 'Dynamic', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
              { name: 'Static', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
            ],
            colors: [
              alpha(theme.palette.warning.dark, 0.8),
              alpha(theme.palette.secondary.main, 0.8),
            ],
          }}
          sx={{ height: '100%' }}
        />
      </Card>
    </Grid>
  );
};

export default ActivityDashboardGroup;
