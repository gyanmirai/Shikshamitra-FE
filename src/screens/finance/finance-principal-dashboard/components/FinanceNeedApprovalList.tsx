import type { CardProps } from '@mui/material';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Stack, Avatar, Button, CardHeader, Typography } from '@mui/material';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    type: 'Charge' | 'Concession';
    studentName: string;
    description: string;
    amount: number;
    date: string;
    avatarUrl?: string;
  }[];
};

export default function FinanceNeedApprovalList({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Box sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
          {list.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar alt={item.studentName} src={item.avatarUrl || ''}>
                {item.studentName.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">{item.studentName}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.type} • {item.description} • {item.date}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right', mr: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: item.type === 'Charge' ? 'error.main' : 'success.main' }}
                >
                  {fCurrency(item.amount)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" color="success" sx={{ minWidth: 0, p: 1 }}>
                  <Iconify icon="eva:checkmark-fill" width={16} />
                </Button>
                <Button size="small" variant="contained" color="error" sx={{ minWidth: 0, p: 1 }}>
                  <Iconify icon="eva:close-fill" width={16} />
                </Button>
              </Stack>
            </Box>
          ))}
        </Box>
      </Scrollbar>
    </Card>
  );
}
