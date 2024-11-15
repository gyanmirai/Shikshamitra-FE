import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Slide,
  Select,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  IconButton,
  FormControl,
  CircularProgress,
} from '@mui/material';

import { fileToBase64 } from 'src/utils/file-to-base64';
import { convertBase64Format } from 'src/utils/base64Formate';

import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { useAddUserMutation } from 'src/redux/user/userApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetOrganizationQuery } from 'src/redux/oraganization/oraganization';
import { useAddEmployeeMutation, useUpdateEmployeeMutation } from 'src/redux/employee/employeeApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { UploadAvatar } from 'src/components/upload';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import WorkExperiences from './work-experiance';

interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  sx?: SxProps<Theme>;
  otherProps?: Record<string, any>;
  renderComp?: (props: any) => React.ReactNode;
}

const RenderOrganization = (props: any) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationQuery,
  });
  const { formik } = props;

  return (
    <FormControl sx={{ maxWidth: '200px', width: '100%' }}>
      <InputLabel id="organization-select-label" size="small">
        Organization
      </InputLabel>
      <Select
        labelId="organization-select-label"
        id="organization-select"
        value={formik.values.organizationName}
        label="Organization"
        name="organizationName"
        disabled={isLoading}
        size="small"
        onChange={formik.handleChange}
      >
        {isLoading ? (
          <MenuItem value="">
            <CircularProgress size={24} />
          </MenuItem>
        ) : data?.items?.length ? (
          data?.items?.map((org: any) => (
            <MenuItem key={org.id} value={org.id}>
              {org.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem value="">
            <em>No Organization Found</em>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};
const RenderRole = (props: any) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  const { formik } = props;
  return (
    <FormControl fullWidth>
      <InputLabel id="Roles-select-label" size="small">
        Roles
      </InputLabel>
      <Select
        labelId="Roles-select-label"
        id="Roles-select"
        value={formik.values.role}
        label="Roles"
        disabled={isLoading}
        name="role"
        size="small"
        onChange={formik.handleChange}
      >
        {isLoading ? (
          <MenuItem value="">
            <CircularProgress size={24} />
          </MenuItem>
        ) : data?.items?.length ? (
          data?.items?.map((org: any) => (
            <MenuItem key={org.id} value={org.id}>
              {org.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem value="">
            <em>No Roles Found</em>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

const RenderPfRules = (props: any) => {
  const a = null;
  return (
    <CustomSelect
      options={[]}
      label="PF Rule"
      value=""
      onChange={() => {}}
      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
    />
  );
};

const InformationFields: FieldsType[] = [
  // {
  //   type: 'text',
  //   label: 'Organization Name',
  //   name: 'organizationName',
  //   placeholder: 'Enter Organization Name',
  //   renderComp: (props) => <RenderOrganization {...props} />,
  // },
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
      <FormControl fullWidth>
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
    renderComp(props) {
      const { formik } = props;

      return (
        <PhoneInput
          name="mobileNo"
          value={formik.values.mobileNo}
          onChange={(value) => {
            console.log(value, 'value====>');
            formik.setFieldValue('mobileNo', value);
          }}
          placeholder="Enter Mobile No."
          error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
        />
      );
    },
  },
  {
    type: 'text',
    label: 'Email',
    name: 'email',
    placeholder: 'Enter Email',
    otherProps: {
      InputProps: {
        startAdornment: (
          <>
            <Iconify icon="mdi-light:email" />{' '}
            <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
          </>
        ),
      },
    },
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
      <FormControl fullWidth>
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
          <MenuItem value="teaching">Teaching</MenuItem>
          <MenuItem value="nonTeaching">Non Teaching</MenuItem>
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
    renderComp: (props) => <RenderRole {...props} />,
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
    label: 'State',
    name: 'state',
    placeholder: 'State',
  },
  {
    type: 'text',
    label: 'City',
    name: 'city',
    placeholder: 'Enter District',
  },
  { type: 'text', label: 'Pincode', name: 'pincode', placeholder: 'Enter Pincode' },

  // {
  //   type: 'text',
  //   label: 'Address',
  //   name: 'address',
  //   placeholder: 'Enter Address',
  //   otherProps: {
  //     multiline: true,
  //     rows: 3,
  //   },
  // },
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
    renderComp(props) {
      const { formik } = props;

      return (
        <PhoneInput
          name="fatherContactNo"
          value={formik.values.fatherContactNo}
          onChange={(value) => {
            console.log(value, 'value====>');
            formik.setFieldValue('fatherContactNo', value);
          }}
          placeholder="Enter Father Contact No."
          error={formik.touched.fatherContactNo && Boolean(formik.errors.fatherContactNo)}
        />
      );
    },
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
    renderComp(props) {
      const { formik } = props;

      return (
        <PhoneInput
          name="motherContactNo"
          value={formik.values.motherContactNo}
          onChange={(value) => {
            console.log(value, 'value====>');
            formik.setFieldValue('motherContactNo', value);
          }}
          placeholder="Enter Mother Contact No."
          error={formik.touched.motherContactNo && Boolean(formik.errors.motherContactNo)}
        />
      );
    },
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
    renderComp(props) {
      const { formik } = props;

      return (
        <PhoneInput
          name="spouseContactNo"
          value={formik.values.spouseContactNo}
          onChange={(value) => {
            console.log(value, 'value====>');
            formik.setFieldValue('spouseContactNo', value);
          }}
          placeholder="Enter Spouse Contact No."
          error={formik.touched.spouseContactNo && Boolean(formik.errors.spouseContactNo)}
        />
      );
    },
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
    type: '',
    label: 'Company Name',
    name: 'companyName',
    renderComp: (props) => <WorkExperiences {...props} />,
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
    type: 'dropdown',
    label: 'PF Rule',
    name: 'pfRule',
    placeholder: 'Select PF Rule',
    renderComp(props) {
      return <RenderPfRules props={props} />;
    },
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
  {
    type: 'text',
    label: 'TDS Percentage',
    name: 'tdsPercentage',
    placeholder: 'Enter TDS Percentage',
  },
  {
    type: 'text',
    label: 'TDS Amount',
    name: 'tdsAmount',
    placeholder: 'Enter TDS Amount',
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
  // PerformanceAndDevelopmentFields,
];

const steps = [
  'Personal Information',
  'Family Information',
  'Documents',
  'Work Experience',
  'Payroll',
  // 'Performance and Development',
];

const EmployeeFrom = ({ editData }: any) => {
  const [activeStep, setActiveStep] = useState(0);
  const [addEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEmployeeMutation,
  });
  const [addUser] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddUserMutation,
  });

  const [updateEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeMutation,
  });
  return (
    <CustomStepperWithFormik
      initialValues={{
        // organizationName: editData ? editData.organizationName : '',
        photo: editData
          ? editData.profilePicture
            ? convertBase64Format(editData.profilePicture)
            : ''
          : '',
        code: editData ? editData.code : '',
        lastName: editData ? editData.lastName : '',
        firstName: editData ? editData.firstName : '',
        middleName: editData ? editData.middleName : '',
        shortName: editData ? editData.shortName : '',
        status: editData ? editData.status : '',
        dob: editData ? dayjs(editData.dateOfBirth, 'YYYY-MM-DD') : null,
        familyCast: editData ? editData.familyCast : '',
        castCategory: editData ? editData.castCategory : '',
        gender: editData ? editData.gender : '',
        religion: editData ? editData.religion : '',
        maritalStatus: editData ? editData.maritalStatus : '',
        bloodGroup: editData ? editData.bloodGroup : '',
        mobileNo: editData ? editData.mobileNo : '',
        email: editData ? editData.email : '',
        department: editData ? editData.department : '',
        designation: editData ? editData.designation : '',
        dateOfJoining: editData ? dayjs(editData.dateOfJoining, 'YYYY-MM-DD') : null,
        employeeGroup: editData ? editData.employeeGroup : '',
        qualification: editData ? editData.qualification : '',
        role: editData ? editData.role : '',
        identificationMark1: editData ? editData.identificationMark1 : '',
        identificationMark2: editData ? editData.identificationMark2 : '',
        identificationMark3: editData ? editData.identificationMark3 : '',
        state: editData ? editData?.state : '',
        city: editData ? editData?.city : '',
        pinCode: editData ? editData?.pinCode : '',
        // address: editData ? editData.address : '',
        // ===============================================================================

        userId: editData ? editData.userId : '',

        // ================================================================================
        fatherName: editData ? editData.fatherDetails.name : '',
        fatherOccupation: editData ? editData.fatherDetails.occupation : '',
        fatherContactNo: editData ? editData.fatherDetails.contactNo : '',
        fatherAddress: editData ? editData.fatherDetails.address : '',
        motherName: editData ? editData.motherDetails.name : '',
        motherOccupation: editData ? editData.motherDetails.occupation : '',
        motherContactNo: editData ? editData.motherDetails.contactNo : '',
        motherAddress: editData ? editData.motherDetails.address : '',
        spouseName: editData ? editData.spouseDetails.name : '',
        spouseOccupation: editData ? editData.spouseDetails.occupation : '',
        spouseContactNo: editData ? editData.spouseDetails.contactNo : '',
        spouseAddress: editData ? editData.spouseDetails.address : '',
        // ===================================================================================

        documents: [],
        // ===================================================================================

        // aadharCard:editData ? editData.aadharCard : '',
        // panCard: '',
        // degreeCertificates: '',
        // marksheet: '',
        // cheque: '',
        // ======================================================================================
        experiences: editData
          ? editData.workExperiences.map((i: any) => ({
              ...i,
              fromDate: dayjs(i.fromDate, 'YYYY-MM-DD'),
              toDate: dayjs(i.toDate, 'YYYY-MM-DD'),
            }))
          : [],
        // ========================================================================================
        bankName: editData ? editData.bankDetails.bankName : '',
        branchName: editData ? editData.bankDetails.branchName : '',
        accountHolderName: editData ? editData.bankDetails.accountHolderName : '',
        accountNumber: editData ? editData.bankDetails.accountNumber : '',
        ifscCode: editData ? editData.bankDetails.ifscCode : '',
        pfType: '',
        epfNumber: '',
        uanNumber: '',
        basicSalary: '',
        punchId: '',
        shiftName: '',
      }}
      steps={steps}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={Yup.object({
        name: Yup.string(),
      })}
      handleNext={async (isLastStep, values) => {
        if (editData) {
          updateEmployee({
            id: editData.id,
            body: {
              userId: editData.userId,
              organizationName: values.organizationName,
              code: values.code,
              lastName: values.lastName,
              firstName: values.firstName,
              middleName: values.middleName,
              shortName: values.shortName,
              status: values.status,
              dateOfBirth: values.dob.format('YYYY-MM-DD'),
              familyCast: values.familyCast,
              castType: 0,
              gender: 0,
              religion: values.religion,
              maritalStatus: 0,
              bloodGroup: values.bloodGroup,
              mobileNo: values.mobileNo,
              email: values.email,
              address: values.address,
              department: values.department,
              designation: values.designation,
              dateOfJoining: values.dateOfJoining.format('YYYY-MM-DD'),

              employeeGroup: values.employeeGroup,
              qualification: values.qualification,
              role: values.role,
              identificationMark1: values.identificationMark1,
              identificationMark2: values.identificationMark2,
              identificationMark3: values.identificationMark3,
              fatherDetails: {
                name: values.fatherName,
                occupation: values.fatherOccupation,
                contactNo: values.fatherContactNo,
                address: values.fatherAddress,
              },
              motherDetails: {
                name: values.motherName,
                occupation: values.motherOccupation,
                contactNo: values.motherContactNo,
                address: values.motherAddress,
              },
              spouseDetails: {
                name: values.spouseName,
                occupation: values.spouseOccupation,
                contactNo: values.spouseContactNo,
                address: values.spouseAddress,
              },
              bankDetails: {
                bankName: values.bankName,
                branchName: values.branchName,
                accountHolderName: values.accountHolderName,
                accountNumber: values.accountNumber,
                ifscCode: values.ifscCode,
              },
              workExperiences: values.experiences.map((i: any) => ({
                ...i,
                fromDate: i.fromDate.format('YYYY-MM-DD'),
                toDate: i.toDate.format('YYYY-MM-DD'),
                employeeId: editData.employeeId,
              })),
              profilePicture: values.photo.replace(/^data:\w+\/[\w-]+;base64,/, ''),
            },
          });
        } else if (isLastStep) {
          try {
            const res = await addUser({
              userName: `${values.firstName}${values.lastName}`,
              name: values.firstName,
              surname: values.lastName,
              email: values.email,
              phoneNumber: values.mobileNo,
              isActive: true,
              lockoutEnabled: true,
              roleNames: [],
              password: 'Test@123',
            });
            await addEmployee({
              userId: res.data.id,
              organizationName: values.organizationName,
              code: values.code,
              lastName: values.lastName,
              firstName: values.firstName,
              middleName: values.middleName,
              shortName: values.shortName,
              status: values.status,
              dateOfBirth: values.dob.format('YYYY-MM-DD'),
              familyCast: values.familyCast,
              castType: 0,
              gender: 0,
              religion: values.religion,
              maritalStatus: 0,
              bloodGroup: values.bloodGroup,
              mobileNo: values.mobileNo,
              email: values.email,
              address: values.address,
              department: values.department,
              designation: values.designation,
              dateOfJoining: values.dateOfJoining.format('YYYY-MM-DD'),

              employeeGroup: values.employeeGroup,
              qualification: values.qualification,
              role: values.role,
              identificationMark1: values.identificationMark1,
              identificationMark2: values.identificationMark2,
              identificationMark3: values.identificationMark3,
              fatherDetails: {
                name: values.fatherName,
                occupation: values.fatherOccupation,
                contactNo: values.fatherContactNo,
                address: values.fatherAddress,
              },
              motherDetails: {
                name: values.motherName,
                occupation: values.motherOccupation,
                contactNo: values.motherContactNo,
                address: values.motherAddress,
              },
              spouseDetails: {
                name: values.spouseName,
                occupation: values.spouseOccupation,
                contactNo: values.spouseContactNo,
                address: values.spouseAddress,
              },
              bankDetails: {
                bankName: values.bankName,
                branchName: values.branchName,
                accountHolderName: values.accountHolderName,
                accountNumber: values.accountNumber,
                ifscCode: values.ifscCode,
              },
              workExperiences: values.experiences.map((i: any) => ({
                ...i,
                fromDate: i.fromDate.format('YYYY-MM-DD'),
                toDate: i.toDate.format('YYYY-MM-DD'),
                employeeId: res.data.id,
              })),
              profilePicture: values.photo.replace(/^data:\w+\/[\w-]+;base64,/, ''),
            });
          } catch (error) {
            console.log(error);
          }
          return;
        }

        setActiveStep(activeStep + 1);
      }}
      renderItem={({ activeStep: step, formik }: any) => <FormSlider step={step} formik={formik} />}
    />
  );
};

export default EmployeeFrom;

const FormSlider = ({ step, formik }: { step: number; formik: any }) => {
  const containerRef = React.useRef<HTMLElement>(null);
  return (
    <Box ref={containerRef} sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
      {steps.map(
        (_, index) =>
          index === step && (
            <Slide
              in={index === step}
              container={containerRef.current}
              direction="left"
              key={index}
            >
              <Box display="flex" gap={2}>
                {step === 0 && (
                  <Box flexGrow={1} display="flex" alignItems="center">
                    <UploadAvatar
                      maxSize={3145728}
                      onDrop={async (acceptedFiles: File[]) => {
                        const value = acceptedFiles[0];
                        const base64 = await fileToBase64(value);
                        formik.setFieldValue('photo', base64);
                      }}
                      value={formik.values.photo}
                      error={formik.touched.photo && Boolean(formik.errors.photo)}
                    />
                  </Box>
                )}
                <Box p={2} display={step === 2 ? 'block' : 'flex'} flexWrap="wrap" gap={2}>
                  <Grid container spacing={2}>
                    {' '}
                    {allFields[step].map((field) => (
                      <Grid
                        item
                        xs={[2, 3].includes(step) ? 12 : 4}
                        md={[2, 3].includes(step) ? 12 : 4}
                        key={field.name}
                      >
                        {field.renderComp ? (
                          field.renderComp({ formik, field })
                        ) : field.type === 'date' ? (
                          <DatePicker
                            label={field.label}
                            name={field.name}
                            value={formik.values[field.name]}
                            format="DD/MM/YYYY"
                            onChange={(newValue) => formik.setFieldValue(field.name, newValue)}
                            // sx={{ ...(field?.sx || {}) }}
                            sx={{
                              ...((field?.sx as any) || {}),
                            }}
                            slotProps={{
                              textField: {
                                placeholder: field.placeholder,
                                fullWidth: true,
                                size: 'small',
                                helperText: formik.touched[field.name] && formik.errors[field.name],
                                error:
                                  formik.touched[field.name] && Boolean(formik.errors[field.name]),
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
                            fullWidth
                            sx={{ ...(field?.sx || {}) }}
                            {...(field?.otherProps || {})}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </Slide>
          )
      )}
    </Box>
  );
};
