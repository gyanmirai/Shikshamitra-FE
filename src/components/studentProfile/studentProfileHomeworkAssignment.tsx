'use client';

import React from 'react';
import { Grid } from '@mui/material';
import MyHomeworkSubmission from 'src/screens/academic/homework-assignment-management/mySubmission/myHomeworkSubmission';
import MyAssignmentSubmission from 'src/screens/academic/homework-assignment-management/mySubmission/myAssignmentSubmission';

const MyProfileSubmission = () => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12 }}>
      <MyHomeworkSubmission />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <MyAssignmentSubmission />
    </Grid>
  </Grid>
);

export default MyProfileSubmission;
