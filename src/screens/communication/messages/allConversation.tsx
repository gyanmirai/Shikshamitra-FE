'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import { Box } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ChatView } from 'src/sections/chat/view';

const AllConversation = (props: TabComponentType) => {
  const [selectedFilter, setSelectedFilter] = useState('staffFaculty');
  return (
    <Box>
      <CustomBreadcrumbs
        heading="All Conversation"
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Messages', href: '/communication/messages' },
          { name: 'All Conversation' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomSelect
        options={[
          { value: 'staffFaculty', label: 'Staff / Faculty' },
          { value: 'students', label: 'Students' },
          { value: 'parents', label: 'Parents' },
        ]}
        value={selectedFilter}
        onChange={(val) => {
          setSelectedFilter(val as string);
        }}
        label="Filtered By"
        formControlProps={{ sx: { minWidth: 180, mb: 2 } }}
      />
      <ChatView />
    </Box>
  );
};

export default AllConversation;
