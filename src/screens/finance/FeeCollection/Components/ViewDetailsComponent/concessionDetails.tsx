import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Stack, Typography, CardContent } from '@mui/material';

const concessions = [
  {
    title: 'Sibling Discount',
    subTitle: 'Tuition Fee',
    amount: 2000,
  },
  {
    title: 'Scholarship',
    subTitle: 'Tuition Fee, Transport Fee',
    amount: 800,
  },
  {
    title: 'Parents Child',
    subTitle: 'Tuition Fee',
    amount: 1000,
  },
];

export default function ConcessionsCard() {
  const total = concessions.reduce((acc, c) => acc + c.amount, 0);

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, height: '100%' }}>
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            Concessions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Saving : ₹ {total.toLocaleString('en-IN')}
          </Typography>
        </Box>
        <Scrollbar sx={{ height: '300px' }}>
          <Stack spacing={1.5}>
            {concessions.map((item, index) => (
              <Box
                key={index}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="500">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.subTitle}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" color="primary.main">
                  ₹ {item.amount.toLocaleString('en-IN')}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      </CardContent>
    </Card>
  );
}
