'use client';

import React from 'react';
import { Box, Grid, CircularProgress } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { useGetStudentDashboardSummaryQuery } from 'src/redux/student';

import OverviewCard from './overview';
import BirthdaySection from './student-birthdate';
import RecentActivities from './recent-activities';
import HouseDistribution from './house-distribution';
import StudentStrengthClassWise from './student-strength-class-wise';

const Overview = () => {
  const { data, isLoading, isError } = useGetStudentDashboardSummaryQuery({});
  const summary = data || {};

  return (
    <Box>
      {isLoading && <CircularProgress size={24} />}
      {isError && (
        <StudentFeedback
          notificationKey="STU-0687"
          presentation="persistent"
          severity="error"
          sx={{ mb: 2 }}
        >
          Unable to load student dashboard summary.
        </StudentFeedback>
      )}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={12}>
          <OverviewCard summary={summary} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <HouseDistribution />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BirthdaySection
            todaysBirthdays={summary.todaysBirthdays || []}
            upcomingBirthdays={summary.upcomingBirthdays || []}
            title="Birthdays"
          />
        </Grid>

        <Grid size={12}>
          <StudentStrengthClassWise />
        </Grid>

        <Grid size={12}>
          <RecentActivities activities={summary.recentActivities || []} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;
