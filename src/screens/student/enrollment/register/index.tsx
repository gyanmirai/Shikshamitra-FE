'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RegisterForm from './register-form';
import { ExamForm } from '../entrance-exam';
import { CommunicationForm } from '../follow-up';
import RegistrationTable from './registration-table';

import type { IInquiryData } from '../Inquiry';

const RegisterScreen = () => {
  // State to store and manage the selected inquiry data for editing
  const [editData, setEditData] = useState<null | IInquiryData>(null);

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
        { name: 'Student', href: '/student/enrollment/dashboard/' },
        { name: 'Student Enrollment', href: '/student/enrollment/registration/' },
        { name: 'Registration' },
        { name: 'Registration Form' },
      ]
    : [
        { name: 'Student', href: '/student/enrollment/dashboard/' },
        { name: 'Student Enrollment', href: '/student/enrollment/registration/' },
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
        links={links}
        // sx={{ px: 1, mb: 2 }}
        isBack={formDialog.value}
        onBack={handleClose}
        action={
          !formDialog.value && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={formDialog.onTrue}
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
        title="Schedule Exam"
      >
        <ExamForm
          studentEnrollmentId={(editData as IInquiryData)?.id || ''}
          studentName={`${(editData as IInquiryData)?.firstName || ''} ${(editData as IInquiryData)?.middleName || ''} ${(editData as IInquiryData)?.lastName || ''}`.trim()}
          standardName={(editData as IInquiryData)?.standard.name || ''}
          handleClose={handleClose}
        />{' '}
      </CustomDialog>

      <CustomDialog
        open={followUpDialog.value}
        handleClose={() => {
          setEditData(null);
          followUpDialog.onFalse();
        }}
        title="Note"
      >
        <CommunicationForm
          handleCloseDialog={() => {
            setEditData(null);
            followUpDialog.onFalse();
          }}
          studentEnrollmentId={(editData as IInquiryData)?.id || ''}
        />{' '}
      </CustomDialog>
    </Box>
  );
};

export default RegisterScreen;
