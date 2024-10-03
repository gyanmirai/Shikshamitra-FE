import React from 'react';

import { Box, Card, List, Button, ListItem, Typography, ListItemText } from '@mui/material';

const Dashboard = () => (
  <Box
    sx={{
      display: 'flex',

      alignItems: 'center',
      p: 2,

      flexWrap: 'wrap',
      gap: 2,
    }}
  >
    <Card sx={{ width: '100%', maxWidth: 400, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: '#1976d2' }}>
        Unread Messages
      </Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="Message from John"
            secondary="Hey, are we still on for the meeting tomorrow?"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Message from Jane"
            secondary="Don't forget to submit the report by EOD."
          />
        </ListItem>
      </List>
      <Button variant="contained" sx={{ mt: 2 }}>
        View All Messages
      </Button>
    </Card>

    <Card sx={{ width: '100%', maxWidth: 400, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: '#1976d2' }}>
        Upcoming Meetings
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Team Sync" secondary="Tomorrow at 10:00 AM" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Client Call" secondary="Friday at 2:00 PM" />
        </ListItem>
      </List>
      <Button variant="contained" sx={{ mt: 2 }}>
        View All Meetings
      </Button>
    </Card>

    <Card sx={{ width: '100%', maxWidth: 400, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: '#1976d2' }}>
        Recent Messages
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Message from Alice" secondary="Can we reschedule our meeting?" />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Message from Bob"
            secondary="I'll send the documents by tomorrow."
          />
        </ListItem>
      </List>
      <Button variant="contained" sx={{ mt: 2 }}>
        View All Recent Messages
      </Button>
    </Card>

    <Card sx={{ width: '100%', maxWidth: 400, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: '#1976d2' }}>
        Meeting Updates
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Project Kickoff" secondary="Rescheduled to next Monday" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Design Review" secondary="Moved to 3:00 PM" />
        </ListItem>
      </List>
      <Button variant="contained" sx={{ mt: 2 }}>
        View All Updates
      </Button>
    </Card>

    <Card sx={{ width: '100%', maxWidth: 400, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: '#1976d2' }}>
        Group Messages
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Team Chat" secondary="Let's discuss the new project." />
        </ListItem>
        <ListItem>
          <ListItemText primary="HR Announcements" secondary="New policies have been updated." />
        </ListItem>
      </List>
      <Button variant="contained" sx={{ mt: 2 }}>
        View All Group Messages
      </Button>
    </Card>
  </Box>
);

export default Dashboard;
