import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';

const Favorite = (props: TabComponentType) => (
  <Box>
    <CustomizableTable
      tableId="favorite-resources"
      columns={[
        { id: 'resourceName', label: 'Resource Name' },
        { id: 'category', label: 'Category' },
        { id: 'fileType', label: 'File Type' },
        { id: 'dateFavorite', label: 'Date Favorite' },
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

export default Favorite;
