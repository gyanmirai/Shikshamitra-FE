import React from 'react';

import { Box, Card, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';

const Reports = () => (
  <Box>
    <Typography variant="h4">Download Reports</Typography>
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', my: 1 }}>
      <Button startIcon={<Iconify icon="mdi:file-pdf-box" />} color="error" variant="contained">
        Download PDF
      </Button>
      <Button startIcon={<Iconify icon="mdi:file-excel" />} color="success" variant="contained">
        Download Excel
      </Button>
    </Box>

    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', my: 1 }}>
      <CustomSelect
        label="Grade"
        name="grade"
        options={[]}
        formControlProps={{ sx: { width: '200px' } }}
        value=""
        onChange={(value) => {}}
      />
      <CustomSelect
        label="Subject"
        name="subject"
        options={[]}
        formControlProps={{ sx: { width: '200px' } }}
        value=""
        onChange={(value) => {}}
      />
      <CustomSelect
        label="Period"
        name="period"
        options={[]}
        formControlProps={{ sx: { width: '200px' } }}
        value=""
        onChange={(value) => {}}
      />
    </Box>
    <Card sx={{ p: 3, height: '100%' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography component="span" variant="h6" gutterBottom>
          Curriculum Reports
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Box component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
          <Box component="li">curriculum progress - 75% curriculum completed</Box>
          <Box component="li">topic completion - 20 out of 25 topics completed</Box>
          <Box component="li">teacher assignments - All subjects assigned to teachers</Box>
        </Box>
      </Box>
    </Card>
  </Box>
);

export default Reports;
