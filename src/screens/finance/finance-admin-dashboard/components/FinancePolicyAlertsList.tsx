import type { CardProps } from '@mui/material';

import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Alert, CardHeader } from '@mui/material';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
  }[];
};

export default function FinancePolicyAlertsList({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Box sx={{ p: 3, gap: 2, display: 'flex', flexDirection: 'column' }}>
          {list.map((item) => (
            <Alert key={item.id} severity={item.severity} sx={{ width: '100%' }}>
              {item.message}
            </Alert>
          ))}
        </Box>
      </Scrollbar>
    </Card>
  );
}
