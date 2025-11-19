'use client';

import React, { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Grid, Switch, TextField, Typography } from '@mui/material';

const ContentManagementSetting = () => {
  const [isContentModerateVisible, setIsContentModerateVisible] = useState<boolean>(false);
  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <CustomBreadcrumbs
        heading="Content Management"
        description="Manage your content settings for the learning management system."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Learning Management System', href: '/academic/lmsDashboard/' },
          { name: 'Settings' },
          {
            name: 'Content Management',
          },
        ]}
        sx={{ mb: 2 }}
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" pb={2}>
              Supported File Types
            </Typography>
            <CustomSelect
              options={[
                { value: 'PDF', label: 'PDF' },
                { value: 'Video', label: 'Video' },
                { value: 'Audio', label: 'Audio' },
              ]}
              value=""
              label="Course"
              onChange={() => {}}
              formControlProps={{ sx: { width: '100%' } }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" pb={2}>
              Content Moderation
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch
                checked={isContentModerateVisible}
                onChange={(e) => setIsContentModerateVisible(e.target.checked)}
              />
              <Typography>Content Moderation</Typography>
            </Box>
            {isContentModerateVisible && (
              <TextField
                placeholder="Text description"
                multiline
                rows={4}
                sx={{ maxWidth: '250px', width: '100%' }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContentManagementSetting;
