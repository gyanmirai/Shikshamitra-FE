// import { isValidPhoneNumber } from 'react-phone-number-input/input';

import type { Dayjs } from 'dayjs';
import type { FormikProps } from 'formik';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Tab,
  Box,
  Card,
  Stack,
  Button,
  TextField,
  Accordion,
  Typography,
  CardContent,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

const personalInformationFields: Fieldtypes[] = [
  {
    sectionName: 'Basic Information',
    fields: [
      {
        name: 'organizationName',
        label: 'Organization Name',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'code', label: 'Code', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'lastName', label: 'Last Name', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'firstName', label: 'First Name', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'middleName', label: 'Middle Name', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'shortName', label: 'Short Name', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'status', label: 'Status', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'dob',
        label: 'DOB',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'familyCast', label: 'Family Cast', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'castCategory', label: 'Cast Category', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'gender',
        label: 'Gender',
        onChange: (e, formik) => {},
        otherProps: { select: true },
      },
      { name: 'religion', label: 'Religion', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'maritalStatus',
        label: 'Marital Status',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'bloodGroup', label: 'Blood Group', onChange: (e, formik) => {}, otherProps: {} },
    ],
  },
  {
    sectionName: 'Contact Information',
    fields: [
      { name: 'mobileNo', label: 'Mobile No.', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'email', label: 'Email', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'address', label: 'Address', onChange: (e, formik) => {}, otherProps: {} },
    ],
  },
  {
    sectionName: 'Employment Details',
    fields: [
      { name: 'department', label: 'Department', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'designation', label: 'Designation', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'dateOfJoining',
        label: 'Date of Joining',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'photo', label: 'Photo', onChange: (e, formik) => {}, otherProps: { type: 'file' } },
      {
        name: 'employeeGroup',
        label: 'Employee Group',
        onChange: (e, formik) => {},
        otherProps: { select: true },
      },
      {
        name: 'qualification',
        label: 'Qualification',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
  {
    sectionName: 'Account Information',
    fields: [
      { name: 'userId', label: 'User Id', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'password',
        label: 'Password',
        onChange: (e, formik) => {},
        otherProps: { type: 'password' },
      },
      { name: 'role', label: 'Role', onChange: (e, formik) => {}, otherProps: {} },
    ],
  },
  {
    sectionName: 'Identification Marks',
    fields: [
      {
        name: 'identificationMark1',
        label: 'Identification Mark 1',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'identificationMark2',
        label: 'Identification Mark 2',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'identificationMark3',
        label: 'Identification Mark 3',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
];
const familyFields: Fieldtypes[] = [
  {
    sectionName: 'Father Details',
    fields: [
      { name: 'fatherName', label: 'Name', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'fatherOccupation',
        label: 'Occupation',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'fatherContactNo',
        label: 'Contact No.',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'fatherAddress',
        label: 'Address',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
  {
    sectionName: 'Mother Details',
    fields: [
      { name: 'motherName', label: 'Name', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'motherOccupation',
        label: 'Occupation',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'motherContactNo',
        label: 'Contact No.',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'motherAddress',
        label: 'Address',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
  {
    sectionName: 'Spouse Details',
    fields: [
      { name: 'spouseName', label: 'Name', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'spouseOccupation',
        label: 'Occupation',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'spouseContactNo',
        label: 'Contact No.',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'spouseAddress',
        label: 'Address',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
];
const workExperienceFields: Fieldtypes[] = [
  {
    sectionName: 'Basic Details',
    fields: [
      {
        name: 'organizationName',
        label: 'Organization Name',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'organizationAddress',
        label: 'Organization Address',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'fromDate',
        label: 'From Date',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'toDate',
        label: 'To Date',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'department',
        label: 'Department',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'designation',
        label: 'Designation',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'responsibilities',
        label: 'Responsibilities',
        type: 'textarea',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'references',
        label: 'References',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
];

const payrollFields: Fieldtypes[] = [
  {
    sectionName: 'Payroll Details',
    fields: [
      {
        name: 'bankName',
        label: 'Bank Name',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'branchName',
        label: 'Branch Name',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'accountHolderName',
        label: 'Account Holder Name',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'accountNumber',
        label: 'Account Number',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'ifscCode',
        label: 'IFSC Code',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'pfType',
        label: 'PF Type',
        type: 'dropdown',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'epfNumber',
        label: 'EPF Number',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'uanNumber',
        label: 'UAN Number',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'basicSalary',
        label: 'Basic Salary',
        type: 'number',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'punchId',
        label: 'Punch Id',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'shiftName',
        label: 'Shift Name',
        type: 'text',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
];

const fields = [personalInformationFields, familyFields, workExperienceFields, payrollFields];

const TABS = [
  { value: 'personalInformation', label: 'Personal Information' },
  { value: 'familyInformation', label: 'Family Information' },
  { value: 'workExperience', label: 'Work Experience' },
  { value: 'payroll', label: 'Payroll' },
  //   { value: 'performanceAndDevelopment', label: 'Performance and Development' },
];

export function EmployeeInformation() {
  const [isEdit, setIsEdit] = useState(false);
  const onSubmit = (_val: any) => {};
  const formik = useFormik({
    initialValues: {
      name: '',
      firstName: '',
      middleName: '',
      lastName: '',
      status: '',
      dateOfBirth: null,
      familyCast: '',
      castCategory: '',
      gender: '',
      religion: '',
      maritalStatus: '',
      bloodGroup: '',
      mobileNumber: '',
      personalEmail: '',
      presentZipCode: '',
      motherName: '',
      motherOccupation: '',
      fatherName: '',
      fatherOccupation: '',
      spouseName: '',
      spouseOccupation: '',
      spouseMobile: '',
      certificateName: [],
      schoolName: '',
      designation: '',
      fromDate: null,
      toDate: null,
      reasonForLeaving: '',
      yearsOfExperience: '',
      bankName: '',
      branch: '',
      ifscNumber: '',
      panNumber: '',
      epfNumber: '',
      basicSalary: '',
      netSalary: '',
      performanceRating: '',
      goalsAchieved: '',
      trainingCompleted: '',
      researchProjects: '',
      additionalTrainingResearch: '',
      skillsDeveloped: '',
      lastReviewDate: null,
    },
    validationSchema: Yup.object().shape({}),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const tabs = useTabs('personalInformation');
  const activeTabIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  useEffect(() => {
    if (activeTabIndex >= 0) {
      setExpanded(fields[activeTabIndex][0].sectionName);
    }
  }, [activeTabIndex]);

  return (
    <Box
      sx={{
        '& input': { fontSize: '12px' },
        '& label': { fontSize: '12px' },
      }}
    >
      <form onSubmit={formik.handleSubmit}>
        <Card
          sx={{
            px: 1,
            '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
          }}
        >
          <CustomTabs
            value={tabs.value}
            onChange={tabs.onChange}
            variant="fullWidth"
            slotProps={{ tab: { px: 0 } }}
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </CustomTabs>

          <Stack direction="row" justifyContent="flex-end" sx={{ my: 1 }}>
            <Button
              startIcon={
                <Iconify
                  icon={isEdit ? 'icon-park-solid:save' : 'solar:pen-bold'}
                  sx={{ cursor: 'pointer', height: '18px', width: '18px' }}
                />
              }
              onClick={() => {
                setIsEdit(!isEdit);
                // popover.onClose();
              }}
            >
              {isEdit ? 'Save' : 'Edit'}
            </Button>
          </Stack>
          <Card sx={{ backgroundColor: (theme) => theme.palette.background.paper }}>
            <CardContent
              sx={{
                width: '100%',
                p: 0,
                '& .Mui-disabled': {
                  color: (theme) => `${theme.palette.text.primary} !important`,
                  '-webkit-text-fill-color': 'unset',
                  cursor: 'no-drop',
                },
                '& .MuiInputLabel-shrink.Mui-disabled': {
                  color: (theme) => `${theme.palette.text.disabled} !important`,
                },
              }}
            >
              {fields[activeTabIndex]?.map(({ sectionName, fields: allField }) => (
                <Accordion expanded={expanded === sectionName} onChange={handleChange(sectionName)}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                  >
                    <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 500 }}>
                      {sectionName}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      {allField.map(({ otherProps = {}, ...field }) => (
                        <Box maxWidth="210px" key={field.name} width="100%">
                          {field.type === 'date' ? (
                            <DatePicker
                              label={field.label}
                              value={
                                formik.values[
                                  field.name as keyof typeof formik.values
                                ] as Dayjs | null
                              }
                              onChange={(value) => field.onChange(value, formik)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error:
                                    formik.touched[field.name as keyof typeof formik.touched] &&
                                    Boolean(
                                      formik.errors[field.name as keyof typeof formik.errors]
                                    ),
                                  helperText:
                                    formik.touched[field.name as keyof typeof formik.touched] &&
                                    (formik.errors[
                                      field.name as keyof typeof formik.errors
                                    ] as string),
                                  size: 'small',
                                  disabled: !isEdit,
                                },
                              }}
                              disabled={!isEdit}
                              {...otherProps}
                            />
                          ) : (
                            <TextField
                              fullWidth
                              label={field.label}
                              name={field.name}
                              size="small"
                              type={field.type || 'text'}
                              value={formik.values[field.name as keyof typeof formik.values]}
                              onChange={(e) => field.onChange(e, formik)}
                              error={
                                formik.touched[field.name as keyof typeof formik.touched] &&
                                Boolean(formik.errors[field.name as keyof typeof formik.errors])
                              }
                              helperText={
                                formik.touched[field.name as keyof typeof formik.touched] &&
                                (formik.errors[field.name as keyof typeof formik.errors] as string)
                              }
                              disabled={!isEdit}
                              {...otherProps}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Card>
      </form>
    </Box>
  );
}

interface Fieldtypes {
  sectionName: string;
  fields: {
    name: string;
    label: string;
    onChange: (e: any, formik: FormikProps<any>) => void;
    otherProps: Record<string, any>;
    type?: undefined | string;
  }[];
}
