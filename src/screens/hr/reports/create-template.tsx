import type { FormikProps } from 'formik';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import Draggable from 'react-draggable';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import UploadButton from 'src/components/upload-button';
import React, { useMemo, useState, useCallback } from 'react';
import { PDFViewer, type PageProps } from '@react-pdf/renderer';
import { ComponentBlock } from 'src/components/component-block';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import CommonReport, { PdfTable, ReportHeader } from 'src/components/reports';
import {
  Box,
  Grid,
  Card,
  Stack,
  Paper,
  Button,
  Divider,
  MenuItem,
  Checkbox,
  Accordion,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogActions,
  InputAdornment,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
} from '@mui/material';

const employeeFields = [
  {
    name: 'photo',
    label: 'Photo',
  },
  {
    name: 'code',
    label: 'Code',
  },
  {
    name: 'lastName',
    label: 'Last Name',
  },
  {
    name: 'firstName',
    label: 'First Name',
  },
  {
    name: 'middleName',
    label: 'Middle Name',
  },
  {
    name: 'shortName',
    label: 'Short Name',
  },
  {
    name: 'employeeStatusType',
    label: 'Employee Status Type',
  },
  {
    name: 'subject',
    label: 'Subject',
  },
  {
    name: 'dob',
    label: 'Date of Birth',
  },
  {
    name: 'familyCast',
    label: 'Family Cast',
  },
  {
    name: 'castType',
    label: 'Cast Type',
  },
  {
    name: 'gender',
    label: 'Gender',
  },
  {
    name: 'religion',
    label: 'Religion',
  },
  {
    name: 'maritalStatus',
    label: 'Marital Status',
  },
  {
    name: 'bloodGroup',
    label: 'Blood Group',
  },
  {
    name: 'mobileNo',
    label: 'Mobile No',
  },
  {
    name: 'email',
    label: 'Email',
  },
  {
    name: 'department',
    label: 'Department',
  },
  {
    name: 'designation',
    label: 'Designation',
  },
  {
    name: 'dateOfJoining',
    label: 'Date of Joining',
  },
  {
    name: 'employeeGroup',
    label: 'Employee Group',
  },
  {
    name: 'qualification',
    label: 'Qualification',
  },
  {
    name: 'role',
    label: 'Role',
  },
  {
    name: 'identificationMark1',
    label: 'Identification Mark',
  },
  {
    name: 'address',
    label: 'Address',
  },
  {
    name: 'state',
    label: 'State',
  },
  {
    name: 'city',
    label: 'City',
  },
  {
    name: 'pinCode',
    label: 'Pincode',
  },
  {
    name: 'employeeId',
    label: 'Employee ID',
  },
  {
    name: 'fatherName',
    label: 'Father Name',
  },
  {
    name: 'fatherOccupation',
    label: 'Father Occupation',
  },
  {
    name: 'fatherContactNo',
    label: 'Father Contact No',
  },
  {
    name: 'fatherAddress',
    label: 'Father Address',
  },
  {
    name: 'fatherState',
    label: 'Father State',
  },
  {
    name: 'fatherCity',
    label: 'Father City',
  },
  {
    name: 'fatherPinCode',
    label: 'Father Pincode',
  },
  {
    name: 'motherName',
    label: 'Mother Name',
  },
  {
    name: 'motherOccupation',
    label: 'Mother Occupation',
  },
  {
    name: 'motherContactNo',
    label: 'Mother Contact No',
  },
  {
    name: 'motherAddress',
    label: 'Mother Address',
  },
  {
    name: 'motherState',
    label: 'Mother State',
  },
  {
    name: 'motherCity',
    label: 'Mother City',
  },
  {
    name: 'motherPinCode',
    label: 'Mother Pincode',
  },
  {
    name: 'spouseName',
    label: 'Spouse Name',
  },
  {
    name: 'spouseOccupation',
    label: 'Spouse Occupation',
  },
  {
    name: 'spouseContactNo',
    label: 'Spouse Contact No',
  },
  {
    name: 'spouseAddress',
    label: 'Spouse Address',
  },
  {
    name: 'spouseState',
    label: 'Spouse State',
  },
  {
    name: 'spouseCity',
    label: 'Spouse City',
  },
  {
    name: 'spousePinCode',
    label: 'Spouse Pincode',
  },
  {
    name: 'bankName',
    label: 'Bank Name',
  },
  {
    name: 'branchName',
    label: 'Branch Name',
  },
  {
    name: 'accountHolderName',
    label: 'Account Holder Name',
  },
  {
    name: 'accountNumber',
    label: 'Account Number',
  },
  {
    name: 'ifscCode',
    label: 'IFSC Code',
  },
  {
    name: 'pfType',
    label: 'PF Type',
  },
  {
    name: 'epfNumber',
    label: 'EPF Number',
  },
  {
    name: 'uanNumber',
    label: 'UAN Number',
  },
  {
    name: 'basicSalary',
    label: 'Basic Salary',
  },
  {
    name: 'punchId',
    label: 'Punch ID',
  },
  {
    name: 'shiftName',
    label: 'Shift Name',
  },
];
export interface ITemplateFormikValues {
  margin: number[];
  report: string;
  elements: { type?: string; text?: string; label?: string; image?: string; style?: {} }[];
  selectedFields: { name: string; label: string }[];
  isGridShow: boolean;
  header: {
    height: number;
  };
  page: any;
}

