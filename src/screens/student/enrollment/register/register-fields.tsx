import { capitalize } from 'lodash';

import { Divider } from '@mui/material';

import { YesNoArray } from 'src/enums/yes-no';
import { CategoryArray } from 'src/enums/studnet-category';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import CustomSelect from 'src/components/custom-select';

import RenderStudent from './RenderStudent';
import { RenderDocuments } from './RenderDocument';
import { generalFormFields } from './GeneralFormFields';
import RenderFamilyInformation from './RenderFamilyInformation';
import RenderLocalAddressFields from './RenderLocalAddressFields';
import RenderPermanentAddressFields from './RenderPermanentAddressFields';
import RenderEmergencyAddressFields from './RenderEmergencyAddressFields';

import type { FieldsType } from './type';

export const documentFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Certificate Name',
    name: 'certificateName',
    placeholder: 'Enter Certificate Name',
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      return <RenderDocuments id={props.formik.values.id} />;
    },
  },
];
export const familyFields: FieldsType[] = [
  {
    name: 'fatherName',
    label: 'Father Name',
    type: 'text',
    otherProps: {},
    gridProps: { xs: 12, md: 12 },
    renderComp(props: any) {
      return <RenderFamilyInformation {...props} />;
    },
  },
];
export const communicationFields: FieldsType[] = [
  {
    name: 'primaryContactNumber',
    label: 'Primary Contact Number',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      const { formik, isEdit } = props;
      return (
        <PhoneInput
          disabled={!isEdit}
          name="primaryContactNumber"
          value={formik.values.primaryContactNumber}
          onChange={(value) => {
            formik.setFieldValue('primaryContactNumber', value);
          }}
          autoFocus
          label="Primary Contact Number"
          placeholder="Primary Contact Number"
          error={formik.touched.primaryContactNumber && Boolean(formik.errors.primaryContactNumber)}
        />
      );
    },
  },
  {
    name: 'parentContactNumber',
    label: 'Parent Contact Number',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      const { formik, isEdit } = props;

      return (
        <PhoneInput
          name="parentContactNumber"
          disabled={!isEdit}
          value={formik.values.parentContactNumber}
          onChange={(value) => {
            formik.setFieldValue('parentContactNumber', value);
          }}
          label="Parent Contact Number"
          placeholder="Parent Contact Number"
          error={formik.touched.parentContactNumber && Boolean(formik.errors.parentContactNumber)}
        />
      );
    },
  },
  {
    name: 'parentEmail',
    label: 'Parent Email',
    type: 'email',
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
    name: 'studentContactNo',
    label: 'Student Contact Number',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      const { formik, isEdit } = props;

      return (
        <PhoneInput
          disabled={!isEdit}
          name="studentContactNo"
          value={formik.values.studentContactNo}
          onChange={(value) => {
            formik.setFieldValue('studentContactNo', value);
          }}
          label="Student Contact Number"
          placeholder="Student Contact Number"
          error={formik.touched.studentContactNo && Boolean(formik.errors.studentContactNo)}
          helperText={formik.touched.studentContactNo && formik.errors.studentContactNo}
        />
      );
    },
  },
  {
    name: 'studentEmail',
    label: 'Student Email',
    type: 'email',
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
    name: 'whatsAppContactNo',
    label: 'WhatsApp Contact Number',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      const { formik, isEdit } = props;

      return (
        <PhoneInput
          disabled={!isEdit}
          name="whatsAppContactNo"
          value={formik.values.whatsAppContactNo}
          onChange={(value) => {
            formik.setFieldValue('whatsAppContactNo', value);
          }}
          label="Whatsapp Number"
          placeholder="Whatsapp Number"
          error={formik.touched.whatsAppContactNo && Boolean(formik.errors.whatsAppContactNo)}
          helperText={formik.touched.whatsAppContactNo && formik.errors.whatsAppContactNo}
        />
      );
    },
  },
  {
    name: 'localAddress',
    label: 'Local Address',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
    renderComp: RenderLocalAddressFields,
  },
  {
    name: 'permanentAddress',
    label: 'Permanent Address',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
    renderComp: RenderPermanentAddressFields,
  },
  {
    name: 'emergencyAddress',
    label: 'Emergency Address',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
    renderComp: RenderEmergencyAddressFields,
  },
  {
    name: 'remarks',
    label: 'Remarks',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
  },
];

