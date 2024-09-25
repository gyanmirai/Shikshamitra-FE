import React from 'react';

import { Box, Card, IconButton, CardHeader, Typography, CardContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const Setting = () => (
  <Box>
    <Typography variant="h4" my={2}>
      Grading Scales
    </Typography>
    <Box display="flex" gap={2}>
      <CustomSelect
        options={[]}
        label="Percentage"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
      />
      <CustomSelect
        options={[]}
        label="GPA"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
      />
      <CustomSelect
        options={[]}
        label="Letter Grade"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
      />
    </Box>
    <CustomizableTable
      columns={[
        { id: 'gradeName', label: 'Grade Name' },
        { id: 'minimumPercentage', label: 'Minimum Percentage' },
        { id: 'maximumPercentage', label: 'Maximum Percentage' },
        { id: 'wightage', label: 'Weightage' },
      ]}
      data={[]}
    />
    <Typography variant="h4" my={2}>
      Feedback Templates Section
    </Typography>
    <Box display="flex" gap={2} flexWrap="wrap">
      <Card sx={{ maxWidth: '300px', width: '100%' }}>
        <CardHeader title="Excellent Performance" />
        <CardContent>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <IconButton>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
            <IconButton sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ maxWidth: '300px', width: '100%' }}>
        <CardHeader title="Needs Improvement" />
        <CardContent>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <IconButton>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
            <IconButton sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  </Box>
);

export default Setting;
