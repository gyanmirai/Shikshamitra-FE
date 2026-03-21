import type { CardProps } from '@mui/material';

import React from 'react';
import { fToNow } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Avatar, CardHeader, Typography } from '@mui/material';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    action: string;
    user: string;
    target: string;
    time: Date | string | number;
    avatarUrl?: string;
  }[];
};

export default function FinanceRecentUpdatesList({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Box sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
          {list.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar alt={item.user} src={item.avatarUrl || ''}>
                {item.user.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">{item.action}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <Box
                    component="span"
                    sx={{ color: 'text.primary', fontWeight: 'fontWeightMedium' }}
                  >
                    {item.user}
                  </Box>{' '}
                  {item.target}
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                {fToNow(item.time)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Scrollbar>
    </Card>
  );
}
