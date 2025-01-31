import React from 'react';

import { Grid, Paper, useTheme, Typography, LinearProgress } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

const AvgClassPerformace = () => {
  const theme = useTheme();
  return (
    <Grid item xs={12} md={6}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.1),
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 'var(--shadows-8)',
            scale: 1.03,
          },
          cursor: 'pointer',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Average Class Performance
        </Typography>
        <Typography variant="h6">GPA: 3.2 (B)</Typography>
        <LinearProgress variant="determinate" value={80} sx={{ mt: 2, mb: 1 }} />
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
              Highest: 4.0 (A)
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
              Lowest: 2.0 (C)
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default AvgClassPerformace;
