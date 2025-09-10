import React from 'react';
import { Box, Card, Grid, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const EarlyRequestBehaviour = () => {
  const data = [
    { id: 1, name: 'Riya Shah', role: 'Student', request: 14 },
    { id: 2, name: 'Ravi Kumar', role: 'Teacher', request: 10 },
    { id: 3, name: 'Meera Iyer', role: 'Staff', request: 8 },
    { id: 4, name: 'Aman Verma', role: 'Student', request: 13 },
    { id: 5, name: 'Sana Sheikh', role: 'Student', request: 11 },
    { id: 6, name: 'Pooja Rathi', role: 'Teacher', request: 9 },
    { id: 7, name: 'Rohit Sinha', role: 'Staff', request: 7 },
    { id: 8, name: 'Neha Dubey', role: 'Student', request: 12 },
    { id: 9, name: 'Deepak Rao', role: 'Teacher', request: 6 },
    { id: 10, name: 'Anjali Mehta', role: 'Staff', request: 5 },
  ];

  return (
    <Box>
      <Grid container spacing={2} sx={{ pt: '20px' }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography sx={{ pt: '13px' }} variant="h6" fontWeight={600} mb="24px">
            Early Request Behaviour
          </Typography>
          <CustomizableTable
            tableId="early-request-behaviour-table"
            columns={[
              {
                id: 'name',
                label: 'Name',
              },
              { id: 'role', label: 'Role' },
              {
                id: 'request',
                label: 'Request in Current Year',
                minWidth: 250,
                filterType: 'number',
                align: 'right',
              },
            ]}
            data={data}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <AnalyticsCurrentVisits
              title="Gate Pass Request Reasons"
              chart={{
                series: [
                  { label: 'Medical', value: 60 },
                  { label: 'Family Emergency', value: 35 },
                  { label: 'Personal', value: 25 },
                  { label: 'Events', value: 15 },
                ],
              }}
              sx={{ boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EarlyRequestBehaviour;
