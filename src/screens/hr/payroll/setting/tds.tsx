import React from 'react';

import { Search } from '@mui/icons-material';
import { Box, Button, TextField, Typography, InputAdornment } from '@mui/material';

const TDS = () => (
  <>
    <Typography variant="h5">TDS Setup</Typography>
    <Box display="flex" gap={2} alignItems="center" mt={2}>
      <TextField
        size="small"
        label="Search Employee"
        sx={{ maxWidth: '250px', width: '100%' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <TextField size="small" label="TDS Percentage" />
      <TextField size="small" label="TDS Amount" />
      <Button variant="contained">Save</Button>
    </Box>
  </>
);

export default TDS;
