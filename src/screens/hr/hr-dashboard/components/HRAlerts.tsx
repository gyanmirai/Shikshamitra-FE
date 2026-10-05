import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { Card, List, ListItem, CardHeader, ListItemIcon, ListItemText } from '@mui/material';

const alerts = [
  { id: 1, text: '2 staff missing biometric punch', icon: <WarningIcon color="warning" /> },
  { id: 2, text: '1 contract expiring this month', icon: <ErrorIcon color="error" /> },
  { id: 3, text: 'Payroll reminders for 4 staff', icon: <InfoIcon color="info" /> },
];

const HRAlerts = () => (
  <Card sx={{ height: '100%' }}>
    <CardHeader title="⚠️ Alerts & Notifications" />
    <List>
      {alerts.map((alert) => (
        <ListItem key={alert.id}>
          <ListItemIcon>{alert.icon}</ListItemIcon>
          <ListItemText primary={alert.text} />
        </ListItem>
      ))}
    </List>
  </Card>
);

export default HRAlerts;
