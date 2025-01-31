'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState, useEffect } from 'react';

import { Box, Card, Grid, alpha, useTheme, Typography } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const SubjectPerformanceComparison = () => {
  const [classes1, setClasses1] = useState('');
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const theme = useTheme();

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes1) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes1);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setClasses1(firstClass?.id);
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes1]);

  return (
    <Grid item xs={12} md={6}>
      <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography variant="subtitle1">Class Comparison</Typography>
          <CustomSelect
            label="Class"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              // formik.setFieldValue('class', selectedClass?.name || '');
              setClasses1(val as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            value={classes1}
            formControlProps={{
              sx: { width: '100%', maxWidth: '150px' },
            }}
          />{' '}
          <CustomSelect
            label="Subject"
            options={[
              { value: 'Math', label: 'Math' },
              { value: 'Science', label: 'Science' },
              { value: 'English', label: 'English' },
              { value: 'History', label: 'History' },
            ]}
            onChange={() => {}}
            value=""
            formControlProps={{
              sx: { width: '100%', maxWidth: '150px' },
            }}
          />
        </Box>
        <AnalyticsWebsiteVisits
          title=""
          //   subheader="(+43%) than last year"
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            series: [
              { name: 'Class 10-A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
              { name: 'Class 10-B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              { name: 'Class 10-C', data: [51, 67, 47, 97, 40, 57, 24, 60, 24] },
            ],
            colors: [
              alpha(theme.palette.primary.dark, 0.8),
              alpha(theme.palette.warning.main, 0.8),
              alpha(theme.palette.error.main, 0.8),
            ],
          }}
          sx={{ height: '100%', boxShadow: 'none' }}
        />
      </Card>
    </Grid>
  );
};

export default SubjectPerformanceComparison;
