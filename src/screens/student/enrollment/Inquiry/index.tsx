'use client';

import type { YesNo } from 'src/enums/yes-no';
import type { RootState } from 'src/redux/store';
import type { GenderType } from 'src/enums/gender';
import type { Category } from 'src/enums/studnet-category';
import type { EmployeeCastType } from 'src/enums/employee-cast';
import type { ICity, IState, ICountry } from 'country-state-city';
import type { Board, Medium, Division, Standards, AcademicYear } from 'src/types/school';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import InquiryForm from './inquiry-form';
import InquiryTable from './inquiry-table';
import { CommunicationForm } from '../follow-up';
import IssueRegistrationForm from '../issue-registration-form/issueRegistrationForm';

export interface IInquiryData {
  id: string;
  userId: string;
  inquiryPreferencesId: string;
  studentEnrollmentState: number;
  inquiryNumber: string | undefined;
  formNumber: string;
  firstName: string;
  email: string;
  middleName: string;
  lastName: string;
  name: string;
  previousSchoolName: string;
  dateOfBirth: string;
  dateOfInquiry: string;
  genderType: GenderType;
  primaryContactNumber: string;
  secondaryContactNumber: string;
  dueDate?: string;
  country: ICountry;
  city: string;
  state: IState;
  // village: string;
  tempGrNo: number;
  grNoRecord: number;
  rollNo: number | null;
  pinCode: number | null;
  address: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  fatherAddress1: string;
  fatherAddress2: string;
  fatherAddress3: string;
  fatherOfficeAddress1: string;
  fatherOfficeAddress2: string;
  fatherOfficeAddress3: string;
  inquiryStatusType: number;
  educationMediumId: string;
  educationMedium: Medium;
  educationBoardId: string;
  educationBoard: Board;
  academicYearId: string;
  academicYear: AcademicYear;
  standardId: string;
  standard: Standards;
  division: Division;
  divisionId: string;
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
  profilePicture?: string;
  aadhaarNo: string;
  religion: string;
  familyCast: string;
  castType: EmployeeCastType;
  motherTongue: string;
  nationality: string;
  birthPlace: string;
  temporaryGr: string;
  panNo: string;
  apparId: string;
  remarks: string;
  onboardingProgressState: number;
  groupMembership: IGroupMembership;
  formNo: string;
  lastClassPassed: string;
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

export interface IGroupMembership {
  groupId: string;
  groupName: string;
  isDivisionLeader: boolean;
  isLeader: boolean;
}

export interface StudentBasicDetails {
  userId: string;
  profilePicture: string;
  aadhaarNo: string;
  religion: string;
  familyCast: string;
  castType: EmployeeCastType;
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
  designation: string;
  organisation: string;
  aadhaarNo: string;
  remarks: string;
  address1: string;
  address2: string;
  address3: string;
  officeAddress1: string;
  officeAddress2: string;
  officeAddress3: string;
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
  localCountry: ICountry;
  localState: IState;
  localCity: ICity;
  localPinCode: string;

  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentAddressLine3: string;
  permanentCountry: ICountry;
  permanentState: IState;
  permanentCity: ICity;
  permanentPinCode: string;

  emergencyAddressLine1: string;
  emergencyAddressLine2: string;
  emergencyAddressLine3: string;
  emergencyCountry: ICountry;
  emergencyState: IState;
  emergencyCity: ICity;
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
  relationName: string;
  relation: string;
  singleParentChild: YesNo;
  singleChild: YesNo;
  sponsorName?: string; // Add any additional fields as required
}
const InquiryScreen = () => {
  // Dialog state for inquiry form modal
  const inquiryDialog = useBoolean();

  // State to store inquiry data being edited
  const [editData, setEditData] = useState<null | IInquiryData>(null);

  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Dialog states for follow-up and registration form modals
  const followUpDialog = useBoolean();
  const issueRegistrationFormDialog = useBoolean();

  /**
   * Handles closing the inquiry dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   *
   * If isSubmit is true or user confirms leaving with unsaved changes:
   * - Resets the changes flag in Redux
   * - Closes the inquiry dialog
   * - Clears the edit data
   *
   * If no unsaved changes:
   * - Simply closes dialog and clears edit data
   */
  const handleClose = (_e?: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      inquiryDialog.onFalse();
      setEditData(null);
    } else if (!isChanges) {
      inquiryDialog.onFalse();
      setEditData(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Inquiry"
        description="Student Inquiry: Captures and manages admission-related inquiries from prospective students or parents."
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Enrollment', href: '/student/enrollment/inquiry' },
          { name: 'Inquiry' },
        ]}
        sx={{ mb: 1 }}
        isBack={inquiryDialog.value}
        onBack={() => handleClose(null, false)}
        action={
          !inquiryDialog.value && (
            <Button
              size="small"
              startIcon={inquiryDialog.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
              variant="contained"
              onClick={inquiryDialog.onTrue}
            >
              Inquiry
            </Button>
          )
        }
      />

      {inquiryDialog.value ? (
        <InquiryForm handleClose={handleClose} editData={editData} />
      ) : (
        <InquiryTable
          inquiryDialog={inquiryDialog}
          followUpDialog={followUpDialog}
          issueRegistrationFormDialog={issueRegistrationFormDialog}
          editData={editData}
          setEditData={setEditData}
        />
      )}

      <CustomDialog
        maxWidth="sm"
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
              title="Add or view communication notes and follow-up details for student inquiries."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <CommunicationForm
          handleCloseDialog={() => {
            setEditData(null);
            followUpDialog.onFalse();
          }}
          studentEnrollmentId={(editData as IInquiryData)?.id || ''}
        />{' '}
      </CustomDialog>

      <CustomDialog
        open={issueRegistrationFormDialog.value}
        handleClose={() => {
          setEditData(null);
          issueRegistrationFormDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Issue Registration Form</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Generate and issue registration forms for student enrollment with necessary details and documentation."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <IssueRegistrationForm
          handleClose={() => {
            setEditData(null);
            issueRegistrationFormDialog.onFalse();
          }}
          editData={editData as IInquiryData}
        />
      </CustomDialog>
    </Box>
  );
};

export default InquiryScreen;
