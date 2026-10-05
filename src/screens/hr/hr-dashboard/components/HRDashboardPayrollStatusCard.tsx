import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Divider, Typography } from '@mui/material';

const PayrollStatusCard = () => (
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
          Staff Paid
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

      <Iconify icon="fa-solid:scroll" width={28} sx={{ color: 'primary.main' }} />
    </Box>
  </Card>
);

export default PayrollStatusCard;
