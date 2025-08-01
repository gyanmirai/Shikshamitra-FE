'use client';

import React from 'react';

import { Box } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

import activities from 'src/json/student/enrollementDashboard/recentActivities.json';

import OverviewCard from './overview';
import BirthdaySection from './student-birthdate';
import RecentActivities from './recent-activities';
import HouseDistribution from './house-distribution';
import StudentStrengthClassWise from './student-strength-class-wise';

const todayBirthdays = [
  { name: 'Arjun Sharma', age: 15, className: '5A' },
  { name: 'Priya Patel', age: 14, className: '5A' },
];

const upcomingBirthdays = [
  { name: 'Arjun Sharma', age: 15, className: '5A', dateLabel: 'Tomorrow' },
  { name: 'Priya Patel', age: 14, className: '5A', dateLabel: 'Dec 28' },
  { name: 'Raj Kumar', age: 13, className: '4B', dateLabel: 'Dec 29' },
  { name: 'Meera Singh', age: 12, className: '3C', dateLabel: 'Dec 30' },
];

const Overview = () => (
  <Box>
    <Grid2 container spacing={2} sx={{ mb: 2 }}>
      <Grid2 xs={12}>
        <OverviewCard />
      </Grid2>

      <Grid2 xs={12} md={6}>
        <HouseDistribution />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <BirthdaySection
          todaysBirthdays={todayBirthdays}
          upcomingBirthdays={upcomingBirthdays}
          title="Birthdays"
        />
      </Grid2>
      <Grid2 xs={12}>
        <StudentStrengthClassWise />
      </Grid2>

      <Grid2 xs={12}>
        <RecentActivities activities={activities} />
      </Grid2>
    </Grid2>
  </Box>
);

export default Overview;
