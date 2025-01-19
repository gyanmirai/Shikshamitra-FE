'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Card, Grid, Switch, Button, Checkbox, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const Settings = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      heading="Settings"
      links={[{ name: 'Academic and Assignment' }, { name: 'Course' }, { name: 'Settings' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <Grid container spacing={2}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <Switch
                checked={false}
                onChange={() => {}}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              <Typography sx={{ ml: 1 }}>Course Updates</Typography>
            </Box>

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
