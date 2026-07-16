'use client';

import React from 'react';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Description } from '@mui/icons-material';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Paper, Button, Typography } from '@mui/material';

const IndividualReport = () => (
  <Grid size={{ xs: 12 }}>
    <Box sx={{ mt: 1, mb: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Generate Individual Reports
      </Typography>
    </Box>

    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid size={{ xs: 12, sm: 3 }}>
          <CustomSelect
            options={[]}
            label="Class"
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <CustomSelect
            options={[]}
            label="Student"
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <CustomSelect
            options={[]}
            label="Report Type"
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <DatePicker label="Start Date" slotProps={{ textField: { size: 'small' } }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <DatePicker label="End Date" slotProps={{ textField: { size: 'small' } }} />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" color="primary" startIcon={<Description />}>
          Generate Reports
        </Button>
      </Box>
    </Paper>
  </Grid>
);

export default IndividualReport;
