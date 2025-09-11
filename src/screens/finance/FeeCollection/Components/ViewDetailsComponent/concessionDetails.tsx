import React from 'react';
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
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        {/* Header */}
        <Typography variant="h6" fontWeight="bold">
          Concessions Applied
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Total Savings: ₹{total.toLocaleString('en-IN')}
        </Typography>

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

              <Typography variant="subtitle1" fontWeight="600" color="green">
                -₹{item.amount.toLocaleString('en-IN')}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
