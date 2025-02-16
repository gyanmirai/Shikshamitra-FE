'use client';

import React from 'react';

import { Grid, Typography } from '@mui/material';

import SeoIllustration from 'src/assets/illustrations/seo-illustration';

import ScrollableListCard from 'src/components/scrollable-list-card';

import { CalendarView } from 'src/sections/calendar/view';
import { AppWelcome } from 'src/sections/overview/app/app-welcome';

import TimeTableView from '../component/time-table-view';
import { PrincipalDashboardCard } from '../principal/component/principal-dashboard-card';

const items = [
  'Math Exam - Sep 20, 2024',
  'Science Exam - Sep 20, 2024',
  'English Exam - Sep 20, 2024',
];
const assignmentItems = [
  'Maths - Sep 20, 2024',
  'Science - Sep 20, 2024',
  'English - Sep 20, 2024',
];
const MainDashboardTeacher = () => (
  <>
    <Grid container spacing={3}>
      <Grid xs={12} md={12} px={5} py={3}>
        <AppWelcome
          title={`Good Morning 👋 \n Jeet`}
          description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
          img={<SeoIllustration hideBackground />}
        />
      </Grid>
      <Grid xs={12} md={6} lg={6} px={4} py={3}>
        <PrincipalDashboardCard
          dropdownLabel="Select Class"
          icon="mdi:school"
          title="Total Students"
          count={250}
          color="primary.main"
          bgColor="primary"
          href="/dashboard"
          labels={[
            { name: 'Female', color: 'error', value: 500 },
            { name: 'Male', color: 'success', value: 500 },
          ]}
          selectOptions={[
            { value: '1', label: '1' },
            { value: '2', label: '3' },
          ]}
          selectedValue="1"
          onSelectChange={(val) => console.log('sele:', val)}
        />
      </Grid>
      <Grid xs={12} md={6} lg={6} px={4} py={3}>
        <PrincipalDashboardCard
          dropdownLabel="Select Class"
          icon="mdi:school"
          title="Today Class Attendance"
          count="50%"
          color="primary.main"
          bgColor="primary"
          href="/dashboard"
          labels={[
            { name: 'Teaching', color: 'error', value: 50 },
            { name: 'Non-teaching', color: 'success', value: 50 },
          ]}
          selectOptions={[]}
          selectedValue="Jan"
          onSelectChange={(val) => console.log('Selected Month:', val)}
        />
      </Grid>
    </Grid>
    <Grid container spacing={6}>
      <Grid item xs={12} md={6} lg={6} px={1} py={3}>
        <ScrollableListCard items={items} title="Upcoming Exams" />
      </Grid>
      <Grid item xs={12} md={6} lg={6} px={1} py={3}>
        <ScrollableListCard items={assignmentItems} title="Assignments Due" />
      </Grid>
    </Grid>
    <Grid container spacing={2}>
      <Grid lg={12} py={3} px={2}>
        <TimeTableView />
      </Grid>
    </Grid>
    <Grid>
      <Typography component="span" variant="h6" gutterBottom px={2}>
        Event & Holliday
      </Typography>

      <CalendarView />
    </Grid>
  </>
);

export default MainDashboardTeacher;
