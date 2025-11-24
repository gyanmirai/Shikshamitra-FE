'use client';

import React from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Switch, Typography, FormControlLabel } from '@mui/material';

const FinanceSettingFeeCollectionTab = () => (
  <>
    <Typography variant="h6">Payment Mode Section</Typography>

    <Typography variant="h6" sx={{ ml: 2, py: '15px' }}>
      Accepted Payment Method
    </Typography>

    <Box display="flex" flexDirection="row" gap={2} ml={2}>
      <FormControlLabel
        label="Credit Card"
        control={<Switch name="creditcard" checked onChange={() => {}} />}
      />{' '}
      <FormControlLabel
        label="Bank Transfer"
        control={<Switch name="banktransfer" checked onChange={() => {}} />}
      />{' '}
      <FormControlLabel
        label="PayPal"
        control={<Switch name="paypal" checked onChange={() => {}} />}
      />
    </Box>

    <Typography variant="h6" sx={{ ml: 2, py: '15px' }}>
      Online Payment Gateways
    </Typography>
    <CustomSelect
      label="select payment gateway"
      options={[]}
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { minWidth: 150, ml: 2 } }}
    />
  </>
);

export default FinanceSettingFeeCollectionTab;
