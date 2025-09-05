'use client';

import React from 'react';

import { Box, Card, Chip, Grid, Button, Typography, LinearProgress } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import type { IBudgetFormValues } from './type';

const BudgetDetailsCard: React.FC<{
  budget: IBudgetFormValues;
  handleClose: (e: any, isSubmit?: boolean) => void;
}> = ({ handleClose, budget }) => {
  const allocated = 45000;
  const spent = 30000;
  const remaining = allocated - spent;
  const utilization = (spent / allocated) * 100;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'calc(100vh - 200px)', sm: '100%' }, // Fixed height on mobile
        maxHeight: { xs: 'calc(100vh - 200px)', sm: '80vh' }, // Ensure it doesn't exceed screen
      }}
    >
      <Scrollbar
        sx={{
          flex: 1,
          p: 2,
          overflow: 'auto', // Ensure scrolling works
        }}
      >
        {/* Basic Details */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" gutterBottom color="primary.main">
              Basic Details
            </Typography>
            <Chip
              size="small"
              label="Active"
              variant="outlined"
              sx={{
                color: 'success.main',
                borderColor: 'success.main',
                bgcolor: 'success.lighter',
              }}
            />
          </Box>
          <Grid container spacing={2}>
            {/* Budget Title */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Budget Title
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {budget?.budgetTitle}
              </Typography>
            </Grid>

            {/* Budget Category */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Budget Category
              </Typography>
              <Chip size="small" label={budget?.budgetCategory} variant="outlined" />
            </Grid>

            {/* Time Period */}
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  bgcolor: '#E8F9F1',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #4CAF50',
                  mb: { xs: 2, sm: 0 }, // Add margin bottom on mobile
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Allocated
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight={600}>
                  ₹{allocated.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  bgcolor: '#FFF3E0',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #FF9800',
                  mb: { xs: 2, sm: 0 }, // Add margin bottom on mobile
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Spent
                </Typography>
                <Typography variant="h6" color="#F57C00" fontWeight={600}>
                  ₹{spent.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  bgcolor: '#FFF9E6',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #FFC107',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Remaining
                </Typography>
                <Typography variant="h6" color="warning.main" fontWeight={600}>
                  ₹{remaining.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box mt={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Utilisation Progress
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {utilization.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={utilization}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'success.main',
                },
              }}
            />
          </Box>
        </Card>

        {/* Category Breakdown */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Category Breakdown
          </Typography>
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight={600}>
                Laboratory Equipment (70%)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ₹70,000 / ₹1,00,000
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={70}
              sx={{
                height: 8,
                borderRadius: 5,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'success.main',
                },
              }}
            />
          </Box>
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight={600}>
                Staff Training (50%)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ₹50,000 / ₹1,00,000
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={50}
              sx={{
                height: 8,
                borderRadius: 5,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'success.main',
                },
              }}
            />
          </Box>
        </Card>

        {/* Budget Controls */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Budget Controls
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '10px solid #FF9800',
              }}
            />
            <Typography variant="body2" fontWeight={600}>
              Threshold Alert: 75%
            </Typography>
          </Box>
        </Card>
      </Scrollbar>

      {/* Bottom Action Buttons - Fixed at bottom */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper', // Ensure background color
          flexShrink: 0, // Prevent shrinking
          position: 'sticky', // Make it sticky
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<Iconify icon="material-symbols:close" />}
          onClick={() => handleClose(null, false)}
          sx={{
            minWidth: { xs: 80, sm: 100 }, // Smaller on mobile
            fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Smaller text on mobile
          }}
          size={window.innerWidth < 600 ? 'small' : 'medium'}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<Iconify icon="material-symbols:download" />}
          onClick={() => {
            // Handle download report action
          }}
          sx={{
            minWidth: { xs: 120, sm: 150 }, // Smaller on mobile
            fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Smaller text on mobile
            bgcolor: 'grey.800',
            '&:hover': {
              bgcolor: 'grey.900',
            },
          }}
          size={window.innerWidth < 600 ? 'small' : 'medium'}
        >
          Download Report
        </Button>
      </Box>
    </Box>
  );
};

export default BudgetDetailsCard;
