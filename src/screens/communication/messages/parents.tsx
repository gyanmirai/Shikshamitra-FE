import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box } from '@mui/material';

import { ChatView } from 'src/sections/chat/view';

const Parents = (props: TabComponentType) => (
  <Box>
    <ChatView />
  </Box>
);

export default Parents;
