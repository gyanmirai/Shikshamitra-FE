import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const ExamninationDashboardReportComponent = (props: TabComponentType) => (
  <Box>
    <Typography component="span" variant="h6" gutterBottom paddingTop="10px">
      Reports Section
    </Typography>
    <Box display="flex" flexDirection="row" gap={3} sx={{ pb: '20px', pt: '20px' }}>
      <CustomSelect
        label="Class"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { minWidth: 120 } }}
      />
      <CustomSelect
        label="Subject"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { minWidth: 120 } }}
      />
      <DatePicker
        label="To Date"
        format="DD-MM-YYYY"
        slotProps={{ textField: { size: 'small' } }}
      />
      <DatePicker
        label="End Date"
        format="DD-MM-YYYY"
        slotProps={{ textField: { size: 'small' } }}
      />
    </Box>

    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <AnalyticsCurrentVisits
          title="Pass/Fail Rates"
          chart={{
            series: [
              { label: 'Pass', value: 80 },
              { label: 'Fail', value: 5 },
            ],
          }}
          sx={{ boxShadow: '' }}
        />
      </Grid>
    </Grid>
  </Box>
);

export default ExamninationDashboardReportComponent;
