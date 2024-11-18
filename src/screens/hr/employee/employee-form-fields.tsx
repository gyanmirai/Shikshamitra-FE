import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import {
  Select,
  Divider,
  MenuItem,
  IconButton,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';

import { useGetRolesQuery } from 'src/redux/role/roleApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

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

export const allFields: FieldsType[][] = [
  InformationFields,
  PersonalFields,
  CertificateFields,
  WorkExperienceFields,
  PayrollFields,
  // PerformanceAndDevelopmentFields,
];
