import React from 'react';
import { Box, Grid, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import { AppAreaInstalled } from '../hr/dashboard/app-area-installed';

const Reports = () => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6 }}>
      <AppAreaInstalled
        title="Comparison Graphs"
        selectSeries="class1"
        chart={{
          categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          series: [
            {
              name: 'class1',
              data: [
                { name: '9-A', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                { name: '9-B', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                { name: '9-C', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
              ],
            },
            {
              name: 'class2',
              data: [
                { name: '10-A', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                { name: '10-B', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                { name: '10-C', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
              ],
            },
            {
              name: 'Class3',
              data: [
                { name: '11-A', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                { name: '11-B', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                { name: '11-C', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
              ],
            },
          ],
        }}
      />
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <AnalyticsWebsiteVisits
        title="Performance Charts"
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          series: [
            { name: 'Class average', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
            { name: 'Individual student performance', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
            { name: 'Subject-wise performance', data: [59, 65, 47, 89, 40, 37, 50, 70, 24] },
          ],
        }}
        sx={{ boxShadow: 'var(--shadows-2)', height: '100%' }}
      />
    </Grid>

    <Grid size={{ xs: 12 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Detailed Data</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined">Export report</Button>
          <Button variant="outlined">Generate report</Button>
        </Box>
      </Box>
      <CustomizableTable
        tableId="detailed-data"
        columns={[
          { id: 'studentName', label: 'Student Name' },
          { id: 'assessmentName', label: 'Assessment Name' },
          { id: 'classAverage', label: 'Class Average' },
          { id: 'grade', label: 'Grade' },
        ]}
        data={[]}
      />
    </Grid>
  </Grid>
);

export default Reports;
