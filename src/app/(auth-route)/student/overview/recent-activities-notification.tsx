import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Button } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

const RecentActivitiesNotification = () => (
  <Grid2 xs={12} md={6} display="flex" gap={1}>
    <Card
      sx={{
        display: 'flex',
        p: 1,
        width: '100%',
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ typography: 'subtitle2' }}>Recent Activities</Box>

        <Scrollbar sx={{ mt: 1.5 }}>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              width: '100%',
              padding: 0,
              animation: 'scrollAnimation 10s linear infinite',
              animationDelay: '1s',
              '@keyframes scrollAnimation': {
                '0%': { transform: 'translateY(0)' },
                '100%': { transform: 'translateY(-100%)' },
              },
              '&:hover': {
                animationPlayState: 'paused',
              },
            }}
          >
            {[
              'Student record updated',
              'Student attendance updated',
              'Student record updated',
              'Student record updated',
              'Student attendance updated',
              'Student record updated',
            ].map((exam, index) => (
              <Box component="li" key={index} sx={{ mb: 1 }}>
                <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                  {exam}
                </Button>
              </Box>
            ))}
          </Box>
        </Scrollbar>
      </Box>
    </Card>
    <Card
      sx={{
        p: 1,
        // mt: 1,
        width: '100%',
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ typography: 'subtitle2' }}>Notifications</Box>

        <Scrollbar sx={{ mt: 1.5, width: '100%' }}>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              padding: 0,
              width: '100%',
              animation: 'scrollAnimation 10s linear infinite',
              animationDelay: '1s',
              '@keyframes scrollAnimation': {
                '0%': { transform: 'translateY(0)' },
                '100%': { transform: 'translateY(-100%)' },
              },
              '&:hover': {
                animationPlayState: 'paused',
              },
            }}
          >
            {[
              'Pending attendance update',
              'Pending record updated',
              'Pending attendance update',
              'Pending attendance update',
              'Pending record updated',
              'Pending attendance update',
            ].map((exam, index) => (
              <Box component="li" key={index} sx={{ mb: 1 }}>
                <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                  {exam}
                </Button>
              </Box>
            ))}
          </Box>
        </Scrollbar>
      </Box>
    </Card>
  </Grid2>
);

export default RecentActivitiesNotification;
