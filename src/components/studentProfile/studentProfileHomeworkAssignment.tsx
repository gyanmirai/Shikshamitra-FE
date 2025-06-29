'use client';

import React from 'react';

import { Grid } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import MyHomeworkSubmission from 'src/screens/academic/homework-assignment-management/mySubmission/myHomeworkSubmission';
import MyAssignmentSubmission from 'src/screens/academic/homework-assignment-management/mySubmission/myAssignmentSubmission';

const MyProfileSubmission = () => {
  // Initialize search params with default tab 'subjectSetting'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'Homeworks' });

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <MyHomeworkSubmission />
      </Grid>
      <Grid item xs={12}>
        {/* <Typography variant="h6" mb={2}>
            My Assignment
          </Typography> */}
        <MyAssignmentSubmission />
      </Grid>
    </Grid>
  );
};

export default MyProfileSubmission;
