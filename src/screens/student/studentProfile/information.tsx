// import { isValidPhoneNumber } from 'react-phone-number-input/input';

import type { Dayjs } from 'dayjs';
import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Tab, Box, Card, Stack, Button, TextField } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';

const generalFormFields: Fieldtypes[] = [
  {
    name: 'grNo',
    label: 'Gr No',
    onChange: (e: any, formik: FormikProps<any>) => {
      formik.handleChange(e);
    },
    otherProps: {},
  },
  { name: 'surname', label: 'Surname', onChange: (e, formik) => {}, otherProps: {} },
  { name: 'name', label: 'Name', onChange: (e, formik) => {}, otherProps: {} },
  { name: 'middleName', label: 'Middle Name', onChange: (e, formik) => {}, otherProps: {} },
  {
    name: 'dob',
    label: 'Date of Birth',
    type: 'date',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  { name: 'gender', label: 'Gender', onChange: (e, formik) => {}, otherProps: {} },
  { name: 'adharNo', label: 'Adhar No', onChange: (e, formik) => {}, otherProps: {} },
  { name: 'religion', label: 'Religion', onChange: (e, formik) => {}, otherProps: {} },
  { name: 'familyCast', label: 'Family Cast', onChange: (e, formik) => {}, otherProps: {} },
  { name: 'castCategory', label: 'Cast Category', onChange: (e, formik) => {}, otherProps: {} },
  { name: 'motherTongue', label: 'Mother Tongue', onChange: (e, formik) => {}, otherProps: {} },
  { name: 'nationality', label: 'Nationality', onChange: (e, formik) => {}, otherProps: {} },
  { name: 'birthPlace', label: 'Birth Place', onChange: (e, formik) => {}, otherProps: {} },
];

const admissionFormFields: Fieldtypes[] = [
  {
    name: 'admissionDate',
    label: 'Admission Date',
    type: 'date',
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
    name: 'admissionFormNumber',
    label: 'Admission Form Number',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  { name: 'previousSchool', label: 'Previous School', onChange: (e, formik) => {}, otherProps: {} },
  { name: 'admissionQuota', label: 'Admission Quota', onChange: (e, formik) => {}, otherProps: {} },
  {
    name: 'previousSchoolLeftDate',
    label: 'Previous School Left Date',
    type: 'date',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'previousLCDate',
    label: 'Previous LC Date',
    type: 'date',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'previousLCNumber',
    label: 'Previous LC Number',
    onChange: (e, formik) => {},
    otherProps: {},
  },
];

const communicationFields: Fieldtypes[] = [
  {
    name: 'parentContactNumber',
    label: 'Parent Contact Number',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  { name: 'parentEmail', label: 'Parent Email', onChange: (e, formik) => {}, otherProps: {} },
  {
    name: 'studentContactNo',
    label: 'Student Contact Number',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  { name: 'studentEmail', label: 'Student Email', onChange: (e, formik) => {}, otherProps: {} },
  {
    name: 'whatsAppContactNo',
    label: 'WhatsApp Contact Number',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  { name: 'localAddress', label: 'Local Address', onChange: (e, formik) => {}, otherProps: {} },
  {
    name: 'permanentAddress',
    label: 'Permanent Address',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'emergencyAddress',
    label: 'Emergency Address',
    onChange: (e, formik) => {},
    otherProps: {},
  },
];

const familyFields: Fieldtypes[] = [
  { name: 'fatherName', label: 'Father Name', onChange: (e, formik) => {}, otherProps: {} },
  {
    name: 'fatherDob',
    label: 'Father Date of Birth',
    type: 'date',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'fatherOccupation',
    label: 'Father Occupation',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'fatherQualification',
    label: 'Father Qualification',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'fatherContactNo',
    label: 'Father Contact Number',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  { name: 'fatherMail', label: 'Father Mail', onChange: (e, formik) => {}, otherProps: {} },
  {
    name: 'fatherExStudent',
    label: 'Father Ex-student',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'fatherPassoutYear',
    label: 'Father Pass out Year',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'fatherOfficeContactNo',
    label: 'Father Office Contact No',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'fatherOfficeAddress',
    label: 'Father Office Address',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'fatherDesignation',
    label: 'Father Designation',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'fatherOrganization',
    label: 'Father Organization',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'fatherAadharNo',
    label: 'Father Aadhar No',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  { name: 'motherName', label: 'Mother Name', onChange: (e, formik) => {}, otherProps: {} },
  {
    name: 'motherDob',
    label: 'Mother Date of Birth',
    type: 'date',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'motherOccupation',
    label: 'Mother Occupation',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'motherQualification',
    label: 'Mother Qualification',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'motherContactNo',
    label: 'Mother Contact No',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  { name: 'motherMail', label: 'Mother Mail', onChange: (e, formik) => {}, otherProps: {} },
  {
    name: 'motherOfficeContactNo',
    label: 'Mother Office Contact No',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'motherOfficeAddress',
    label: 'Mother Office Address',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'motherDesignation',
    label: 'Mother Designation',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'motherOrganization',
    label: 'Mother Organization',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'motherAnnualIncome',
    label: 'Mother Annual Income',
    onChange: (e, formik) => {},
    otherProps: {},
  },
  {
    name: 'motherAadharNo',
    label: 'Mother Aadhar No',
    onChange: (e, formik) => {},
    otherProps: {},
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
const fields = [generalFormFields, admissionFormFields, communicationFields, familyFields];
const validationSchemas = [
  generalFormValidationSchema,
  admissionFormValidationSchema,
  communicationValidationSchema,
  familyValidationSchema,
];

const dob = dayjs(new Date('2000-01-01'));
export function StudentInformation() {
  const [activeStep, setActiveStep] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
  const onSubmit = (_val: any) => {};
  const formik = useFormik({
    initialValues: {
      grNo: 'GR001',
      surname: 'Doe',
      name: 'John',
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

  const [open, setOpen] = useState('General');

  const handleToggle = useCallback((tab: string) => {
    setOpen((prev) => (prev === tab ? '' : tab));
  }, []);

  // const tabs = ['General', 'Admission', 'Communication', 'Family'];

  const TABS = [
    { value: 'general', label: 'General' },
    { value: 'admission', label: 'Admission' },
    { value: 'communication', label: 'Contact Deails' },
    { value: 'family', label: 'Family Details' },
  ];
  const tabs = useTabs('general');
  const activeTabIndex = TABS.findIndex((tab) => tab.value === tabs.value);
  return (
    <Box
      sx={{
        '& input': { fontSize: '12px' },
        '& label': { fontSize: '12px' },
      }}
    >
      <Stack direction="row" justifyContent="flex-end" sx={{ my: 1 }}>
        <Button
          onClick={() => setIsEdit(!isEdit)}
          variant="outlined"
          size="small"
          startIcon={
            <Iconify
              icon={isEdit ? 'icon-park-solid:save' : 'solar:pen-bold'}
              sx={{ cursor: 'poniter', height: 18, width: 18 }}
            />
          }
        >
          {isEdit ? 'Save' : 'Edit'}
        </Button>
      </Stack>
      <form onSubmit={formik.handleSubmit}>
        {/* {tabs.map((tab, index) => (
          <Fragment key={index}>
            <Subheader data-title={tab} open={open === tab} onClick={() => handleToggle(tab)}>
              {tab}
            </Subheader>

            <Collapse in={open === tab} sx={{ mt: '4px' }}>
              {' '}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 3,
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
                {fields[index].map(({ otherProps = {}, ...field }) => (
                  <Box maxWidth="220px" key={field.name} width="100%">
                    {field.type === 'date' ? (
                      <DatePicker
                        label={field.label}
                        value={
                          formik.values[field.name as keyof typeof formik.values] as Dayjs | null
                        }
                        onChange={(value) => field.onChange(value, formik)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error:
                              formik.touched[field.name as keyof typeof formik.touched] &&
                              Boolean(formik.errors[field.name as keyof typeof formik.errors]),
                            helperText:
                              formik.touched[field.name as keyof typeof formik.touched] &&
                              (formik.errors[field.name as keyof typeof formik.errors] as string),
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
            </Collapse>
          </Fragment>
        ))} */}

        {/* <CustomStepper
        activeStep={activeStep}
        steps={['General', 'Admission', 'Communication', 'Family Information']}
      /> */}
        <Card
          sx={{
            px: 1,
            '& *': { fontSize: '12px !important', '& svg': { fontSize: '18px !important' } },
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

          <Scrollbar sx={{ minHeight: 384 }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                mt: 2,
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
              {fields[activeTabIndex]?.map(({ otherProps = {}, ...field }) => (
                <Box maxWidth="210px" key={field.name} width="100%">
                  {field.type === 'date' ? (
                    <DatePicker
                      label={field.label}
                      value={
                        formik.values[field.name as keyof typeof formik.values] as Dayjs | null
                      }
                      onChange={(value) => field.onChange(value, formik)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched[field.name as keyof typeof formik.touched] &&
                            Boolean(formik.errors[field.name as keyof typeof formik.errors]),
                          helperText:
                            formik.touched[field.name as keyof typeof formik.touched] &&
                            (formik.errors[field.name as keyof typeof formik.errors] as string),
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
          </Scrollbar>
        </Card>

        {/* <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
          }}
        >
          {fields[activeStep].map(({ otherProps = {}, ...field }) => (
            <Box maxWidth="220px" key={field.name} width="100%">
              {field.type === 'date' ? (
                <DatePicker
                  label={field.label}
                  value={formik.values[field.name as keyof typeof formik.values] as Dayjs | null}
                  onChange={(value) => field.onChange(value, formik)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched[field.name as keyof typeof formik.touched] &&
                        Boolean(formik.errors[field.name as keyof typeof formik.errors]),
                      helperText:
                        formik.touched[field.name as keyof typeof formik.touched] &&
                        (formik.errors[field.name as keyof typeof formik.errors] as string),
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
        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setActiveStep((prev) => prev - 1)}
            disabled={activeStep === 0}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={() => activeStep !== fields.length - 1 && setActiveStep((prev) => prev + 1)}
            type="submit"
          >
            {activeStep === fields.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box> */}
      </form>
    </Box>
  );
}

interface Fieldtypes {
  name: string;
  label: string;
  onChange: (e: any, formik: FormikProps<any>) => void;
  otherProps?: Record<string, any>;
  type?: undefined | string;
}
