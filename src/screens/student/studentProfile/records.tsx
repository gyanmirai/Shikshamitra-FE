'use client';

import React from 'react';

import { Box, Card, List, ListItem, Typography, CardHeader, CardContent } from '@mui/material';

import type { StudentTabsComponentType } from '.';

const TABS = [
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'health', label: 'Health' },
];

// const Records = (props: StudentTabsComponentType) => {
//   const tabs = useTabs('behavioral');
//   const renderTabs = (
//     <CustomTabs
//       value={tabs.value}
//       onChange={tabs.onChange}
//       variant="fullWidth"
//       slotProps={{ tab: { px: 0 } }}
//     >
//       {TABS.map((tab) => (
//         <Tab key={tab.value} value={tab.value} label={tab.label} />
//       ))}
//     </CustomTabs>
//   );
//   return (
//     <Box>
//       {renderTabs}

//       <Scrollbar sx={{ minHeight: 384 }}>
//         <Box sx={{ p: 3, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
//           {tabs.value === 'behavioral' && <RenderBehavioralRecord />}
//           {tabs.value === 'health' && <RenderHealthRecord />}
//         </Box>
//       </Scrollbar>
//     </Box>
//   );
// };
const Records = (props: StudentTabsComponentType) => {
  console.log('records component render------------');

  return (
    <>
      <Typography variant="h6">Records</Typography>

      {/* <Box display="flex" gap={2}>
        <StudentEnrollmentCard
          icon="wpf:inspection"
          title="Merits and Achievements"
          count={2}
          color="success.main"
          bgColor="success"
          labels={[
            { name: 'Honor Roll (2022-2023)', color: 'success' },
            { name: 'Volunteer of the Month (May 2023)', color: 'warning' },
          ]}
          index={0}
        />
        <StudentEnrollmentCard
          icon="fluent-mdl2:account-activity"
          title="Extracurricular Activities"
          count={3}
          color="warning.main"
          bgColor="warning"
          labels={[
            { name: 'Honor Roll (2022-2023)', color: 'success' },
            { name: 'Volunteer of the Month (May 2023)', color: 'warning' },
          ]}
          index={0}
        />
      </Box>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Disciplinary Incidents</Typography>

          <DataTable
            data={[{ date: '2023-03-15', incident: 'Disrupting Class', actionTaken: 'Warning' }]}
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'incident', label: 'Incident' },
              { key: 'actionTaken', label: 'Action Taken' },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Counseling Sessions</Typography>
          <DataTable
            data={[{ date: '2023-03-15', reason: 'Academic Support' }]}
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'reason', label: 'Reason' },
            ]}
          />
        </Grid>
      </Grid> */}
    </>
  );
};
export default Records;

const RenderHealthRecord = () => (
  <Box display="flex" gap={1}>
    <Card elevation={3} sx={{ flexGrow: 1 }}>
      <CardHeader
        title="Medical History"
        sx={{
          '& .MuiCardHeader-title': {
            fontWeight: 'bold',
            fontSize: '14px !important',
          },
        }}
      />
      <CardContent sx={{ p: 1 }}>
        <List>
          <ListItem>- Asthma</ListItem>
          <ListItem>- Allergies to Peanuts</ListItem>
        </List>
      </CardContent>
    </Card>
    <Card elevation={3} sx={{ flexGrow: 1 }}>
      <CardHeader
        title="Vaccination Records"
        sx={{
          '& .MuiCardHeader-title': {
            fontWeight: 'bold',
            fontSize: '14px !important',
          },
        }}
      />
      <CardContent sx={{ p: 1 }}>
        <List>
          <ListItem>- MMR (2021)</ListItem>
          <ListItem>- Tetanus (2022)</ListItem>
        </List>
      </CardContent>
    </Card>
    <Card elevation={3} sx={{ flexGrow: 1 }}>
      <CardHeader
        title="Recent Health Check-up"
        sx={{
          '& .MuiCardHeader-title': {
            fontWeight: 'bold',
            fontSize: '14px !important',
          },
        }}
      />
      <CardContent sx={{ p: 1 }}>
        <List>
          <ListItem>- Height: 165 cm</ListItem>
          <ListItem>- Height: 165 cm</ListItem>
          <ListItem>- Blood Pressure: 120/80 mmHg</ListItem>
        </List>
      </CardContent>
    </Card>
  </Box>
);
