import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import {
  Box,
  Grid,
  Stack,
  Select,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { GenderType, GenderTypeArray } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { MaritalStatusType, MaritalStatusTypeArray } from 'src/enums/marriatal-status';
import { EmployeeStatusType, EmployeeStatusTypeArray } from 'src/enums/employee-status-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import WorkExperiences from './work-experiance';

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

interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  sx?: SxProps<Theme>;
  otherProps?: Record<string, any>;
  renderComp?: (props: any) => React.ReactNode;
}

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
    renderComp: (props) => (
      <FormControl fullWidth>
        <InputLabel id="dropdown-label" size="small">
          Status
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.formik.values.status}
          onChange={props.formik.handleChange}
          size="small"
          label="Status"
          name="status"
        >
          {EmployeeStatusTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {EmployeeStatusType[index]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ),
  },
  {
    type: 'text',
    label: 'Subject',
    name: 'subject',
    placeholder: 'Enter Subject',
    renderComp(props) {
      return (
        <CustomSelect
          options={[]}
          label="Subject"
          multiple
          onChange={(val) => props.formik.setFieldValue('subject', val)}
          value={props.formik.values.subject}
          formControlProps={{
            fullWidth: true,
            sx: {
              maxWidth: 'unset',
            },
          }}
        />
      );
    },
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
    renderComp: (props) => (
      <FormControl fullWidth>
        <InputLabel id="dropdown-label" size="small">
          Cast Category
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.formik.values.castCategory}
          onChange={props.formik.handleChange}
          size="small"
          label="Cast Category"
          name="castCategory"
        >
          {EmployeeCastTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {EmployeeCastType[index]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ),
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
          value={props.formik.values.gender}
          onChange={props.formik.handleChange}
          size="small"
          label="Gender"
          name="gender"
        >
          {GenderTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {GenderType[index]}
            </MenuItem>
          ))}
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
    renderComp: (props) => (
      <FormControl fullWidth>
        <InputLabel id="dropdown-label" size="small">
          Marital Status
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.formik.values.maritalStatus}
          onChange={props.formik.handleChange}
          size="small"
          label="Marital Status"
          name="maritalStatus"
        >
          {MaritalStatusTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {MaritalStatusType[index]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ),
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
          value={props.formik.values.employeeGroup}
          label="Employee Group"
          name="employeeGroup"
          onChange={props.formik.handleChange}
          size="small"
        >
          <MenuItem value="teaching">Teaching</MenuItem>
          <MenuItem value="nonTeaching">Non Teaching</MenuItem>
        </Select>
      </FormControl>
    ),
    // renderComp: (props) => (
    //   <FormControl fullWidth>
    //     <InputLabel id="dropdown-label" size="small">
    //       Employee Group
    //     </InputLabel>
    //     <Select
    //       labelId="dropdown-label"
    //       id="dropdown"
    //       label="Employee Group"
    //       value={props.formik.values.employeeGroup}
    //       onChange={props.formik.handleChange}
    //       size="small"
    //       name="employeeGroup"
    //     >
    //       {EmployeeGroupTypeArray.map((i, index) => (
    //         <MenuItem key={i} value={index}>
    //           {EmployeeGroupType[index]}
    //         </MenuItem>
    //       ))}
    //     </Select>
    //   </FormControl>
    // ),
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
  {
    type: 'text',
    label: 'Pincode',
    name: 'pincode',
    placeholder: 'Enter Pincode',
    otherProps: {
      type: 'number',
    },
  },

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

// const FamilyFields: FieldsType[] = [
//   {
//     type: 'text',
//     label: 'Father Name',
//     name: 'fatherName',
//     placeholder: 'Enter Father Name',
//   },
//   {
//     type: 'text',
//     label: 'Father Occupation',
//     name: 'fatherOccupation',
//     placeholder: 'Enter Father Occupation',
//   },
//   {
//     type: 'text',
//     label: 'Father Contact No.',
//     name: 'fatherContactNo',
//     placeholder: 'Enter Father Contact No.',
//     renderComp(props) {
//       const { formik } = props;

