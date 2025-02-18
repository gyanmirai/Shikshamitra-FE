'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, alpha, useTheme, Typography } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const StudentCoursePerfoemance = () => {
  const [classes3, setClasses3] = useState<string>('');
  const [classes4, setClasses4] = useState<string>('');
  const [classes5, setClasses5] = useState<string>('All');
  const [division, setDivision] = useState<any>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const theme = useTheme();
  return (
    <Grid2 container spacing={2} mt={1}>
      <Grid2 xs={12} sm={6}>
        <Card
          sx={{
            alignItems: 'center',
            p: 2,
            height: '100%',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-end">
            <Typography variant="subtitle1">Class Wise Performance</Typography>
            <Box display="flex" gap={1}>
              <CustomSelect
                options={classData?.items}
                value={classes4}
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  setClasses4(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { minWidth: 120 } }}
              />
              <CustomSelect
                label="Division"
                labelKey="name"
                valueKey="id"
                options={divisionOptions}
                value={division}
                onChange={(val) => {
                  setDivision(val as string);
                }}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
          </Box>

          <AnalyticsCurrentVisits
            title=""
            chart={{
              series: [
                { label: 'Course 1', value: 35 },
                { label: 'Course 2', value: 25 },
                { label: 'Course 3', value: 15 },
                { label: 'Course 4', value: 50 },
              ],
            }}
            sx={{ boxShadow: 'none' }}
          />
        </Card>
      </Grid2>
      <Grid2 xs={12} sm={6}>
        <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Chapters for subject</Typography>
            <CustomSelect
              label="Class"
              options={classData?.items || []}
              labelKey="name"
              valueKey="id"
              onChange={(val) => {
                const selectedClass: Standards = classData.items.find(
                  (i: Standards) => i.id === val
                );
                // formik.setFieldValue('class', selectedClass?.name || '');
                setClasses3(selectedClass?.name);
              }}
              value={classes3}
              formControlProps={{
                sx: { width: '100%', maxWidth: '200px' },
              }}
            />
          </Box>
          <AnalyticsWebsiteVisits
            title=""
            //   subheader="(+43%) than last year"
            chart={{
              categories: ['Math', 'Science', 'History', 'ENG', 'Social Science', 'Gujarati'],
              series: [{ name: 'Chapters', data: [43, 33, 22, 37, 10, 16] }],

              colors: [alpha(theme.palette.primary.dark, 0.8)],
              options: {
                legend: {
                  show: false,
                  position: 'top',
                },
              },
            }}
            sx={{ height: '100%', boxShadow: 'none' }}
          />
        </Card>
      </Grid2>
    </Grid2>
  );
};

export default StudentCoursePerfoemance;
