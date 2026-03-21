import React from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  List,
  Stack,
  Button,
  Avatar,
  ListItem,
  CardHeader,
  Typography,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

const DashboardAlerts = () => {
  const alerts = [
    {
      id: 1,
      title: 'Route R-10 Delayed > 20 mins',
      subtitle: 'Driver: Rajesh Kumar | Vehicle: GJ-01-AB-1234',
      type: 'critical',
      time: '10 min ago',
    },
    {
      id: 2,
      title: 'Bus GJ-05 Breakdown Reported',
      subtitle: 'Near City Center | Replacement needed',
      type: 'critical',
      time: '25 min ago',
    },
    {
      id: 3,
      title: '3 Students Unassigned in Route R-04',
      subtitle: 'Review new admissions',
      type: 'warning',
      time: '1 hr ago',
    },
    {
      id: 4,
      title: 'Insurance Expiring: Bus GJ-12-XX-99',
      subtitle: 'Expires in 5 days',
      type: 'info',
      time: '2 hrs ago',
    },
  ];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Attention Required"
        action={
          <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}>
            View All
          </Button>
        }
      />
      <List sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        {alerts.map((alert) => (
          <ListItem
            key={alert.id}
            alignItems="flex-start"
            sx={{
              mb: 1.5,
              bgcolor: 'background.neutral',
              borderRadius: 1,
              borderLeft: `4px solid ${
                alert.type === 'critical'
                  ? '#FF4842'
                  : alert.type === 'warning'
                    ? '#FFC107'
                    : '#1890FF'
              }`,
            }}
            secondaryAction={
              <Button size="small" color={alert.type === 'critical' ? 'error' : 'primary'}>
                Resolve
              </Button>
            }
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor:
                    alert.type === 'critical'
                      ? 'error.lighter'
                      : alert.type === 'warning'
                        ? 'warning.lighter'
                        : 'info.lighter',
                  color:
                    alert.type === 'critical'
                      ? 'error.main'
                      : alert.type === 'warning'
                        ? 'warning.main'
                        : 'info.main',
                }}
              >
                <Iconify
                  icon={
                    alert.type === 'critical'
                      ? 'mdi:alert-circle'
                      : alert.type === 'warning'
                        ? 'mdi:alert'
                        : 'mdi:information'
                  }
                />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                    {alert.title}
                  </Typography>
                </Box>
              }
              secondary={
                <Stack component="span" direction="column" spacing={0.5} mt={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {alert.subtitle}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.disabled', fontStyle: 'italic' }}
                  >
                    {alert.time}
                  </Typography>
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default DashboardAlerts;
