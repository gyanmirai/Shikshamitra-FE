import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Button,
  Switch,
  Divider,
  Checkbox,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const Setting = (props: TabComponentType) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h6" my={1}>
        Grading Scales
      </Typography>
      <CustomSelect
        formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
        options={[
          { value: 'standard', label: 'Standard' },
          { value: 'advanced', label: 'Advanced' },
          { value: 'custom', label: 'Custom' },
        ]}
        value="standard"
        onChange={() => {}}
        label="Grading System Selection"
      />
      <Typography variant="h6" my={1}>
        Editable Grading Scale Table
      </Typography>
      <CustomizableTable
        columns={[
          { id: 'grade', label: 'Grade' },
          {
            id: 'range',
            label: 'Range',
          },
        ]}
        data={[
          { id: 1, grade: 'A', range: '90-100' },
          { id: 2, grade: 'B', range: '80-89' },
          { id: 3, grade: 'C', range: '70-79' },
          { id: 4, grade: 'D', range: '60-69' },
          { id: 5, grade: 'F', range: '0-59' },
        ]}
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <Typography variant="h6">Weighting Adjustments</Typography>
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
        label="Assignment Types"
      />
      &nbsp;
      <CustomSelect
        formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
        options={[
          { value: 'homework', label: 'Homework' },
          { value: 'quiz', label: 'Quiz' },
          { value: 'exam', label: 'Exam' },
          { value: 'project', label: 'Project' },
        ]}
        value=""
        onChange={() => {}}
        label="Weighting Inputs"
      />
      <Typography variant="h6" my={1}>
        Progress Visualization
      </Typography>
      <Box sx={{ width: '100%', my: 2 }}>
        <LinearProgress variant="determinate" value={75} /> 75%
      </Box>
      <Button variant="contained">Add new categories</Button>
    </Grid>
    <Grid item xs={12} md={6}>
      <Typography variant="h6">Grade Submission Settings</Typography>
      <DatePicker
        sx={{ maxWidth: '250px', width: '100%', my: 1 }}
        label="Select Date"
        slotProps={{ textField: { size: 'small' } }}
      />
      &nbsp;
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
        label="Assignment Types"
      />
      &nbsp;
      <CustomSelect
        formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
        options={[
          { value: 'homework', label: 'Homework' },
          { value: 'quiz', label: 'Quiz' },
          { value: 'exam', label: 'Exam' },
          { value: 'project', label: 'Project' },
        ]}
        value="standard"
        onChange={() => {}}
        label="Who is allowed to submit or edit grades"
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Switch checked={false} onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
        <Typography sx={{ mr: 2 }}>Reminders about upcoming grade submission deadlines</Typography>
      </Box>
    </Grid>
    <Grid item xs={12}>
      <Typography variant="h6" my={1}>
        Notifications & Alerts
      </Typography>
      <Divider sx={{ my: 1 }} />
    </Grid>
    <Grid item xs={12} md={6}>
      <Typography variant="h6">Missing Grades Alert</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
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
    </Grid>
    <Grid item xs={12} md={6}>
      <Typography variant="h6">Overdue Assessments Alert</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
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
    </Grid>
    <Grid item xs={12} md={6}>
      <Typography variant="h6">Performance Alerts</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
        <Typography>Low-performance alerts</Typography>
      </Box>
      <TextField
        label="alert if students drop below 60%"
        size="small"
        sx={{ maxWidth: '250px', width: '100%', my: 1 }}
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <Typography variant="h6">Performance Alerts</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
          <Typography>Email notification</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
          <Typography>SMS notification</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
          <Typography>Dashboard notification</Typography>
        </Box>
      </Box>
    </Grid>
  </Grid>
);

export default Setting;
