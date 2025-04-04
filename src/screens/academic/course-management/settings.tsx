'use client';

// Import required dependencies and types

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Card, Grid, Switch, Button, Checkbox, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Settings component for managing course-related configurations
const Settings = (props: TabComponentType) => (
  <Box>
    {/* Breadcrumb navigation */}
    <CustomBreadcrumbs
      heading="Settings"
      description="Track the progress of each subject and its chapters in real-time. Monitor completed and pending chapters, and analyze progress to ensure curriculum coverage and effective learning."
      links={[
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Syllabus', href: '/academic/courseSubjects' },
        { name: 'Settings' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <Grid container spacing={2}>
      {/* Notification Settings Card */}
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" marginBottom={2}>
            Notification Setting
          </Typography>

          <Box sx={{ flex: 1 }}>
            {/* Course Updates Toggle Switch */}
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <Switch
                checked={false}
                onChange={() => {}}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              <Typography sx={{ ml: 1 }}>Course Updates</Typography>
            </Box>

            {/* Notification Frequency Dropdown */}
            <CustomSelect
              options={[]}
              value=""
              onChange={(val) => {}}
              defaultChecked
              label="Notification Frequency"
              formControlProps={{
                sx: {
                  minWidth: 300,
                  mb: 2,
                },
              }}
            />
          </Box>

          {/* Save Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 'auto',
              pt: 2,
            }}
          >
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>

      {/* Course Creation Workflow Card */}
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" marginBottom={2}>
            Course Creation Workflow
          </Typography>

          <Box sx={{ flex: 1 }}>
            {/* Workflow Steps Checklist */}
            <Box display="flex" alignItems="center" mb={1}>
              <Checkbox size="small" checked />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Step 1 : Course Title
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" mb={1}>
              <Checkbox size="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Step 2 : Course Description
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" mb={1}>
              <Checkbox size="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Step 3 : Upload File
              </Typography>
            </Box>
          </Box>

          {/* Save Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 'auto',
              pt: 2,
            }}
          >
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default Settings;
