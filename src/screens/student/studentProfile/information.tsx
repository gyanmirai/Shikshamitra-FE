// import { isValidPhoneNumber } from 'react-phone-number-input/input';

import type { Dayjs } from 'dayjs';
import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
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

import type { StudentTabsComponentType } from '.';

const generalFormFields: Fieldtypes[] = [
  {
    sectionName: 'Basic details',
    fields: [
      { name: 'rollNo', label: 'Roll No.', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'grNo', label: 'Gr. No.', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'lastName', label: 'Last Name', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'firstName', label: 'First Name', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'middleName', label: 'Middle Name', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'gender', label: 'Gender', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'className', label: 'Class Name', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'division', label: 'Division', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'feeCategory', label: 'Fee Category', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'status', label: 'Status', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'dob',
        label: 'Date Of birth',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'age', label: 'Age', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'dobWorld',
        label: 'Date Of birth world',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'bloodGroup', label: 'BloodGroup', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'birthPlace', label: 'BirthPlace', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'birthTaluka', label: 'BirthTaluka', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'birthDistrict',
        label: 'BirthDistrict',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'birthState', label: 'BirthState', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'birthCountry', label: 'BirthCountry', onChange: (e, formik) => {}, otherProps: {} },
    ],
  },
  {
    sectionName: 'Family Cast & Subcast',
    fields: [
      { name: 'religion', label: 'Religion', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'familyCast', label: 'Family Cast', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'familySubCast',
        label: 'Family Sub Cast',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'castCategory', label: 'Cast Category', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'house', label: 'House', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'motherTongue', label: 'Mother Tongue', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'nationality', label: 'Nationality', onChange: (e, formik) => {}, otherProps: {} },
    ],
  },
  {
    sectionName: 'Government Register Number Detail',
    fields: [
      { name: 'UIDNumber', label: 'UID Number', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'adharNo', label: 'Adhaar Number', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'PENNumber', label: 'PEN Number', onChange: (e, formik) => {}, otherProps: {} },
    ],
  },
  {
    sectionName: 'Bank Detail',
    fields: [
      { name: 'bankName', label: 'Bank Name', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'bankBranch', label: 'Bank Branch', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'bankAccountNumber',
        label: 'Bank Account Number',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'bankIFSCCode',
        label: 'Bank IFSC Code',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'bankAccountHolderName',
        label: 'Bank Account Holder Name',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
];

const admissionFormFields: Fieldtypes[] = [
  {
    sectionName: 'Admission Details',
    fields: [
      {
        name: 'admissionCategory',
        label: 'Admission Category',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'previousSchool',
        label: 'Previous School',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'admissionDate',
        label: 'Admission Date',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'admissionFormNumber',
        label: 'Admission Form Number',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'transferFrom',
        label: 'Transfer From',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'passingYear',
        label: 'Passing Year',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'leftStandard',
        label: 'Left Standard',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'leftDate',
        label: 'Left Date',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'lcDate',
        label: 'LC Date',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'leftReason',
        label: 'Left Reason',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'lcNumber',
        label: 'LC Number',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'admissionStandard',
        label: 'Admission Standard',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'lcSubmitted',
        label: 'LC Submitted',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
];

const communicationFields: Fieldtypes[] = [
  {
    sectionName: 'Communication Details',
    fields: [
      {
        name: 'fatherContactNo',
        label: 'Father Contact No.',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'motherContactNo',
        label: 'Mother Contact No.',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'studentContactNo',
        label: 'Student Contact No.',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'whatsappNo',
        label: 'Whatsapp No.',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
  {
    sectionName: 'Present Address',
    fields: [
      {
        name: 'presentStreetLine1',
        label: 'Street Line 1',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'presentStreetLine2',
        label: 'Street Line 2',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'presentPostalCode',
        label: 'Postal Code',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'presentCity', label: 'City', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'presentState', label: 'State', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'presentContactNo',
        label: 'Contact No.',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
  {
    sectionName: 'Permanent Address',
    fields: [
      {
        name: 'permanentStreetLine1',
        label: 'Street Line 1',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'permanentStreetLine2',
        label: 'Street Line 2',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'permanentPostalCode',
        label: 'Postal Code',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'permanentCity', label: 'City', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'permanentState', label: 'State', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'permanentContactNo',
        label: 'Contact No.',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
  {
    sectionName: 'Emergency Address',
    fields: [
      {
        name: 'emergencyStreetLine1',
        label: 'Street Line 1',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'emergencyStreetLine2',
        label: 'Street Line 2',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'emergencyPostalCode',
        label: 'Postal Code',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'emergencyCity', label: 'City', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'emergencyState', label: 'State', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'emergencyContactNo',
        label: 'Contact No.',
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
        name: 'fatherDob',
        label: 'DOB',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'fatherQualification',
        label: 'Qualification',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'fatherOccupation',
        label: 'Occupation',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'fatherOrganization',
        label: 'Organization',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'fatherDesignation',
        label: 'Designation',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'fatherMail', label: 'Mail', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'fatherOfficeContactNo',
        label: 'Office Contact No.',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'fatherAnnualIncome',
        label: 'Annual Income',
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
        name: 'motherDob',
        label: 'DOB',
        type: 'date',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'motherQualification',
        label: 'Qualification',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'motherOccupation',
        label: 'Occupation',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'motherMail', label: 'Mail', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'motherOfficeContactNo',
        label: 'Office Contact No.',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'motherAnnualIncome',
        label: 'Annual Income',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
];

const healthFields: Fieldtypes[] = [
  {
    sectionName: 'Health Details',
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
        name: 'isPhysicalDeformity',
        label: 'Is Physical Deformity',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'physicalDeformityRemark',
        label: 'Physical Deformity Remark',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'isMajorIllness',
        label: 'Is Major Illness',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'illnessRemark',
        label: 'Illness Remark',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'isAnyAllergy',
        label: 'Is any Allergy',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'allergyRemark',
        label: 'Allergy Remark',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'familyDoctorName',
        label: 'Family Doctor Name',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'familyDoctorContactNo',
        label: 'Family Doctor Contact no.',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
];

const transportFields: Fieldtypes[] = [
  {
    sectionName: 'Transport Details',
    fields: [
      {
        name: 'transportMode',
        label: 'Transport Mode',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      {
        name: 'routeDestination',
        label: 'Route Destination',
        onChange: (e, formik) => {},
        otherProps: {},
      },
      { name: 'pickupTime', label: 'Pickup Time', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'dropTime', label: 'Drop Time', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'routeName', label: 'Route Name', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'pickupPoint', label: 'Pickup Point', onChange: (e, formik) => {}, otherProps: {} },
      { name: 'dropPoint', label: 'Drop Point', onChange: (e, formik) => {}, otherProps: {} },
      {
        name: 'transportationDetails',
        label: 'Transportation Details',
        onChange: (e, formik) => {},
        otherProps: {},
      },
    ],
  },
];

const generalFormValidationSchema = Yup.object().shape({
  grNo: Yup.string().required('GR No is required'),
  surname: Yup.string().required('Surname is required'),
  name: Yup.string().required('Name is required'),
  middleName: Yup.string(),
  dob: Yup.date().required('Date of Birth is required'),
  gender: Yup.string().required('Gender is required'),
  adharNo: Yup.string().matches(/^\d{12}$/, 'Adhar No must be 12 digits'),
  religion: Yup.string(),
  familyCast: Yup.string(),
  castCategory: Yup.string(),
  motherTongue: Yup.string(),
  nationality: Yup.string().required('Nationality is required'),
  birthPlace: Yup.string(),
});

const admissionFormValidationSchema = Yup.object().shape({
  admissionDate: Yup.date().required('Admission Date is required'),
  admissionStandard: Yup.string().required('Admission Standard is required'),
  admissionFormNumber: Yup.string().required('Admission Form Number is required'),
  previousSchool: Yup.string(),
  admissionQuota: Yup.string(),
  previousSchoolLeftDate: Yup.date(),
  previousLCDate: Yup.date(),
  previousLCNumber: Yup.string(),
});

const communicationValidationSchema = Yup.object().shape({
  parentContactNumber: Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits'),
  parentEmail: Yup.string().email('Invalid email format'),
  studentContactNo: Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits'),
  studentEmail: Yup.string().email('Invalid email format'),
  whatsAppContactNo: Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits'),
  localAddress: Yup.string(),
  permanentAddress: Yup.string(),
  emergencyAddress: Yup.string(),
});

const healthValidationSchema = Yup.object().shape({
  identificationMark1: Yup.string(),
  identificationMark2: Yup.string(),
  isPhysicalDeformity: Yup.boolean(),
  physicalDeformityRemark: Yup.string(),
  isMajorIllness: Yup.boolean(),
  illnessRemark: Yup.string(),
  isAnyAllergy: Yup.boolean(),
  allergyRemark: Yup.string(),
  familyDoctorName: Yup.string(),
  familyDoctorContactNo: Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits'),
});
const transportValidationSchema = Yup.object().shape({
  transportMode: Yup.string(),
  routeDestination: Yup.string(),
  pickupTime: Yup.string(),
  dropTime: Yup.string(),
  routeName: Yup.string(),
  pickupPoint: Yup.string(),
  dropPoint: Yup.string(),
  transportationDetails: Yup.string(),
});

const familyValidationSchema = Yup.object().shape({
  fatherName: Yup.string(),
  fatherDob: Yup.date(),
  fatherOccupation: Yup.string(),
  fatherQualification: Yup.string(),
  fatherContactNo: Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits'),
  fatherMail: Yup.string().email('Invalid email format'),
  fatherExStudent: Yup.string(),
  fatherPassoutYear: Yup.number().positive().integer(),
  fatherOfficeContactNo: Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits'),
  fatherOfficeAddress: Yup.string(),
  fatherDesignation: Yup.string(),
  fatherOrganization: Yup.string(),
  fatherAadharNo: Yup.string().matches(/^\d{12}$/, 'Aadhar No must be 12 digits'),
  motherName: Yup.string(),
  motherDob: Yup.date(),
  motherOccupation: Yup.string(),
  motherQualification: Yup.string(),
  motherContactNo: Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits'),
  motherMail: Yup.string().email('Invalid email format'),
  motherOfficeContactNo: Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits'),
  motherOfficeAddress: Yup.string(),
  motherDesignation: Yup.string(),
  motherOrganization: Yup.string(),
  motherAnnualIncome: Yup.number().positive(),
  motherAadharNo: Yup.string().matches(/^\d{12}$/, 'Aadhar No must be 12 digits'),
});
const fields = [
  generalFormFields,
  admissionFormFields,
  communicationFields,
  familyFields,
  healthFields,
  transportFields,
];
const validationSchemas = [
  generalFormValidationSchema,
  admissionFormValidationSchema,
  communicationValidationSchema,
  familyValidationSchema,
  healthValidationSchema,
  transportValidationSchema,
];
const TABS = [
  { value: 'general', label: 'General' },
  { value: 'admission', label: 'Admission' },
  { value: 'communication', label: 'Contact Deails' },
  { value: 'family', label: 'Family information' },
  { value: 'health', label: 'Health' },
  { value: 'transport', label: 'Transport' },
];

const dob = dayjs(new Date('2000-01-01'));
export function StudentInformation(props: StudentTabsComponentType) {
  const [activeStep] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
  const onSubmit = (_val: any) => {};
  const formik = useFormik({
    initialValues: {
      grNo: 'GR001',
      rollNo: 1,
      lastName: 'Doe',
      firstName: 'John',
      className: '12',
      division: 'A',
      feeCategory: 'General',
      status: 'Active',
      bloodGroup: 'A+',
      birthTaluka: 'Surat',
      birthDistrict: 'Surat',
      birthState: 'Gujarat',
      birthCountry: 'India',
      age: dayjs().diff(dob, 'year'),
      middleName: 'johnson',
      dob,
      gender: 'Male',
      adharNo: '123456789012',
      religion: 'Hindu',
      familyCast: 'Ahir',
      castCategory: 'OBC',
      motherTongue: 'Hindi',
      nationality: 'Indian',
      birthPlace: 'Surat',
      admissionDate: dayjs(new Date('2023-01-01')),
      admissionStandard: '12',
      admissionFormNumber: 'ADM001',
      previousSchool: 'ABC School',
      admissionQuota: 'General',
      previousSchoolLeftDate: dayjs(new Date('2022-12-31')),
      previousLCDate: dayjs(new Date('2022-12-31')),
      previousLCNumber: 'LC001',
      parentContactNumber: '9876543210',
      parentEmail: 'john@gmail.com',
      studentContactNo: '9876543210',
      studentEmail: 'john@gmail.com',
      whatsAppContactNo: '9876543210',
      localAddress: '123 Main St, Surat',
      permanentAddress: '123 Main St, Surat',
      emergencyAddress: '123 Main St, Surat',
      fatherName: 'Johnson',
      fatherDob: dayjs(new Date('1970-01-01')),
      fatherOccupation: 'Teacher',
      fatherQualification: 'B.Tech',
      fatherContactNo: '9876543210',
      fatherMail: 'john@gmail.com',
      fatherExStudent: 'Yes',
      fatherPassoutYear: '2000',
      fatherOfficeContactNo: '9876543210',
      fatherOfficeAddress: '123 Main St, Surat',
      fatherDesignation: 'Teacher',
      fatherOrganization: 'ABC School',
      fatherAadharNo: '123456789012',
      motherName: 'Jery',
      motherDob: dayjs(new Date('1970-01-01')),
      motherOccupation: 'Teacher',
      motherQualification: 'B.Tech',
      motherContactNo: '9876543210',
      motherMail: 'john@gmail.com',
      motherOfficeContactNo: '9876543210',
      motherOfficeAddress: '123 Main St, Surat',
      motherDesignation: 'Teacher',
      motherOrganization: 'ABC School',
      motherAnnualIncome: '100000',
      motherAadharNo: '123456789012',
    },
    validationSchema: validationSchemas[activeStep],
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // const tabs = ['General', 'Admission', 'Communication', 'Family'];

  const tabs = useTabs('general');
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
