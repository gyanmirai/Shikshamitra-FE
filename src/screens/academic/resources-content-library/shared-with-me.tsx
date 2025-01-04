import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const SharedWithMe = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      heading="Shared With Me"
      links={[
        { name: 'Academic and Assignment' },
        { name: 'Resource Content Library' },
        { name: 'Shared With Me' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <CustomizableTable
      columns={[
        { id: 'resourceName', label: 'Resource Name' },
        { id: 'sharedBy', label: 'Shared By' },
        { id: 'dateShared', label: 'Date Shared' },
        {
          id: 'action',
          label: 'action',
          render() {
            return (
              <ThreeDotsActions
                actions={() => (
                  <MenuList>
                    <MenuItem>
                      <Iconify icon="mdi:download" />
                      Download
                    </MenuItem>
                    <MenuItem>
                      <Iconify icon="mdi:star" />
                      Favorite
                    </MenuItem>
                    <MenuItem>
                      <Iconify icon="mdi:eye" />
                      Preview
                    </MenuItem>
                    <MenuItem>
                      <Iconify icon="mdi:delete" />
                      Remove
                    </MenuItem>
                  </MenuList>
                )}
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

export default SharedWithMe;
