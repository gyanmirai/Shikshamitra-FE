import React from 'react';

import { Box, Card, Avatar, Typography } from '@mui/material';

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

const FinanceCollectFeeStudentCardComponent = ({ user }: Props) => {
  const data = [];
  return (
    <Card sx={{ display: 'flex', width: '100%', p: 2 }}>
      {/* Left Section: Student Name and Avatar */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{ width: '30%', textAlign: 'center' }}
      >
        {/* Student Name */}
        <Typography variant="subtitle1" component="div" sx={{ mb: 1 }}>
          {user.name}
        </Typography>

        <Avatar
          alt={user.name}
          src={user.avatarUrl}
          sx={{
            width: 80,
            height: 80,
            position: 'relative',
          }}
        />
      </Box>

      {/* Right Section: Student Information */}
      <Box
        sx={{
          width: '70%',
          pl: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          sx={{ py: 2, typography: 'subtitle1', width: '100%' }}
        >
          {['Class', 'Parents Contact', 'Outstanding due'].map((label, index) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
              <Typography
                variant="caption"
                component="div"
                sx={{ mb: 0.5, color: 'text.secondary' }}
              >
                {label}
              </Typography>
              {index === 0 ? 10 : index === 1 ? '9876542347' : '20,000'}
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
};

export default FinanceCollectFeeStudentCardComponent;
