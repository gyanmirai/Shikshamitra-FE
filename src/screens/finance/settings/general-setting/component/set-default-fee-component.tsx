import React from 'react';

import { Box, Button, TextField, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const SetDefaultFeeComponent = () => (
  <>
    <Typography component="span" variant="h6">
      Set Default Fee Components
    </Typography>
    <Box pt="15px" display="flex" flexDirection="column" gap={3}>
      <TextField
        name="Add new fee component"
        label="Add new fee component"
        // value={formik.values.description}
        // onChange={formik.handleChange}
        size="small"
      />
      <CustomSelect
        label="Predefined components"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { minWidth: 150 } }}
      />
    </Box>
    <Box py="15px" display="flex" justifyContent="flex-end">
      <Button variant="contained" size="small">
        Add
      </Button>
    </Box>
  </>
);

export default SetDefaultFeeComponent;
