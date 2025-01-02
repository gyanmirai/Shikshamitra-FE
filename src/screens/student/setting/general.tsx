import React from 'react';

import { Box, Card, Checkbox, Typography, FormControlLabel } from '@mui/material';

const General = () => (
  <Box>
    <Card sx={{ p: 2, my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Field Configuration Section:
      </Typography>

      <Box>
        <FormControlLabel control={<Checkbox />} label="Student name" />
        <FormControlLabel control={<Checkbox />} label="Roll No." />
        <FormControlLabel control={<Checkbox />} label="Admission Date" />
      </Box>
    </Card>
  </Box>
);

export default General;
