'use client';

import { Box } from '@mui/material';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FileDownload } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import UploadButton from 'src/components/upload-button';
import { shikshaMitraToast } from 'src/components/toast';
import { convertCsvToJson } from 'src/utils/convertCsvToJson';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useAddBulkStudentMutation } from 'src/redux/student/buik-student/bulk-student-api';

const BulkStudentAddScreen = () => {
  const [importStudent, { isLoading }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useAddBulkStudentMutation,
  });

  // state to manage the loading state of the template download
  const isDownLoadingTemplate = useBoolean(false);
  // state to manage the open state of the review dialog
  const isOpenReviewDialog = useBoolean(false);

  // state to manage the review student data
  const [reviewStudentData, setReviewStudentData] = useState<Record<string, any>[]>([]);

  // Implement the logic to download the template file
  const handleDownloadTemplate = () => {
    isDownLoadingTemplate.onTrue();
    const link = document.createElement('a');
    link.href = '/templates/student_upload_template.csv'; // relative path to public folder
    link.download = 'student_upload_template.csv'; // filename for download
    link.click();
    isDownLoadingTemplate.onFalse();
  };

  // Implement the logic to handle file import
  // You can use a file input element to select the file and then process it
  const handleImport = async (e: any) => {
    const file = e?.target?.files?.[0];
    if (!file) {
      shikshaMitraToast.error({ message: 'Please select a file to import' });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('files', file); // Assuming you have a file input element named 'file'
      await importStudent(formData);
      shikshaMitraToast.success({ message: 'File imported successfully' });

      const data = await convertCsvToJson(file);

      setReviewStudentData(data); // Set the review student data
      isOpenReviewDialog.onTrue();

      // Handle the response from the API here
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // const dialog = useBoolean();
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <LoadingButton
          loading={isDownLoadingTemplate.value}
          startIcon={<Iconify icon={GlobalIcons.download} />}
          size="small"
          variant="outlined"
          onClick={handleDownloadTemplate}
        >
          Download Template
        </LoadingButton>
        <UploadButton
          size="small"
          startIcon={<FileDownload />}
          variant="contained"
          onChange={handleImport}
          disabled={isLoading}
          accept=".csv, .xlsx, .xls"
        >
          {isLoading ? 'Importing..' : 'Import'}
        </UploadButton>
      </Box>
      <CustomizableTable
        tableId="bulk-student-add"
        noDataText="No Bulk Student Added"
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'rollNo', label: 'Roll No' },
          { id: 'board', label: 'Board' },
          { id: 'medium', label: 'Medium' },
          { id: 'organization', label: 'Organization' },
          { id: 'class', label: 'Class' },
          { id: 'division', label: 'Division' },
        ]}
        data={[]}
      />{' '}
      <CustomDialog
        open={isOpenReviewDialog.value}
        handleClose={isOpenReviewDialog.onFalse}
        title="Review Student Data"
        maxWidth="lg"
      >
        <Box p={2}>
          <CustomizableTable
            tableId="review-student-data"
            noDataText="No Student Data"
            columns={[
              { id: 'FormNumber', label: 'Form Number' },
              { id: 'FirstName', label: 'First Name' },
              { id: 'MiddleName', label: 'Middle Name' },
              { id: 'LastName', label: 'Last Name' },
              { id: 'DateOfBirth', label: 'Date of Birth' },
              { id: 'Gender', label: 'Gender' },
              { id: 'Email', label: 'Email' },
              { id: 'ParentContactNumber', label: 'Parent Contact No' },
              { id: 'AlternativeContactNumber', label: 'Alt Contact No' },
              { id: 'AddressLine1', label: 'Building No./Flat/House No.' },
              { id: 'AddressLine2', label: 'Area/Locality/Road Name' },
              { id: 'AddressLine3', label: 'Landmark' },
              { id: 'CountryName', label: 'Country' },
              { id: 'CountryIsoCode', label: 'Country ISO' },
              { id: 'StateName', label: 'State' },
              { id: 'StateIsoCode', label: 'State ISO' },
              { id: 'City', label: 'City' },
              { id: 'PinCode', label: 'Pincode' },
              { id: 'AadhaarNo', label: 'Aadhaar No' },
              { id: 'Religion', label: 'Religion' },
              { id: 'FamilyCast', label: 'Family Caste' },
              { id: 'CastType', label: 'Caste Type' },
              { id: 'MotherTongue', label: 'Mother Tongue' },
              { id: 'Nationality', label: 'Nationality' },
              { id: 'BirthPlace', label: 'Birth Place' },
              { id: 'Remarks', label: 'Remarks' },
              { id: 'Category', label: 'Category' },
              { id: 'RightToEducation', label: 'RTE' },
              { id: 'BPLStudent', label: 'BPL Student' },
              { id: 'PersonWithDisability', label: 'PWD' },
              { id: 'SecondLanguage', label: 'Second Language' },
              { id: 'EmergencyContactNo', label: 'Emergency Contact' },
              { id: 'SingleParentChild', label: 'Single Parent Child' },
              { id: 'SingleChild', label: 'Single Child' },
              { id: 'SponsorName', label: 'Sponsor Name' },
              { id: 'GrNoRecord', label: 'GR No' },
              { id: 'TempGrNo', label: 'Temp GR No' },
              { id: 'RollNo', label: 'Roll No' },
              { id: 'AcademicYearId', label: 'Academic Year' },
              { id: 'EducationBoardId', label: 'Board' },
              { id: 'EducationMediumId', label: 'Medium' },
              { id: 'EducationMediumStageId', label: 'Stage' },
              { id: 'StandardId', label: 'Class' },
              { id: 'DivisionId', label: 'Division' },
              { id: 'Status', label: 'Status' },
              { id: 'FatherName', label: 'Father Name' },
              { id: 'FatherDOB', label: 'Father DOB' },
              { id: 'FatherOccupation', label: 'Father Occupation' },
              { id: 'FatherQualification', label: 'Father Qualification' },
              { id: 'FatherContactNo', label: 'Father Contact' },
              { id: 'FatherEmail', label: 'Father Email' },
              { id: 'FatherAadhaarNo', label: 'Father Aadhaar' },
              { id: 'MotherName', label: 'Mother Name' },
              { id: 'MotherDOB', label: 'Mother DOB' },
              { id: 'MotherOccupation', label: 'Mother Occupation' },
              { id: 'MotherQualification', label: 'Mother Qualification' },
              { id: 'MotherContactNo', label: 'Mother Contact' },
              { id: 'MotherEmail', label: 'Mother Email' },
              { id: 'MotherAadhaarNo', label: 'Mother Aadhaar' },
              { id: 'GuardianName', label: 'Guardian Name' },
              { id: 'GuardianDOB', label: 'Guardian DOB' },
              { id: 'GuardianOccupation', label: 'Guardian Occupation' },
              { id: 'GuardianQualification', label: 'Guardian Qualification' },
              { id: 'GuardianContactNo', label: 'Guardian Contact' },
              { id: 'GuardianEmail', label: 'Guardian Email' },
              { id: 'GuardianAadhaarNo', label: 'Guardian Aadhaar' },
              { id: 'PreviousSchoolName', label: 'Previous School Name' },
              { id: 'PreviousSchoolAddress', label: 'Previous School Address' },
              { id: 'PreviousSchoolBoard', label: 'Previous School Board' },
              { id: 'PreviousSchoolMedium', label: 'Previous School Medium' },
              { id: 'TcNo', label: 'TC No' },
              { id: 'LastClassPassed', label: 'Last Class Passed' },
              { id: 'Percentage', label: 'Percentage' },
              { id: 'BankName', label: 'Bank Name' },
              { id: 'BranchName', label: 'Branch Name' },
              { id: 'AccountHolderName', label: 'Account Holder' },
              { id: 'AccountNumber', label: 'Account Number' },
              { id: 'IfscCode', label: 'IFSC Code' },
              { id: 'Weight', label: 'Weight' },
              { id: 'Height', label: 'Height' },
              { id: 'BodyMassIndex', label: 'BMI' },
              { id: 'Haemoglobin', label: 'Haemoglobin' },
              { id: 'Allergies', label: 'Allergies' },
              { id: 'CovidVaccination', label: 'COVID Vaccination' },
              { id: 'PulseRate', label: 'Pulse Rate' },
              { id: 'ChildImmunisation', label: 'Immunisation' },
              { id: 'ImmunisationRemarks', label: 'Immunisation Remarks' },
            ]}
            data={reviewStudentData || []}
          />
        </Box>
      </CustomDialog>
    </Box>
  );
};
export default BulkStudentAddScreen;
