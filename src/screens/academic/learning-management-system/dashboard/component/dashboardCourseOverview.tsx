'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Grid,
  MenuItem,
  MenuList,
  Typography,
  ListItemText,
  CircularProgress,
} from '@mui/material';

const DashboardCourseOverview = () => (
  <Grid size={12} mt={2}>
    <Typography variant="h6">Course Overview</Typography>
    <CustomizableTable
      tableId="courseOverviewTable"
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
);

export default DashboardCourseOverview;
