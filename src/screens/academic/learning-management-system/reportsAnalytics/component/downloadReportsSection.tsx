'use client';

import React from 'react';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Iconify } from 'src/components/iconify';
import { Description } from '@mui/icons-material';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Paper, Button, Typography } from '@mui/material';

const DownloadReportsSection = () => (
  <Grid size={{ xs: 12 }}>
    <Box sx={{ mt: 4, mb: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Download Reports Section
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
            label="Subject"
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <CustomSelect
            options={[]}
            label="Assignment Status"
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
        <Button variant="contained" color="primary" startIcon={<Description />}>
          Download as PDF
        </Button>
        <Button variant="contained" color="error" startIcon={<Iconify icon="mdi:file-excel" />}>
          Download as Excel
        </Button>
      </Box>
    </Paper>
  </Grid>
);

export default DownloadReportsSection;
