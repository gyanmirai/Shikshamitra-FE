'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { CheckCircle } from '@mui/icons-material';
import { Box, Grid, Card, Typography } from '@mui/material';

const TotalGradeEntered = () => {
  const theme = useTheme();
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          bgcolor: varAlpha(theme.palette.secondary.mainChannel, 0.1),
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 'var(--shadows-8)',
            scale: 1.03,
          },
          cursor: 'pointer',
        }}
      >
        <CheckCircle sx={{ fontSize: 32, mr: 2, color: 'secondary.main' }} />
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Total Grades Entered
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            03
          </Typography>
        </Box>
      </Card>
    </Grid>
  );
};

export default TotalGradeEntered;
