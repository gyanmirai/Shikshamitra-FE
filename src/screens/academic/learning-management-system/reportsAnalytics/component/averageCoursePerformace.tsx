'use client';

import React from 'react';
import { BarChart } from '@mui/icons-material';
import { Box, Grid, Paper, Typography } from '@mui/material';

const AverageCoursePerformace = () => (
  <Grid size={{ xs: 12, md: 6 }}>
    <Paper elevation={3} sx={{ p: 2, bgcolor: '#1976d2' }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
        Average Course Performance
      </Typography>
      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
        90%
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <BarChart sx={{ color: '#fff', mr: 1 }} />
        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
          Overall progress
        </Typography>
      </Box>
    </Paper>
  </Grid>
);

export default AverageCoursePerformace;