const dummyData = [
  {
    photo: 'employee1.jpg',
    code: 'EMP001',
    lastName: 'Smith',
    firstName: 'John',
    middleName: 'Robert',
    shortName: 'JS',
    employeeStatusType: 1,
    subject: ['Math', 'Science'],
    dob: '1990-05-15',
    familyCast: 'General',
    castType: 'Open',
    gender: 'Male',
    religion: 'Christian',
    maritalStatus: 'Married',
    bloodGroup: 'O+',
    mobileNo: '9876543210',
    email: 'john.smith@example.com',
    department: 'IT',
    designation: 'Senior Developer',
    dateOfJoining: '2020-01-15',
    employeeGroup: 'Technical',
    qualification: 'B.Tech',
    role: 'Team Lead',
    identificationMark1: 'Mole on right cheek',
    address: '123 Main St',
    state: 'California',
    city: 'San Francisco',
    pinCode: '94105',
    employeeId: 'EMP001',
    sameAsFatherAddressForMother: false,
    sameAsFatherAddressForSpouse: false,
    fatherName: 'Robert Smith',
    fatherOccupation: 'Business',
    fatherContactNo: '9876543211',
    fatherAddress: '456 Oak St',
    fatherState: 'California',
    fatherCity: 'San Francisco',
    fatherPinCode: '94106',
    motherName: 'Mary Smith',
    motherOccupation: 'Teacher',
    motherContactNo: '9876543212',
    motherAddress: '456 Oak St',
    motherState: 'California',
    motherCity: 'San Francisco',
    motherPinCode: '94106',
    spouseName: 'Emma Smith',
    spouseOccupation: 'Doctor',
    spouseContactNo: '9876543213',
    spouseAddress: '123 Main St',
    spouseState: 'California',
    spouseCity: 'San Francisco',
    spousePinCode: '94105',
    documents: {},
    experiences: [],
    bankName: 'Chase Bank',
    branchName: 'Downtown Branch',
    accountHolderName: 'John Smith',
    accountNumber: '1234567890',
    ifscCode: 'CHASE0001',
    pfType: 'EPF',
    epfNumber: 'EPF123456',
    uanNumber: 'UAN987654',
    basicSalary: '85000',
    punchId: 'P001',
    shiftName: 'Morning Shift',
  },
  {
    photo: 'employee2.jpg',
    code: 'EMP002',
    lastName: 'Johnson',
    firstName: 'Sarah',
    middleName: 'Marie',
    shortName: 'SJ',
    employeeStatusType: 1,
    subject: ['English', 'History'],
    dob: '1992-08-20',
    familyCast: 'General',
    castType: 'Open',
    gender: 'Female',
    religion: 'Hindu',
    maritalStatus: 'Single',
    bloodGroup: 'A+',
    mobileNo: '9876543220',
    email: 'sarah.johnson@example.com',
    department: 'HR',
    designation: 'HR Manager',
    dateOfJoining: '2019-06-10',
    employeeGroup: 'Management',
    qualification: 'MBA',
    role: 'Manager',
    identificationMark1: 'Birthmark on left arm',
    address: '789 Pine St',
    state: 'New York',
    city: 'New York City',
    pinCode: '10001',
    employeeId: 'EMP002',
    sameAsFatherAddressForMother: true,
    sameAsFatherAddressForSpouse: false,
    fatherName: 'Michael Johnson',
    fatherOccupation: 'Engineer',
    fatherContactNo: '9876543221',
    fatherAddress: '321 Elm St',
    fatherState: 'New York',
    fatherCity: 'New York City',
    fatherPinCode: '10002',
    motherName: 'Patricia Johnson',
    motherOccupation: 'Accountant',
    motherContactNo: '9876543222',
    motherAddress: '321 Elm St',
    motherState: 'New York',
    motherCity: 'New York City',
    motherPinCode: '10002',
    spouseName: '',
    spouseOccupation: '',
    spouseContactNo: '',
    spouseAddress: '',
    spouseState: '',
    spouseCity: '',
    spousePinCode: '',
    documents: {},
    experiences: [],
    bankName: 'Bank of America',
    branchName: 'Manhattan Branch',
    accountHolderName: 'Sarah Johnson',
    accountNumber: '0987654321',
    ifscCode: 'BOA0002',
    pfType: 'EPF',
    epfNumber: 'EPF789012',
    uanNumber: 'UAN654321',
    basicSalary: '75000',
    punchId: 'P002',
    shiftName: 'Day Shift',
  },
  {
    photo: 'employee3.jpg',
    code: 'EMP003',
    lastName: 'Patel',
    firstName: 'Raj',
    middleName: 'Kumar',
    shortName: 'RP',
    employeeStatusType: 1,
    subject: ['Physics', 'Chemistry'],
    dob: '1988-12-03',
    familyCast: 'OBC',
    castType: 'Reserved',
    gender: 'Male',
    religion: 'Hindu',
    maritalStatus: 'Married',
    bloodGroup: 'B+',
    mobileNo: '9876543230',
    email: 'raj.patel@example.com',
    department: 'Engineering',
    designation: 'Project Manager',
    dateOfJoining: '2018-03-20',
    employeeGroup: 'Technical',
    qualification: 'M.Tech',
    role: 'Project Lead',
    identificationMark1: 'Scar on forehead',
    address: '567 Maple Ave',
    state: 'Texas',
    city: 'Austin',
    pinCode: '73301',
    employeeId: 'EMP003',
    sameAsFatherAddressForMother: true,
    sameAsFatherAddressForSpouse: false,
    fatherName: 'Kumar Patel',
    fatherOccupation: 'Professor',
    fatherContactNo: '9876543231',
    fatherAddress: '890 Cedar St',
    fatherState: 'Texas',
    fatherCity: 'Austin',
    fatherPinCode: '73302',
    motherName: 'Priya Patel',
    motherOccupation: 'Homemaker',
    motherContactNo: '9876543232',
    motherAddress: '890 Cedar St',
    motherState: 'Texas',
    motherCity: 'Austin',
    motherPinCode: '73302',
    spouseName: 'Meera Patel',
    spouseOccupation: 'Software Engineer',
    spouseContactNo: '9876543233',
    spouseAddress: '567 Maple Ave',
    spouseState: 'Texas',
    spouseCity: 'Austin',
    spousePinCode: '73301',
    documents: {},
    experiences: [],
    bankName: 'Wells Fargo',
    branchName: 'Austin Branch',
    accountHolderName: 'Raj Patel',
    accountNumber: '5678901234',
    ifscCode: 'WF0003',
    pfType: 'EPF',
    epfNumber: 'EPF345678',
    uanNumber: 'UAN789012',
    basicSalary: '95000',
    punchId: 'P003',
    shiftName: 'Regular Shift',
  },
];

