import type { CardProps } from '@mui/material';

import React from 'react';
import { useRouter } from 'src/routes/hooks';
import { fCurrency } from 'src/utils/format-number';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Avatar, Button, CardHeader, Typography } from '@mui/material';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    category: string;
    amount: number;
    addedBy: string;
    date: string;
    avatarUrl?: string;
  }[];
  viewAllPath?: string;
};

export default function FinanceRecentExpenses({
  title,
  subheader,
  list,
  viewAllPath,
  ...other
}: Props) {
  const router = useRouter();

  const handleViewAll = () => {
    if (viewAllPath) {
      router.push(viewAllPath);
    }
  };

  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          viewAllPath && (
            <Button size="small" onClick={handleViewAll}>
              View All
            </Button>
          )
        }
      />

      <Scrollbar>
        <Box sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
          {list.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar alt={item.addedBy} src={item.avatarUrl || ''}>
                {item.addedBy.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">{item.category}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.addedBy} • {item.date}
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
