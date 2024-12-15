import React from 'react';

import { Box, Card, Checkbox, Typography, FormControlLabel } from '@mui/material';

const Notification = () => (
  <Card sx={{ p: 2, my: 2, boxShadow: 'var(--shadows-3)' }}>
    <Typography variant="h6" gutterBottom>
      Automated Notifications
    </Typography>

    <Box>
      <FormControlLabel control={<Checkbox />} label="Absent" />
      <FormControlLabel control={<Checkbox />} label="Late" />
      <FormControlLabel control={<Checkbox />} label="Half-day" />
    </Box>
  </Card>
);

export default Notification;
