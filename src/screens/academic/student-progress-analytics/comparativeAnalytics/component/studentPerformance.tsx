'use client';

import React from 'react';

import { Box, Card, Grid, Typography, CircularProgress } from '@mui/material';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

const StudentPerformance = () => (
  <>
    <Grid item xs={12} md={6}>
      <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Student Comparison</Typography>
        </Box>
        <PerformanceOverTime
          id="demo__4"
          chart={{
            categories: ['Math', 'Science', 'History', 'Eng', 'May'],
            series: [
              {
                name: 'Student Performance',
                data: [10, 41, 35, 51],
              },
              {
                name: 'Class Average',
                data: [49, 51, 35, 10],
              },
            ],
            options: {
              legend: {
                show: true,
                position: 'top',
              },
            },
          }}
          sx={{ height: '100%', boxShadow: 'none' }}
        />
      </Card>
    </Grid>
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          // Dark background color
          padding: 2,
          height: '100%',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Performance Deviation
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Box position="relative" display="inline-flex" mr={2}>
            <CircularProgress
              variant="determinate"
              value={73.9}
              size={45}
              thickness={2}
              color="success"
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="caption" component="div">
                73.9%
              </Typography>
            </Box>
          </Box>
          <Typography>+10% above class average in Math</Typography>
        </Box>

        <Box display="flex" alignItems="center">
          <Box position="relative" display="inline-flex" mr={2}>
            <CircularProgress
              variant="determinate"
              value={73.9}
              size={45}
              thickness={2}
              color="error"
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="caption" component="div">
                73.9%
              </Typography>
            </Box>
          </Box>
          <Typography>+10% below class average in English</Typography>
        </Box>
      </Card>
    </Grid>
  </>
);

export default StudentPerformance;
