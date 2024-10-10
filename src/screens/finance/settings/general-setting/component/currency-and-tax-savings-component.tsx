import React from 'react';

import { Box, Switch, TextField, Typography, FormControlLabel } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const CurrencyAndTaxSavingsComponent = () => (
  <>
    <Typography component="span" variant="h6">
      Currency and Tax Settings
    </Typography>
    <Box py="15px" display="flex" flexDirection="column" gap={3}>
      <CustomSelect
        label="Select Currency"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { minWidth: 150 } }}
      />
      <TextField
        name="Tex Rate"
        label="Add new fee component"
        // value={formik.values.description}
        // onChange={formik.handleChange}
        size="small"
      />
      <FormControlLabel
        label="Tax-inclusive pricing."
        control={<Switch name="taxinclusivepricing." checked onChange={() => {}} />}
      />
    </Box>
  </>
);

export default CurrencyAndTaxSavingsComponent;
