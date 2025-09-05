import React from 'react';
import { Card, Switch, FormGroup, FormControlLabel } from '@mui/material';

const Notification = () => (
  <Card sx={{ p: 2 }}>
    <FormGroup>
      <FormControlLabel control={<Switch defaultChecked />} label="Enable email notifications" />
      <FormControlLabel control={<Switch />} label="Enable SMS notifications" />
      <FormControlLabel control={<Switch />} label="Daily Summary Reports" />
    </FormGroup>
  </Card>
);

export default Notification;
