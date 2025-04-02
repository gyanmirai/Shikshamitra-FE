'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RegisterForm from './register-form';
import { ExamForm } from '../entrance-exam';
import { CommunicationForm } from '../follow-up';
import RegistrationTable from './registration-table';

import type { IInquiryData } from '../Inquiry';

const RegisterScreen = () => {
  const [editData, setEditData] = useState<null | IInquiryData>(null);
  const formDialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const dialog = useBoolean();
  const followUpDialog = useBoolean();
  const links = formDialog.value
    ? [
      { name: 'Student' },
      { name: 'Student Enroll' },
      { name: 'Registration' },
      { name: 'Registration Form' },
    ]
    : [{ name: 'Student' }, { name: 'Student Enroll' }, { name: 'Registration' }];

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      formDialog.onFalse();
      dispatch(setIsChanges(false));
      setEditData(null);
    } else {
      formDialog.onFalse();
      setEditData(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Registration"
        links={links}
        description="Registration allows you to manage student enrollment, admissions, and academic records efficiently in one place"
        // sx={{ px: 1, mb: 2 }}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={formDialog.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            onClick={formDialog.value ? handleClose : formDialog.onTrue}
          >
            {formDialog.value ? 'Back' : 'Registration'}
          </Button>
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
          handleClose={() => {
            setEditData(null);
            dialog.onFalse();
          }}
        />{' '}
      </CustomDialog>

      <CustomDialog
        open={followUpDialog.value}
        handleClose={() => {
          setEditData(null);
          followUpDialog.onFalse();
        }}
        title="Follow Up"
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
