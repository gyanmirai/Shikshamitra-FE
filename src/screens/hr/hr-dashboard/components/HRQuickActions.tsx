import React from 'react';
import EventIcon from '@mui/icons-material/Event';
import DomainIcon from '@mui/icons-material/Domain';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Card, Grid, Button, CardHeader } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const actions = [
  { label: 'Add Employee', icon: <PersonAddIcon /> },
  { label: 'Salary Slip', icon: <ReceiptIcon /> },
  { label: 'Approve Leave', icon: <EventAvailableIcon /> },
  { label: 'Fix Attendance', icon: <AccessTimeIcon /> },
  { label: 'Reports Export', icon: <AssessmentIcon /> },
  { label: 'Create Event', icon: <EventIcon /> },
  { label: 'Assign Department', icon: <DomainIcon /> },
];

const HRQuickActions = () => (
  <Card sx={{ p: 3, mt: 3 }}>
    <CardHeader title="🎯 Quick Actions" sx={{ p: 0, mb: 2 }} />
    <Grid container spacing={2}>
      {actions.map((action, index) => (
        <Grid key={index}>
          <Button
            variant="outlined"
            startIcon={action.icon}
            sx={{
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {action.label}
          </Button>
        </Grid>
      ))}
    </Grid>
  </Card>
);

export default HRQuickActions;
