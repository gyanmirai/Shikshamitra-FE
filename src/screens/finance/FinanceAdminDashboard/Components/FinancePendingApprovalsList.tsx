import type { CardProps } from '@mui/material';

import React from 'react';
import { Label } from 'src/components/label';
import { fCurrency } from 'src/utils/format-number';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Avatar, Button, CardHeader, Typography } from '@mui/material';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    type: string;
    requester: string;
    amount?: number;
    date: string;
    status: string;
    avatarUrl?: string;
  }[];
};

export default function FinancePendingApprovalsList({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Box sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
          {list.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar alt={item.requester} src={item.avatarUrl || ''}>
                {item.requester.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">{item.type}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.requester} • {item.date}
                </Typography>
              </Box>

              <Box
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}
              >
                {item.amount && (
                  <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                    {fCurrency(item.amount)}
                  </Typography>
                )}
                <Label color="warning">{item.status}</Label>
              </Box>
            </Box>
          ))}
        </Box>
      </Scrollbar>

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Box component="span" className="iconify solar--alt-arrow-right-bold" />}
        >
          View All
        </Button>
      </Box>
    </Card>
  );
}
