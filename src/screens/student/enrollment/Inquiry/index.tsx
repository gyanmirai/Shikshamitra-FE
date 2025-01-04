'use client';

import type { GenderType } from 'src/enums/gender';
import type { Medium, Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import InquiryForm from './inquiry-form';
import InquiryTable from './inquiry-table';
import { CommunicationForm } from '../follow-up';

export interface IInquiryData {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  inquiryNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  formNumber: string;
  previousSchoolName: string;
  dateOfBirth: string;
  age: number;
  dateOfInquiry: string;
  genderType: GenderType;
  parentContactNumber: string;
  alternativeContactNumber: string;
  city: string;
  state: string;
  pinCode: number;
  address: string;
  educationMediumId: string;
  academicYearId: string;
  standerdId: string;
  inquiryPreferenceId: string;
  educationMedium: Medium;
  academicYear: {
    id: string;
    creationTime: string;
    creatorId: string;
    lastModificationTime: string;
    lastModifierId: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  standard: Standards;
  inquiryPreference: {
    id: string;
    creationTime: string;
    creatorId: string;
    lastModificationTime: string;
    lastModifierId: string;
    preferenceName: string;
  };
}

const InquiryScreen = () => {
  const [editData, setEditData] = useState<null | IInquiryData>(null);
  const dialog = useBoolean();
  const followUpDialog = useBoolean();
  const links = dialog.value
    ? [{ name: 'Student' }, { name: 'Inquiry' }, { name: 'Inquiry Form' }]
    : [{ name: 'Student' }, { name: 'Inquiry' }];

  const handleClose = () => {
    dialog.onFalse();
    setEditData(null);
  };
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Inquiry"
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={dialog.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={dialog.value ? handleClose : dialog.onTrue}
          >
            {dialog.value ? 'Back' : 'Inquiry'}
          </Button>
        }
      />

      {dialog.value ? (
        <InquiryForm handleClose={handleClose} editData={editData} />
      ) : (
        <InquiryTable
          dialog={dialog}
          followUpDialog={followUpDialog}
          editData={editData}
          setEditData={setEditData}
        />
      )}

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

export default InquiryScreen;
