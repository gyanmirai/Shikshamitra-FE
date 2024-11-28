import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Switch, TextField, Typography, FormControlLabel } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

type PeriodSetting = {
  label: string;
  unit: string;
};

const StudentProgressAnalyticsSetting = (props: TabComponentType) => {
  const periodSettings: PeriodSetting[] = [
    { label: 'Letter Grades', unit: 'Letter Grades' },
    { label: 'Percentage-based', unit: 'Percentage-based' },
    { label: 'Percentage-based', unit: 'Percentage-based' },
  ];

  return (
    <Box>
      <Typography variant="h6">Grading Scale Configuration</Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '350px',
          py: '10px',
          flexDirection: 'row',
        }}
      >
        {periodSettings.map((setting, index) => (
          <Box sx={{ px: '10px' }}>
            <CustomSelect
              label={setting.unit}
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 170 } }}
            />
          </Box>
        ))}
      </Box>
      <Typography variant="h6">Customizable Ranges</Typography>
      <Box
        gap={2}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '350px',
          py: '10px',
          flexDirection: 'row',
        }}
      >
        <TextField fullWidth name="description" label="Grade Field" size="small" />

        <TextField fullWidth name="description" label="Range Field" size="small" />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Switch />
        <Typography>Enable Subject-Specific Grading Scales</Typography>
      </Box>
      <CustomSelect
        label="Notify Admin"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { minWidth: 150 } }}
      />

      <Box sx={{ pt: '7px' }} />

      <Typography variant="h6">Attendance Policies</Typography>
      <Box sx={{ pb: '7px' }} />

      <Box gap={3} sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '330px' }}>
        <TextField fullWidth name="description" label="Attendance types" size="small" />
        <TextField fullWidth name="description" label="additional notes or rules" size="small" />
      </Box>
      <TextField name="description" label="Alert threshold, for example" size="small" />
      <Box sx={{ py: '7px' }} />
      <Typography variant="h6">Attendance Reports</Typography>
      <Box sx={{ py: '7px' }} />
      <CustomSelect
        label="Attendance reports"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { minWidth: 180 } }}
      />

      <Box />
      <Box sx={{ py: '8px', display: 'flex', flexDirection: 'row' }} gap={3}>
        <FormControlLabel control={<Switch />} label="Sending reports to teachers" />
        <FormControlLabel control={<Switch />} label="Sending reports to parents" />
      </Box>

      <Typography variant="h6">Notifications</Typography>
      <Box sx={{ py: '7px' }} />
      <Typography variant="h6">Performance Alerts</Typography>
      <Box sx={{ py: '7px' }} />
      <FormControlLabel control={<Switch />} label="Set reminders for curriculum reviews" />
      <Box sx={{ py: '7px' }} />
      <TextField
        fullWidth
        name="description"
        label="Notification thresholds, like 3 absences"
        size="small"
      />
      <Box sx={{ py: '8px' }} />
      <TextField fullWidth name="description" label="Frequency settings" size="small" />
      <Box sx={{ py: '10px' }} />
    </Box>
  );
};

export default StudentProgressAnalyticsSetting;
