import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Card, Grid, Switch, Button, Checkbox, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const Settings = (props: TabComponentType) => (
  <Box sx={{ flexGrow: 1, p: 3 }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" marginBottom={1}>
            Notification Setting
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
            <Switch
              checked={false}
              onChange={() => {}}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <Typography sx={{ mr: 2 }}>Course Updates</Typography>
          </Box>
          <CustomSelect
            options={[]}
            value=""
            onChange={(val) => {}}
            defaultChecked
            label="Notification Frequency"
            formControlProps={{ sx: { minWidth: 300, ml: 1 } }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1, marginTop: 2 }}>
            <Switch
              checked={false}
              onChange={() => {}}
              defaultChecked
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <Typography sx={{ mr: 2 }}>New Assignments</Typography>
          </Box>
          <CustomSelect
            options={[]}
            value=""
            onChange={(val) => {}}
            label="Notification Frequency"
            formControlProps={{ sx: { minWidth: 300, ml: 1 } }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1, marginTop: 2 }}>
            <Switch
              checked={false}
              onChange={() => {}}
              defaultChecked
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <Typography sx={{ mr: 2 }}>Student Progress</Typography>
          </Box>
          <CustomSelect
            options={[]}
            value=""
            onChange={(val) => {}}
            label="Notification Frequency"
            formControlProps={{ sx: { minWidth: 300, ml: 1 } }}
          />
          <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1}>
            {' '}
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" marginBottom={1}>
            Course Creation Workflow
          </Typography>
          <Box display="flex" alignItems="center">
            <Checkbox size="small" checked />
            <Typography variant="body2">Step 1 : Course Title</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Checkbox size="small" />
            <Typography variant="body2">Step 2 : Course Description</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Checkbox size="small" />
            <Typography variant="body2">Step 3 : Upload File</Typography>
          </Box>
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            {' '}
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default Settings;
