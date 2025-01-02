import type { ReactElement } from 'react';

import React from 'react';

import { Phone, Message, LinkedIn } from '@mui/icons-material';
import { Box, Button, Avatar, IconButton, Typography } from '@mui/material';

import CustomTooltip from '../custom-tooltip';

interface UserProfile {
  name: string;
  email?: string;
  role?: string;
  class?: string;
  division?: string;
  avatarUrl?: string;
  workHours?: string;
  location?: string;
  timezone?: string;
  organization?: string;
  board?: string;
  medium?: string;
}

const UserHoverProfile: React.FC<{
  user: UserProfile;
  avatarComp: ReactElement<any, any>;
}> = ({ user, avatarComp }) => (
  <CustomTooltip
    arrow
    title={
      <Box sx={{ width: 300, padding: 2 }}>
        {/* User Avatar and Information */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <Avatar
            src={user.avatarUrl}
            alt={user.name}
            sx={{ width: 56, height: 56, marginRight: 2 }}
          />
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2">
              {user.board} - {user.medium} -{user.organization}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user.class} - {user.division}
            </Typography>
          </Box>
        </Box>

        {/* Messaging Options */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', marginBottom: 2 }}>
          <IconButton>
            <Message />
          </IconButton>
          <IconButton>
            <Phone />
          </IconButton>
          <IconButton>
            <LinkedIn />
          </IconButton>
        </Box>

        {/* Quick Message Input */}
        <Box sx={{ marginBottom: 2 }}>
          <Button fullWidth variant="outlined">
            View Full Profile
          </Button>
        </Box>

        {/* <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="body2">
              Invited you to <b>Shikshamitra Daily Standup</b>
            </Typography>
            <Button variant="contained" size="small" sx={{ marginTop: 1 }}>
              Accept
            </Button>
          </CardContent>
        </Card>

      
        <Card>
          <CardContent>
            <Typography variant="body2">
              <b>Available</b> • Free all day
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Work hours: {user.workHours}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user.timezone}
            </Typography>
          </CardContent>
        </Card> */}
      </Box>
      //   <Box p={2}>
      //     <Typography variant="h6">{user.name}</Typography>
      //     <Typography variant="body2">{user.email}</Typography>
      //     <Typography variant="body2" color="textSecondary">
      //       {user.role}
      //     </Typography>
      //   </Box>
    }
    placement="right"
  >
    {avatarComp}
  </CustomTooltip>
);

export default UserHoverProfile;
