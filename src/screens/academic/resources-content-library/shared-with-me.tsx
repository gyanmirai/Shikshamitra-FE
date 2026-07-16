'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const SharedWithMe = (props: TabComponentType) => {
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem>
            <Iconify icon="mdi:download" />
            Download
          </MenuItem>
          <MenuItem>
            <Iconify icon="mdi:star" />
            Favorite
          </MenuItem>
        </MenuList>
      </>
    ),
    []
  );
  return (
    <Box>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Shared With Me"
        links={[
          { name: 'Academics' },
          { name: 'Resource Content Library' },
          { name: 'Shared With Me' },
        ]}
      />
      <CustomizableTable
        tableId="shared-with-me"
        columns={[
          { id: 'resourceName', label: 'Resource Name' },
          { id: 'sharedBy', label: 'Shared By' },
          { id: 'dateShared', label: 'Date Shared' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showViewIcon
                  showDeleteIcon
                  handleDeleteClick={() => {}}
                  handleViewClick={() => {}}
                />
              );
            },
          },
        ]}
        data={[
          {
            resourceName: 'Math Textbook',
            sharedBy: 'John Doe',
            dateShared: '2023-05-15',
          },
          {
            resourceName: 'Science Lab Report',
            sharedBy: 'Jane Smith',
            dateShared: '2023-05-14',
          },
          {
            resourceName: 'History Presentation',
            sharedBy: 'Mike Johnson',
            dateShared: '2023-05-13',
          },
          {
            resourceName: 'English Essay',
            sharedBy: 'Sarah Brown',
            dateShared: '2023-05-12',
          },
          {
            resourceName: 'Chemistry Notes',
            sharedBy: 'Tom Wilson',
            dateShared: '2023-05-11',
          },
        ]}
      />
    </Box>
  );
};

export default SharedWithMe;
