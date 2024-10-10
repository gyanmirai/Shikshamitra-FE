import React from 'react';

import { Box, Switch, TextField, Typography, FormControlLabel } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const DefinedSchoolWideRulesComponent = () => (
  <>
    <Typography component="span" variant="h6">
      Define School-Wide Rules
    </Typography>
    <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
      <Box display="flex" flexDirection="column" gap={3}>
        <FormControlLabel
          label="Discount"
          control={<Switch name="discount" checked onChange={() => {}} />}
        />
        <TextField
          name="Specify discount percentage"
          label="Specify discount percentage"
          // value={formik.values.description}
          // onChange={formik.handleChange}
          size="small"
        />
        <CustomSelect
          label="Reminder frequency"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 150 } }}
        />
      </Box>
      <Box display="flex" flexDirection="column" gap={3}>
        <FormControlLabel
          label="Late-Fees"
          control={<Switch name="latefees" checked onChange={() => {}} />}
        />
        <TextField
          name="Specify late fee amount"
          label="Specify late fee amount"
          // value={formik.values.description}
          // onChange={formik.handleChange}
          size="small"
        />
        <CustomSelect
          label="Reminder frequency"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 150 } }}
        />
      </Box>
    </Box>
  </>
);

export default DefinedSchoolWideRulesComponent;
