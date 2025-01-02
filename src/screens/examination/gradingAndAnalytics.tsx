import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Box, Grid, Card } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

import { TopPerformer } from '../student/enrollment/entrance-exam/dashboard';

import type { TabComponentType } from '../hr/leave-request';

const GradingAndAnalytics = (props: TabComponentType) => {
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<any>([]);
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box>
      <Box display="flex" gap={2} mt={2} mb={5}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          value={classes}
          isLoading={isLoading}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            setClasses(val as string);
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          options={divisionOptions || []}
          disabled={!classes}
          value={division}
          isLoading={isLoading}
          label="Division"
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            setDivision(val as string);
          }}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          size="small"
        />
        <DatePicker
          label="Start Date"
          format="DD-MM-YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="End Date"
          format="DD-MM-YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <AnalyticsWebsiteVisits
            title="Visual Performance Overview"
            chart={{
              categories: ['Math', 'Science', 'English', 'Gujarati', 'Hindi'],
              series: [{ name: '', data: [68, 43, 58, 75, 60] }],
            }}
            sx={{ boxShadow: 'var(--shadows-2)', height: '100%' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <AnalyticsCurrentVisits
              title="Analysis Chart"
              chart={{
                series: [
                  { label: 'High Performance', value: 35 },
                  { label: 'Average', value: 25 },
                  { label: 'Low Performance', value: 15 },
                ],
              }}
              sx={{ boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TopPerformer
              title="Top Performer"
              sx={{ height: '100%' }}
              list={[
                {
                  id: '1',
                  name: 'Jayvion Simon',
                  avatarUrl: '/static/images/avatars/avatar_1.png',
                  totalMarks: 0,
                },
                {
                  id: '2',
                  name: 'Lucian Obrien',
                  avatarUrl: '/static/images/avatars/avatar_2.png',
                  totalMarks: 0,
                },
                {
                  id: '3',
                  name: 'Deja Bredy',
                  avatarUrl: '/static/images/avatars/avatar_3.png',
                  totalMarks: 0,
                },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TopPerformer
              title="Bottom Performer"
              sx={{ height: '100%' }}
              list={[
                {
                  id: '1',
                  name: 'Jayvion Simon',
                  avatarUrl: '/static/images/avatars/avatar_1.png',
                  totalMarks: 0,
                },
                {
                  id: '2',
                  name: 'Lucian Obrien',
                  avatarUrl: '/static/images/avatars/avatar_2.png',
                  totalMarks: 0,
                },
                {
                  id: '3',
                  name: 'Deja Bredy',
                  avatarUrl: '/static/images/avatars/avatar_3.png',
                  totalMarks: 0,
                },
              ]}
            />
          </Grid>
        </Grid>
      </Box>
      {/* <Box display="flex" gap={2} mt={2} justifyContent="end" mb={20}>
        <Button
          startIcon={<Iconify icon="mingcute:notification-fill" />}
          color="warning"
          variant="contained"
        >
          send notification
        </Button>{' '}
        <Button startIcon={<Iconify icon="uis:calender" />} variant="contained" color="secondary">
          Schedule Remedial Classes
        </Button>
      </Box> */}
    </Box>
  );
};

export default GradingAndAnalytics;
