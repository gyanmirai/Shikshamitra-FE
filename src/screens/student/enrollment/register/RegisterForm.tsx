import type { SxProps } from '@mui/material';

import * as Yup from 'yup';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, TextField, IconButton } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { UploadAvatar } from 'src/components/upload';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  sx?: SxProps;
  otherProps?: Record<string, any>;
  renderComp?: (props: any) => React.ReactNode;
}

const generalFormFields: FieldsType[] = [
  {
    name: 'grNo',
    label: 'Gr No',
    type: 'text',
    otherProps: {},
  },
  { name: 'surname', label: 'Surname', type: 'text', otherProps: {} },
  { name: 'name', label: 'Name', type: 'text', otherProps: {} },
  { name: 'middleName', label: 'Middle Name', type: 'text', otherProps: {} },
  {
    name: 'dob',
    label: 'Date of Birth',
    type: 'date',
    otherProps: {},
  },
  { name: 'gender', label: 'Gender', type: 'text', otherProps: {} },
  { name: 'adharNo', label: 'Adhar No', type: 'text', otherProps: {} },
  { name: 'religion', label: 'Religion', type: 'text', otherProps: {} },
  { name: 'familyCast', label: 'Family Cast', type: 'text', otherProps: {} },
  { name: 'castCategory', label: 'Cast Category', type: 'text', otherProps: {} },
  { name: 'motherTongue', label: 'Mother Tongue', type: 'text', otherProps: {} },
  { name: 'nationality', label: 'Nationality', type: 'text', otherProps: {} },
  { name: 'birthPlace', label: 'Birth Place', type: 'text', otherProps: {} },
];
// const admissionFormFields: FieldsType[] = [
//   {
//     name: 'admissionDate',
//     label: 'Admission Date',
//     type: 'date',
//     otherProps: {},
//   },
//   {
//     name: 'admissionStandard',
//     label: 'Admission Standard',
//     type: 'text',
//     otherProps: {},
//   },
//   {
//     name: 'admissionFormNumber',
//     label: 'Admission Form Number',
//     type: 'text',
//     otherProps: {},
//   },
//   {
//     name: 'previousSchool',
//     label: 'Previous School',
//     type: 'text',
//     otherProps: {},
//   },
//   {
//     name: 'admissionQuota',
//     label: 'Admission Quota',
//     type: 'text',
//     otherProps: {},
//   },
//   {
//     name: 'previousSchoolLeftDate',
//     label: 'Previous School Left Date',
//     type: 'date',
//     otherProps: {},
//   },
//   {
//     name: 'previousLCDate',
//     label: 'Previous LC Date',
//     type: 'date',
//     otherProps: {},
//   },
//   {
//     name: 'previousLCNumber',
//     label: 'Previous LC Number',
//     type: 'text',
//     otherProps: {},
//   },
// ];
const documentFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Certificate Name',
    name: 'certificateName',
    placeholder: 'Enter Certificate Name',
    renderComp(props) {
      return (
        <CustomizableTable
          columns={[
            { id: 'name', label: 'Name' },
            {
              id: 'status',
              label: 'Status',
              render(value, row) {
                return (
                  <Label color={row.status === 'Uploaded' ? 'success' : 'warning'}>
                    {row.status}
                  </Label>
                );
              },
            },
            {
              id: 'upload',
              label: 'Upload',
              render(value, row) {
                return (
                  <IconButton>
                    <Iconify icon="ri:file-upload-fill" />
                  </IconButton>
                );
              },
            },
            {
              id: 'view',
              label: 'View',
              render(value, row) {
                return (
                  <IconButton>
                    <Iconify icon="carbon:view-filled" />
                  </IconButton>
                );
              },
            },
          ]}
          data={[
            {
              name: 'Certificate_BonafiedTabular.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_Bonafied_Double.pdf',
              status: 'Uploaded',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_Bonafied_LetterHead.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_Bonafied_WithAddress.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_Bonafied_WithPreviousDetai',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_CBSETransfer.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_Transfer_CBSE.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'First Trial Certificates.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
          ]}
        />
      );
    },
  },
];
const communicationFields: FieldsType[] = [
  {
    name: 'parentContactNumber',
    label: 'Parent Contact Number',
    type: 'text',
    otherProps: {},
  },
  { name: 'parentEmail', label: 'Parent Email', type: 'email', otherProps: {} },
  {
    name: 'studentContactNo',
    label: 'Student Contact Number',
    type: 'text',
    otherProps: {},
  },
  { name: 'studentEmail', label: 'Student Email', type: 'email', otherProps: {} },
  {
    name: 'whatsAppContactNo',
    label: 'WhatsApp Contact Number',
    type: 'text',
    otherProps: {},
  },
  { name: 'localAddress', label: 'Local Address', type: 'text', otherProps: {} },
  {
    name: 'permanentAddress',
    label: 'Permanent Address',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'emergencyAddress',
    label: 'Emergency Address',
    type: 'text',
    otherProps: {},
  },
];
const familyFields: FieldsType[] = [
  { name: 'fatherName', label: 'Father Name', type: 'text', otherProps: {} },
  {
    name: 'fatherDob',
    label: 'Father Date of Birth',
    type: 'date',

    otherProps: {},
  },
  {
    name: 'fatherOccupation',
    label: 'Father Occupation',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'fatherQualification',
    label: 'Father Qualification',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'fatherContactNo',
    label: 'Father Contact Number',
    type: 'text',
    otherProps: {},
  },
  { name: 'fatherMail', label: 'Father Mail', otherProps: {}, type: 'text' },
  {
    name: 'fatherExStudent',
    label: 'Father Ex-student',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'fatherPassoutYear',
    label: 'Father Pass out Year',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'fatherOfficeContactNo',
    label: 'Father Office Contact No',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'fatherOfficeAddress',
    label: 'Father Office Address',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'fatherDesignation',
    label: 'Father Designation',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'fatherOrganization',
    label: 'Father Organization',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'fatherAadharNo',
    label: 'Father Aadhar No',
    type: 'text',
    otherProps: {},
  },

  { name: 'motherName', label: 'Mother Name', otherProps: {}, type: 'text' },
  {
    name: 'motherDob',
    label: 'Mother Date of Birth',
    type: 'date',

    otherProps: {},
  },
  {
    name: 'motherOccupation',
    label: 'Mother Occupation',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'motherQualification',
    label: 'Mother Qualification',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'motherContactNo',
    label: 'Mother Contact No',
    type: 'text',
    otherProps: {},
  },
  { name: 'motherMail', label: 'Mother Mail', otherProps: {}, type: 'text' },
  {
    name: 'motherOfficeContactNo',
    label: 'Mother Office Contact No',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'motherOfficeAddress',
    label: 'Mother Office Address',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'motherDesignation',
    label: 'Mother Designation',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'motherOrganization',
    label: 'Mother Organization',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'motherAnnualIncome',
    label: 'Mother Annual Income',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'motherAadharNo',
    label: 'Mother Aadhar No',
    type: 'text',
    otherProps: {},
  },
];

