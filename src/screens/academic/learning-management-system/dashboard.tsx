'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import {
  Box,
  Card,
  Grid,
  Button,
  MenuItem,
  MenuList,
  Typography,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { AnalyticsConversionRates } from 'src/screens/student/enrollment/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { CalendarView } from 'src/sections/calendar/view/calendar-view';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const Dashboard = (props: TabComponentType) => (
  <Box sx={{ flexGrow: 1 }}>
    <CustomBreadcrumbs
      heading="Dashboard"
      links={[
        { name: 'Academic and Assignment' },
        { name: 'Learning Management System' },
        { name: 'Dashboard' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.1),
          }}
        >
          <Typography variant="h6" gutterBottom>
            Active Courses
          </Typography>
          <Typography variant="h3" gutterBottom>
            • 06
          </Typography>
          <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                padding: 0,
              }}
            >
              {['Math Course', 'Science Course'].map((exam, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                    {exam}
                  </Button>
                </Box>
              ))}
            </Box>
          </Scrollbar>
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
            backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
          }}
        >
          <Typography variant="h6" gutterBottom>
            Ongoing Assignments
          </Typography>
          <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                padding: 0,
              }}
            >
              {['Math Assignement', 'Science Assignement'].map((exam, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                    {exam}
                  </Button>
                </Box>
              ))}
            </Box>
          </Scrollbar>
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
            backgroundColor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.1),
          }}
        >
          <Typography variant="h6" gutterBottom>
            Upcoming Quizzes
          </Typography>
          <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                padding: 0,
              }}
            >
              {['General Quiz-10-10-2024', 'General Quiz-12-10-2024'].map((exam, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                    {exam}
                  </Button>
                </Box>
              ))}
            </Box>
          </Scrollbar>
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
            backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
          }}
        >
          <Typography variant="h6" gutterBottom>
            Recent Activity Feed Section
          </Typography>
          <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                padding: 0,
              }}
            >
              {[
                'Science newly created courses - yesterday',
                'Math Assignments submitted - 2 hours ago',
                'Math Assignments submitted - 2 hours ago',
              ].map((exam, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                    {exam}
                  </Button>
                </Box>
              ))}
            </Box>
          </Scrollbar>
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
              return (
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={value} />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                      {value}%
                    </Typography>
                  </Box>
                </Box>
              );
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
