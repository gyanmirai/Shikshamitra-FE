'use client';

import React, { useState, useCallback } from 'react';

import Add from '@mui/icons-material/Add';
import { Box, Button, MenuItem, MenuList } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RegisterForm from '../register/RegisterForm';

const AdmissionScreen = () => {
  const [open, setOpen] = useState(false);
  const actions = useCallback(
    ({ popover }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            // modal.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            // modal.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="mingcute:transfer-fill" sx={{ height: '16px', width: '16px' }} />
          Move to Enroll
        </MenuItem>
      </MenuList>
    ),
    []
  );

  const dummyData = [
    { id: 1, name: 'John Doe', class: '10th', board: 'CBSE' },
    { id: 2, name: 'Jane Smith', class: '9th', board: 'ICSE' },
    { id: 3, name: 'Mike Johnson', class: '11th', board: 'State Board' },
    { id: 4, name: 'Emily Brown', class: '12th', board: 'CBSE' },
    { id: 5, name: 'David Lee', class: '8th', board: 'ICSE' },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Admission"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Admission' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
            Add Admission
          </Button>
        }
      />
      <CustomizableTable
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'class', label: 'Class' },
          { id: 'board', label: 'Board' },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return <ThreeDotsActions actions={actions} />;
            },
          },
        ]}
        data={dummyData}
      />
      <CustomDialog
        maxWidth="lg"
        open={open}
        handleClose={() => setOpen(false)}
        title="Registration"
      >
        <RegisterForm />
      </CustomDialog>
    </Box>
  );
};

export default AdmissionScreen;
