import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { convertBase64Format } from 'src/utils/base64Formate';
import CustomizableTable from 'src/components/customizabaleTable';
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
        <HostelRoomDetailCard label="Block" value="-" color="success" />
        <HostelRoomDetailCard label="Floor" value="-" color="success" />
        <HostelRoomDetailCard label="Room Number" value="-" color="warning" />
        <HostelRoomDetailCard label="Room Type" value="-" color="error" />
        <HostelRoomDetailCard label="Bed Number" value="-" color="error" />
        <HostelRoomDetailCard label="Bed Type" value="-" color="error" />
      </Stack>
      <Typography variant="h6" mt={2}>
        Room Mates Info
      </Typography>
      <CustomizableTable
        tableId="student-list"
        isShowedDense={false}
        noDataText={<>No Student Data Found </>}
        data={[]}
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
