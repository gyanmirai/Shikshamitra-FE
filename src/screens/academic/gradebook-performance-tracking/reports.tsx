import React from 'react';

import { Box, Card, Grid, Button, Typography, CardActions, CardContent } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const Reports = () => (
  <Box sx={{ padding: 4, minHeight: '100vh' }}>
    {/* Report Creation Section */}
    <Grid container spacing={4} sx={{ marginBottom: 4 }}>
      <Grid item xs={12} md={6}>
        <Typography variant="h5" gutterBottom>
          Report Creation Process
        </Typography>
        <Box display="flex" gap={2} mb={2}>
          <CustomSelect
            options={[]}
            label="Select Report Type"
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
          />

          <CustomSelect
            options={[]}
            label="Filter"
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" sx={{ backgroundColor: '#3488e3' }}>
            Preview
          </Button>
          <Button variant="contained" color="secondary" sx={{ backgroundColor: '#f85a40' }}>
            Generate Report
          </Button>
        </Box>
      </Grid>
    </Grid>

    {/* Pre-built Templates Section */}
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Pre-built Templates
        </Typography>
      </Grid>

      {/* Template 1 */}
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6">Progress Review Template</Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" sx={{ marginRight: 1 }}>
              Use Template
            </Button>
            <Button variant="outlined" color="error">
              Customize
            </Button>
          </CardActions>
        </Card>
      </Grid>

      {/* Template 2 */}
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6">End-of-Term Summary</Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" sx={{ marginRight: 1 }}>
              Use Template
            </Button>
            <Button variant="outlined" color="error">
              Customize
            </Button>
          </CardActions>
        </Card>
      </Grid>

      {/* Template 3 */}
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6">Gradebook Audit Template</Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" sx={{ marginRight: 1 }}>
              Use Template
            </Button>
            <Button variant="outlined" color="error">
              Customize
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default Reports;
