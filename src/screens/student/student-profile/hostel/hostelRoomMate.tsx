import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import { convertBase64Format } from 'src/utils/base64Formate';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Stack, Avatar, Button, Typography } from '@mui/material';

import ViewHostelRules from './components/viewHostelRules';
import HostelRoomDetailCard from './components/hostelRoomDetailCard';

import type { StudentTabsComponentType } from '..';

const HostelRoomMate = (props: StudentTabsComponentType) => {
  const viewRuleDialog = useBoolean();
  return (
    <Box display="flex" flexDirection="column">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          p: 2,
          width: '100%',
        }}
      >
        <Button
          startIcon={<Iconify icon={GlobalIcons.eye} />}
          variant="contained"
          onClick={viewRuleDialog.onTrue}
          size="small"
        >
          View Hostel Rules
        </Button>
      </Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <HostelRoomDetailCard label="Block" value="A" color="success" />
        <HostelRoomDetailCard label="Floor" value="4" color="success" />
        <HostelRoomDetailCard label="Room Number" value="102" color="warning" />
        <HostelRoomDetailCard label="Room Type" value="AC" color="error" />
        <HostelRoomDetailCard label="Bed Number" value="4" color="error" />
        <HostelRoomDetailCard label="Bed Type" value="Single" color="error" />
      </Stack>
      <Typography variant="h6" mt={2}>
        Room Mates Info
      </Typography>
      <CustomizableTable
        tableId="student-list"
        isShowedDense={false}
        noDataText={<>No Student Data Found </>}
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
      <CustomDialog
        open={viewRuleDialog.value}
        handleClose={() => {
          viewRuleDialog.onFalse();
        }}
        title="Hostel Rules"
        maxWidth="md"
      >
        <ViewHostelRules />
      </CustomDialog>
    </Box>
  );
};

export default HostelRoomMate;
