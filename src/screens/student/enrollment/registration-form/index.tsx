'use client';

import { useDispatch } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { Box, Card, Typography } from '@mui/material';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { StudentRegistrationFormApi } from 'src/redux/student/registration-form/registration-form-api';

import { CommunicationForm } from '../follow-up';
import RegisterForm from '../register/register-form';
import { RegistrationTable } from './components/RegistrationTable';
import { useRegistrationFormData } from './hooks/useRegistrationFormData';

import type { IGeneralInformationResponse } from '../register/type';

const RegistrationFormScreen = () => {
  // Dialog control for registration form
  const registerFormDialog = useBoolean();
  const dispatch = useDispatch();
  const [editData, setEditData] = useState<IGeneralInformationResponse | null>(null);
  const followUpDialog = useBoolean();
  const { tableData, isLoading, isFetching } = useRegistrationFormData();

  // Mutation hook to move student to registration status
  // const [moveToRegistration] = useQueryAndMutation({
  //   type: 'mutation',
  //   currentQueryAndMutation: useMoveToRegistrationMutation,
  //   popupConfig: {
  //     successMessage: 'Student moved to registration successfully',
  //     success: true,
  //   },
  // });

  const handleClose = useCallback(
    (_e: unknown, isSubmit?: boolean) => {
      // Note: This close handler is passed to breadcrumb back action
      const shouldClose =
        Boolean(isSubmit) ||
        (typeof window !== 'undefined' ? window.confirm('Are u sure to leave this page ?') : true);
      if (shouldClose) {
        dispatch(StudentRegistrationFormApi.util.invalidateTags(['Student-Registration-Form']));
        setEditData(null);
        registerFormDialog.onFalse();
        dispatch(setIsChanges(false));
      }
    },
    [dispatch, registerFormDialog]
  );

  const handleMoveToRegistration = useCallback(
    (row: any) => {
      setEditData(row);
      registerFormDialog.onTrue();
    },
    [registerFormDialog]
  );

  const handleOpenNotes = useCallback(
    (row: any) => {
      setEditData(row);
      followUpDialog.onTrue();
    },
    [followUpDialog]
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {registerFormDialog.value ? (
        <CustomBreadcrumbs
          heading="Move to Registration"
          description="Move students from Form Issuance to Registered Status to begin the formal admission process."
          links={[
            { name: 'Student', href: '/student/dashboard/' },
            { name: 'Student Enrollment', href: '/student/dashboard/' },
            { name: 'Registration Form Issued', href: '/student/dashboard/' },
            { name: 'Move to Registration' },
          ]}
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Registration Form Issued"
          description="After an inquiry Registration Form in a School ERP is provided to the prospective students for the admission process. "
          links={[
            { name: 'Student', href: '/student/dashboard/' },
            { name: 'Student Enrollment', href: '/student/dashboard/' },
            { name: 'Registration Form Issued' },
          ]}
        />
      )}
      {registerFormDialog.value ? (
        <Card sx={{ height: '100%' }}>
          <RegisterForm
            editData={editData}
            handleClose={() => {
              setEditData(null);
              registerFormDialog.onFalse();
              dispatch(
                StudentRegistrationFormApi.util.invalidateTags(['Student-Registration-Form'])
              );
            }}
            isComeFromIssueForm
          />
        </Card>
      ) : (
        <RegistrationTable
          data={tableData}
          isLoading={isLoading || isFetching}
          onMoveToRegistration={handleMoveToRegistration}
          onOpenNotes={handleOpenNotes}
        />
      )}

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
              title="Add and view communication notes and follow-ups related to students inquiries. "
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <CommunicationForm
          isStatus={false}
          handleCloseDialog={() => {
            setEditData(null);
            followUpDialog.onFalse();
          }}
          selectedStudent={editData}
          studentEnrollmentId={(editData as IGeneralInformationResponse)?.studentId || ''}
        />{' '}
      </CustomDialog>
    </Box>
  );
};

export default RegistrationFormScreen;