const getPageDimensions = (pageSize: string): { width: number; height: number } => {
  const dimensions = {
    '4A0': { width: 4768, height: 6741 },
    '2A0': { width: 3370, height: 4768 },
    A0: { width: 2384, height: 3370 },
    A1: { width: 1684, height: 2384 },
    A2: { width: 1191, height: 1684 },
    A3: { width: 842, height: 1191 },
    A4: { width: 595, height: 842 },
    A5: { width: 420, height: 595 },
    A6: { width: 298, height: 420 },
    A7: { width: 210, height: 298 },
    A8: { width: 147, height: 210 },
    A9: { width: 105, height: 147 },
    A10: { width: 74, height: 105 },
    B0: { width: 2835, height: 4008 },
    B1: { width: 2004, height: 2835 },
    B2: { width: 1417, height: 2004 },
    B3: { width: 1001, height: 1417 },
    B4: { width: 709, height: 1001 },
    B5: { width: 499, height: 709 },
    B6: { width: 354, height: 499 },
    B7: { width: 249, height: 354 },
    B8: { width: 176, height: 249 },
    B9: { width: 125, height: 176 },
    B10: { width: 88, height: 125 },
    C0: { width: 2599, height: 3677 },
    C1: { width: 1837, height: 2599 },
    C2: { width: 1298, height: 1837 },
    C3: { width: 918, height: 1298 },
    C4: { width: 649, height: 918 },
    C5: { width: 459, height: 649 },
    C6: { width: 323, height: 459 },
    C7: { width: 230, height: 323 },
    C8: { width: 162, height: 230 },
    C9: { width: 113, height: 162 },
    C10: { width: 79, height: 113 },
    RA0: { width: 2438, height: 3458 },
    RA1: { width: 1729, height: 2438 },
    RA2: { width: 1219, height: 1729 },
    RA3: { width: 865, height: 1219 },
    RA4: { width: 609, height: 865 },
    SRA0: { width: 2551, height: 3628 },
    SRA1: { width: 1814, height: 2551 },
    SRA2: { width: 1276, height: 1814 },
    SRA3: { width: 907, height: 1276 },
    SRA4: { width: 638, height: 907 },
    EXECUTIVE: { width: 522, height: 756 },
    FOLIO: { width: 612, height: 936 },
    LEGAL: { width: 612, height: 1008 },
    LETTER: { width: 612, height: 792 },
    TABLOID: { width: 792, height: 1224 },
    ID1: { width: 242.65, height: 153 },
  };
  return dimensions[pageSize as keyof typeof dimensions] || dimensions.A4;
};

