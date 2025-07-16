import React from 'react';

import { Box, Card, Stack, Divider, useTheme, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

const PayrollStatusCard = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Title */}
      <Typography variant="h6" mb={3} fontWeight={600}>
        Current Payroll Status
      </Typography>

      {/* Payroll Stats */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="success.main">
            ₹ 12.45L
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Payroll Processed
          </Typography>
        </Box>

        <Box textAlign="right">
          <Typography variant="h4" fontWeight={700} color="info.main">
            148
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Employees Paid
          </Typography>
        </Box>
      </Stack>

      {/* Status Line */}
      <Divider />
      <Box display="flex" alignItems="center" justifyContent="center" py={2}>
        <Iconify icon="material-symbols:check-circle" color="green" width={24} />
        <Typography variant="body1" fontWeight={500} color="success.main" ml={1}>
          May 2025 - Processing Complete
        </Typography>
      </Box>
      <Divider />

      {/* Salary Slips */}
      <Box mt={3} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" fontWeight={700}>
            148 Generated
          </Typography>
          <Typography variant="body2" color="text.secondary">
            May 2025
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: 'success.light',
            borderRadius: 2,
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="fluent-emoji:receipt" width={28} />
        </Box>
      </Box>
    </Card>
  );
};

export default PayrollStatusCard;
