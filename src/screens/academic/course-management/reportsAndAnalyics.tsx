import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Button, useTheme, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CourseHoursSpent } from 'src/screens/hr/dashboard/course-hours-spent';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { TabComponentType } from 'src/screens/hr/leave-request';

const Reports = (props: TabComponentType) => {
  const theme = useTheme();
  const [classes, setClasses] = useState<string>('');

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box>
      <Typography variant="h6" marginBottom={1}>
        Course Completion Report
      </Typography>
      <CustomizableTable
        columns={[
          { id: 'className', label: 'Class' },
          { id: 'completionRate', label: 'Completion Rate' },
        ]}
        data={[
          {
            className: 1,
            completionRate: '50%',
          },
          {
            className: 2,
            completionRate: '40%',
          },
          {
            className: 3,
            completionRate: '70%',
          },
          {
            className: 4,
            completionRate: '20%',
          },
          {
            className: 5,
            completionRate: '90%',
          },
        ]}
      />
      <Grid2 xs={12} sm={6} marginTop={2}>
        <Card
          sx={{
            alignItems: 'center',
            p: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
            <CustomSelect
              options={classData?.items || []}
              value={classes}
              onChange={(val) => {
                setClasses(val as string);
              }}
              label="Class"
              isLoading={isLoading}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>
          <AnalyticsWebsiteVisits
            title="Subject Performance"
            chart={{
              categories: ['Math', 'English', 'Science', 'Physics'],
              series: [{ name: '', data: [65, 70, 40, 55] }],
            }}
            sx={{ height: '100%', marginTop: 5, boxShadow: 'none' }}
          />
        </Card>
      </Grid2>
      <Grid2 xs={12} marginTop={2}>
        <Card
          sx={{
            p: 3,
            height: '100%',
            backgroundColor: varAlpha(theme.palette.secondary.mainChannel, 0.1),
          }}
        >
          <CourseHoursSpent
            title="Performance Trends"
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
        </Card>
      </Grid2>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={3} mb={3} gap={2}>
        <Button variant="contained">Export to PDF</Button>
        <Button variant="contained" color="secondary">
          Export to CSV
        </Button>
      </Box>
    </Box>
  );
};

export default Reports;
