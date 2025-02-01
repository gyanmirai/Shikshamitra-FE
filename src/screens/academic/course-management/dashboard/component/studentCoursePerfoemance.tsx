import React, { useState } from 'react';

import { Box, Card } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CourseHoursSpent } from 'src/screens/hr/dashboard/course-hours-spent';

import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const StudentCoursePerfoemance = () => {
  const [classes3, setClasses3] = useState<string>('');
  const [classes4, setClasses4] = useState<string>('');
  const [classes5, setClasses5] = useState<string>('All');
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  return (
    <Grid2 container spacing={2} mt={1}>
      <Grid2 xs={12} sm={6}>
        <Card
          sx={{
            alignItems: 'center',
            p: 3,
            height: '100%',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
            <CustomSelect
              options={classData?.items}
              value={classes3}
              onChange={(val) => {
                setClasses3(val as string);
              }}
              label="Class"
              isLoading={isLoading}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>
          <AnalyticsWebsiteVisits
            title="Student engagement across different courses"
            chart={{
              categories: ['A course', 'B course', 'C course', 'D course'],
              series: [{ name: '', data: [65, 70, 40, 55] }],
            }}
            sx={{ height: '100%', marginTop: 5 }}
          />
        </Card>
      </Grid2>
      <Grid2 xs={12} sm={6}>
        <Card
          sx={{
            alignItems: 'center',
            p: 3,
            height: '100%',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
            <CustomSelect
              options={classData?.items}
              value={classes4}
              onChange={(val) => {
                setClasses4(val as string);
              }}
              label="Class"
              isLoading={isLoading}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>

          <AnalyticsCurrentVisits
            title="Class Wise Performance"
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
      <Grid2 xs={12}>
        <CourseHoursSpent
          title="Student Performance Trends Across Different Subjects"
          selected="Class1"
          chart={{
            series: [
              {
                name: 'Class1',
                categories: ['Eng', 'GUj', 'Hin', 'Maths', 'Sci'],
                data: [{ data: [10, 41, 35, 151, 49] }],
              },
              {
                name: 'Class2',
                categories: ['Eng', 'GUj', 'Hin', 'Maths', 'Sci'],
                data: [{ data: [83, 112, 119, 88, 103] }],
              },
              {
                name: 'Class3',
                categories: ['Eng', 'GUj', 'Hin', 'Maths', 'Sci'],
                data: [{ data: [24, 72, 64, 96, 76] }],
              },
            ],
          }}
        />
      </Grid2>
    </Grid2>
  );
};

export default StudentCoursePerfoemance;
