'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Typography } from '@mui/material';

const StudentProgressCards = () => (
  <Grid container spacing={2} mt={2}>
    <Grid size={{ xs: 12, md: 4 }}>
      <Card
        sx={{
          height: '100%',
          p: 3,
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1a2027' : '#e6f7ff'),
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'scale(1.05)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Iconify icon="ph:exam" height={27} width={27} />
          <Typography variant="h6">Completed Exams</Typography>
        </Box>
        <Typography
          variant="h3"
          sx={{ mt: 1, textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}
        >
          25
        </Typography>
      </Card>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <Card
        sx={{
          height: '100%',
          p: 3,
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1a2027' : '#e6ffe6'),
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'scale(1.05)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Iconify icon="fluent:quiz-new-20-regular" height={27} width={27} />
          <Typography variant="h6">Completed Quiz</Typography>
        </Box>
        <Typography
          variant="h3"
          sx={{ mt: 1, textAlign: 'center', color: '#008000', fontWeight: 'bold' }}
        >
          14
        </Typography>
      </Card>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <Card
        sx={{
          height: '100%',
          p: 3,
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1a2027' : '#fff0f0'),
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'scale(1.05)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Iconify icon="mdi:assignment" height={27} width={27} />
          <Typography variant="h6">Completed Assignments</Typography>
        </Box>
        <Typography
          variant="h3"
          sx={{ mt: 1, textAlign: 'center', color: '#d32f2f', fontWeight: 'bold' }}
        >
          92
        </Typography>
      </Card>
    </Grid>
  </Grid>
);

export default StudentProgressCards;