const CreateTemplate = () => {
  const [activeTab, setActiveTab] = useState<null | number>(null);

  const dialog = useBoolean();

  const handleChangeTab = useCallback((index: number) => {
    setActiveTab((pre) => (pre === index ? null : index));
  }, []);
  const formik = useFormik<ITemplateFormikValues>({
    initialValues: {
      margin: [0, 0, 0, 0],
      elements: [],
      page: 'A4',
      report: '',
      selectedFields: [],
      isGridShow: true,
      header: {
        height: 100,
      },
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const pageProps: PageProps | undefined = useMemo(
    () => ({
      size: formik.values.page,
      style: {
        paddingBottom: `${formik.values.margin[2]}in`,
        paddingTop: `${formik.values.margin[0]}in`,
        paddingLeft: `${formik.values.margin[3]}in`,
        paddingRight: `${formik.values.margin[1]}in`,
      },
    }),
    [formik.values.margin, formik.values.page]
  );

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ height: '100%' }}>
      <Grid container spacing={2} height="100%">
        <Grid size={{ xs: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="body1">Employee List</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton onClick={dialog.onTrue}>
                <Iconify icon="eva:eye-fill" />
              </IconButton>
              <IconButton>
                <Iconify icon="eva:save-fill" />
              </IconButton>
            </Box>
          </Box>

          <AccordingComp
            handleChangeTab={handleChangeTab}
            activeTab={activeTab}
            accordionDetails={[
              { title: 'Page', content: <PdfMargin formik={formik} /> },
              { title: 'Header', content: <PdfHeader formik={formik} /> },
              { title: 'Body', content: <PdfBodyTable formik={formik} /> },
              // { title: 'Footer', content: <PdfFooter formik={formik} /> },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 8 }} overflow="auto">
          <PdfBody formik={formik} pageProps={pageProps} />
        </Grid>
      </Grid>

      <CustomDialog
        maxWidth="lg"
        PaperProps={{
          sx: {
            height: '80%',
          },
        }}
        title="Preview"
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <CommonReport
            pageProps={pageProps}
            reportHeader={
              <ReportHeader
                height={formik.values.header.height}
                elements={formik.values.elements}
                data={dummyData[0]}
              />
            }
            reportBody={
              <PdfTable
                columns={formik.values.selectedFields.map((field: any) => ({
                  label: field.label,
                  id: field.name,
                  minWidth: 100 / formik.values.selectedFields.length,
                }))}
                data={dummyData}
              />
            }
          />
        </PDFViewer>
      </CustomDialog>
    </Box>
  );
};

export default CreateTemplate;

const PdfBodyTable = ({ formik }: any) => (
  <Scrollbar sx={{ height: '300px' }}>
    <Grid container spacing={2}>
      {employeeFields.map((field) => (
        <Grid size={{ xs: 6 }} key={field.name}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.selectedFields.some((i: any) => i.name === field.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    formik.setFieldValue('selectedFields', [
                      ...formik.values.selectedFields,
                      field,
                    ]);
                  } else {
                    formik.setFieldValue(
                      'selectedFields',
                      formik.values.selectedFields.filter((i: any) => i.name !== field.name)
                    );
                  }
                }}
              />
            }
            label={field.label}
          />
        </Grid>
      ))}
    </Grid>
  </Scrollbar>
);

const PdfBody = ({ formik, pageProps }: any) => {
  const onDrag = (fieldName: any, newPosition: any) => {
    const elements = cloneDeep(formik.values.elements);
    const modifiedData = elements.map((field: any) =>
      field.label === fieldName
        ? {
            ...field,
            position: newPosition,
            // style: { ...field.style, top: newPosition.y, left: newPosition.x },
          }
        : field
    );
    formik.setFieldValue('elements', modifiedData);
  };
  return (
    <Paper
      elevation={6}
      sx={{ position: 'relative', ...(getPageDimensions(formik.values.page) as any) }}
      style={pageProps.style}
    >
      <Box sx={{ height: formik.values.header.height, border: '1px solid gray' }} />
      {formik.values.isGridShow && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 99,
            backgroundImage: `
                  linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
                `,
            backgroundSize: '20px 20px',
          }}
        />
      )}
      {formik.values.elements.map((element: any, index: number) => (
        <Draggable
          bounds="parent"
          onDrag={(e, data) => onDrag(element.label, { x: data.x, y: data.y })}
        >
          <Box
            position="absolute"
            sx={{
              // border: "1px dashed gray",
              zIndex: 1,
              padding: '0px',
              cursor: 'move',

              ...element.style,
              transform: `translate(${element?.position?.x || 0}px, ${element?.position?.y || 0}px)`,
              // height: element?.style?.height || '100%',
              // width: element?.style?.width || '100%',
              '&:hover': {
                // display: isDrag ? 'flex' : 'none',
                background: '#d1d1d1cc',
              },
            }}
          >
            {element.type === 'text' && (
              <Typography
                variant="body1"
                sx={{
                  position: 'absolute',
                  // display: 'inline-block',
                  top: 0,
                  width: '100%',
                  height: '100%',
                  left: 0,
                  fontSize: 12,
                  ...(element?.style || {}),
                }}
              >
                {element?.text}
              </Typography>
            )}
            {element.type === 'image' && (
              <img
                src={element.image}
                alt={element.label}
                draggable={false}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  ...(element?.style || {}),
                }}
              />
            )}
            {element.type === 'divider' && (
              <Divider
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  borderBottom: '1px solid black',
                  ...(element?.style || {}),
                  width: `calc(100% - ${formik.values.margin[3]}in - ${formik.values.margin[1]}in)`,
                }}
              />
            )}
          </Box>
        </Draggable>
      ))}
      <CustomizableTable
        tableId="table-1"
        isFilter={false}
        isPagination={false}
        isSearch={false}
        isShowedDense={false}
        columns={formik.values.selectedFields.map((field: any) => ({
          label: field.label,
          id: field.name,
          minWidth: 100 / formik.values.selectedFields.length,
        }))}
        data={[]}
      />
    </Paper>
  );
};

interface IPdfMarginProps {
  formik: FormikProps<ITemplateFormikValues>;
}

