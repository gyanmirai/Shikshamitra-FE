'use client';

import React from 'react';

import { Tab, Box, Card, List, ListItem, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import DataTable from 'src/components/commonTable';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';

const TABS = [
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'health', label: 'Health' },
];

const Records = () => {
  const tabs = useTabs('behavioral');
  const renderTabs = (
    <CustomTabs
      value={tabs.value}
      onChange={tabs.onChange}
      variant="fullWidth"
      slotProps={{ tab: { px: 0 } }}
    >
      {TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );
  return (
    <Card sx={{ '& *': { fontSize: '12px !important' } }}>
      {renderTabs}

      <Scrollbar sx={{ minHeight: 384 }}>
        <Box sx={{ p: 3, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
          {tabs.value === 'behavioral' && <RenderBehavioralRecord />}
          {tabs.value === 'health' && <RenderHealthRecord />}
        </Box>
      </Scrollbar>
    </Card>
  );
};

export default Records;

const RenderBehavioralRecord = () => (
  <>
    <Typography variant="h6">Disciplinary Incidents:</Typography>

    <DataTable
      data={[{ date: '2023-03-15', incident: 'Disrupting Class', actionTaken: 'Warning' }]}
      columns={[
        { key: 'date', label: 'Date' },
        { key: 'incident', label: 'Incident' },
        { key: 'actionTaken', label: 'Action Taken' },
      ]}
    />
    <Typography variant="h6">Merits and Achievements:</Typography>
    <List>
      <ListItem>Honor Roll (2022-2023)</ListItem>
      <ListItem>Volunteer of the Month (May 2023)</ListItem>
    </List>
    <Typography variant="h6">Counseling Sessions:</Typography>
    <DataTable
      data={[{ date: '2023-03-15', reason: 'Academic Support' }]}
      columns={[
        { key: 'date', label: 'Date' },
        { key: 'reason', label: 'Reason' },
      ]}
    />
    <Typography variant="h6">Extracurricular Activities:</Typography>
    <List>
      <ListItem>Soccer Team</ListItem>
      <ListItem>Art Club</ListItem>
    </List>
  </>
);

const RenderHealthRecord = () => (
  <>
    <Typography variant="h6">Medical History:</Typography>
    <List>
      <ListItem>Asthma</ListItem>
      <ListItem>Allergies to Peanuts</ListItem>
    </List>
    <Typography variant="h6">Vaccination Records:</Typography>
    <List>
      <ListItem>MMR (2021)</ListItem>
      <ListItem>Tetanus (2022)</ListItem>
    </List>
    <Typography variant="h6">Recent Health Check-up:</Typography>
    <List>
      <ListItem>Height: 165 cm</ListItem>
      <ListItem>Height: 165 cm</ListItem>
      <ListItem>Blood Pressure: 120/80 mmHg</ListItem>
    </List>
  </>
);
