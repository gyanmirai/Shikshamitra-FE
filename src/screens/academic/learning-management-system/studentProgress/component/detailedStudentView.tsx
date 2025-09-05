'use client';

import { School, AssignmentTurnedIn } from '@mui/icons-material';
import { Box, Grid, Avatar, Typography, LinearProgress } from '@mui/material';

const DetailedStudentView = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 3,
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#333' : '#f5f5f5'),
      borderRadius: 2,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}
  >
    <Avatar
      alt="Student Name"
      src="/path-to-student-image.jpg"
      sx={{
        width: 120,
        height: 120,
        border: (theme) => `3px solid ${theme.palette.primary.main}`,
        marginBottom: 2,
      }}
    />
    <Typography variant="h4" fontWeight="bold" sx={{ marginBottom: 1 }}>
      John Doe
    </Typography>
    <Typography
      variant="h5"
      sx={{
        color: '#4caf50',
        fontWeight: 'bold',
        marginBottom: 3,
      }}
    >
      A+
    </Typography>
    <Grid container spacing={3} sx={{ width: '100%', maxWidth: 400 }}>
      <Grid size={{ xs: 6 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#424242' : 'white'),
            padding: 2,
            borderRadius: 1,
          }}
        >
          <School
            sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main, marginBottom: 1 }}
          />
          <Typography variant="subtitle1" color="textSecondary">
            Average Grade
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            95%
          </Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 6 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#424242' : 'white'),
            padding: 2,
            borderRadius: 1,
          }}
        >
          <AssignmentTurnedIn
            sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main, marginBottom: 1 }}
          />
          <Typography variant="subtitle1" color="textSecondary">
            Assignments Completed
          </Typography>
          <Box sx={{ width: '100%', marginTop: 1 }}>
            <LinearProgress
              variant="determinate"
              value={80}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#555' : '#e0e0e0'),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4caf50',
                },
              }}
            />
            <Typography variant="body2" sx={{ textAlign: 'center', marginTop: 0.5 }}>
              80%
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Box>
);

export default DetailedStudentView;
