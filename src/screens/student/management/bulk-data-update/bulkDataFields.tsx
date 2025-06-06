import type { Board } from 'src/types/school';

import { capitalize } from 'lodash';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetClassByOrganizationIdQuery } from 'src/redux/class/classApi';

import CustomSelect from 'src/components/custom-select';

const RenderAcademicYear = (props: any) => {
  // Destructure props to get value, row (unused), and onChange function
  const { value, row, onChange } = props;

  // Fetch academic year data using custom hook
  // Returns data object containing items array and loading state
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });
  return (
    <CustomSelect
      name="academicYear"
      label="Academic Year"
      isLoading={yearLoading}
      options={academicYear?.items || []}
      value={value}
      labelKey="name"
      valueKey="id"
      onChange={(newValue) => onChange(newValue)}
      // error={!!(touched.academicYear && errors.academicYear) || false}
      // helperText={(touched.academicYear && errors.academicYear) || ''}
      formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
    />
  );
};

const RenderBoard = (props: any) => {
  // Destructure props to get value, row (unused), and onChange function
  const { value, row, onChange } = props;

  // Fetch board data using custom hook
  // Returns data object containing items array and loading state
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  return (
    <CustomSelect
      name="board"
      label="Board"
      isLoading={boardLoading}
      options={board?.items || []}
      labelKey="name"
      valueKey="id"
      value={value}
      onChange={(newValue) => onChange(newValue)}
      // error={!!(touched.board && errors.board) || false}
      // helperText={(touched.board && errors.board) || ''}
      formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
    />
  );
};

const RenderMedium = (props: any) => {
  // Destructure props to get value, selected row data, and onChange handler
  const { value, row, onChange } = props;

  // Fetch board data using custom hook
  // Returns data object containing board items and loading state
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  return (
    <CustomSelect
      name="medium"
      label="Medium"
      options={board?.items?.find((item: Board) => item.id === row.board)?.educationMediums || []}
      value={value}
      labelKey="name"
      valueKey="id"
      onChange={(newValue) => onChange(newValue)}
      // error={!!(touched.medium && errors.medium) || false}
      // helperText={(touched.medium && errors.medium) || ''}
      formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
    />
  );
};

const RenderClass = (props: any) => {
  // Destructure props to get value, selected row data, and onChange handler
  const { value, row, onChange } = props;

  // Fetch classes data using custom hook based on selected medium
  // Returns data object containing classes and loading state
  // Skip query if no medium is selected
  const { data: classes, isLoading: classLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassByOrganizationIdQuery,
    options: {
      skip: !row.medium,
    },
    params: row.medium,
  });
  return (
    <CustomSelect
      name="class"
      label="Class"
      isLoading={classLoading}
      labelKey="name"
      valueKey="id"
      options={classes || []}
      value={value}
      onChange={(newValue) => onChange(newValue)}
      // error={!!(touched.class && errors.class) || false}
      // helperText={(touched.class && errors.class) || ''}
      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
    />
  );
};

