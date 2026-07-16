'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Grid, Button, Typography } from '@mui/material';

const LmsDashboardCards = () => (
  <Grid container spacing={1}>
    <Grid size={{ xs: 12, md: 6 }}>
      <Card
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: (theme) => varAlpha(theme.vars.palette.secondary.mainChannel, 0.1),
        }}
      >
        <Typography variant="h6" gutterBottom>
          Active Courses
        </Typography>
        <Typography variant="h3" gutterBottom>
          • 06
        </Typography>
        <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
          <Box component="ul" sx={{ listStyle: 'none', padding: 0 }}>
            {['Math Course', 'Science Course'].map((exam, index) => (
              <Box component="li" key={index} sx={{ mb: 1 }}>
                <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                  {exam}
                </Button>
              </Box>
            ))}
          </Box>
        </Scrollbar>
      </Card>
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <Card
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
        }}
      >
        <Typography variant="h6" gutterBottom>
          Ongoing Assignments
        </Typography>
        <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
          <Box component="ul" sx={{ listStyle: 'none', padding: 0 }}>
            {['Math Assignement', 'Science Assignement'].map((exam, index) => (
              <Box component="li" key={index} sx={{ mb: 1 }}>
                <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                  {exam}
                </Button>
              </Box>
            ))}
          </Box>
        </Scrollbar>
      </Card>
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <Card
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.1),
        }}
      >
        <Typography variant="h6" gutterBottom>
          Upcoming Quizzes
        </Typography>
        <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
          <Box component="ul" sx={{ listStyle: 'none', padding: 0 }}>
            {['General Quiz-10-10-2024', 'General Quiz-12-10-2024'].map((exam, index) => (
              <Box component="li" key={index} sx={{ mb: 1 }}>
                <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                  {exam}
                </Button>
              </Box>
            ))}
          </Box>
        </Scrollbar>
      </Card>
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <Card
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
        }}
      >
        <Typography variant="h6" gutterBottom>
          Recent Activity Feed Section
        </Typography>
        <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
          <Box component="ul" sx={{ listStyle: 'none', padding: 0 }}>
            {[
              'Science newly created courses - yesterday',
              'Math Assignments submitted - 2 hours ago',
              'Math Assignments submitted - 2 hours ago',
            ].map((exam, index) => (
              <Box component="li" key={index} sx={{ mb: 1 }}>
                <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                  {exam}
                </Button>
              </Box>
            ))}
          </Box>
        </Scrollbar>
      </Card>
    </Grid>
  </Grid>
);

export default LmsDashboardCards;
