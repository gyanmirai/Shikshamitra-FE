'use client';

import React from 'react';

import { Box, Card, Grid, MenuItem, MenuList, Typography, ListItemText } from '@mui/material';

import { AnalyticsConversionRates } from 'src/screens/student/enrollment/dashboard';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import CircularProgressLabel from 'src/components/circular-progress-with-label/circularProgressLabel';

import { CalendarView } from 'src/sections/calendar/view/calendar-view';

const Dashboard = () => (
  <Box sx={{ flexGrow: 1 }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Active Courses
          </Typography>
          <Typography variant="h3" gutterBottom>
            • 06
          </Typography>
          <Typography variant="body1" gutterBottom>
            • Math Course
          </Typography>
          <Typography variant="body1" gutterBottom>
            • Science Course
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Ongoing Assignments
          </Typography>
          <Typography variant="body1" gutterBottom>
            • Math Assignment
          </Typography>
          <Typography variant="body1" gutterBottom>
            • Math Homework 1
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Upcoming Quizzes
          </Typography>
          <Typography variant="body1" gutterBottom>
            • General Quiz-10-10-2024
          </Typography>
          <Typography variant="body1" gutterBottom>
            • General Quiz-12-10-2024
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Recent Activity Feed Section
          </Typography>
          <Typography variant="body1" gutterBottom>
            • Science newly created courses - yesterday
          </Typography>
          <Typography variant="body1" gutterBottom>
            • Math Assignments submitted - 2 hours ago
          </Typography>
          <Typography variant="body1" gutterBottom>
            • Math Assignments submitted - 2 hours ago
          </Typography>
        </Card>
      </Grid>
    </Grid>
    <Grid item xs={12} mt={2}>
      <Typography variant="h6">Course Overview</Typography>
      <CustomizableTable
        columns={[
          { id: 'courseName', label: 'Course Name' },
          { id: 'teacher', label: 'Teacher(s)' },
          { id: 'enrollmentStatus', label: 'Enrollment Status' },
          {
            id: 'progress',
            label: 'Progress',
            render(value, row) {
              return <CircularProgressLabel value={value} />;
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={() => (
                    <MenuList>
                      <MenuItem>
                        <Iconify icon="solar:pen-bold" />
                        <ListItemText>Edit</ListItemText>
                      </MenuItem>
                      <MenuItem>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                        <ListItemText>Delete</ListItemText>
                      </MenuItem>
                      <MenuItem>
                        <Iconify icon="mdi:eye" />
                        <ListItemText>View Course</ListItemText>
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={[
          {
            courseName: 'Math',
            teacher: 'Jayvion Simon',
            enrollmentStatus: '25 Studet Enrolled',
            progress: 80,
          },
          {
            courseName: 'Science',
            teacher: 'Lucian Obrien',
            enrollmentStatus: '25 Studet Enrolled',
            progress: 50,
          },
          {
            courseName: 'English',
            teacher: 'Deja Bredy',
            enrollmentStatus: '25 Studet Enrolled',
            progress: 20,
          },
          {
            courseName: 'Math',
            teacher: 'Jayvion Simon',
            enrollmentStatus: '25 Studet Enrolled',
            progress: 100,
          },
          {
            courseName: 'Math',
            teacher: 'Jayvion Simon',
            enrollmentStatus: '25 Studet Enrolled',
            progress: 60,
          },
        ]}
      />
    </Grid>
    <Grid item xs={12} mt={2}>
      <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
        <Typography variant="h6">Progress Visualization</Typography>
        <AnalyticsConversionRates
          title=""
          chart={{
            categories: ['Math', 'Science', 'English', 'Gujarati', 'Hindi'],
            series: [{ name: '', data: [70, 65, 71, 79, 85] }],
            options: {
              chart: {
                toolbar: {
                  show: true,
                  offsetX: 0,
                  offsetY: 0,
                  tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,

                    customIcons: [],
                  },
                },
              },
            },
          }}
          sx={{ height: '100%', boxShadow: 'none' }}
        />
      </Card>
    </Grid>
    <CalendarView />
  </Box>
);

export default Dashboard;
