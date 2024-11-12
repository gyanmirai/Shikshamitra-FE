import React from 'react';

import { Box, Card, Checkbox, Typography, FormControlLabel } from '@mui/material';

const NotificationMethod = () => (
  <Card sx={{ p: 2, my: 2, boxShadow: 'var(--shadows-3)' }}>
    <Typography variant="h6" gutterBottom>
      Method
    </Typography>
    <Box>
      <FormControlLabel value="email" control={<Checkbox />} label="Email" />
      <FormControlLabel value="sms" control={<Checkbox />} label="SMS" />
      <FormControlLabel value="push" control={<Checkbox />} label="Push Notification" />
    </Box>
  </Card>
);

export default NotificationMethod;
