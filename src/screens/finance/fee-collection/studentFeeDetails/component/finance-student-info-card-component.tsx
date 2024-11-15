import React from 'react';

import { Box, Card, Avatar, Button, Typography } from '@mui/material';


export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

type Props = {
  user: IUserCard;
};

const FinanceStudentInfoCardComponent = ({ user }: Props) => {
  const data = [];
  return (
    <Card sx={{ display: 'flex', width: '100%', p: 2 }}>
      {/* Left Section: Avatar and Name */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{ width: '30%', textAlign: 'center' }}
      >
        <Typography variant="subtitle1" component="div" sx={{ mb: 1 }}>
          {user.name}
        </Typography>
        <Avatar
          alt={user.name}
          src={user.avatarUrl}
          sx={{
            width: 80,
            height: 80,
          }}
        />
      </Box>

      {/* Right Section: Fee Information and Buttons */}
      <Box
        sx={{
          width: '70%',
          pl: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Fee Information */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          sx={{ typography: 'subtitle1', width: '100%', mb: 2 }}
        >
          {['Paid Fees', 'Pending Fees', 'Overdue Fees'].map((label, index) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
                {label}
              </Typography>
              {index === 0 ? '10,000' : index === 1 ? '20,000' : '30,000'}
            </Box>
          ))}
        </Box>

        {/* Bottom-Left Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button size='small' variant="contained">Send Reminder</Button>
          <Button size='small' variant="contained">Generate Report</Button>
        </Box>
      </Box>
    </Card>

  );
};

export default FinanceStudentInfoCardComponent;