const PdfMargin = ({ formik }: IPdfMarginProps) => {
  const { values, setFieldValue } = formik;
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6 }}>
        <CustomSelect
          options={[
            { label: '0', value: 0 },
            { label: '0.25', value: 0.25 },
            { label: '1', value: 1 },
            { label: '1.5', value: 1.5 },
            { label: '2', value: 2 },
            { label: '2.5', value: 2.5 },
            { label: '3', value: 3 },
            { label: '3.5', value: 3.5 },
            { label: '4', value: 4 },
          ]}
          label="Left"
          onChange={(val) => {
            setFieldValue('margin', [values.margin[0], values.margin[1], values.margin[2], val]);
          }}
          value={values.margin[3]}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      </Grid>

      <Grid size={{ xs: 6 }}>
        <CustomSelect
          options={[
            { label: '0', value: 0 },
            { label: '0.25', value: 0.25 },
            { label: '1', value: 1 },
            { label: '1.5', value: 1.5 },
            { label: '2', value: 2 },
            { label: '2.5', value: 2.5 },
            { label: '3', value: 3 },
            { label: '3.5', value: 3.5 },
            { label: '4', value: 4 },
          ]}
          label="Right"
          onChange={(val) => {
            setFieldValue('margin', [values.margin[0], val, values.margin[2], values.margin[3]]);
          }}
          value={values.margin[1]}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      </Grid>

      <Grid size={{ xs: 6 }}>
        <CustomSelect
          options={[
            { label: '0', value: 0 },
            { label: '0.25', value: 0.25 },
            { label: '1', value: 1 },
            { label: '1.5', value: 1.5 },
            { label: '2', value: 2 },
            { label: '2.5', value: 2.5 },
            { label: '3', value: 3 },
            { label: '3.5', value: 3.5 },
            { label: '4', value: 4 },
          ]}
          label="Top"
          onChange={(val) => {
            setFieldValue('margin', [val, values.margin[1], values.margin[2], values.margin[3]]);
          }}
          value={values.margin[0]}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      </Grid>

      <Grid size={{ xs: 6 }}>
        <CustomSelect
          options={[
            { label: '0', value: 0 },
            { label: '0.25', value: 0.25 },
            { label: '1', value: 1 },
            { label: '1.5', value: 1.5 },
            { label: '2', value: 2 },
            { label: '2.5', value: 2.5 },
            { label: '3', value: 3 },
            { label: '3.5', value: 3.5 },
            { label: '4', value: 4 },
          ]}
          label="Bottom"
          onChange={(val) => {
            setFieldValue('margin', [values.margin[0], values.margin[1], val, values.margin[3]]);
          }}
          value={values.margin[2]}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      </Grid>

      <Grid size={{ xs: 6 }}>
        <CustomSelect
          options={[
            { label: '4A0', value: '4A0' },
            { label: '2A0', value: '2A0' },
            { label: 'A0', value: 'A0' },
            { label: 'A1', value: 'A1' },
            { label: 'A2', value: 'A2' },
            { label: 'A3', value: 'A3' },
            { label: 'A4', value: 'A4' },
            { label: 'A5', value: 'A5' },
            { label: 'A6', value: 'A6' },
            { label: 'A7', value: 'A7' },
            { label: 'A8', value: 'A8' },
            { label: 'A9', value: 'A9' },
            { label: 'A10', value: 'A10' },
            { label: 'B0', value: 'B0' },
            { label: 'B1', value: 'B1' },
            { label: 'B2', value: 'B2' },
            { label: 'B3', value: 'B3' },
            { label: 'B4', value: 'B4' },
            { label: 'B5', value: 'B5' },
            { label: 'B6', value: 'B6' },
            { label: 'B7', value: 'B7' },
            { label: 'B8', value: 'B8' },
            { label: 'B9', value: 'B9' },
            { label: 'B10', value: 'B10' },
            { label: 'C0', value: 'C0' },
            { label: 'C1', value: 'C1' },
            { label: 'C2', value: 'C2' },
            { label: 'C3', value: 'C3' },
            { label: 'C4', value: 'C4' },
            { label: 'C5', value: 'C5' },
            { label: 'C6', value: 'C6' },
            { label: 'C7', value: 'C7' },
            { label: 'C8', value: 'C8' },
            { label: 'C9', value: 'C9' },
            { label: 'C10', value: 'C10' },
            { label: 'RA0', value: 'RA0' },
            { label: 'RA1', value: 'RA1' },
            { label: 'RA2', value: 'RA2' },
            { label: 'RA3', value: 'RA3' },
            { label: 'RA4', value: 'RA4' },
            { label: 'SRA0', value: 'SRA0' },
            { label: 'SRA1', value: 'SRA1' },
            { label: 'SRA2', value: 'SRA2' },
            { label: 'SRA3', value: 'SRA3' },
            { label: 'SRA4', value: 'SRA4' },
            { label: 'EXECUTIVE', value: 'EXECUTIVE' },
            { label: 'FOLIO', value: 'FOLIO' },
            { label: 'LEGAL', value: 'LEGAL' },
            { label: 'LETTER', value: 'LETTER' },
            { label: 'TABLOID', value: 'TABLOID' },
            { label: 'ID1', value: 'ID1' },
          ]}
          label="Page Size"
          onChange={(val) => {
            setFieldValue('page', val);
          }}
          value={values.page}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={values.isGridShow}
              onChange={(e) => setFieldValue('isGridShow', e.target.checked)}
            />
          }
          label="Show Grid"
        />
      </Grid>
    </Grid>
  );
};

interface IAccordionProps {
  handleChangeTab: (tab: number) => void;
  activeTab: number | null;
  accordionDetails: {
    title: string;
    content: React.ReactNode;
  }[];
}

