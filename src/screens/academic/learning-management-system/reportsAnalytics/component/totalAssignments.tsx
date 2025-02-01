'use client';

import React from 'react';

import { CheckCircle } from '@mui/icons-material';
import { Box, Grid, Paper, Typography } from '@mui/material';

const TotalAssignments = () => (
  <Grid item xs={12} md={6}>
    <Paper elevation={3} sx={{ p: 2, bgcolor: '#388e3c' }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
        Total Assignments Submitted
      </Typography>
      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
        20
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <CheckCircle sx={{ color: '#fff', mr: 1 }} />
        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
          Submitted assignments
        </Typography>
      </Box>
    </Paper>
  </Grid>
);

export default TotalAssignments;
