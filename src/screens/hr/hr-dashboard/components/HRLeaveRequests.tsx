import React from 'react';
import {
  Card,
  List,
  Avatar,
  ListItem,
  CardHeader,
  Typography,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

const requests = [
  { id: 1, name: 'Rahul Mehta', type: 'Sick Leave (2d)', time: '2 hours ago', avatar: '' },
  { id: 2, name: 'Priya Sen', type: 'Casual Leave', time: '5 hours ago', avatar: '' },
  { id: 3, name: 'Roshan P', type: 'Earned Leave', time: '1 day ago', avatar: '' },
];

const HRLeaveRequests = () => (
  <Card sx={{ height: '100%' }}>
    <CardHeader title="📝 Leave Requests (Pending 03)" />
    <List>
      {requests.map((req) => (
        <ListItem key={req.id} divider>
          <ListItemAvatar>
            <Avatar src={req.avatar} alt={req.name} />
          </ListItemAvatar>
          <ListItemText
            primary={req.name}
            secondary={
              <Typography component="span" variant="body2" color="text.primary">
                {req.type}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  </Card>
);

export default HRLeaveRequests;
