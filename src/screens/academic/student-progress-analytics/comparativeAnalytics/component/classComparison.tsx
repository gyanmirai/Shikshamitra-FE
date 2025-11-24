'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState, useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Typography } from '@mui/material';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const ClassComparison = () => {
  const [classes2, setClasses2] = useState('');
  const [, setDivision] = useState('');
  const [, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const theme = useTheme();

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes2) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes2);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setClasses2(firstClass?.id);
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes2]);

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Subject Performance Comparison</Typography>
          <CustomSelect
            label="Class"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              setClasses2(val as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            value={classes2}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
        </Box>

        <AnalyticsWebsiteVisits
          title=""
          chart={{
            categories: ['Math', 'Science', 'History', 'ENG'],
            series: [
              { name: '', data: [43, 33, 22, 37] },
              { name: '', data: [51, 70, 47, 67] },
              { name: '', data: [51, 67, 47, 97] },
            ],
            colors: [
              alpha(theme.vars.palette.primary.dark, 0.8),
              alpha(theme.vars.palette.warning.main, 0.8),
              alpha(theme.palette.error.main, 0.8),
            ],
            options: { legend: { show: false, position: 'top' } },
          }}
          sx={{ height: '100%', boxShadow: 'none' }}
        />
      </Card>
    </Grid>
  );
};

export default ClassComparison;
