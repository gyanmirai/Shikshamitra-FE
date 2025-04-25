import React from 'react';

import { Box, Avatar, Typography } from '@mui/material';

import { convertBase64Format } from 'src/utils/base64Formate';

import CustomizableTable from 'src/components/customizabaleTable';

import type { StudentTabsComponentType } from '..';

const HostelRoomMate = (props: StudentTabsComponentType) => (
  <Box>
    <Typography variant="h6">Room Mates Info</Typography>
    <CustomizableTable
      tableId="student-list"
      isShowedDense={false}
      noDataText={<>No Student Data Found </>}
      searchFieldProps={{
        placeholder: 'Search Name, Roll No...',
        label: 'Search Name, Roll No...',
      }}
      data={[
        {
          id: 1,
          name: 'Aarav Mehta',
          rollNo: 'R001',
          standardId: '10-A',
          grNoRecord: 'GR2025001',
          parentContactNumber: '9876543210',
          profilePicture: '', // Add base64 or image URL if needed
        },
        {
          id: 2,
          name: 'Ishita Shah',
          rollNo: 'R002',
          standardId: '10-A',
          grNoRecord: 'GR2025002',
          parentContactNumber: '9123456789',
          profilePicture: '',
        },
        {
          id: 3,
          name: 'Devansh Patel',
          rollNo: 'R003',
          standardId: '10-B',
          grNoRecord: 'GR2025003',
          parentContactNumber: '9012345678',
          profilePicture: '',
        },
        {
          id: 4,
          name: 'Kavya Desai',
          rollNo: 'R004',
          standardId: '9-C',
          grNoRecord: 'GR2025004',
          parentContactNumber: '9988776655',
          profilePicture: '',
        },
        {
          id: 5,
          name: 'Rahul Trivedi',
          rollNo: 'R005',
          standardId: '8-B',
          grNoRecord: 'GR2025005',
          parentContactNumber: '9876501234',
          profilePicture: '',
        },
      ]}
      columns={[
        {
          id: 'name',
          label: 'Name',
          render: (value, row) => (
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 32, height: 32, mr: 1 }}
                src={convertBase64Format(row.profilePicture)}
                alt={value}
              />
              <Typography component="span" fontSize="12px">
                {value}
              </Typography>
            </Box>
          ),
        },
        { id: 'rollNo', label: 'Roll No' },
        { id: 'standardId', label: 'Class' },
        { id: 'rollNo', label: 'Roll No' },
        { id: 'grNoRecord', label: 'Gr No' },
        { id: 'parentContactNumber', label: 'Contact No' },
      ]}
    />
  </Box>
);

export default HostelRoomMate;
