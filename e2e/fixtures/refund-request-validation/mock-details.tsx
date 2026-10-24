import React from 'react';
import { Stack, Typography } from '@mui/material';
import FeeHeadRefundTable from 'src/screens/finance/feeRefund/NewRefundForm/FeeHeadRefundTable';

export default function Details({ formik }: any) {
  return (
    <Stack spacing={2}>
      <Typography variant="body2">Refund method: Cash · Received by: Synthetic Parent</Typography>
      <FeeHeadRefundTable compact formik={formik} />
    </Stack>
  );
}
