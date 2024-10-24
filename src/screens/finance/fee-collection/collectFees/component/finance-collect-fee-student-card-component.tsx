import React from 'react';

import { Box, Card, Avatar, Divider, Typography, ListItemText } from '@mui/material';

import { fShortenNumber } from 'src/utils/format-number';

import { AvatarShape } from 'src/assets/illustrations';

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
    <Card sx={{ textAlign: 'center', position: 'relative' }}>
      <Box pb="30px">
        <AvatarShape
          sx={{
            position: 'absolute',
            top: 15,
            left: 0,
            right: 0,
            zIndex: 10,
            mx: 'auto',
          }}
        />

        <Avatar
          alt={user.name}
          src={user.avatarUrl}
          sx={{
            width: 64,
            height: 64,
            zIndex: 11,
            position: 'absolute',
            top: 15,
            mx: 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </Box>

      {/* User Info */}
      <ListItemText
        sx={{ mt: 7, mb: 1 }}
        primary={user.name}
        primaryTypographyProps={{ typography: 'subtitle1' }}
        secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
      />

      {/* Divider */}
      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* Fee Information */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        sx={{ py: 3, typography: 'subtitle1' }}
      >
        {['Class', 'Parents Contact', 'Outstanding due'].map((label, index) => (
          <div key={label}>
            <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
              {label}
            </Typography>
            {fShortenNumber(
              index === 0
                ? user.totalFollowing
                : index === 1
                  ? user.totalFollowers
                  : user.totalPosts
            )}
          </div>
        ))}
      </Box>
    </Card>
  );
};

export default FinanceCollectFeeStudentCardComponent;
