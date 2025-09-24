import React from 'react';
import { Label } from 'src/components/label';
import { Box, Card, Stack, Typography, CardContent, LinearProgress } from '@mui/material';

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
    <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
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
              {/* First line: Quarter and Amount */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography fontWeight="600">
                  {index + 1}. {item.quarter}
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  ₹{item.amount.toLocaleString('en-IN')}
                </Typography>
              </Box>
              {/* Second line: Date and Chip */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: item.status === 'Paid' ? 'green' : 'orange',
                    fontWeight: 500,
                  }}
                >
                  {item.status === 'Paid' ? 'Paid' : 'Due'}: {item.date}
                </Typography>
                <Label
                  color={item.status === 'Paid' ? 'success' : 'warning'}
                  variant="soft"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    height: 22,
                    px: 1,
                    lineHeight: 1.2,
                  }}
                >
                  {item.status}
                </Label>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
