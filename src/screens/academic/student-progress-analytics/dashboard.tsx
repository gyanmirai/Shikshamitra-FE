import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Card, Grid, useTheme, Typography } from '@mui/material';

import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';

import CustomSelect from 'src/components/custom-select';

import { PerformanceOverTime } from '../gradebook-performance-tracking/progress-report';

const Dashboard = (props: TabComponentType) => {
  const theme = useTheme();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* <Grid item xs={12}>
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
        </Grid> */}
        <Grid item xs={12} sm={6} md={4}>
          <EmployeeDashboardCard
            title="Total Students"
            icon="mdi:account-multiple"
            value={8000}
            // labels={[
            //   { name: ' Boys : 5000', color: 'info' },
            //   { name: 'Girls : 3000', color: 'secondary' },
            // ]}
            color="primary.main"
            // href="/hr/employee"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <EmployeeDashboardCard
            title="Overall Performance"
            icon="mdi:star"
            value="A+"
            // labels={[
            //   { name: ' Highest : B', color: 'info' },
            //   { name: 'Lowest : A', color: 'secondary' },
            // ]}
            color="primary.main"
            // href="/hr/employee"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <EmployeeDashboardCard
            title="Overall Performance"
            icon="mdi:star"
            value="A+"
            // labels={[
            //   { name: ' Highest : B', color: 'info' },
            //   { name: 'Lowest : A', color: 'secondary' },
            // ]}
            color="primary.main"
            // href="/hr/employee"
          />
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Performance Trends</Typography>
              <CustomSelect
                label="Yearly"
                options={[
                  { value: '2024', label: '2024' },
                  { value: '2023', label: '2023' },
                  { value: '2022', label: '2022' },
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
        {/* <Grid item xs={12}>
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
        </Grid> */}
      </Grid>
    </Box>
  );
};

export default Dashboard;
