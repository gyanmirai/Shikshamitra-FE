'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import {
  Box,
  Card,
  Grid,
  Button,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const Settings = (props: TabComponentType) => (
  <Box>
    <Typography variant="h6" mt={2}>
      Notification Section
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6">Set Reminders</Typography>
          <FormControlLabel control={<Switch />} label="Set reminders for curriculum reviews" />
          <Box sx={{ pb: '20px', pt: '20px', width: '400px' }}>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="explaining when notifications will be triggered (e.g., 2 weeks before review date)"
              name="description"
              label="explaining when notifications will be triggered (e.g., 2 weeks before review date)"
              // value={formik.values.description}
              // onChange={formik.handleChange}
              size="small"
            />
          </Box>
          <FormControlLabel
            control={<Switch />}
            label="Notify teachers when curriculum is updated"
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 'auto',
              pt: 2,
            }}
          >
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6">Permission Connection</Typography>
          <Box sx={{ pl: '20px', pb: '20px', pt: 2 }}>
            <CustomSelect
              label="Edit Curriculum"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 250 } }}
            />
          </Box>
          <Box sx={{ pl: '20px', pb: '20px' }}>
            <CustomSelect
              label="Approved Curriculum Update"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 250 } }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 'auto',
              pt: 13,
            }}
          >
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  </Box>
);
export default Settings;
