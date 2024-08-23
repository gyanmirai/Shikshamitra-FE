import type { SxProps } from '@mui/material';

import * as Yup from 'yup';
import React, { useState } from 'react';

import { Box, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import { CustomStepperWithFormik } from 'src/components/custom-stepper';

interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder: string;
  sx?: SxProps;
  otherProps?: Record<string, any>;
  renderComp?: (props: any) => React.ReactNode;
}

const InformationFields: FieldsType[] = [
  {
    type: 'text',
    label: 'First name',
    name: 'firstName',
    placeholder: 'Enter First name',
  },
  {
    type: 'text',
    label: 'Middle name',
    name: 'middleName',
    placeholder: 'Enter Middle name',
  },
  {
    type: 'text',
    label: 'Last name',
    name: 'lastName',
    placeholder: 'Enter Last name',
  },
  {
    type: 'text',
    label: 'Email',
    name: 'email',
    placeholder: 'Enter Email',
  },
  {
    type: 'text',
    label: 'Mobile',
    name: 'mobile',
    placeholder: 'Enter Mobile',
  },
  {
    type: 'date',
    label: 'Date of Birth',
    name: 'dateOfBirth',
    placeholder: 'Enter Date of Birth',
  },
  {
    type: 'text',
    label: 'Gender',
    name: 'gender',
    placeholder: 'Enter Gender',
  },
];

const PersonalFields: FieldsType[] = [
  {
    type: 'text',
    label: "Mother's Name",
    name: 'motherName',
    placeholder: "Enter Mother's Name",
  },
  {
    type: 'text',
    label: "Mother's Occupation",
    name: 'motherOccupation',
    placeholder: "Enter Mother's Occupation",
  },
  {
    type: 'text',
    label: "Father's Name",
    name: 'fatherName',
    placeholder: "Enter Father's Name",
  },
  {
    type: 'text',
    label: "Father's Occupation",
    name: 'fatherOccupation',
    placeholder: "Enter Father's Occupation",
  },
  {
    type: 'text',
    label: "Spouse's Name",
    name: 'spouseName',
    placeholder: "Enter Spouse's Name",
  },
  {
    type: 'text',
    label: "Spouse's Occupation",
    name: 'spouseOccupation',
    placeholder: "Enter Spouse's Occupation",
  },
  {
    type: 'text',
    label: "Spouse's Mobile",
    name: 'spouseMobile',
    placeholder: "Enter Spouse's Mobile",
  },
];
const CertificateFields: FieldsType[] = [];
const WorkExperienceFields: FieldsType[] = [
  {
    type: 'text',
    label: 'School Name',
    name: 'schoolName',
    placeholder: 'Enter School Name',
  },
  {
    type: 'text',
    label: 'Designation',
    name: 'designation',
    placeholder: 'Enter Designation',
  },
  {
    type: 'date',
    label: 'From Date',
    name: 'fromDate',
    placeholder: 'Enter From Date',
  },
  {
    type: 'date',
    label: 'To Date',
    name: 'toDate',
    placeholder: 'Enter To Date',
  },
  {
    type: 'text',
    label: 'Reason for Leaving',
    name: 'reasonForLeaving',
    placeholder: 'Enter Reason for Leaving',
  },
  {
    type: 'number',
    label: 'Years of Experience',
    name: 'yearsOfExperience',
    placeholder: 'Enter Years of Experience',
  },
];
const PayrollFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Bank Name',
    name: 'bankName',
    placeholder: 'Enter Bank Name',
  },
  {
    type: 'text',
    label: 'Branch',
    name: 'branch',
    placeholder: 'Enter Branch',
  },
  {
    type: 'text',
    label: 'IFSC Number',
    name: 'ifscNumber',
    placeholder: 'Enter IFSC Number',
  },
  {
    type: 'text',
    label: 'PAN Number',
    name: 'panNumber',
    placeholder: 'Enter PAN Number',
  },
  {
    type: 'text',
    label: 'EPF No.',
    name: 'epfNumber',
    placeholder: 'Enter EPF Number',
  },
  {
    type: 'number',
    label: 'Basic Salary',
    name: 'basicSalary',
    placeholder: 'Enter Basic Salary',
  },
  {
    type: 'number',
    label: 'Net Salary',
    name: 'netSalary',
    placeholder: 'Enter Net Salary',
  },
];
const PerformanceAndDevelopmentFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Performance Rating',
    name: 'performanceRating',
    placeholder: 'Enter Performance Rating',
  },
  {
    type: 'text',
    label: 'Goals Achieved',
    name: 'goalsAchieved',
    placeholder: 'Enter Goals Achieved',
  },
  {
    type: 'text',
    label: 'Training Completed',
    name: 'trainingCompleted',
    placeholder: 'Enter Training Completed',
  },
  {
    type: 'text',
    label: 'Research Projects',
    name: 'researchProjects',
    placeholder: 'Enter Research Projects',
  },
  {
    type: 'textarea',
    label: 'Additional Training/Research',
    name: 'additionalTrainingResearch',
    placeholder: 'Enter Additional Training or Research Information',
  },
  {
    type: 'text',
    label: 'Skills Developed',
    name: 'skillsDeveloped',
    placeholder: 'Enter Skills Developed',
  },
  {
    type: 'date',
    label: 'Last Review Date',
    name: 'lastReviewDate',
    placeholder: 'Select Last Review Date',
  },
];

const allFields: FieldsType[][] = [
  InformationFields,
  PersonalFields,
  CertificateFields,
  WorkExperienceFields,
  PayrollFields,
  PerformanceAndDevelopmentFields,
];

const EmployeeFrom = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <CustomStepperWithFormik
      initialValues={{}}
      steps={[
        'Information',
        'Personal',
        'Certificate',
        'Work Experience',
        'Payroll',
        'Performance and Development',
      ]}
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
        <Box p={2} display="flex" flexWrap="wrap" gap={2}>
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
                // fullWidth
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
      )}
    />
  );
};

export default EmployeeFrom;
