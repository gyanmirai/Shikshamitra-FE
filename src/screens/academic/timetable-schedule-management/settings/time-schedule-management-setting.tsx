import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Card, Button, Switch, TextField, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

type PeriodSetting = {
  label: string;
  unit: string;
};

type AssignedTeacher = {
  subject: string;
  optionLabel: string;
  optionList: string[];
};

const TimeScheduleManagementSetting = () => {
  const periodSettings: PeriodSetting[] = [
    { label: 'Class Duration (e.g., 45 minutes)', unit: 'Select Unit' },
    { label: 'Break Duration (e.g., 10 minutes)', unit: 'Select Unit' },
    { label: 'School Hours (e.g., 9 AM - 3 PM)', unit: 'Select Unit' },
  ];

  const assigningTeachers: AssignedTeacher[] = [
    { subject: 'Maths', optionLabel: 'List of teachers', optionList: ['Morris', 'Trump', 'Modi'] },
    {
      subject: 'Science',
      optionLabel: 'List of teachers',
      optionList: ['Morris', 'Trump', 'Modi'],
    },
  ];

  return (
    <Box>
      <Card sx={{ p: 2, mb: 1 }}>
        <Typography variant="h6">General Settings</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Switch />
          <Typography>Enable Notification for Timetable Changes</Typography>
          <Switch />
          <Typography>Auto-scheduling of classes</Typography>
        </Box>
      </Card>
      <Card sx={{ p: 2, mb: 1 }}>
        <Typography variant="h6">Period Settings</Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 1 }}>
          {periodSettings.map((setting, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '200px',
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                name="description"
                label={setting.label}
                size="small"
                sx={{ mb: 1 }}
              />
              <CustomSelect
                label={setting.unit}
                options={[
                  { value: 'hours', label: 'Hours' },
                  { value: 'minute', label: 'Minute' },
                ]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { width: '100%' } }}
              />
            </Box>
          ))}
        </Box>
      </Card>
      <Card sx={{ p: 2, mb: 1 }}>
        <Typography variant="h6">Conflict Resolution Settings</Typography>
        <Box display="flex" sx={{ gap: 2, py: '20px' }}>
          <CustomSelect
            label="How Should TimeTable Conflicts Be Handled ?"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 320 } }}
          />
          <CustomSelect
            label="Notify Admin"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 320 } }}
          />
        </Box>
      </Card>
      <Card sx={{ p: 2, mb: 1 }}>
        <Typography variant="h6">Teacher and Subject Assignments</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '350px', py: '10px' }}>
          {assigningTeachers.map((teacher, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                mb: 2,
                gap: 2,
                pl: 1,
              }}
            >
              <TextField
                fullWidth
                name="description"
                label={teacher.subject}
                size="small"
                sx={{ flex: '1 1 auto', minWidth: '200px' }}
              />
              <Box sx={{ width: '16px' }} />
              <CustomSelect
                label={teacher.optionLabel}
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 150 } }}
              />
            </Box>
          ))}
        </Box>
      </Card>
      <Card sx={{ p: 2, mb: 1 }}>
        <Typography variant="h6">Teacher Availability</Typography>
        <Box display="flex" sx={{ gap: 2 }}>
          <CustomSelect
            label="Available Teacher"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 200 } }}
          />

          <DatePicker
            label="Date"
            format="DD-MM-YYYY"
            slotProps={{ textField: { size: 'small' } }}
          />

          <CustomSelect
            label="Subject"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 120 } }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          <Button variant="contained">Save Changes</Button>
        </Box>
      </Card>
    </Box>
  );
};

export default TimeScheduleManagementSetting;
