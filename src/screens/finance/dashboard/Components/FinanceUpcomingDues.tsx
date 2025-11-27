import type { CardProps } from '@mui/material';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Avatar, CardHeader, Typography } from '@mui/material';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    description: string;
    dueDate: string;
    amount: number;
    avatarUrl?: string;
  }[];
};

export default function FinanceUpcomingDues({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Box sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
          {list.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                alt={item.description}
                src={item.avatarUrl || ''}
                sx={{ bgcolor: 'warning.lighter', color: 'warning.main' }}
              >
                <Iconify icon="solar:calendar-mark-bold-duotone" width={24} />
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">{item.description}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Due: {item.dueDate}
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
