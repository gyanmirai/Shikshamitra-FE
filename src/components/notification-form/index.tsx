import React, { useState } from 'react';
import {
  Box,
  Grid,
  Radio,
  TextField,
  FormLabel,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import CustomSelect from '../custom-select';

const NotificationForm = () => {
  const [notificationType, setNotificationType] = useState('daily');
  const [time, setTime] = useState('');
  const [date, setDate] = useState<any>(null);
  const [dayOfWeek, setDayOfWeek] = useState<any>('');
  const [dayOfMonth, setDayOfMonth] = useState<any>('');

  const weekdays = [
    { value: 'Sunday', label: 'Sunday' },
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
  ];

  const handleRadioChange = (event: any) => {
    setNotificationType(event.target.value);
  };

  const handleSubmit = () => {
    alert(
      `Notification type: ${notificationType}, Time: ${time}, Date: ${
        date ? date.toLocaleDateString() : 'N/A'
      }, Day: ${dayOfWeek}`
    );
  };

  return (
    <Box pl="5px">
      <FormControl component="fieldset">
        <FormLabel component="legend">Notification Frequency</FormLabel>
        <RadioGroup row value={notificationType} onChange={handleRadioChange}>
          <FormControlLabel value="daily" control={<Radio />} label="Daily" />
          <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
          <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
        </RadioGroup>
      </FormControl>

      {notificationType === 'daily' && (
        <Grid container spacing={2} pt="20px">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              size="small"
              label="Select Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      )}

      {notificationType === 'weekly' && (
        <Grid container spacing={2} pt="20px">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              label="Day of the Week"
              options={weekdays}
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              size="small"
              label="Select Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      )}

      {notificationType === 'monthly' && (
        <Grid container spacing={2} pt="20px">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              size="small"
              label="Day of the Month"
              type="number"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              size="small"
              label="Select Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default NotificationForm;
