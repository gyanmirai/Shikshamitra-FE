'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AnnouncementImportant from './announcementImportant/announcementImportant';
import AnnouncementCategory from './announcementCategory/announcementCategoryForm';

const SettingAnnouncement = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      heading="Setting Announcement"
      description="Manage your announcement settings, including categories and important announcements."
      links={[
        { name: 'Communication', href: '/communication/dashboard' },
        { name: 'Settings' },
        { name: 'Setting Announcement' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    {/* Component for managing announcement categories */}
    <AnnouncementCategory />
    {/* Component for managing important announcements */}
    <AnnouncementImportant />
  </Box>
);

export default SettingAnnouncement;
