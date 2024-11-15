import React from 'react';

import { Box, Switch, TextField, FormControlLabel } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const CurrencyAndTaxSavingsComponent = () => (
  <>
    {/* <Typography component="span" variant="subtitle1">
      Currency and Tax Settings
    </Typography> */}
    <Box py="15px" display="flex" flexDirection="column" gap={3}>
      <CustomSelect
        label="Select Currency"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: 230 } }}
      />
      <TextField
        name="TaxRate"
        label="Tax Rate"
        // value={formik.values.description}
        // onChange={formik.handleChange}
        size="small"
        sx={{width : 230}}
      />
      <FormControlLabel
        label="Tax-inclusive pricing."
        control={<Switch name="taxinclusivepricing." checked onChange={() => {}} />}
      />
    </Box>
  </>
);

export default CurrencyAndTaxSavingsComponent;
