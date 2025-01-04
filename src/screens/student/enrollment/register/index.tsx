'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RegisterForm from './RegisterForm';
import { ExamForm } from '../entrance-exam';
import { CommunicationForm } from '../follow-up';
import RegistrationTable from './registration-table';

const RegisterScreen = () => {
  const [open, setOpen] = useState(false);
  const dialog = useBoolean();
  const followUpDialog = useBoolean();
  const links = open
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
            startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            onClick={() => setOpen(!open)}
          >
            {open ? 'Back' : 'Registration'}
          </Button>
        }
      />
      {open ? (
        <RegisterForm />
      ) : (
        <RegistrationTable dialog={dialog} followUpDialog={followUpDialog} />
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
