'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ChatView } from 'src/sections/chat/view';

const StaffFaculty = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      heading="Staff Faculty"
      links={[{ name: 'Communication' }, { name: 'Messages' }, { name: 'Staff Faculty' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <ChatView />
  </Box>
);

export default StaffFaculty;
