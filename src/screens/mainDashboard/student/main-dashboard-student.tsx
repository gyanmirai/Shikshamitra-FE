'use client';

import React from 'react';

import { Box, Grid, Divider, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import SeoIllustration from 'src/assets/illustrations/seo-illustration';

import { AppWelcome } from 'src/sections/overview/app/app-welcome';

import TimeTableView from '../component/time-table-view';
import OneLineInfoCard from './component/one-line-info-card';
import UpcomingExamCard from './component/exam-card-for-student';
import UpcomingAssignmentCard from './component/upcoming-assignment-card';
import { PrincipalDashboardCard } from '../principal/component/principal-dashboard-card';

const MainDashboardStudent = () => (
  <Grid container spacing={3} sx={{ px: 2 }}>
    <Grid item lg={12}>
      <AppWelcome
        title={`Good Morning 👋 \n Jeet`}
        description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
        img={<SeoIllustration hideBackground />}
      />
    </Grid>

    <Grid item lg={3}>
      <PrincipalDashboardCard
        dropdownLabel=""
        icon="noto:receipt"
        title="Total Fees"
        count={formatNumber(550000, 'INR')}
        color="primary.main"
        bgColor="primary"
        href="/dashboard"
        labels={[
          { name: 'Paid', color: 'success', value: formatNumber(250000, 'INR') },
          { name: 'Pending', color: 'warning', value: formatNumber(250000, 'INR') },
          { name: 'Due', color: 'error', value: formatNumber(250000, 'INR') },
        ]}
        selectOptions={[]}
      />
    </Grid>

    <Grid item lg={3}>
      <PrincipalDashboardCard
        dropdownLabel=""
        icon="noto:receipt"
        title="Upcoming Fee Payment"
        count={formatNumber(550000, 'INR')}
        color="primary.main"
        bgColor="primary"
        href="/dashboard"
        labels={[{ name: 'Date', color: 'info', value: '02-05-2025' }]}
        selectOptions={[]}
      />
    </Grid>

    <Grid item lg={3}>
      <OneLineInfoCard
        items={[
          { title: 'Overall Performance', text: 'A+', icon: 'mdi:star', color: 'yellow' },
          // { title: 'Overall Attendance', text: '90%', icon: 'mdi:calendar-check', color: "info:main" }
        ]}
      />
    </Grid>
    <Grid item lg={3}>
      <OneLineInfoCard
        items={[
          // { title: 'Overall Performance', text: 'A+', icon: 'mdi:star', color: "yellow" },
          {
            title: 'Overall Attendance',
            text: '90%',
            icon: 'mdi:calendar-check',
            color: 'info:main',
          },
        ]}
      />
    </Grid>

    <Grid item lg={6}>
      <UpcomingExamCard
        exams={[
          { subject: 'Math Exam', date: 'Sep 20, 2024', class: '10th-A', room: '101' },
          { subject: 'Physics Exam', date: 'Sep 22, 2024', class: '12th-B', room: '102' },
          { subject: 'Chemistry Exam', date: 'Sep 24, 2024', class: '11th-C', room: '103' },
          { subject: 'Biology Exam', date: 'Sep 26, 2024', class: '9th-D', room: '104' },
        ]}
      />
    </Grid>
    <Grid item lg={6}>
      <UpcomingAssignmentCard
        assignments={[
          { name: 'Math Homework', dueDate: 'Sep 20, 2024' },
          { name: 'Science Report', dueDate: 'Sep 22, 2024' },
          { name: 'English Essay', dueDate: 'Sep 25, 2024' },
          { name: 'History Presentation', dueDate: 'Sep 27, 2024' },
        ]}
      />
    </Grid>
    <Grid item lg={12}>
      <Typography variant="h6">My Timetable</Typography>
      <TimeTableView />
    </Grid>

    <Grid item lg={6} pb="30px">
      <Typography variant="h6" mb="20px">
        My Fee Structure
      </Typography>
      <Box display="flex" justifyContent="space-between">
        <Box width="100%">
          <Typography
            width="100%"
            bgcolor="#F4F6F8"
            fontSize="16px"
            fontWeight="bold"
            p={1}
            display="flex"
            alignItems="center"
            height="50px"
          >
            Fee Type
          </Typography>
          <Box bgcolor="white">
            {['Tuition', 'Library', 'Admission', 'Sports', 'Total Fee'].map((item, index) => (
              <Box key={index}>
                <Typography
                  fontSize="16px"
                  fontWeight={item === 'Total Fee' ? 'bold' : 'normal'}
                  display="flex"
                  alignItems="center"
                  ml="8px"
                  height="50px"
                >
                  {item}
                </Typography>
                {item !== 'Total Fee' && <Divider sx={{ borderStyle: 'dotted' }} />}
              </Box>
            ))}
          </Box>
        </Box>
        <Box width="100%">
          <Typography
            width="100%"
            bgcolor="#F4F6F8"
            fontSize="16px"
            fontWeight="bold"
            p={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="50px"
          >
            Amount
          </Typography>
          <Box bgcolor="white">
            {[10000, 10000, 10000, 10000, 40000].map((amount, index) => (
              <Box key={index}>
                <Typography
                  fontSize="16px"
                  fontWeight={index === 4 ? 'bold' : 'normal'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="50px"
                >
                  {formatNumber(amount, 'INR')}
                </Typography>
                {index !== 4 && <Divider sx={{ borderStyle: 'dotted' }} />}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Grid>
  </Grid>
);

export default MainDashboardStudent;