export const additionalDetailsFields: FieldsType[] = [
  {
    name: 'category',
    label: 'Category',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={CategoryArray}
          disabled={!props.isEdit}
          label="Category"
          value={props.formik.values.category}
          onChange={(value) => {
            props.formik.setFieldValue('category', value);
          }}
          autoFocus
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={props.formik.touched.category && Boolean(props.formik.errors.category)}
          helperText={props.formik.touched.category && props.formik.errors.category}
        />
      );
    },
  },
  // {
  //   name: 'RTE',
  //   label: 'Right to Education',
  //   type: 'text',
  //   otherProps: {},
  //   renderComp(props: any) {
  //     return (
  //       <CustomSelect
  //         disabled={!props.isEdit}
  //         options={YesNoArray as any}
  //         label="Right to Education"
  //         value={props.formik.values.RTE}
  //         onChange={(value) => {
  //           props.formik.setFieldValue('RTE', value);
  //         }}
  //         formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
  //         error={props.formik.touched.RTE && Boolean(props.formik.errors.RTE)}
  //         helperText={props.formik.touched.RTE && props.formik.errors.RTE}
  //       />
  //     );
  //   },
  // },
  {
    name: 'bplStudent',
    label: 'BPL Student',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          disabled={!props.isEdit}
          options={YesNoArray as any}
          label="BPL Student"
          value={props.formik.values.bplStudent}
          onChange={(value) => {
            props.formik.setFieldValue('bplStudent', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={props.formik.touched.bplStudent && Boolean(props.formik.errors.bplStudent)}
          helperText={props.formik.touched.bplStudent && props.formik.errors.bplStudent}
        />
      );
    },
  },
  {
    name: 'bplCardNo',
    label: 'BPL Card No',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      disabled: !formik.values.bplStudent,
    }),
  },
  {
    name: 'personWithDisability',
    label: 'Person With Disability',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          disabled={!props.isEdit}
          options={YesNoArray as any}
          label="Person With Disability"
          value={props.formik.values.personWithDisability}
          onChange={(value) => {
            props.formik.setFieldValue('personWithDisability', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={
            props.formik.touched.personWithDisability &&
            Boolean(props.formik.errors.personWithDisability)
          }
          helperText={
            props.formik.touched.personWithDisability && props.formik.errors.personWithDisability
          }
        />
      );
    },
  },
  {
    name: 'secondLanguage',
    label: 'Second Language',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'emergencyContactNo: ',
    label: 'Emergency Contact No',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      const { formik, isEdit } = props;
      return (
        <PhoneInput
          disabled={!isEdit}
          name="emergencyContactNo"
          value={formik.values.emergencyContactNo}
          onChange={(value) => {
            formik.setFieldValue('emergencyContactNo', value);
          }}
          placeholder="Emergency Contact No."
          label="Emergency Contact No"
          error={formik.touched.emergencyContactNo && Boolean(formik.errors.emergencyContactNo)}
        />
      );
    },
  },
  {
    name: 'singleParentChild',
    label: 'Single Parent Child',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          disabled={!props.isEdit}
          options={YesNoArray as any}
          label="Single Parent Child"
          value={props.formik.values.singleParentChild}
          onChange={(value) => {
            props.formik.setFieldValue('singleParentChild', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={
            props.formik.touched.singleParentChild && Boolean(props.formik.errors.singleParentChild)
          }
          helperText={
            props.formik.touched.singleParentChild && props.formik.errors.singleParentChild
          }
        />
      );
    },
  },
  {
    name: 'singleChild',
    label: 'Single Child',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          disabled={!props.isEdit}
          options={YesNoArray as any}
          label="Single Child"
          value={props.formik.values.singleChild}
          onChange={(value) => {
            props.formik.setFieldValue('singleChild', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={props.formik.touched.singleChild && Boolean(props.formik.errors.singleChild)}
          helperText={props.formik.touched.singleChild && props.formik.errors.singleChild}
        />
      );
    },
  },
  {
    name: 'sponsorStudent',
    label: 'Student Referrer',
    type: 'text',
    otherProps: {},
    renderComp: (props) => <RenderStudent {...props} />,
  },
  // {
  //   name: 'sponsorName ',
  //   label: 'Sponsor Name',
  //   type: 'text',
  //   otherProps: {},
  // },
];

export const medicalFields: FieldsType[] = [
  {
    name: 'weight',
    label: 'Weight (kg)',
    type: 'number',
    otherProps: { autoFocus: true },
  },
  {
    name: 'height',
    label: 'Height (cm)',
    type: 'number',
    otherProps: {},
  },
  {
    name: 'bmi',
    label: 'Body Mass Index (BMI)',
    type: 'number',
    otherProps: {},
  },
  {
    name: 'pulseRate',
    label: 'Pulse Rate',
    type: 'number',
    otherProps: {},
  },
  {
    name: 'haemoglobin',
    label: 'Haemoglobin (hb)',
    type: 'string',
    otherProps: {},
  },
  {
    name: 'allergies',
    label: 'Allergies',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'covidVaccination',
    label: 'Covid Vaccination *',
    type: 'text',
    otherProps: {
      placeholder: 'Enter Covid Vaccination *',
    },
  },
  {
    name: 'childImmunisation',
    label: 'Child Immunisation',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'immunisationRemarks',
    label: 'Immunisation Remarks',
    type: 'text',
    otherProps: {},
  },
];

export const previousSchoolFields: FieldsType[] = [
  {
    name: 'schoolName',
    label: 'Previous School Name',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('schoolName', newName);
      },
      autoFocus: true,
    }),
  },
  {
    name: 'schoolAddress',
    label: 'Previous School Address',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('schoolAddress', newName);
      },
    }),
  },
  {
    name: 'schoolBoard',
    label: 'Previous School Board',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'schoolMedium',
    label: 'Previous School Medium',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('schoolMedium', newName);
      },
    }),
  },
  {
    name: 'tcNumber',
    label: 'TC Number',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'lastClassPassed',
    label: 'Last Class Passed',
    type: 'number',
    otherProps: {},
  },
  {
    name: 'percentage',
    label: 'Percentage',
    type: 'number',
    otherProps: {},
  },
];

export const bankDetailsFields: FieldsType[] = [
  {
    name: 'bankName',
    label: 'Bank Name',
    type: 'text',
    otherProps: { autoFocus: true },
  },
  {
    name: 'accountNo',
    label: 'Account No',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'ifscCode',
    label: 'IFSC Code',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'branchName',
    label: 'Branch Name',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'accountHolderName',
    label: 'Account Holder Name',
    type: 'text',
    otherProps: {},
  },
];

// Array containing all form field groups for student registration
// Each element represents a different section of the registration form:
// - generalFormFields: Basic student information
// - documentFields: Required document uploads
// - familyFields: Parent/guardian information
// - communicationFields: Contact details
// - additionalDetailsFields: Extra student information
// - medicalFields: Health and medical information
// - previousSchoolFields: Prior education details
// - bankDetailsFields: Banking information
export const allFields = [
  generalFormFields,
  documentFields,
  familyFields,
  communicationFields,
  additionalDetailsFields,
  medicalFields,
  previousSchoolFields,
  bankDetailsFields,
];
