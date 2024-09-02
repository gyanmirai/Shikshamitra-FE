import type { SxProps } from '@mui/material';

import * as Yup from 'yup';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  IconButton,
  FormControl,
} from '@mui/material';

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

// const RenderOrganization = (props: any) => {
//   const { data, isLoading } = useQueryAndMutation({
//     type: 'query',
//     currentQueryAndMutation: useGetOrganizationQuery,
//   });
//   const { formik } = props;

//   return (
//     <FormControl sx={{ maxWidth: '200px', width: '100%' }}>
//       <InputLabel id="organization-select-label" size="small">
//         Organization
//       </InputLabel>
//       <Select
//         labelId="organization-select-label"
//         id="organization-select"
//         value={formik.values.organizationName}
//         label="Organization"
//         name="organizationName"
//         disabled={isLoading}
//         size="small"
//         onChange={formik.handleChange}
//       >
//         {isLoading ? (
//           <MenuItem value="">
//             <CircularProgress size={24} />
//           </MenuItem>
//         ) : data?.items?.length ? (
//           data?.items?.map((org: any) => (
//             <MenuItem key={org.id} value={org.id}>
//               {org.name}
//             </MenuItem>
//           ))
//         ) : (
//           <MenuItem value="">
//             <em>No Organization Found</em>
//           </MenuItem>
//         )}
//       </Select>
//     </FormControl>
//   );
// };
// const RenderRole = (props: any) => {
//   const { data, isLoading } = useQueryAndMutation({
//     type: 'query',
//     currentQueryAndMutation: useGetRolesQuery,
//   });
//   const { formik } = props;
//   return (
//     <FormControl sx={{ maxWidth: '200px', width: '100%' }}>
//       <InputLabel id="Roles-select-label" size="small">
//         Roles
//       </InputLabel>
//       <Select
//         labelId="Roles-select-label"
//         id="Roles-select"
//         value={formik.values.role}
//         label="Roles"
//         disabled={isLoading}
//         name="role"
//         size="small"
//         onChange={formik.handleChange}
//       >
//         {isLoading ? (
//           <MenuItem value="">
//             <CircularProgress size={24} />
//           </MenuItem>
//         ) : data?.items?.length ? (
//           data?.items?.map((org: any) => (
//             <MenuItem key={org.id} value={org.id}>
//               {org.name}
//             </MenuItem>
//           ))
//         ) : (
//           <MenuItem value="">
//             <em>No Organization Found</em>
//           </MenuItem>
//         )}
//       </Select>
//     </FormControl>
//   );
// };

const InformationFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Organization Name',
    name: 'organizationName',
    placeholder: 'Enter Organization Name',
    // renderComp: RenderOrganization,
  },
  {
    type: 'text',
    label: 'Code',
    name: 'code',
    placeholder: 'Enter Code',
  },
  {
    type: 'text',
    label: 'Last Name',
    name: 'lastName',
    placeholder: 'Enter Last Name',
  },
  {
    type: 'text',
    label: 'First Name',
    name: 'firstName',
    placeholder: 'Enter First Name',
  },
  {
    type: 'text',
    label: 'Middle Name',
    name: 'middleName',
    placeholder: 'Enter Middle Name',
  },
  {
    type: 'text',
    label: 'Short Name',
    name: 'shortName',
    placeholder: 'Enter Short Name',
  },
  {
    type: 'text',
    label: 'Status',
    name: 'status',
    placeholder: 'Enter Status',
  },
  {
    type: 'date',
    label: 'DOB',
    name: 'dob',
    placeholder: 'Select Date of Birth',
  },
  {
    type: 'text',
    label: 'Family Cast',
    name: 'familyCast',
    placeholder: 'Enter Family Cast',
  },
  {
    type: 'text',
    label: 'Cast Category',
    name: 'castCategory',
    placeholder: 'Enter Cast Category',
  },
  {
    type: 'select',
    label: 'Gender',
    name: 'gender',
    placeholder: 'Select Gender',
    renderComp: (props) => (
      <FormControl sx={{ maxWidth: '200px', width: '100%' }}>
        <InputLabel id="dropdown-label" size="small">
          Gender
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.value}
          onChange={props.onChange}
          size="small"
          label="Gender"
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>
    ),
  },
  {
    type: 'text',
    label: 'Religion',
    name: 'religion',
    placeholder: 'Enter Religion',
  },
  {
    type: 'text',
    label: 'Marital Status',
    name: 'maritalStatus',
    placeholder: 'Enter Marital Status',
  },
  {
    type: 'text',
    label: 'Blood Group',
    name: 'bloodGroup',
    placeholder: 'Enter Blood Group',
  },
  {
    type: 'text',
    label: 'Mobile No.',
    name: 'mobileNo',
    placeholder: 'Enter Mobile No.',
  },
  {
    type: 'text',
    label: 'Email',
    name: 'email',
    placeholder: 'Enter Email',
  },

  {
    type: 'text',
    label: 'Department',
    name: 'department',
    placeholder: 'Enter Department',
  },
  {
    type: 'text',
    label: 'Designation',
    name: 'designation',
    placeholder: 'Enter Designation',
  },
  {
    type: 'date',
    label: 'Date of Joining',
    name: 'dateOfJoining',
    placeholder: 'Select Date of Joining',
  },

  {
    type: 'select',
    label: 'Employee Group',
    name: 'employeeGroup',
    placeholder: 'Select Employee Group',
    renderComp: (props) => (
      <FormControl sx={{ maxWidth: '200px', width: '100%' }}>
        <InputLabel id="dropdown-label" size="small">
          Employee Group
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.value}
          label="Employee Group"
          onChange={props.onChange}
          size="small"
        >
          <MenuItem value="option1">Option 1</MenuItem>
          <MenuItem value="option2">Option 2</MenuItem>
          <MenuItem value="option3">Option 3</MenuItem>
        </Select>
      </FormControl>
    ),
  },
  {
    type: 'text',
    label: 'Qualification',
    name: 'qualification',
    placeholder: 'Enter Qualification',
  },

  {
    type: 'text',
    label: 'Role',
    name: 'role',
    placeholder: 'Enter Role',
    // renderComp: RenderRole,
  },
  {
    type: 'text',
    label: 'Identification Mark 1',
    name: 'identificationMark1',
    placeholder: 'Enter Identification Mark 1',
  },
  {
    type: 'text',
    label: 'Identification Mark 2',
    name: 'identificationMark2',
    placeholder: 'Enter Identification Mark 2',
  },
  {
    type: 'text',
    label: 'Identification Mark 3',
    name: 'identificationMark3',
    placeholder: 'Enter Identification Mark 3',
  },
  {
    type: 'text',
    label: 'Address',
    name: 'address',
    placeholder: 'Enter Address',
    otherProps: {
      multiline: true,
      rows: 3,
    },
  },
];

const PersonalFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Father Name',
    name: 'fatherName',
    placeholder: 'Enter Father Name',
  },
  {
    type: 'text',
    label: 'Father Occupation',
    name: 'fatherOccupation',
    placeholder: 'Enter Father Occupation',
  },
  {
    type: 'text',
    label: 'Father Contact No.',
    name: 'fatherContactNo',
    placeholder: 'Enter Father Contact No.',
  },
  {
    type: 'text',
    label: 'Father Address',
    name: 'fatherAddress',
    placeholder: 'Enter Father Address',
  },
  {
    type: 'text',
    label: 'Mother Name',
    name: 'motherName',
    placeholder: 'Enter Mother Name',
  },
  {
    type: 'text',
    label: 'Mother Occupation',
    name: 'motherOccupation',
    placeholder: 'Enter Mother Occupation',
  },
  {
    type: 'text',
    label: 'Mother Contact No.',
    name: 'motherContactNo',
    placeholder: 'Enter Mother Contact No.',
  },
  {
    type: 'text',
    label: 'Mother Address',
    name: 'motherAddress',
    placeholder: 'Enter Mother Address',
  },
  {
    type: 'text',
    label: 'Spouse Name',
    name: 'spouseName',
    placeholder: 'Enter Spouse Name',
  },
  {
    type: 'text',
    label: 'Spouse Occupation',
    name: 'spouseOccupation',
    placeholder: 'Enter Spouse Occupation',
  },
  {
    type: 'text',
    label: 'Spouse Contact No.',
    name: 'spouseContactNo',
    placeholder: 'Enter Spouse Contact No.',
  },
  {
    type: 'text',
    label: 'Spouse Address',
    name: 'spouseAddress',
    placeholder: 'Enter Spouse Address',
  },
];
const CertificateFields: FieldsType[] = [
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
            { name: 'Certificate 1', status: 'Pending', upload: 'Upload', view: 'View' },
            { name: 'Certificate 2', status: 'Uploaded', upload: 'Upload', view: 'View' },
            { name: 'Certificate 3', status: 'Pending', upload: 'Upload', view: 'View' },
          ]}
        />
      );
    },
  },
];
export const WorkExperienceFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Organization Name',
    name: 'organizationName',
    placeholder: 'Enter Organization Name',
  },
  {
    type: 'text',
    label: 'Organization Address',
    name: 'organizationAddress',
    placeholder: 'Enter Organization Address',
  },
  {
    type: 'date',
    label: 'From Date',
    name: 'fromDate',
    placeholder: 'Select From Date',
  },
  {
    type: 'date',
    label: 'To Date',
    name: 'toDate',
    placeholder: 'Select To Date',
  },
  {
    type: 'text',
    label: 'Department',
    name: 'department',
    placeholder: 'Enter Department',
  },
  {
    type: 'text',
    label: 'Designation',
    name: 'designation',
    placeholder: 'Enter Designation',
  },
  {
    type: 'textarea',
    label: 'Responsibilities',
    name: 'responsibilities',
    placeholder: 'Enter Responsibilities',
  },
  {
    type: 'text',
    label: 'References',
    name: 'references',
    placeholder: 'Enter References',
  },
];
export const PayrollFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Bank Name',
    name: 'bankName',
    placeholder: 'Enter Bank Name',
  },
  {
    type: 'text',
    label: 'Branch Name',
    name: 'branchName',
    placeholder: 'Enter Branch Name',
  },
  {
    type: 'text',
    label: 'Account Holder Name',
    name: 'accountHolderName',
    placeholder: 'Enter Account Holder Name',
  },
  {
    type: 'text',
    label: 'Account Number',
    name: 'accountNumber',
    placeholder: 'Enter Account Number',
  },
  {
    type: 'text',
    label: 'IFSC Code',
    name: 'ifscCode',
    placeholder: 'Enter IFSC Code',
  },
  {
    type: 'dropdown',
    label: 'PF Type',
    name: 'pfType',
    placeholder: 'Select PF Type',
  },
  {
    type: 'text',
    label: 'EPF Number',
    name: 'epfNumber',
    placeholder: 'Enter EPF Number',
  },
  {
    type: 'text',
    label: 'UAN Number',
    name: 'uanNumber',
    placeholder: 'Enter UAN Number',
  },
  {
    type: 'text',
    label: 'Basic Salary',
    name: 'basicSalary',
    placeholder: 'Enter Basic Salary',
  },
  {
    type: 'text',
    label: 'Punch Id',
    name: 'punchId',
    placeholder: 'Enter Punch Id',
  },
  {
    type: 'text',
    label: 'Shift Name',
    name: 'shiftName',
    placeholder: 'Enter Shift Name',
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
      initialValues={{
        organizationName: '',
        code: '',
        lastName: '',
        firstName: '',
        middleName: '',
        shortName: '',
        status: '',
        dob: null,
        familyCast: '',
        castCategory: '',
        gender: '',
        religion: '',
        maritalStatus: '',
        bloodGroup: '',
        mobileNo: '',
        email: '',
        address: '',
        department: '',
        designation: '',
        dateOfJoining: null,
        photo: '',
        employeeGroup: '',
        qualification: '',
        userId: '',
        password: '',
        role: '',
        identificationMark1: '',
        identificationMark2: '',
        identificationMark3: '',
        documents: [
          {
            name: 'root',
            type: 'folder',
            children: [],
          },
        ],
        fatherName: '',
        fatherOccupation: '',
        fatherContactNo: '',
        fatherAddress: '',
        motherName: '',
        motherOccupation: '',
        motherContactNo: '',
        motherAddress: '',
        spouseName: '',
        spouseOccupation: '',
        spouseContactNo: '',
        spouseAddress: '',
        aadharCard: '',
        panCard: '',
        degreeCertificates: '',
        marksheet: '',
        cheque: '',
        expOrganizationName: '',
        expOrganizationAddress: '',
        expFromDate: null,
        expToDate: null,
        expDepartment: '',
        expDesignation: '',
        expResponsibilities: '',
        expReferences: '',
        bankName: '',
        branchName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        pfType: '',
        epfNumber: '',
        uanNumber: '',
        basicSalary: '',
        punchId: '',
        shiftName: '',
      }}
      steps={[
        'Personal Information',
        'Family Information',
        'Documents',
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
          <Box p={2} display={step === 2 ? 'block' : 'flex'} flexWrap="wrap" gap={2}>
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

export default EmployeeFrom;
