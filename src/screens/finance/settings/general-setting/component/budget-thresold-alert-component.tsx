import React from 'react';

import { Box, Switch, TextField, Typography, FormControlLabel } from '@mui/material';

const BudgetThresoldAlertComponent = () => (
  <>
    <Box py="15px">
      <Typography component="span" variant="h6">
        Budget Threshold Alerts
      </Typography>
    </Box>

    <Box pb="10px ">
      <TextField
        name="Threshold percentage"
        label="Threshold percentage"
        // value={formik.values.description}
        // onChange={formik.handleChange}
        size="small"
      />
    </Box>
    <FormControlLabel
      label="Notifications"
      control={<Switch name="dense" checked onChange={() => {}} />}
    />
  </>
);

export default BudgetThresoldAlertComponent;
