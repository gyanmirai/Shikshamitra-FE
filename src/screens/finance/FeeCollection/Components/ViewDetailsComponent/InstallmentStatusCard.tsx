import React from 'react';
import { Box, Card, Chip, Stack, Typography, CardContent, LinearProgress } from '@mui/material';

const installments = [
  {
    quarter: 'Quarter 1',
    amount: 10000,
    status: 'Paid',
    date: '10-01-2025',
  },
  {
    quarter: 'Quarter 2',
    amount: 10000,
    status: 'Pending',
    date: '28-02-2025',
  },
];

export default function InstallmentStatusCard() {
  const total = installments.length;
  const paid = installments.filter((i) => i.status === 'Paid').length;
  const progress = (paid / total) * 100;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        {/* Header */}
        <Typography variant="h6" fontWeight="bold">
          Installment Status
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {paid} of {total} installment Paid
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 5,
              '& .MuiLinearProgress-bar': { borderRadius: 5 },
            }}
          />
          <Typography variant="body2" color="text.secondary" align="center" mt={1}>
            {progress}% Complete
          </Typography>
        </Box>

        {/* Installments List */}
        <Stack spacing={2}>
          {installments.map((item, index) => (
            <Box
              key={index}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography fontWeight="600">
                  {index + 1}. {item.quarter}
                </Typography>
                <Chip
                  label={item.status}
                  size="small"
                  sx={{
                    bgcolor:
                      item.status === 'Paid' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(237, 108, 2, 0.1)',
                    color: item.status === 'Paid' ? 'green' : 'orange',
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Typography variant="body1" fontWeight="500">
                ₹{item.amount.toLocaleString('en-IN')}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: item.status === 'Paid' ? 'green' : 'orange',
                  mt: 0.5,
                  fontWeight: 500,
                }}
              >
                {item.status === 'Paid' ? 'Paid' : 'Due'}: {item.date}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