export const allCategory = [
  {
    name: 'General',
    id: 'general',
    subCategory: [
      // { name: 'Roll No.', id: 'rollNo123' },
      // { name: 'Gr. No.', id: 'grNo123' },
      // { name: 'Last Name', id: 'lastName' },
      { name: 'Form No', id: 'formNo', type: 'text' },
      {
        name: 'Academic Year',
        id: 'academicYear',
        type: 'text',
        renderComp(props: any) {
          return <RenderAcademicYear {...props} />;
        },
      },
      {
        name: 'Board',
        id: 'board',
        type: 'text',
        renderComp(props: any) {
          return <RenderBoard {...props} />;
        },
      },
      {
        name: 'Medium',
        id: 'medium',
        type: 'text',
        renderComp(props: any) {
          return <RenderMedium {...props} />;
        },
      },
      {
        name: 'Class',
        id: 'class',
        type: 'text',
        renderComp(props: any) {
          return <RenderClass {...props} />;
        },
      },
      {
        name: 'Previous School',
        id: 'previousSchool',
        type: 'text',
      },
      {
        name: 'First Name',
        id: 'firstName',
        type: 'text',
        otherProps: ({ onChange }: any) => ({
          onChange: (e: any) => {
            const newName = capitalize(e.target.value);
            onChange(newName);
          },
        }),
      },
      { name: 'Middle Name', id: 'middleName', type: 'text' },
      { name: 'Last Name', id: 'lastName', type: 'text' },

      { name: 'Contact No', id: 'contactNo', type: 'text' },
      { name: 'Alternate Contact No', id: 'alternateContactNo', type: 'text' },

      { name: 'Email', id: 'email', type: 'text' },
      { name: 'Date Of birth', id: 'dateOfBirth', type: 'date' },
      { name: 'Gender', id: 'gender', type: 'dropdown' },
      { name: 'Aadhar No', id: 'aadharNo', type: 'text' },

      { name: 'Religion', id: 'religion', type: 'text' },
      { name: 'FamilyCast', id: 'familyCast', type: 'text' },
      { name: 'CastCategory', id: 'castCategory', type: 'dropdown' },
      { name: 'MotherTongue', id: 'motherTongue', type: 'text' },
      { name: 'Nationality', id: 'nationality', type: 'text' },
      { name: 'BirthPlace', id: 'birthPlace', type: 'text' },
      { name: 'Temporary GR', id: 'temporaryGr', type: 'text' },
      { name: 'Remarks', id: 'remarks', type: 'text' },
    ],
  },
  {
    name: 'Family Information',
    id: 'familyInformation',
    subCategory: [
      { name: 'Father Name', id: 'fatherName', type: 'text' },
      { name: 'Father DOB', id: 'fatherDOB', type: 'date' },
      { name: 'Father Occupation', id: 'fatherOccupation', type: 'text' },
      { name: 'Father Qualification', id: 'fatherQualification', type: 'text' },
      { name: 'Father Contact No.', id: 'fatherContactNo', type: 'text' },
      { name: 'Father Email', id: 'fatherEmail', type: 'text' },
      { name: 'Father Pass out Year', id: 'fatherPassOutYear', type: 'text' },
      { name: 'Father Office No.', id: 'fatherOfficeNo', type: 'text' },
      { name: 'Father Office Address', id: 'fatherOfficeAddress', type: 'text' },
      { name: 'Father Designation', id: 'fatherDesignation', type: 'text' },
      { name: 'Father Organization', id: 'fatherOrganization', type: 'text' },
      { name: 'Father Aadhar No.', id: 'fatherAadharNo', type: 'text' },
      { name: 'Father Remarks', id: 'fatherRemarks', type: 'text' },
      { name: 'Father Address', id: 'fatherAddress', type: 'text' },

      { name: 'Mother Name', id: 'motherName', type: 'text' },
      { name: 'Mother DOB', id: 'motherDOB', type: 'date' },
      { name: 'Mother Occupation', id: 'motherOccupation', type: 'text' },
      { name: 'Mother Qualification', id: 'motherQualification', type: 'text' },
      { name: 'Mother Contact No.', id: 'motherContactNo', type: 'text' },
      { name: 'Mother Email', id: 'motherEmail', type: 'text' },
      { name: 'Mother Pass out Year', id: 'motherPassOutYear', type: 'text' },
      { name: 'Mother Office No.', id: 'motherOfficeNo', type: 'text' },
      { name: 'Mother Office Address', id: 'motherOfficeAddress', type: 'text' },
      { name: 'Mother Designation', id: 'motherDesignation', type: 'text' },
      { name: 'Mother Organization', id: 'motherOrganization', type: 'text' },
      { name: 'Mother Aadhar No.', id: 'motherAadharNo', type: 'text' },
      { name: 'Mother Remarks', id: 'motherRemarks', type: 'text' },
      { name: 'Mother Address', id: 'motherAddress', type: 'text' },

      { name: 'Guardian Name', id: 'guardianName', type: 'text' },
      { name: 'Guardian DOB', id: 'guardianDOB', type: 'date' },
      { name: 'Guardian Occupation', id: 'guardianOccupation', type: 'text' },
      { name: 'Guardian Qualification', id: 'guardianQualification', type: 'text' },
      { name: 'Guardian Contact No.', id: 'guardianContactNo', type: 'text' },
      { name: 'Guardian Email', id: 'guardianEmail', type: 'text' },
      { name: 'Guardian Pass out Year', id: 'guardianPassOutYear', type: 'text' },
      { name: 'Guardian Office No.', id: 'guardianOfficeNo', type: 'text' },
      { name: 'Guardian Office Address', id: 'guardianOfficeAddress', type: 'text' },
      { name: 'Guardian Designation', id: 'guardianDesignation', type: 'text' },
      { name: 'Guardian Organization', id: 'guardianOrganization', type: 'text' },
      { name: 'Guardian Aadhar No.', id: 'guardianAadharNo', type: 'text' },
      { name: 'Guardian Remarks', id: 'guardianRemarks', type: 'text' },
      { name: 'Guardian Address', id: 'guardianAddress', type: 'text' },

      { name: 'Sibling Details', id: 'siblingDetails', type: 'dropdown' },
    ],
  },
  {
    name: 'Communication',
    id: 'communication',
    subCategory: [
      { name: 'Primary Contact No.', id: 'primaryContactNo', type: 'text' },
      { name: 'Student Contact No.', id: 'studentContactNo', type: 'text' },
      { name: 'Parent Contact No.', id: 'parentContactNo', type: 'text' },
      { name: 'Student Email', id: 'studentEmail', type: 'text' },
      { name: 'Parent Email', id: 'parentEmail', type: 'text' },
      { name: 'WhatsApp No.', id: 'whatsappNo', type: 'text' },

      { name: 'Local Addr - Line 1', id: 'localAddrLine1', type: 'text' },
      { name: 'Local Addr - Line 2', id: 'localAddrLine2', type: 'text' },
      { name: 'Local Addr - Line 3', id: 'localAddrLine3', type: 'text' },
      { name: 'Local Addr - Country', id: 'localAddrCountry', type: 'text' },
      { name: 'Local Addr - State', id: 'localAddrState', type: 'text' },
      { name: 'Local Addr - City', id: 'localAddrCity', type: 'text' },
      { name: 'Local Addr - Pincode', id: 'localAddrPincode', type: 'text' },

      { name: 'Permanent Addr Same as Local', id: 'permanentAddrSame', type: 'text' },
      { name: 'Permanent Addr - Line 1', id: 'permanentAddrLine1', type: 'text' },
      { name: 'Permanent Addr - Line 2', id: 'permanentAddrLine2', type: 'text' },
      { name: 'Permanent Addr - Line 3', id: 'permanentAddrLine3', type: 'text' },
      { name: 'Permanent Addr - Country', id: 'permanentAddrCountry', type: 'text' },
      { name: 'Permanent Addr - State', id: 'permanentAddrState', type: 'text' },
      { name: 'Permanent Addr - City', id: 'permanentAddrCity', type: 'text' },
      { name: 'Permanent Addr - Pincode', id: 'permanentAddrPincode', type: 'text' },

      { name: 'Emergency Addr Same as Local', id: 'emergencyAddrSame', type: 'text' },
      { name: 'Emergency Addr - Line 1', id: 'emergencyAddrLine1', type: 'text' },
      { name: 'Emergency Addr - Line 2', id: 'emergencyAddrLine2', type: 'text' },
      { name: 'Emergency Addr - Line 3', id: 'emergencyAddrLine3', type: 'text' },
      { name: 'Emergency Addr - Country', id: 'emergencyAddrCountry', type: 'text' },
      { name: 'Emergency Addr - State', id: 'emergencyAddrState', type: 'text' },
      { name: 'Emergency Addr - City', id: 'emergencyAddrCity', type: 'text' },
      { name: 'Emergency Addr - Pincode', id: 'emergencyAddrPincode', type: 'text' },

      { name: 'Remarks', id: 'remarks', type: 'text' },
    ],
  },
  {
    name: 'Additional Details',
    id: 'additionalDetails',
    subCategory: [
      { name: 'Category', id: 'category', type: 'dropdown' },
      { name: 'Right to Education', id: 'rightToEducation', type: 'dropdown' },
      { name: 'BPL Card No.', id: 'bplCardNo', type: 'text' },
      { name: 'Person With Disability', id: 'personWithDisability', type: 'dropdown' },
      { name: 'Emergency Contact No.', id: 'emergencyContactNo', type: 'text' },
      { name: 'Single Parent Child', id: 'singleParentChild', type: 'dropdown' },
      { name: 'Student', id: 'student', type: 'dropdown' },
      { name: 'Sponsor Name', id: 'sponsorName', type: 'text' },
      { name: 'BPL Student', id: 'bplStudent', type: 'dropdown' },
      { name: 'Second Language', id: 'secondLanguage', type: 'text' },
      { name: 'Single Child', id: 'singleChild', type: 'dropdown' },
    ],
  },
  {
    name: 'Medical Records',
    id: 'medicalRecords',
    subCategory: [
      { name: 'Weight (kg)', id: 'weight', type: 'text' },
      { name: 'Height (cm)', id: 'height', type: 'text' },
      { name: 'Pulse Rate', id: 'pulseRate', type: 'text' },
      { name: 'Haemoglobin (hb)', id: 'haemoglobin', type: 'text' },
      { name: 'Covid Vaccination', id: 'covidVaccination', type: 'text' },
      { name: 'Child Immunisation', id: 'childImmunisation', type: 'text' },
      { name: 'Body Mass Index (BMI)', id: 'bmi', type: 'text' },
      { name: 'Allergies', id: 'allergies', type: 'text' },
      { name: 'Immunisation Remarks', id: 'immunisationRemarks', type: 'text' },
    ],
  },
  {
    name: 'Previous School Details',
    id: 'previousSchoolDetails',
    subCategory: [
      { name: 'Previous School Name', id: 'prevSchoolName', type: 'text' },
      { name: 'Previous School Address', id: 'prevSchoolAddress', type: 'text' },
      { name: 'Previous School Medium', id: 'prevSchoolMedium', type: 'text' },
      { name: 'TC Number', id: 'tcNumber', type: 'text' },
      { name: 'Percentage', id: 'percentage', type: 'text' },
      { name: 'Previous School Board', id: 'prevSchoolBoard', type: 'text' },
      { name: 'Last Class Passed', id: 'lastClassPassed', type: 'text' },
    ],
  },
  {
    name: 'Bank Details',
    id: 'parentsBankDetails',
    subCategory: [
      { name: 'Bank Name', id: 'bankName', type: 'text' },
      { name: 'Branch Name', id: 'branchName', type: 'text' },
      { name: 'Account No', id: 'accountNo', type: 'text' },
      { name: 'Account Holder Name', id: 'accountHolderName', type: 'text' },
      { name: 'IFSC Code', id: 'ifscCode', type: 'text' },
    ],
  },
];
