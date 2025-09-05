import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Button, Typography, CardActions, CardContent } from '@mui/material';

const Reports = (props: TabComponentType) => (
  <Box sx={{ p: 4, minHeight: '100vh' }}>
    {/* Report Creation Section */}
    <Grid container spacing={4} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h5" gutterBottom>
          Report Creation Process
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <CustomSelect
            options={[]}
            label="Select Report Type"
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
          />
          <CustomSelect
            options={[]}
            label="Filter"
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
          />
        </Box>

        <Box display="flex" gap={2}>
          <Button variant="contained" sx={{ backgroundColor: '#3488e3' }}>
            Preview
          </Button>
          <Button variant="contained" sx={{ backgroundColor: '#f85a40' }}>
            Generate Report
          </Button>
        </Box>
      </Grid>
    </Grid>

    {/* Pre-built Templates Section */}
    <Grid container spacing={4}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h5" gutterBottom>
          Pre-built Templates
        </Typography>
      </Grid>

      {/* Template Cards */}
      {[
        { title: 'Progress Review Template' },
        { title: 'End-of-Term Summary' },
        { title: 'Gradebook Audit Template' },
      ].map((template, index) => (
        <Grid key={index} size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6">{template.title}</Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" sx={{ mr: 1 }}>
                Use Template
              </Button>
              <Button variant="outlined" color="error">
                Customize
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default Reports;
