'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ChatView } from 'src/sections/chat/view';

const Parents = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      heading="Parents"
      links={[{ name: 'Communication' }, { name: 'Messages' }, { name: 'Parents' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <ChatView />
  </Box>
);

export default Parents;
