'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Paper, Button, MenuList, MenuItem } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RegisterForm from './RegisterForm';
import { ExamForm } from '../entrance-exam';
import { CommunicationForm } from '../follow-up';

const RegisterScreen = () => {
  const [open, setOpen] = useState(false);
  const dialog = useBoolean();
  const followUpDialog = useBoolean();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Registration"
        links={[{ name: 'Student' }, { name: 'Student Enroll' }, { name: 'Registration' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Registration
          </Button>
        }
      />
      <Paper sx={{ px: 1, py: 2 }}>
        <CustomizableTable
          columns={[
            { id: 'Organization', label: 'Organization' },
            { id: 'Code', label: 'Code' },
            { id: 'Name', label: 'Name' },
            { id: 'FirstName', label: 'First Name' },
            { id: 'MiddleName', label: 'Middle Name' },
            { id: 'EmployeeDesignation', label: 'Role' },
            {
              id: 'StatusName',
              label: 'Status',
              render(value, row) {
                return (
                  <Label variant="soft" color={value === 'Active' ? 'success' : 'error'}>
                    {value}
                  </Label>
                );
              },
            },
            {
              id: 'actions',
              label: 'Actions',
              isSort: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={(props) => (
                      <MenuList>
                        <MenuItem>
                          <Iconify icon="mdi:arrow-right" sx={{ mr: 2 }} />
                          Move To Admission
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            dialog.onTrue();
                          }}
                        >
                          <Iconify icon="mdi:calendar-clock" sx={{ mr: 2 }} />
                          Schedule Exam
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            followUpDialog.onTrue();
                          }}
                        >
                          <Iconify icon="icon-park:follow-up-date-sort" sx={{ mr: 2 }} />
                          Follow Up
                        </MenuItem>
                      </MenuList>
                    )}
                    placement="right-top"
                  />
                );
              },
            },
          ]}
          data={[
            {
              Organization: 'ABC University',
              Code: 'STU001',
              Name: 'John Doe',
              FirstName: 'John',
              MiddleName: 'Michael',
              EmployeeDesignation: 'Student',
              StatusName: 'Active',
            },
            {
              Organization: 'XYZ College',
              Code: 'STU002',
              Name: 'Jane Smith',
              FirstName: 'Jane',
              MiddleName: 'Elizabeth',
              EmployeeDesignation: 'Student',
              StatusName: 'Inactive',
            },
            {
              Organization: 'EFG Institute',
              Code: 'STU003',
              Name: 'Bob Johnson',
              FirstName: 'Bob',
              MiddleName: 'William',
              EmployeeDesignation: 'Student',
              StatusName: 'Active',
            },
          ]}
        />
        <CustomDialog
          maxWidth="lg"
          open={open}
          handleClose={() => setOpen(false)}
          title="Registration"
        >
          <RegisterForm />
        </CustomDialog>

        <CustomDialog
          maxWidth="lg"
          open={dialog.value}
          handleClose={dialog.onFalse}
          title="Schedule Exam"
        >
          <ExamForm />{' '}
        </CustomDialog>
        <CustomDialog
          open={followUpDialog.value}
          handleClose={followUpDialog.onFalse}
          title="Follow Up"
        >
          <CommunicationForm handleCloseDialog={followUpDialog.onFalse} />{' '}
        </CustomDialog>
      </Paper>{' '}
    </Box>
  );
};

export default RegisterScreen;
