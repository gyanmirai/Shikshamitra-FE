'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

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
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Registration"
        links={links}
        // sx={{ px: 1, mb: 2 }}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={formDialog.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            onClick={formDialog.onToggle}
          >
            {formDialog.value ? 'Back' : 'Registration'}
          </Button>
        }
      />
      {formDialog.value ? (
        <Card sx={{ height: '100%', mt: 1 }}>
          <RegisterForm
            editData={editData}
            handleClose={() => {
              setEditData(null);
              formDialog.onFalse();
            }}
          />
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
    </Box>
  );
};

export default RegisterScreen;
