'use client';

import React from 'react';

import { Box, Card, Chip, Grid, Typography, LinearProgress } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

import type { IBudgetFormValues } from './type';

const BudgetDetailsCard: React.FC<{ budget: IBudgetFormValues }> = ({ budget }) => {
  const allocated = 45000;
  const spent = 30000;
  const remaining = allocated - spent;
  const utilization = (spent / allocated) * 100;

  return (
    <Box sx={{ p: 2 }}>
      <Scrollbar sx={{ height: '500px' }}>
        {/* Basic Details */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Basic Details
          </Typography>
          <Grid container spacing={2}>
            {/* Budget Title */}
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Budget Title
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {budget?.budgetTitle}
              </Typography>
            </Grid>

            {/* Budget Category */}
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Budget Category
              </Typography>
              <Chip size="small" label={budget?.budgetCategory} variant="outlined" />
            </Grid>

            {/* Time Period */}
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Time Period
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {budget?.startDate} to {budget?.endDate}
              </Typography>
            </Grid>
          </Grid>
        </Card>

        {/* Budget Utilization */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Budget Utilization
          </Typography>
          <Grid container spacing={2} textAlign="center">
            <Grid item xs={4}>
              <Box sx={{ bgcolor: '#E6F7FF', p: 1, borderRadius: 2 }}>
                <Typography variant="body2">Allocated</Typography>
                <Typography variant="h6">₹{allocated.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ bgcolor: '#E8F9F1', p: 1, borderRadius: 2 }}>
                <Typography variant="body2">Spent</Typography>
                <Typography variant="h6">₹{spent.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ bgcolor: '#F9F9F9', p: 1, borderRadius: 2 }}>
                <Typography variant="body2">Remaining</Typography>
                <Typography variant="h6">₹{remaining.toLocaleString()}</Typography>
              </Box>
            </Grid>
          </Grid>
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              Utilisation Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={utilization}
              sx={{ height: 8, borderRadius: 5 }}
            />
            <Typography variant="caption">{utilization.toFixed(1)}%</Typography>
          </Box>
        </Card>

        {/* Category Breakdown */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Category Breakdown
          </Typography>
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              Laboratory Equipment (70%)
            </Typography>
            <LinearProgress variant="determinate" value={70} sx={{ height: 8, borderRadius: 5 }} />
            <Typography variant="caption">₹70,000 / ₹1,00,000</Typography>
          </Box>
          <Box>
            <Typography variant="body2" gutterBottom>
              Staff Training (50%)
            </Typography>
            <LinearProgress variant="determinate" value={50} sx={{ height: 8, borderRadius: 5 }} />
            <Typography variant="caption">₹50,000 / ₹1,00,000</Typography>
          </Box>
        </Card>

        {/* Budget Controls */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Budget Controls
          </Typography>
          <Typography variant="body2" color="warning.main">
            ⚠ Threshold Alert: 75%
          </Typography>
        </Card>
      </Scrollbar>
    </Box>
  );
};

export default BudgetDetailsCard;
