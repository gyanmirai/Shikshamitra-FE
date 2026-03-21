import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Button, CardHeader, Typography } from '@mui/material';

const QuickActions = () => {
  const actions = [
    { label: 'Add Route', icon: 'mdi:map-plus', color: 'primary' },
    { label: 'Assign Driver', icon: 'mdi:account-plus', color: 'info' },
    { label: 'New Vehicle', icon: 'mdi:bus-plus', color: 'success' },
    { label: 'Broadcast Alert', icon: 'mdi:broadcast', color: 'error' },
    { label: 'Maintenance', icon: 'mdi:tools', color: 'warning' },
    { label: 'Reports', icon: 'mdi:file-chart', color: 'secondary' },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Quick Actions" />
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {actions.map((action) => (
            <Grid key={action.label} size={{ xs: 6, sm: 4, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                color={action.color as any}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  py: 3,
                  height: '100%',
                  borderRadius: 2,
                  borderColor: (theme) =>
                    theme.palette[
                      action.color as
                        | 'primary'
                        | 'secondary'
                        | 'error'
                        | 'warning'
                        | 'info'
                        | 'success'
                    ]?.main,
                  backgroundColor: (theme) =>
                    theme.palette[
                      action.color as
                        | 'primary'
                        | 'secondary'
                        | 'error'
                        | 'warning'
                        | 'info'
                        | 'success'
                    ]?.lighter,
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette[
                        action.color as
                          | 'primary'
                          | 'secondary'
                          | 'error'
                          | 'warning'
                          | 'info'
                          | 'success'
                      ]?.light,
                  },
                }}
              >
                <Iconify
                  icon={action.icon}
                  width={32}
                  sx={{ mb: 1, color: `${action.color}.main` }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  {action.label}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  );
};

export default QuickActions;
