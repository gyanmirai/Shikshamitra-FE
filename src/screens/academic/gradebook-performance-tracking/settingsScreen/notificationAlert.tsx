import React from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Button, Checkbox, TextField, Typography } from '@mui/material';

const NotificationAlert = () => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12 }}>
      <Typography variant="h6" my={1}>
        Notifications & Alerts
      </Typography>
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ p: 2, height: '100%' }}>
        <Typography variant="subtitle1">Missing Grades Alert</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
          <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
          <Typography>Missing grades</Typography>
        </Box>
        <CustomSelect
          formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
          options={[
            { value: 'homework', label: 'Homework' },
            { value: 'quiz', label: 'Quiz' },
            { value: 'exam', label: 'Exam' },
            { value: 'project', label: 'Project' },
          ]}
          value="homework"
          onChange={() => {}}
          label="Frequency"
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined">Reset</Button>
          <Button variant="contained">Save</Button>
        </Box>
      </Card>
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ p: 2, height: '100%' }}>
        <Typography variant="subtitle1">Overdue Assessments Alert</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
          <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
          <Typography>Overdue assessments</Typography>
        </Box>
        <CustomSelect
          formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
          options={[
            { value: 'homework', label: 'Homework' },
            { value: 'quiz', label: 'Quiz' },
            { value: 'exam', label: 'Exam' },
            { value: 'project', label: 'Project' },
          ]}
          value="homework"
          onChange={() => {}}
          label="Time-based alerts"
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined">Reset</Button>
          <Button variant="contained">Save</Button>
        </Box>
      </Card>
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ p: 2, height: '100%' }}>
        <Typography variant="subtitle1">Performance Alerts</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
          <Typography>Low-performance alerts</Typography>
        </Box>
        <TextField
          label="alert if students drop below 60%"
          size="small"
          sx={{ maxWidth: '250px', width: '100%', my: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 4 }}>
          <Button variant="outlined">Reset</Button>
          <Button variant="contained">Save</Button>
        </Box>
      </Card>
    </Grid>
  </Grid>
);

export default NotificationAlert;
