'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Paper,
  Button,
  MenuList,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';

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
            { id: 'inquiryNo', label: 'inquiryNo' },
            { id: 'FirstName', label: 'First Name' },
            { id: 'MiddleName', label: 'Middle Name' },
            { id: 'Name', label: 'Name' },
            { id: 'Code', label: 'Code' },
            { id: 'class', label: 'Class' },
            { id: 'Organization', label: 'Organization' },
            { id: 'parentContactNo', label: 'Parent Contact No' },
            { id: 'EmployeeDesignation', label: 'Role' },
            {
              id: 'progress',
              label: 'Progress',
              render(value, row) {
                return (
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={value} />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{ color: 'text.secondary' }}
                      >
                        {value}%
                      </Typography>
                    </Box>
                  </Box>
                );
              },
            },
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
                          <Iconify icon="solar:pen-bold" sx={{ mr: 2 }} />
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            if (row.progress < 50) {
                              toast.error('Please Complete Registration Form First');
                            }
                          }}
                        >
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
              Organization: 'primary',
              Code: 'REG001',
              Name: 'Sarah Anderson',
              FirstName: 'Sarah',
              MiddleName: 'Marie',
              EmployeeDesignation: 'Student',
              StatusName: 'Active',
              parentContactNo: '+91-555-0101',
              class: '5',
              inquiryNo: 'INQ001',
              progress: '100',
            },
            {
              Organization: 'pre-primary',
              Code: 'REG002',
              Name: 'Michael Chen',
              FirstName: 'Michael',
              MiddleName: 'James',
              EmployeeDesignation: 'Student',
              StatusName: 'Inactive',
              parentContactNo: '+91-555-0102',
              class: 'KG-2',
              inquiryNo: 'INQ002',
              progress: '75',
            },
            {
              Organization: 'primary',
              Code: 'REG003',
              Name: 'Emily Rodriguez',
              FirstName: 'Emily',
              MiddleName: 'Sofia',
              EmployeeDesignation: 'Student',
              StatusName: 'Active',
              parentContactNo: '+91-555-0103',
              class: '3',
              inquiryNo: 'INQ003',
              progress: '50',
            },
            {
              Organization: 'secondary',
              Code: 'REG004',
              Name: 'David Thompson',
              FirstName: 'David',
              MiddleName: 'Alexander',
              EmployeeDesignation: 'Student',
              StatusName: 'Active',
              parentContactNo: '+91-555-0104',
              class: '9',
              inquiryNo: 'INQ004',
              progress: '25',
            },
            {
              Organization: 'higher secondary',
              Code: 'REG005',
              Name: 'Lisa Wong',
              FirstName: 'Lisa',
              MiddleName: 'Grace',
              EmployeeDesignation: 'Student',
              StatusName: 'Inactive',
              parentContactNo: '+91-555-0105',
              class: '11',
              inquiryNo: 'INQ005',
              progress: '0',
            },
          ]}
        />
        <CustomDialog
          maxWidth="xl"
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