const allFields = [
  generalFormFields,
  // admissionFormFields,
  documentFields,
  familyFields,
  communicationFields,
];

const RegisterForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <CustomStepperWithFormik
      initialValues={{
        name: '',
        age: '',
        middleName: '',
        dob: null,
        gender: '',
        adharNo: '',
        religion: '',
        familyCast: '',
        castCategory: '',
        motherTongue: '',
        nationality: '',
        birthPlace: '',
        admissionDate: null,
        admissionStandard: '',
        admissionFormNumber: '',
        previousSchool: '',
        admissionQuota: '',
        previousSchoolLeftDate: null,
        previousLCDate: null,
        previousLCNumber: '',
        parentContactNumber: '',
        parentEmail: '',
        studentContactNo: '',
        studentEmail: '',
        whatsAppContactNo: '',
        localAddress: '',
        permanentAddress: '',
        emergencyAddress: '',
        fatherName: '',
        fatherDob: null,
        fatherOccupation: '',
        fatherQualification: '',
        fatherContactNo: '',
        fatherMail: '',
        fatherExStudent: '',
        fatherPassoutYear: '',
        fatherOfficeContactNo: '',
        fatherOfficeAddress: '',
        fatherDesignation: '',
        fatherOrganization: '',
        fatherAadharNo: '',
        motherName: '',
        motherDob: null,
        motherOccupation: '',
        motherQualification: '',
        motherContactNo: '',
        motherMail: '',
        motherOfficeContactNo: '',
        motherOfficeAddress: '',
        motherDesignation: '',
        motherOrganization: '',
        motherAnnualIncome: '',
        motherAadharNo: '',
      }}
      steps={['General', 'Documents', 'Family Information', 'Communication']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={Yup.object({
        name: Yup.string(),
      })}
      handleNext={(isLastStep, values) => {
        if (isLastStep) return;

        setActiveStep(activeStep + 1);
      }}
      renderItem={({ activeStep: step, formik }: any) => (
        <Box display="flex" gap={2}>
          {step === 0 && (
            <Box flexGrow={1} display="flex" alignItems="center">
              <UploadAvatar
                maxSize={3145728}
                onDrop={(acceptedFiles: File[]) => {
                  const value = acceptedFiles[0];
                  formik.setFieldValue('photo', value);
                }}
                value={formik.values.photo}
                error={formik.touched.photo && Boolean(formik.errors.photo)}
              />
            </Box>
          )}
          <Box p={2} display={step === 1 ? 'block' : 'flex'} flexWrap="wrap" gap={2}>
            {' '}
            {allFields[step].map((field) =>
              field.renderComp ? (
                field.renderComp({ formik, field })
              ) : field.type === 'date' ? (
                <DatePicker
                  label={field.label}
                  name={field.name}
                  value={formik.values[field.name]}
                  format="DD/MM/YYYY"
                  onChange={(newValue) => formik.setFieldValue(field.name, newValue)}
                  sx={{ maxWidth: '200px', width: '100%', ...(field?.sx || {}) }}
                  slotProps={{
                    textField: {
                      placeholder: field.placeholder,
                      size: 'small',
                      helperText: formik.touched[field.name] && formik.errors[field.name],
                      error: formik.touched[field.name] && Boolean(formik.errors[field.name]),
                    },
                  }}
                />
              ) : (
                <TextField
                  key={field.name}
                  type={field.type}
                  size="small"
                  label={field.label}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formik.values[field.name]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                  helperText={formik.touched[field.name] && formik.errors[field.name]}
                  sx={{ maxWidth: '200px', width: '100%', ...(field?.sx || {}) }}
                  {...(field?.otherProps || {})}
                />
              )
            )}
          </Box>
        </Box>
      )}
    />
  );
};

export default RegisterForm;
