import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import GradeIcon from '@mui/icons-material/Grade';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import { Assessment, TrendingUp } from '@mui/icons-material';
import {
  Box,
  Card,
  Grid,
  List,
  alpha,
  useTheme,
  ListItem,
  Typography,
  CardHeader,
  CardContent,
  ListItemText,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import { PerformanceOverTime } from '../gradebook-performance-tracking/progress-report';

const Dashboard = () => {
  const theme = useTheme();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomSelect
            label="Organization"
            options={[
              { value: 'org1', label: 'Organization 1' },
              { value: 'org2', label: 'Organization 2' },
              { value: 'org3', label: 'Organization 3' },
            ]}
            onChange={() => {}}
            value=""
            formControlProps={{
              sx: { width: '100%', maxWidth: '200px' },
            }}
          />
          &nbsp;
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
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',

              bgcolor: '#e3f2fd',
            }}
          >
            <CardContent>
              <PeopleIcon sx={{ fontSize: 60, color: '#1976d2' }} />
              <Typography variant="h4" component="div" color="black" sx={{ mt: 2 }}>
                40
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Total Students
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',

              bgcolor: '#e8f5e9',
            }}
          >
            <CardContent>
              <GradeIcon sx={{ fontSize: 60, color: '#4caf50' }} />
              <Typography variant="h4" component="div" color="black" sx={{ mt: 2 }}>
                A
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Overall Performance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',

              bgcolor: '#fff3e0',
            }}
          >
            <CardContent>
              <WarningIcon sx={{ fontSize: 60, color: '#ff9800' }} />
              <Typography variant="h4" component="div" color="black" sx={{ mt: 2 }}>
                15
              </Typography>
              <Typography variant="h6" color="text.secondary">
                At-Risk Students (40%)
              </Typography>
            </CardContent>
          </Card>
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
                  {
                    name: 'Negative Metrics',
                    data: [49, 51, 35, 10, 41, 35, 51, 49, 62, 69, 91, 148],
                  },
                ],
                options: {
                  legend: {
                    show: true,
                    position: 'top',
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12}>
          <CustomSelect
            label="Class"
            options={[
              { value: 'class1', label: 'Class 1' },
              { value: 'class2', label: 'Class 2' },
              { value: 'class3', label: 'Class 3' },
              { value: 'class4', label: 'Class 4' },
              { value: 'class5', label: 'Class 5' },
            ]}
            onChange={() => {}}
            value=""
            formControlProps={{
              sx: { width: '100%', maxWidth: '200px' },
            }}
          />
          &nbsp;
          <CustomSelect
            label="Subject"
            options={[
              { value: 'subject1', label: 'Mathematics' },
              { value: 'subject2', label: 'Science' },
              { value: 'subject3', label: 'English' },
              { value: 'subject4', label: 'History' },
              { value: 'subject5', label: 'Geography' },
            ]}
            onChange={() => {}}
            value=""
            formControlProps={{
              sx: { width: '100%', maxWidth: '200px' },
            }}
          />
          &nbsp;
          <CustomSelect
            label="Grade Ranges"
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
              { value: 'D', label: 'D' },
              { value: 'E', label: 'E' },
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
          <AnalyticsWebsiteVisits
            title="Class-Wide Performance"
            //   subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                { name: 'C', data: [51, 67, 47, 97, 40, 57, 24, 60, 24] },
              ],
              colors: [
                alpha(theme.palette.primary.dark, 0.8),
                alpha(theme.palette.warning.main, 0.8),
                alpha(theme.palette.error.main, 0.8),
              ],
            }}
            sx={{ height: '100%' }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6"> Recent Activity</Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#e3f2fd' }}>
                <CardHeader
                  sx={{ color: 'black' }}
                  title="New Grades Posted"
                  avatar={<GradeIcon color="primary" />}
                />
                <CardContent>
                  <List>
                    {['Math: 95%', 'Science: 88%', 'History: 92%'].map((grade, index) => (
                      <ListItem key={index}>
                        <ListItemText sx={{ color: 'black' }} primary={grade} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#fff8e1' }}>
                <CardHeader
                  title="Student Performance Updates"
                  sx={{ color: 'black' }}
                  avatar={<TrendingUp color="warning" />}
                />
                <CardContent>
                  <List>
                    {[
                      'John Doe: Improved in Math',
                      'Jane Smith: Excelling in Science',
                      'Mike Johnson: Needs support in History',
                    ].map((update, index) => (
                      <ListItem sx={{ color: 'black' }} key={index}>
                        <ListItemText primary={update} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#e8f5e9' }}>
                <CardHeader
                  sx={{ color: 'black' }}
                  title="Generated Reports"
                  avatar={<Assessment color="success" />}
                />
                <CardContent>
                  <List>
                    {[
                      'Q1 Progress Report',
                      'Mid-Term Evaluation',
                      'Subject-wise Performance Analysis',
                    ].map((report, index) => (
                      <ListItem key={index}>
                        <ListItemText sx={{ color: 'black' }} primary={report} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
