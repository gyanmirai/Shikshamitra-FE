'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/custom-dialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';

import RegisterForm from './register-form';
import { ExamForm } from '../entrance-exam';
import { CommunicationForm } from '../follow-up';
import RegistrationTable from './registration-table';

import type { IInquiryData } from '../inquiry/type';

const RegisterScreen = () => {
  // State to store and manage the selected inquiry data for editing
  const [editData, setEditData] = useState<any>(null);

  // Custom boolean hook to manage form dialog visibility
  const formDialog = useBoolean();

  // Redux state to track if there are unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Custom boolean hooks to manage different dialog states
  const dialog = useBoolean();
  const followUpDialog = useBoolean();

  // Dynamic breadcrumb links based on form dialog state
  const links = formDialog.value
    ? [
        { name: 'Student', href: '/student/dashboard/' },
        { name: 'Student Enrollment', href: '/student/dashboard/' },
        { name: 'Registration' },
      ]
    : [
        { name: 'Student', href: '/student/dashboard/' },
        { name: 'Student Enrollment', href: '/student/dashboard/' },
        { name: 'Registration' },
      ];

  // Handler for closing the form dialog
  // Checks for unsaved changes and prompts user confirmation if needed
  const handleClose = (_e?: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setEditData(null);
      dialog.onFalse();
      formDialog.onFalse();
      dispatch(setIsChanges(false));
    } else {
      formDialog.onFalse();
      setEditData(null);
      dialog.onFalse();
    }
  };
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Registration"
        description={
          formDialog.value
            ? 'Enter student information across the sections to complete the registration'
            : 'View students registrations, manage completion status, and update details for each record.'
        }
        links={links}
        isBack={formDialog.value}
        onBack={handleClose}
        action={
          !formDialog.value && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={formDialog.onTrue}
              sx={{ px: '32px' }}
            >
              Registration
            </Button>
          )
        }
      />
      {formDialog.value ? (
        <Card sx={{ height: '100%', mt: 1 }}>
          <RegisterForm editData={editData} handleClose={handleClose} />
        </Card>
      ) : (
        <RegistrationTable
          dialog={dialog}
          followUpDialog={followUpDialog}
          setEditData={setEditData}
          editData={editData}
          formDialog={formDialog}
        />
      )}

      <CustomDialog
        maxWidth="lg"
        open={dialog.value}
        handleClose={() => {
          setEditData(null);
          dialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Schedule Exam</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Schedule an entrance exam for the selected student."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {editData && (
          <ExamForm
            studentEnrollmentId={editData.studentId || ''}
            studentName={`${editData.firstName || ''} ${editData.middleName || ''} ${editData.lastName || ''}`.trim()}
            standardName={editData.standard || ''}
            educationBoard={editData.academicBoardName?.name || 'N/A'}
            educationMedium={editData.academicMediumName?.name || 'N/A'}
            handleClose={handleClose}
          />
        )}{' '}
      </CustomDialog>

      <CustomDialog
        open={followUpDialog.value}
        handleClose={() => {
          setEditData(null);
          followUpDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Notes</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Monitor communication history with follow-up notes and important updates for students enrollment."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <CommunicationForm
          handleCloseDialog={() => {
            setEditData(null);
            followUpDialog.onFalse();
          }}
          selectedStudent={editData}
          studentEnrollmentId={(editData as IInquiryData)?.studentId || ''}
        />{' '}
      </CustomDialog>
    </Box>
  );
};

export default RegisterScreen;
