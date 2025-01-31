'use client';

import React from 'react';

import { Box, Grid, Card, styled, Avatar, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  margin: '0 auto',
  border: `3px solid ${theme.palette.primary.main}`,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0.5, 1),
}));

const StudentProfile = ({ student }: any) => (
  <>
    <Grid item xs={12} textAlign="center">
      <StyledAvatar src={student.avatarUrl} alt={student.name} />
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
        {student.name}
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Grade {student.grade}
      </Typography>
    </Grid>
    <Grid item xs={12} sm={6}>
      <SectionTitle variant="h5">Attendance</SectionTitle>
      <StatItem>
        <Iconify icon="mdi:tick-circle-outline" color="primary" />
        <StatLabel>Present Days :</StatLabel>
        <StatValue>{student.attendance.presentDays}</StatValue>
      </StatItem>
      <StatItem>
        <Iconify icon="mdi:tick-circle-outline" color="error" />
        <StatLabel>Absent Days :</StatLabel>
        <StatValue>{student.attendance.absentDays}</StatValue>
      </StatItem>
    </Grid>
    <Grid item xs={12} sm={6}>
      <SectionTitle variant="h5">Behavior & Participation</SectionTitle>
      <StatItem>
        <Iconify icon="mdi:star-outline" color="primary" />
        <StatLabel>Behavior Score :</StatLabel>
        <StatValue>{student.behavior.score}</StatValue>
      </StatItem>
      <StatItem>
        <Iconify icon="mdi:star-outline" color="error" />
        <StatLabel>Participation Level :</StatLabel>
        <StatValue>{student.behavior.participationLevel}</StatValue>
      </StatItem>
    </Grid>
    <Grid item xs={12} md={6}>
      <Card sx={{ height: '400px', p: 2, boxShadow: 'var(--shadows-2)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Performance by Subject</Typography>
        </Box>
        <AnalyticsWebsiteVisits
          title=""
          chart={{
            categories: ['Math', 'Science', 'History', 'ENG', 'May'],
            series: [{ name: '', data: [43, 33, 22, 37, 67] }],
          }}
          sx={{ height: '100%', boxShadow: 'none' }}
        />
      </Card>
    </Grid>
  </>
);

export default StudentProfile;
