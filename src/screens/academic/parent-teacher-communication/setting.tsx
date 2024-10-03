import React from 'react';

import {
  Box,
  Switch,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  FormControlLabel,
} from '@mui/material';

const Settings = () => {
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [meetingTool, setMeetingTool] = React.useState('');
  const [meetingDuration, setMeetingDuration] = React.useState('');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Notification Settings
      </Typography>

      <FormControlLabel control={<Switch />} label="Email Notifications" />
      <FormControlLabel control={<Switch />} label="SMS Notifications" />
      <FormControlLabel control={<Switch />} label="Push Notifications" />
      <FormControlLabel control={<Switch />} label="Meeting Reminders" />

      <Typography variant="h6" gutterBottom>
        Email/SMS Settings
      </Typography>
      <TextField
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
        margin="normal"
      />

      <Typography variant="h6" gutterBottom>
        Meeting Defaults
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Default Virtual Meeting Tool</InputLabel>
        <Select value={meetingTool} onChange={(e) => setMeetingTool(e.target.value)}>
          <MenuItem value="Zoom">Zoom</MenuItem>
          <MenuItem value="Teams">Teams</MenuItem>
          <MenuItem value="Google Meet">Google Meet</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Default Meeting Duration</InputLabel>
        <Select value={meetingDuration} onChange={(e) => setMeetingDuration(e.target.value)}>
          <MenuItem value="Zoom">30 min</MenuItem>
          <MenuItem value="Teams">1 hour</MenuItem>
          <MenuItem value="Google Meet">1.5 hour</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default Settings;
