import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Grade, Assessment, TrendingUp } from '@mui/icons-material';
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

import { varAlpha } from 'src/theme/styles';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { PerformanceOverTime } from '../gradebook-performance-tracking/progress-report';

const ClassProgress = () => (
  <Box>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CustomSelect
          label="Class"
          options={[
            { value: 'org1', label: 'Class 1' },
            { value: 'org2', label: 'Class 2' },
            { value: 'org3', label: 'Class 3' },
          ]}
          onChange={() => {}}
          value=""
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />{' '}
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
          onChange={() => {}}
          value=""
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
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
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                backgroundColor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.2),
                height: '100%',
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
          <Grid item xs={12} md={4}>
            <Card
              sx={{ backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.2) }}
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
          <Grid item xs={12} md={4}>
            <Card
              sx={{ backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.2) }}
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
      <Grid item xs={12}>
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
              formControlProps={{
                sx: { width: '100%', maxWidth: '200px' },
              }}
            />
          </Box>
          <PerformanceOverTime
            id="demo__4"
            //   title="Performance Over Time"
            //   subheader="(+43%) than last year"
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
                      // Map numerical values to custom labels
                      const labelsMap: { [key: number]: string } = {
                        1: 'A',
                        2: 'A+',
                        3: 'B',
                        4: 'B+',
                        5: 'C',
                        6: 'D',
                      };

                      return labelsMap[value] || value.toString(); // Return the mapped label or the value itself as a string
                    },
                  },
                },
              },
            }}
            sx={{ height: '100%', boxShadow: 'none' }}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Detailed Class Breakdown</Typography>
        <CustomizableTable
          columns={[
            { id: 'studentName', label: 'Student Name' },
            { id: 'overallProgress', label: 'Overall Progress' },
            { id: 'subjectPerformance', label: 'Subject Performance' },
            { id: 'attendanceRecord', label: 'Attendance Record' },
            { id: 'performanceFlags', label: 'Performance Flags' },
            { id: 'action', label: 'Actions' },
          ]}
          data={[
            {
              studentName: 'John Doe',
              overallProgress: '85%',
              subjectPerformance: 'A-',
              attendanceRecord: '95%',
              performanceFlags: 'None',
            },
            {
              studentName: 'Jane Smith',
              overallProgress: '92%',
              subjectPerformance: 'A+',
              attendanceRecord: '98%',
              performanceFlags: 'Excellent',
            },
            {
              studentName: 'Mike Johnson',
              overallProgress: '78%',
              subjectPerformance: 'B',
              attendanceRecord: '88%',
              performanceFlags: 'Needs Improvement',
            },
            {
              studentName: 'Emily Brown',
              overallProgress: '89%',
              subjectPerformance: 'A',
              attendanceRecord: '93%',
              performanceFlags: 'Good',
            },
            {
              studentName: 'Alex Wilson',
              overallProgress: '72%',
              subjectPerformance: 'C+',
              attendanceRecord: '82%',
              performanceFlags: 'At Risk',
            },
          ]}
        />
      </Grid>
    </Grid>
  </Box>
);

export default ClassProgress;