//       return (
//         <PhoneInput
//           name="fatherContactNo"
//           value={formik.values.fatherContactNo}
//           onChange={(value) => {
//             console.log(value, 'value====>');
//             formik.setFieldValue('fatherContactNo', value);
//           }}
//           placeholder="Enter Father Contact No."
//           error={formik.touched.fatherContactNo && Boolean(formik.errors.fatherContactNo)}
//         />
//       );
//     },
//   },
//   {
//     type: 'text',
//     label: 'Father Address',
//     name: 'fatherAddress',
//     placeholder: 'Enter Father Address',
//   },
//   {
//     type: 'text',
//     label: 'Mother Name',
//     name: 'motherName',
//     placeholder: 'Enter Mother Name',
//   },
//   {
//     type: 'text',
//     label: 'Mother Occupation',
//     name: 'motherOccupation',
//     placeholder: 'Enter Mother Occupation',
//   },
//   {
//     type: 'text',
//     label: 'Mother Contact No.',
//     name: 'motherContactNo',
//     placeholder: 'Enter Mother Contact No.',
//     renderComp(props) {
//       const { formik } = props;

//       return (
//         <PhoneInput
//           name="motherContactNo"
//           value={formik.values.motherContactNo}
//           onChange={(value) => {
//             console.log(value, 'value====>');
//             formik.setFieldValue('motherContactNo', value);
//           }}
//           placeholder="Enter Mother Contact No."
//           error={formik.touched.motherContactNo && Boolean(formik.errors.motherContactNo)}
//         />
//       );
//     },
//   },
//   {
//     type: 'text',
//     label: 'Mother Address',
//     name: 'motherAddress',
//     placeholder: 'Enter Mother Address',
//   },
//   {
//     type: 'text',
//     label: 'Spouse Name',
//     name: 'spouseName',
//     placeholder: 'Enter Spouse Name',
//   },
//   {
//     type: 'text',
//     label: 'Spouse Occupation',
//     name: 'spouseOccupation',
//     placeholder: 'Enter Spouse Occupation',
//   },
//   {
//     type: 'text',
//     label: 'Spouse Contact No.',
//     name: 'spouseContactNo',
//     placeholder: 'Enter Spouse Contact No.',
//     renderComp(props) {
//       const { formik } = props;

//       return (
//         <PhoneInput
//           name="spouseContactNo"
//           value={formik.values.spouseContactNo}
//           onChange={(value) => {
//             console.log(value, 'value====>');
//             formik.setFieldValue('spouseContactNo', value);
//           }}
//           placeholder="Enter Spouse Contact No."
//           error={formik.touched.spouseContactNo && Boolean(formik.errors.spouseContactNo)}
//         />
//       );
//     },
//   },
//   {
//     type: 'text',
//     label: 'Spouse Address',
//     name: 'spouseAddress',
//     placeholder: 'Enter Spouse Address',
//   },
// ];

