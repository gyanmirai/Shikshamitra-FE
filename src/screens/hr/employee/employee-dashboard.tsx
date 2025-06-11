import React from 'react';

import {
  Box,
  Card,
  Grid,
  Stack,
  Table,
  Paper,
  Button,
  TableRow,
  useTheme,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
} from '@mui/material';

// Dummy data
const upcomingSchedule = [
  {
    id: 1,
    title: 'Staff Meeting',
    time: '10:00 AM - 11:00 AM',
    description: 'Discuss quarterly curriculum updates',
  },
  {
    id: 2,
    title: 'Math Exam Grading',
    time: 'Due: Tomorrow, 5:00 PM',
    description: 'Grade papers for Class 10A',
  },
  {
    id: 3,
    title: 'Science Project Submission Deadline',
    time: 'Due: Next Friday',
    description: 'Collect and review project submissions',
  },
];

const leaderboard = [
  { id: 1, name: 'Aarav Patel', department: 'Math Department', points: 1250 },
  { id: 2, name: 'Priya Sharma', department: 'Science Department', points: 1160 },
  { id: 3, name: 'Rohan Kumar', department: 'English Department', points: 1050 },
];

const smartSuggestions = [
  {
    id: 1,
    title: 'Automatic grading for MCQs',
    description: 'Save up to 2 hours per week',
  },
  {
    id: 2,
    title: 'Schedule parent-teacher meetings',
    description: 'Use the automated scheduling tool',
  },
];

const EmployeeDashboard = () => {
  const theme = useTheme();

  // Activity Heatmap Chart Configuration
  const heatmapOptions = {
    chart: {
      type: 'heatmap',
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    colors: ['#008FFB'],
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: '#EEEEEE' },
            { from: 1, to: 2, color: '#90CAF9' },
            { from: 3, to: 4, color: '#42A5F5' },
            { from: 5, to: 6, color: '#1976D2' },
          ],
        },
      },
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
  };

  const heatmapSeries = [
    {
      name: 'Activity',
      data: [
        { x: 'Mon', y: 4 },
        { x: 'Tue', y: 2 },
        { x: 'Wed', y: 5 },
        { x: 'Thu', y: 6 },
        { x: 'Fri', y: 3 },
        { x: 'Sat', y: 1 },
        { x: 'Sun', y: 0 },
      ],
    },
  ];

  // Productivity Chart Configuration
  const productivityOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    dataLabels: { enabled: false },
    colors: ['#4CAF50'],
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
  };

  const productivitySeries = [
    {
      name: 'Productivity',
      data: [75, 85, 95, 90, 85, 70],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Status Cards */}
        <Grid item xs={12} container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, bgcolor: '#FFF5F5' }}>
              <Typography variant="subtitle2" color="error">
                Homework Drafts
              </Typography>
              <Typography variant="h4">12</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, bgcolor: '#F6FFF8' }}>
              <Typography variant="subtitle2" color="success.main">
                Published Assignments
              </Typography>
              <Typography variant="h4">45</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, bgcolor: '#FFFBF2' }}>
              <Typography variant="subtitle2" color="warning.main">
                Pending Exams
              </Typography>
              <Typography variant="h4">3</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, bgcolor: '#F5F8FF' }}>
              <Typography variant="subtitle2" color="primary">
                Feedback Received
              </Typography>
              <Typography variant="h4">27</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Upcoming Schedule and Activity Heatmap */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Upcoming Schedule</Typography>
              <Button color="primary">View All</Button>
            </Stack>
            <Stack spacing={2}>
              {upcomingSchedule.map((item) => (
                <Box key={item.id} sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
        {/* <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" mb={2}>
              Activity Heatmap
            </Typography>
            <Chart options={heatmapOptions} series={heatmapSeries} type="heatmap" height={200} />
          </Card>
        </Grid> */}

        {/* Leaderboard, Smart Suggestions, and Productivity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Leaderboard
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableBody>
                  {leaderboard.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.department}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="primary">{item.points} pts</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Smart Suggestions
            </Typography>
            <Stack spacing={2}>
              {smartSuggestions.map((item) => (
                <Box key={item.id} sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: 1 }}>
                  <Typography variant="subtitle2">{item.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
        {/* <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Personal Productivity
            </Typography>
            <Chart
              options={productivityOptions}
              series={productivitySeries}
              type="bar"
              height={200}
            />
          </Card>
        </Grid> */}
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