const AccordingComp = ({ accordionDetails = [], handleChangeTab, activeTab }: IAccordionProps) => (
  <Stack spacing={5} direction="row" alignItems="flex-start">
    <Stack
      component="section"
      spacing={2}
      flex="1 1 auto"
      sx={{
        minWidth: 0,
        borderRadius: 2,
        p: 2,
        bgcolor: 'background.neutral',
      }}
    >
      <Card className="scroll__to__view">
        <CardContent sx={{ p: 2 }}>
          <ComponentBlock sx={{ p: 2 }}>
            <Box sx={{ width: '100%' }}>
              {accordionDetails.map((item, index) => (
                <Accordion
                  key={item.title}
                  expanded={activeTab === index}
                  onChange={() => handleChangeTab(index)}
                >
                  <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                    <Typography variant="subtitle1" fontSize="14px">
                      {item.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>{item.content}</AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </ComponentBlock>
        </CardContent>
      </Card>
    </Stack>
  </Stack>
);

const PdfHeader = ({ formik }: any) => {
  const dialog = useBoolean();
  const { elements, header } = formik.values;
  return (
    <Box>
      <TextField
        label="Height"
        type="number"
        size="small"
        fullWidth
        value={header?.height ?? 100}
        onChange={(e) => {
          formik.setFieldValue('header.height', +e.target.value);
        }}
        InputProps={{
          endAdornment: <InputAdornment position="end">px</InputAdornment>,
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button size="small" color="primary" startIcon={<Add />} onClick={dialog.onTrue}>
          Add Element
        </Button>
      </Box>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {elements?.map((item: any, index: number) => {
          if (item.type === 'text') {
            return (
              <ComponentBlock title={item.label} sx={{ gap: 1, p: 2 }}>
                <Iconify
                  icon="charm:circle-cross"
                  sx={{
                    position: 'absolute',
                    right: '0',
                    top: '-9px',
                    zIndex: '203',
                    stroke: 'red',
                    color: 'rgba(var(--palette-grey-500Channel) / 02)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const newElements = [...elements];
                    newElements.splice(index, 1);
                    formik.setFieldValue('elements', newElements);
                  }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <TextField
                    value={item.text}
                    fullWidth
                    size="small"
                    onChange={(e) => {
                      const newElements = [...elements];
                      newElements[index].text = e.target.value;
                      formik.setFieldValue('elements', newElements);
                    }}
                  />
                  <ThreeDotsActions
                    actions={() => (
                      <Box sx={{ width: 400, p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6, md: 6 }}>
                            <TextField
                              size="small"
                              label="Font Size"
                              type="number"
                              fullWidth
                              value={item?.style?.fontSize ?? 14}
                              onChange={(e) => {
                                const newElements = [...elements];
                                newElements[index] = {
                                  ...newElements[index],
                                  style: {
                                    ...(newElements[index]?.style || {}),
                                    fontSize: +e.target.value,
                                  },
                                };
                                formik.setFieldValue('elements', newElements);
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 6, md: 6 }}>
                            <TextField
                              select
                              size="small"
                              label="Font Weight"
                              fullWidth
                              value={item?.style?.fontWeight ?? 'normal'}
                              onChange={(e) => {
                                const newElements = [...elements];
                                newElements[index] = {
                                  ...newElements[index],
                                  style: {
                                    ...(newElements[index]?.style || {}),
                                    fontWeight: e.target.value,
                                  },
                                };
                                formik.setFieldValue('elements', newElements);
                              }}
                            >
                              <MenuItem value="normal">Normal</MenuItem>
                              <MenuItem value="bold">Bold</MenuItem>
                            </TextField>
                          </Grid>

                          <Grid size={{ xs: 6, md: 6 }}>
                            <TextField
                              select
                              size="small"
                              label="Font Style"
                              value={item?.style?.fontStyle ?? 'normal'}
                              fullWidth
                              onChange={(e) => {
                                const newElements = [...elements];
                                newElements[index] = {
                                  ...newElements[index],
                                  style: {
                                    ...(newElements[index]?.style || {}),
                                    fontStyle: e.target.value,
                                  },
                                };
                                formik.setFieldValue('elements', newElements);
                              }}
                            >
                              <MenuItem value="normal">Normal</MenuItem>
                              <MenuItem value="italic">Italic</MenuItem>
                            </TextField>
                          </Grid>

                          <Grid size={{ xs: 6, md: 6 }}>
                            <TextField
                              size="small"
                              label="Color"
                              type="color"
                              fullWidth
                              value={item?.style?.color ?? '#000000'}
                              onChange={(e) => {
                                const newElements = [...elements];
                                newElements[index] = {
                                  ...newElements[index],
                                  style: {
                                    ...(newElements[index]?.style || {}),
                                    color: e.target.value,
                                  },
                                };
                                formik.setFieldValue('elements', newElements);
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 6, md: 6 }}>
                            <TextField
                              size="small"
                              label="Width"
                              type="number"
                              fullWidth
                              value={item?.style?.width ?? 100}
                              onChange={(e) => {
                                const newElements = [...elements];
                                newElements[index] = {
                                  ...newElements[index],
                                  style: {
                                    ...(newElements[index]?.style || {}),
                                    width: Number(e.target.value),
                                  },
                                };
                                formik.setFieldValue('elements', newElements);
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 6, md: 6 }}>
                            <TextField
                              size="small"
                              label="Height"
                              type="number"
                              fullWidth
                              value={item?.style?.height ?? 100}
                              onChange={(e) => {
                                const newElements = [...elements];
                                newElements[index] = {
                                  ...newElements[index],
                                  style: {
                                    ...(newElements[index]?.style || {}),
                                    height: Number(e.target.value),
                                  },
                                };
                                formik.setFieldValue('elements', newElements);
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    placement="right-center"
                  />
                </Box>
              </ComponentBlock>
            );
          }
          if (item.type === 'image') {
            return (
              <ComponentBlock title={item.label} sx={{ gap: 1, p: 2 }}>
                <Iconify
                  icon="charm:circle-cross"
                  sx={{
                    position: 'absolute',
                    right: '0',
                    top: '-9px',
                    zIndex: '203',
                    stroke: 'red',
                    color: 'rgba(var(--palette-grey-500Channel) / 02)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const newElements = [...elements];
                    newElements.splice(index, 1);
                    formik.setFieldValue('elements', newElements);
                  }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <img src={item.image} alt="" width="100px" height="100px" />
                  <ThreeDotsActions
                    actions={() => (
                      <Box sx={{ width: 400, p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <TextField
                              size="small"
                              label="width"
                              type="number"
                              value={item?.style?.width ?? 100}
                              onChange={(e) => {
                                const newElements = [...elements];
                                newElements[index] = {
                                  ...newElements[index],
                                  style: {
                                    ...(newElements[index]?.style || {}),
                                    width: +e.target.value,
                                  },
                                };
                                formik.setFieldValue('elements', newElements);
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 6 }}>
                            <TextField
                              size="small"
                              label="height"
                              type="number"
                              value={item?.style?.height ?? 100}
                              onChange={(e) => {
                                const newElements = [...elements];
                                newElements[index] = {
                                  ...newElements[index],
                                  style: {
                                    ...(newElements[index]?.style || {}),
                                    height: +e.target.value,
                                  },
                                };
                                formik.setFieldValue('elements', newElements);
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    placement="right-center"
                  />
                </Box>
              </ComponentBlock>
            );
          }
          if (item.type === 'divider') {
            return (
              <ComponentBlock title={item.label} sx={{ gap: 1, p: 2 }}>
                <Iconify
                  icon="charm:circle-cross"
                  sx={{
                    position: 'absolute',
                    right: '0',
                    top: '-9px',
                    zIndex: '203',
                    stroke: 'red',
                    color: 'rgba(var(--palette-grey-500Channel) / 02)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const newElements = [...elements];
                    newElements.splice(index, 1);
                    formik.setFieldValue('elements', newElements);
                  }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Box sx={{ borderBottom: '1px solid black', width: '100%' }} />
                  <ThreeDotsActions
                    actions={() => (
                      <Box sx={{ width: 400, p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <TextField
                              size="small"
                              label="Color"
                              type="color"
                              fullWidth
                              value={item?.style?.borderColor ?? '#000000'}
                              onChange={(e) => {
                                const newElements = [...elements];
                                newElements[index] = {
                                  ...newElements[index],
                                  style: {
                                    ...(newElements[index]?.style || {}),
                                    borderColor: e.target.value,
                                  },
                                };
                                formik.setFieldValue('elements', newElements);
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 6 }}>
                            <TextField
                              size="small"
                              label="width"
                              type="number"
                              value={item?.style?.borderWidth ?? 1}
                              onChange={(e) => {
                                const newElements = [...elements];
                                newElements[index] = {
                                  ...newElements[index],
                                  style: {
                                    ...(newElements[index]?.style || {}),
                                    borderWidth: +e.target.value,
                                  },
                                };
                                formik.setFieldValue('elements', newElements);
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    placement="right-center"
                  />
                </Box>
              </ComponentBlock>
            );
          }
          return null;
        })}
      </Stack>
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Add Element">
        <ElementForm
          handleClose={dialog.onFalse}
          handleSubmit={(values) => {
            formik.setFieldValue('elements', [
              ...elements,
              { ...values, label: `${elements.length + 1}.${values.label}` },
            ]);
            dialog.onFalse();
          }}
        />
      </CustomDialog>
    </Box>
  );
};

interface IElementFormProps {
  handleClose: () => void;
  handleSubmit: (values: any) => void;
}
const ElementForm = ({ handleClose, handleSubmit }: IElementFormProps) => {
  const formik = useFormik({
    initialValues: {
      type: '',
      text: '',
      label: '',
      image: '',
      filedType: 'static',
    },
    onSubmit: (values) =>
      handleSubmit({
        ...values,

        style: {
          width: values.type === 'text' ? 100 : values.type === 'image' ? 100 : '100%',
          height: values.type === 'text' ? 100 : values.type === 'image' ? 100 : '2px',
        },
      }),
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2}>
          <CustomSelect
            options={[
              {
                label: 'Text',
                value: 'text',
              },
              {
                label: 'Image',
                value: 'image',
              },
              {
                label: 'Divider',
                value: 'divider',
              },
            ]}
            label="Type"
            value={formik.values.type}
            onChange={(val) => formik.setFieldValue('type', val)}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
          <CustomSelect
            options={[
              {
                label: 'Dynamic',
                value: 'dynamic',
              },
              {
                label: 'Static',
                value: 'static',
              },
            ]}
            label="Filed type"
            value={formik.values.filedType}
            onChange={(val) => formik.setFieldValue('filedType', val)}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />

          {formik.values.filedType === 'static' && (
            <TextField
              fullWidth
              label="Label"
              size="small"
              value={formik.values.label}
              onChange={(e) => formik.setFieldValue('label', e.target.value)}
            />
          )}
          {formik.values.filedType === 'dynamic' && (
            <CustomSelect
              options={[
                {
                  label: 'Photo',
                  value: 'photo',
                },
                {
                  label: 'Code',
                  value: 'code',
                },
                {
                  label: 'Last Name',
                  value: 'lastName',
                },
                {
                  label: 'First Name',
                  value: 'firstName',
                },
                {
                  label: 'Middle Name',
                  value: 'middleName',
                },
                {
                  label: 'Short Name',
                  value: 'shortName',
                },
                {
                  label: 'Employee Status',
                  value: 'employeeStatusType',
                },
                {
                  label: 'Subject',
                  value: 'subject',
                },
                {
                  label: 'Date of Birth',
                  value: 'dob',
                },
                {
                  label: 'Family Cast',
                  value: 'familyCast',
                },
                {
                  label: 'Cast Type',
                  value: 'castType',
                },
                {
                  label: 'Gender',
                  value: 'gender',
                },
                {
                  label: 'Religion',
                  value: 'religion',
                },
                {
                  label: 'Marital Status',
                  value: 'maritalStatus',
                },
                {
                  label: 'Blood Group',
                  value: 'bloodGroup',
                },
                {
                  label: 'Mobile Number',
                  value: 'mobileNo',
                },
                {
                  label: 'Email',
                  value: 'email',
                },
                {
                  label: 'Department',
                  value: 'department',
                },
                {
                  label: 'Designation',
                  value: 'designation',
                },
                {
                  label: 'Date of Joining',
                  value: 'dateOfJoining',
                },
                {
                  label: 'Employee Group',
                  value: 'employeeGroup',
                },
                {
                  label: 'Qualification',
                  value: 'qualification',
                },
                {
                  label: 'Role',
                  value: 'role',
                },
                {
                  label: 'Identification Mark',
                  value: 'identificationMark1',
                },
                {
                  label: 'Address',
                  value: 'address',
                },
                {
                  label: 'State',
                  value: 'state',
                },
                {
                  label: 'City',
                  value: 'city',
                },
                {
                  label: 'Pincode',
                  value: 'pinCode',
                },
                {
                  label: 'Employee ID',
                  value: 'employeeId',
                },
                {
                  label: 'Father Name',
                  value: 'fatherName',
                },
                {
                  label: 'Father Occupation',
                  value: 'fatherOccupation',
                },
                {
                  label: 'Father Contact',
                  value: 'fatherContactNo',
                },
                {
                  label: 'Father Address',
                  value: 'fatherAddress',
                },
                {
                  label: 'Father State',
                  value: 'fatherState',
                },
                {
                  label: 'Father City',
                  value: 'fatherCity',
                },
                {
                  label: 'Father Pincode',
                  value: 'fatherPinCode',
                },
                {
                  label: 'Mother Name',
                  value: 'motherName',
                },
                {
                  label: 'Mother Occupation',
                  value: 'motherOccupation',
                },
                {
                  label: 'Mother Contact',
                  value: 'motherContactNo',
                },
                {
                  label: 'Mother Address',
                  value: 'motherAddress',
                },
                {
                  label: 'Mother State',
                  value: 'motherState',
                },
                {
                  label: 'Mother City',
                  value: 'motherCity',
                },
                {
                  label: 'Mother Pincode',
                  value: 'motherPinCode',
                },
                {
                  label: 'Spouse Name',
                  value: 'spouseName',
                },
                {
                  label: 'Spouse Occupation',
                  value: 'spouseOccupation',
                },
                {
                  label: 'Spouse Contact',
                  value: 'spouseContactNo',
                },
                {
                  label: 'Spouse Address',
                  value: 'spouseAddress',
                },
                {
                  label: 'Spouse State',
                  value: 'spouseState',
                },
                {
                  label: 'Spouse City',
                  value: 'spouseCity',
                },
                {
                  label: 'Spouse Pincode',
                  value: 'spousePinCode',
                },
                {
                  label: 'Bank Name',
                  value: 'bankName',
                },
                {
                  label: 'Branch Name',
                  value: 'branchName',
                },
                {
                  label: 'Account Holder Name',
                  value: 'accountHolderName',
                },
                {
                  label: 'Account Number',
                  value: 'accountNumber',
                },
                {
                  label: 'IFSC Code',
                  value: 'ifscCode',
                },
                {
                  label: 'PF Type',
                  value: 'pfType',
                },
                {
                  label: 'EPF Number',
                  value: 'epfNumber',
                },
                {
                  label: 'UAN Number',
                  value: 'uanNumber',
                },
                {
                  label: 'Basic Salary',
                  value: 'basicSalary',
                },
                {
                  label: 'Punch ID',
                  value: 'punchId',
                },
                {
                  label: 'Shift Name',
                  value: 'shiftName',
                },
              ]}
              label="Field"
              value={formik.values.label}
              onChange={(val) => formik.setFieldValue('label', val)}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            />
          )}
          {formik.values.type === 'text' && (
            <TextField
              fullWidth
              label="Text"
              size="small"
              value={formik.values.text}
              onChange={(e) => formik.setFieldValue('text', e.target.value)}
              helperText={`Use format for Text Value: '{{Text Value}}'`}
            />
          )}
          {formik.values.type === 'image' && (
            <>
              <UploadButton
                fullWidth
                startIcon={<Add />}
                onChange={(e) => {
                  const val = e.target.files[0];
                  const fileReader = new FileReader();
                  fileReader.readAsDataURL(val);
                  fileReader.onload = () => {
                    formik.setFieldValue('image', fileReader.result);
                  };
                }}
                children="Upload Image"
              />
              {formik.values.image && (
                <img src={formik.values.image} alt="" style={{ width: '100%', height: '80px' }} />
              )}
            </>
          )}
          {/* <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.isDynamic}
                onChange={(e) => formik.setFieldValue('isDynamic', e.target.checked)}
                size="small"
              />
            }
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                Dynamic Field (
                <Typography variant="caption" color="textSecondary">
                  Use format for Text Value: {`{{${formik.values.label || 'Label'}}}`}
                </Typography>
                )
              </Stack>
            }
          /> */}
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" size="small" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" size="small">
          Save
        </Button>
      </DialogActions>
    </Box>
  );
};
