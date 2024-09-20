import React from 'react';

import { Save } from '@mui/icons-material';
import { Box, Button, Checkbox, TextField, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const AddPayElement = () => (
  <Box>
    <Box display="flex" justifyContent="flex-end" alignItems="center">
      <Button startIcon={<Save />} variant="contained">
        Save
      </Button>
    </Box>
    <Box display="flex" gap={2} flexWrap="wrap">
      <TextField size="small" label="Code" />
      <TextField size="small" label="Name" />
      <CustomSelect
        options={[]}
        label="Pay Element Type"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
      />
    </Box>

    <Box display="flex" alignItems="center" mt={2}>
      <Checkbox size="small" />
      <Typography variant="body2">Employee Specific</Typography>
    </Box>
    <Box display="flex" alignItems="center" mt={2} gap={2}>
      <Box display="flex" alignItems="center">
        <Checkbox size="small" />
        <Typography variant="body2">Depend</Typography>
      </Box>
      <CustomSelect
        options={[]}
        label="Amount"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
      />
      <TextField size="small" label="Amount Of Percentage" />
    </Box>
    <Box display="flex" alignItems="center" mt={2}>
      <Checkbox size="small" />
      <Typography variant="body2">Pay Slip</Typography>
    </Box>
  </Box>
);

export default AddPayElement;
