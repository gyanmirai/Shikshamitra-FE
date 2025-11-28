import type { CardProps } from '@mui/material';

import React from 'react';
import { fCurrency } from 'src/utils/format-number';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Avatar, CardHeader, Typography } from '@mui/material';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    name: string;
    class: string;
    amount: number;
    avatarUrl?: string;
  }[];
};

export default function FinanceHighOutstandingStudents({
  title,
  subheader,
  list,
  ...other
}: Props) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Box sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
          {list.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar alt={item.name} src={item.avatarUrl || ''}>
                {item.name.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">{item.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.class}
                </Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ color: 'error.main' }}>
                {fCurrency(item.amount)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Scrollbar>
    </Card>
  );
}
