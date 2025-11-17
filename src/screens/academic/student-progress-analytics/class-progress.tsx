'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { varAlpha } from 'src/theme/styles';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grade, Assessment, TrendingUp } from '@mui/icons-material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  List,
  Card,
  Grid,
  ListItem,
  CardHeader,
  Typography,
  CardContent,
  ListItemText,
} from '@mui/material';

import { PerformanceOverTime } from '../gradebook-performance-tracking/progress-report';

const ClassProgress = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [subject, setSubject] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({ classId: firstClass.id });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes, setSearchParams]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Class Progress"
        links={[
          { name: 'Academics' },
          { name: 'Student Progress Analytics' },
          { name: 'Class Progress' },
        ]}
        sx={{ mb: 2 }}
      />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomSelect
            label="Class"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              setSearchParams?.({ classId: val as string });
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            value={classes}
            formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
          />
          <CustomSelect
            label="Division"
            disabled={!classes}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division}
            onChange={(val) => setDivision(val as string)}
            formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
          />
          &nbsp;
          <CustomSelect
            label="Subject"
            options={[
              { value: 'math', label: 'Mathematics' },
              { value: 'science', label: 'Science' },
              { value: 'english', label: 'English' },
              { value: 'history', label: 'History' },
              { value: 'art', label: 'Art' },
            ]}
            value={subject}
            onChange={(val) => setSubject(val as string)}
            formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
          />
          &nbsp;
          <DatePicker
            label="From Date"
            sx={{ width: '100%', maxWidth: '200px' }}
            slotProps={{ textField: { size: 'small' } }}
          />
          &nbsp;
          <DatePicker
            label="To Date"
            sx={{ width: '100%', maxWidth: '200px' }}
            slotProps={{ textField: { size: 'small' } }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  backgroundColor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.2),
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: 'var(--shadows-8)', scale: 1.03 },
                }}
              >
                <CardHeader title="Class Average" avatar={<Grade color="success" />} />
                <CardContent>
                  <Typography color="success.main" variant="h3">
                    A+
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  backgroundColor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.2),
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: 'var(--shadows-8)', scale: 1.03 },
                }}
              >
                <CardHeader title="Top 5 Performers" avatar={<TrendingUp color="warning" />} />
                <CardContent>
                  <List>
                    {['John Doe - A+', 'John Doe - A+', 'John Doe - A+'].map((update, index) => (
                      <ListItem key={index}>
                        <ListItemText color="warning.main" primary={update} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  backgroundColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.2),
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: 'var(--shadows-8)', scale: 1.03 },
                }}
              >
                <CardHeader title="Bottom 5 Performers" avatar={<Assessment color="error" />} />
                <CardContent>
                  <List>
                    {['John Doe - E', 'John Doe - E', 'John Doe - E'].map((report, index) => (
                      <ListItem key={index}>
                        <ListItemText sx={{ color: 'error.main' }} primary={report} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Performance Trends</Typography>
              <CustomSelect
                label="Monthly"
                options={[
                  { value: 'Monthly', label: 'Monthly' },
                  { value: 'Weekly', label: 'Weekly' },
                ]}
                onChange={() => {}}
                value=""
                formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
              />
            </Box>
            <PerformanceOverTime
              id="demo__4"
              chart={{
                categories: [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                series: [
                  {
                    name: 'Positive Metrics',
                    data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                  },
                ],
                options: {
                  yaxis: {
                    labels: {
                      formatter(value: number) {
                        const labelsMap: { [key: number]: string } = {
                          1: 'A',
                          2: 'A+',
                          3: 'B',
                          4: 'B+',
                          5: 'C',
                          6: 'D',
                        };
                        return labelsMap[value] || value.toString();
                      },
                    },
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Detailed Class Breakdown</Typography>
          <CustomizableTable
            tableId="student-progress-table"
            columns={[
              { id: 'studentName', label: 'Student Name' },
              { id: 'overallProgress', label: 'Overall Progress' },
              { id: 'attendanceRecord', label: 'Attendance Record' },
              { id: 'performanceFlags', label: 'Performance Flags' },
              {
                id: 'action',
                label: 'Action',
                isSort: false,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      placement="right-top"
                      showViewIcon
                      handleViewClick={() => {}}
                      showThreeDots={false}
                    />
                  );
                },
              },
            ]}
            data={[
              {
                studentName: 'John Doe',
                overallProgress: '85%',
                attendanceRecord: '95%',
                performanceFlags: 'Excellent',
              },
              {
                studentName: 'Jane Smith',
                overallProgress: '92%',
                attendanceRecord: '98%',
                performanceFlags: 'Excellent',
              },
              {
                studentName: 'Mike Johnson',
                overallProgress: '78%',
                attendanceRecord: '88%',
                performanceFlags: 'Satisfaction',
              },
              {
                studentName: 'Emily Brown',
                overallProgress: '89%',
                attendanceRecord: '93%',
                performanceFlags: 'Satisfaction',
              },
              {
                studentName: 'Alex Wilson',
                overallProgress: '72%',
                attendanceRecord: '82%',
                performanceFlags: 'Needs Improvement',
              },
            ]}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClassProgress;
