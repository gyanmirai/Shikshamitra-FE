'use client';

import type { YesNo } from 'src/enums/yes-no';
import type { GenderType } from 'src/enums/gender';
import type { Category } from 'src/enums/studnet-category';
import type { Board, Medium, Standards, AcademicYear } from 'src/types/school';

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
  studentEnrollmentState: number;
  inquiryNumber: string | undefined;
  formNumber: string;
  firstName: string;
  email: string;
  middleName: string;
  lastName: string;
  previousSchoolName: string;
  dateOfBirth: string;
  dateOfInquiry: string;
  genderType: GenderType;
  parentContactNumber: string;
  alternativeContactNumber: string;
  country: string;
  city: string;
  state: string;
  pinCode: number;
  address: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  inquiryStatusType: number;
  educationMediumId: string;
  educationMedium: Medium;
  educationBoardId: string;
  educationBoard: Board;
  academicYearId: string;
  academicYear: AcademicYear;
  standardId: string;
  standard: Standards;
  inquiryPreferenceId: string;
  inquiryPreference: InquiryPreference;
  studentBasicDetails: StudentBasicDetails;
  fatherDetails: ParentDetails;
  motherDetails: ParentDetails;
  guardianDetails: ParentDetails;
  studentCommunicationDetails: StudentCommunicationDetails;
  studentAdditionalDetails: StudentAdditionalDetails;
  studentMedicalRecords: StudentMedicalRecords;
  previousSchoolDetails: PreviousSchoolDetails;
  parentBankDetails: ParentBankDetails;
}

export interface ParentBankDetails {
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
}
export interface PreviousSchoolDetails {
  previousSchoolName: string;
  previousSchoolAddress: string;
  previousSchoolBoard: string;
  previousSchoolMedium: string;
  tcNo: string;
  lastClassPassed: string;
  percentage: number;
}
export interface StudentMedicalRecords {
  weight: number;
  height: number;
  bodyMassIndex: number;
  haemoglobin: string;
  allergies: string;
  covidVaccination: string;
  childImmunisation: string;
  immunisationRemarks: string;
}

export interface InquiryPreference {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  preferenceName: string;
}

export interface StudentBasicDetails {
  userId: string;
  profilePicture: string;
  aadhaarNo: string;
  religion: string;
  familyCast: string;
  castType: number;
  motherTongue: string;
  nationality: string;
  birthPlace: string;
  temporaryGr: string;
  remarks: string;
}

export interface ParentDetails {
  name: string;
  dateOfBirth: string;
  occupation: string;
  qualification: string;
  contactNo: string;
  email: string;
  passOutYear: number;
  officeNo: string;
  officeAddress: string;
  designation: string;
  organisation: string;
  aadhaarNo: string;
  remarks: string;
  address: string;
}

export interface StudentCommunicationDetails {
  primaryContactNo: string;
  parentContactNo: string;
  parentEmail: string;
  studentContactNo: string;
  studentEmail: string;
  whatsAppNo: string;

  localAddressLine1: string;
  localAddressLine2: string;
  localAddressLine3: string;
  localCountry: string;
  localState: string;
  localCity: string;
  localPinCode: string;

  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentAddressLine3: string;
  permanentCountry: string;
  permanentState: string;
  permanentCity: string;
  permanentPinCode: string;

  emergencyAddressLine1: string;
  emergencyAddressLine2: string;
  emergencyAddressLine3: string;
  emergencyCountry: string;
  emergencyState: string;
  emergencyCity: string;
  emergencyPinCode: string;
  remarks: string;
}

export interface StudentAdditionalDetails {
  category: Category;
  rightToEducation: YesNo;
  bplStudent: YesNo;
  bplCardNo: string;
  personWithDisability: YesNo;
  secondLanguage: string;
  emergencyContactNo: string;
  singleParentChild: YesNo;
  singleChild: YesNo;
  sponsorName?: string; // Add any additional fields as required
}
const InquiryScreen = () => {
  const [editData, setEditData] = useState<null | IInquiryData>(null);
  const dialog = useBoolean();
  const followUpDialog = useBoolean();
  const links = dialog.value
    ? [
        { name: 'Student' },
        { name: 'Student Enrollment' },
        { name: 'Inquiry' },
        { name: 'Inquiry Form' },
      ]
    : [{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Inquiry' }];

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

export default InquiryScreen;