const FamilyFields = [
  {
    type: 'text',
    label: 'Father Name',
    name: 'fatherName',
    placeholder: 'Enter Father Name',
    renderComp(props: any) {
      return <RenderFamilyInformation {...props} />;
    },
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
    renderComp(props) {
      return (
        <CustomSelect
          options={[]}
          label="Select Shift"
          onChange={() => {}}
          value=""
          formControlProps={{
            fullWidth: true,
            sx: {
              maxWidth: 'unset',
            },
          }}
        />
      );
    },
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

export const allFields: FieldsType[][] = [
  InformationFields,
  FamilyFields,
  CertificateFields,
  WorkExperienceFields,
  PayrollFields,
  // PerformanceAndDevelopmentFields,
];

function RenderFamilyInformation(props: any) {
  const { formik } = props;

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Father Details
            </Typography>
            <Stack spacing={1}>
              <TextField
                name="fatherName"
                label="Father Name"
                value={formik.values.fatherName}
                onChange={formik.handleChange}
                error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}
                helperText={formik.touched.fatherName && formik.errors.fatherName}
                fullWidth
                size="small"
              />
              <TextField
                name="fatherOccupation"
                label="Father Occupation"
                value={formik.values.fatherOccupation}
                onChange={formik.handleChange}
                error={formik.touched.fatherOccupation && Boolean(formik.errors.fatherOccupation)}
                helperText={formik.touched.fatherOccupation && formik.errors.fatherOccupation}
                fullWidth
                size="small"
              />
              <PhoneInput
                name="fatherContactNo"
                value={formik.values.fatherContactNo}
                onChange={(value) => {
                  formik.setFieldValue('fatherContactNo', value);
                }}
                placeholder="Enter Father Contact No."
                error={formik.touched.fatherContactNo && Boolean(formik.errors.fatherContactNo)}
              />
              <TextField
                name="fatherAddress"
                multiline
                rows={3}
                label="Father Address"
                value={formik.values.fatherAddress}
                onChange={formik.handleChange}
                error={formik.touched.fatherAddress && Boolean(formik.errors.fatherAddress)}
                helperText={formik.touched.fatherAddress && formik.errors.fatherAddress}
                fullWidth
                size="small"
              />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Mother Details
            </Typography>
            <Stack spacing={1}>
              <TextField
                name="motherName"
                label="Mother Name"
                value={formik.values.motherName}
                onChange={formik.handleChange}
                error={formik.touched.motherName && Boolean(formik.errors.motherName)}
                helperText={formik.touched.motherName && formik.errors.motherName}
                fullWidth
                size="small"
              />
              <TextField
                name="motherOccupation"
                label="Mother Occupation"
                value={formik.values.motherOccupation}
                onChange={formik.handleChange}
                error={formik.touched.motherOccupation && Boolean(formik.errors.motherOccupation)}
                helperText={formik.touched.motherOccupation && formik.errors.motherOccupation}
                fullWidth
                size="small"
              />
              <PhoneInput
                name="motherContactNo"
                value={formik.values.motherContactNo}
                onChange={(value) => {
                  formik.setFieldValue('motherContactNo', value);
                }}
                placeholder="Enter Mother Contact No."
                error={formik.touched.motherContactNo && Boolean(formik.errors.motherContactNo)}
              />

              <TextField
                name="motherAddress"
                multiline
                rows={3}
                label="Mother Address"
                value={formik.values.motherAddress}
                onChange={formik.handleChange}
                error={formik.touched.motherAddress && Boolean(formik.errors.motherAddress)}
                helperText={formik.touched.motherAddress && formik.errors.motherAddress}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForMother}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.sameAsFatherAddressForMother}
                    onChange={(e) => {
                      formik.setFieldValue('sameAsFatherAddressForMother', e.target.checked);
                      if (e.target.checked) {
                        formik.setFieldValue('motherAddress', formik.values.fatherAddress);
                      }
                    }}
                    name="sameAsFatherAddressForMother"
                  />
                }
                label="Same as Father Address"
              />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Spouse Details
            </Typography>
            <Stack spacing={1}>
              <TextField
                name="spouseName"
                label="Spouse Name"
                value={formik.values.spouseName}
                onChange={formik.handleChange}
                error={formik.touched.spouseName && Boolean(formik.errors.spouseName)}
                helperText={formik.touched.spouseName && formik.errors.spouseName}
                fullWidth
                size="small"
              />
              <TextField
                name="spouseOccupation"
                label="Spouse Occupation"
                value={formik.values.spouseOccupation}
                onChange={formik.handleChange}
                error={formik.touched.spouseOccupation && Boolean(formik.errors.spouseOccupation)}
                helperText={formik.touched.spouseOccupation && formik.errors.spouseOccupation}
                fullWidth
                size="small"
              />
              <PhoneInput
                name="spouseContactNo"
                value={formik.values.spouseContactNo}
                onChange={(value) => {
                  formik.setFieldValue('spouseContactNo', value);
                }}
                placeholder="Enter Spouse Contact No."
                error={formik.touched.spouseContactNo && Boolean(formik.errors.spouseContactNo)}
              />

              <TextField
                name="spouseAddress"
                multiline
                rows={3}
                label="Spouse Address"
                value={formik.values.spouseAddress}
                onChange={formik.handleChange}
                error={formik.touched.spouseAddress && Boolean(formik.errors.spouseAddress)}
                helperText={formik.touched.spouseAddress && formik.errors.spouseAddress}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForSpouse}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.sameAsFatherAddressForSpouse}
                    onChange={(e) => {
                      formik.setFieldValue('sameAsFatherAddressForSpouse', e.target.checked);
                      if (e.target.checked) {
                        formik.setFieldValue('spouseAddress', formik.values.fatherAddress);
                      }
                    }}
                    name="sameAsFatherAddressForSpouse"
                  />
                }
                label="Same as Father Address"
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
