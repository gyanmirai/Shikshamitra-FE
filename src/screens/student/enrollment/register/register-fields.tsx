import type { SxProps, GridProps } from '@mui/material';

import dayjs from 'dayjs';
import { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Stack,
  Select,
  Divider,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  Autocomplete,
  FormControlLabel,
} from '@mui/material';

import calculateAge from 'src/utils/calculate-age';

import { GenderType, GenderTypeArray } from 'src/enums/gender';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

export interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  sx?: SxProps;
  otherProps?: Record<string, any>;
  renderComp?: (props: any) => React.ReactNode;
  gridProps?: GridProps;
}

export const generalFormFields: FieldsType[] = [
  { name: 'inquiryNo', label: 'Inquiry No', type: 'text', otherProps: { disabled: true } },
  { name: 'formNo', label: 'Form No', type: 'text' },
  { name: 'surname', label: 'Surname', type: 'text', otherProps: {} },
  { name: 'name', label: 'Name', type: 'text', otherProps: {} },
  { name: 'middleName', label: 'Middle Name', type: 'text', otherProps: {} },
  {
    name: 'dob',
    label: 'Date of Birth',
    type: 'date',
    otherProps: {},
    renderComp: (props: any) => (
      <DatePicker
        label="Date of Birth"
        name="dob"
        value={props.formik.values.dob}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            placeholder: 'Date of Birth',
            fullWidth: true,
            size: 'small',
          },
        }}
        onChange={(newValue) => {
          const date = newValue?.format();
          if (date) {
            const age = calculateAge(date);
            props.formik.setFieldValue('age', age);
          }
          props.formik.setFieldValue('dob', newValue);
        }}
      />
    ),
  },
  {
    name: 'age',
    label: 'Age',
    type: 'text',
    otherProps: {
      disabled: true,
    },
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'text',
    otherProps: {},
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
  { name: 'adharNo', label: 'Adhar No', type: 'text', otherProps: {} },
  { name: 'religion', label: 'Religion', type: 'text', otherProps: {} },
  { name: 'familyCast', label: 'Family Cast', type: 'text', otherProps: {} },
  {
    name: 'castCategory',
    label: 'Cast Category',
    type: 'text',
    otherProps: {},
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
  { name: 'motherTongue', label: 'Mother Tongue', type: 'text', otherProps: {} },
  { name: 'nationality', label: 'Nationality', type: 'text', otherProps: {} },
  { name: 'birthPlace', label: 'Birth Place', type: 'text', otherProps: {} },
  { name: 'temporaryGr', label: 'Temporary GR', type: 'text', otherProps: {} },
  { name: 'remarks', label: 'Remarks', type: 'text', otherProps: { multiline: true, rows: 2 } },
];

export const documentFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Certificate Name',
    name: 'certificateName',
    placeholder: 'Enter Certificate Name',
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      return (
        <CustomizableTable
          tableId="certificate-table"
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
            {
              name: 'Certificate_BonafiedTabular.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_Bonafied_Double.pdf',
              status: 'Uploaded',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_Bonafied_LetterHead.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_Bonafied_WithAddress.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_Bonafied_WithPreviousDetai',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_CBSETransfer.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'Certificate_Transfer_CBSE.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
            {
              name: 'First Trial Certificates.pdf',
              status: 'Pending',
              upload: 'Upload',
              view: 'View',
            },
          ]}
        />
      );
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
      const { formik } = props;

      return (
        <PhoneInput
          name="primaryContactNumber"
          value={formik.values.primaryContactNumber}
          onChange={(value) => {
            formik.setFieldValue('primaryContactNumber', value);
          }}
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
      const { formik } = props;

      return (
        <PhoneInput
          name="parentContactNumber"
          value={formik.values.parentContactNumber}
          onChange={(value) => {
            formik.setFieldValue('parentContactNumber', value);
          }}
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
      const { formik } = props;

      return (
        <PhoneInput
          name="studentContactNo"
          value={formik.values.studentContactNo}
          onChange={(value) => {
            console.log(value, 'value====>');
            formik.setFieldValue('studentContactNo', value);
          }}
          placeholder="Student Contact Number"
          error={formik.touched.studentContactNo && Boolean(formik.errors.studentContactNo)}
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
      const { formik } = props;

      return (
        <PhoneInput
          name="whatsAppContactNo"
          value={formik.values.whatsAppContactNo}
          onChange={(value) => {
            console.log(value, 'value====>');
            formik.setFieldValue('whatsAppContactNo', value);
          }}
          placeholder="Whatsapp Number"
          error={formik.touched.whatsAppContactNo && Boolean(formik.errors.whatsAppContactNo)}
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
    renderComp(props) {
      const { formik } = props;
      return (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                name="localAddress"
                value={formik.values.localAddress}
                onChange={formik.handleChange}
                error={formik.touched.localAddress && Boolean(formik.errors.localAddress)}
                helperText={formik.touched.localAddress && formik.errors.localAddress}
                fullWidth
                placeholder="Local Address"
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="localState"
                value={formik.values.localState}
                onChange={formik.handleChange}
                error={formik.touched.state && Boolean(formik.errors.localState)}
                helperText={formik.touched.localState && formik.errors.localState}
                fullWidth
                placeholder="State"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="localCity"
                value={formik.values.localCity}
                onChange={formik.handleChange}
                error={formik.touched.localCity && Boolean(formik.errors.localCity)}
                helperText={formik.touched.localCity && formik.errors.localCity}
                fullWidth
                placeholder="City"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="localPincode"
                value={formik.values.localPincode}
                onChange={formik.handleChange}
                error={formik.touched.localPincode && Boolean(formik.errors.localPincode)}
                helperText={formik.touched.localPincode && formik.errors.localPincode}
                fullWidth
                placeholder="Pincode"
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      );
    },
  },
  {
    name: 'permanentAddress',
    label: 'Permanent Address',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      const { formik } = props;
      return (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.sameAsLocalForPermanent}
                    onChange={(e) => {
                      formik.setFieldValue('sameAsLocalForPermanent', e.target.checked);
                      if (e.target.checked) {
                        formik.setFieldValue('permanentAddress', formik.values.localAddress);
                        formik.setFieldValue('permanentState', formik.values.localState);
                        formik.setFieldValue('permanentCity', formik.values.localCity);
                        formik.setFieldValue('permanentPincode', formik.values.localPincode);
                      }
                    }}
                    name="sameAsLocal"
                  />
                }
                label="Same as Local Address"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="permanentAddress"
                value={formik.values.permanentAddress}
                onChange={formik.handleChange}
                error={formik.touched.permanentAddress && Boolean(formik.errors.permanentAddress)}
                helperText={formik.touched.permanentAddress && formik.errors.permanentAddress}
                fullWidth
                placeholder="Permanent Address"
                multiline
                rows={3}
                size="small"
                disabled={formik.values.sameAsLocalForPermanent}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="permanentState"
                value={formik.values.permanentState}
                onChange={formik.handleChange}
                error={formik.touched.state && Boolean(formik.errors.permanentState)}
                helperText={formik.touched.permanentState && formik.errors.permanentState}
                fullWidth
                placeholder="State"
                size="small"
                disabled={formik.values.sameAsLocalForPermanent}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="permanentCity"
                value={formik.values.permanentCity}
                onChange={formik.handleChange}
                error={formik.touched.permanentCity && Boolean(formik.errors.permanentCity)}
                helperText={formik.touched.permanentCity && formik.errors.permanentCity}
                fullWidth
                placeholder="City"
                size="small"
                disabled={formik.values.sameAsLocalForPermanent}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="permanentPincode"
                value={formik.values.permanentPincode}
                onChange={formik.handleChange}
                error={formik.touched.permanentPincode && Boolean(formik.errors.permanentPincode)}
                helperText={formik.touched.permanentPincode && formik.errors.permanentPincode}
                fullWidth
                placeholder="Pincode"
                size="small"
                disabled={formik.values.sameAsLocalForPermanent}
              />
            </Grid>
          </Grid>
        </Box>
      );
    },
  },
  {
    name: 'emergencyAddress',
    label: 'Emergency Address',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      const { formik } = props;
      return (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.emergencySameAsLocal}
                    onChange={(e) => {
                      formik.setFieldValue('emergencySameAsLocal', e.target.checked);
                      if (e.target.checked) {
                        formik.setFieldValue('emergencyAddress', formik.values.localAddress);
                        formik.setFieldValue('emergencyState', formik.values.localState);
                        formik.setFieldValue('emergencyCity', formik.values.localCity);
                        formik.setFieldValue('emergencyPincode', formik.values.localPincode);
                      }
                    }}
                  />
                }
                label="Same as Local Address"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="emergencyAddress"
                value={formik.values.emergencyAddress}
                onChange={formik.handleChange}
                error={formik.touched.emergencyAddress && Boolean(formik.errors.emergencyAddress)}
                helperText={formik.touched.emergencyAddress && formik.errors.emergencyAddress}
                fullWidth
                placeholder="Emergency Address"
                multiline
                rows={3}
                size="small"
                disabled={formik.values.emergencySameAsLocal}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="emergencyState"
                value={formik.values.emergencyState}
                onChange={formik.handleChange}
                error={formik.touched.state && Boolean(formik.errors.emergencyState)}
                helperText={formik.touched.emergencyState && formik.errors.emergencyState}
                fullWidth
                placeholder="State"
                size="small"
                disabled={formik.values.emergencySameAsLocal}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="emergencyCity"
                value={formik.values.emergencyCity}
                onChange={formik.handleChange}
                error={formik.touched.emergencyCity && Boolean(formik.errors.emergencyCity)}
                helperText={formik.touched.emergencyCity && formik.errors.emergencyCity}
                fullWidth
                placeholder="City"
                size="small"
                disabled={formik.values.emergencySameAsLocal}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="emergencyPincode"
                value={formik.values.emergencyPincode}
                onChange={formik.handleChange}
                error={formik.touched.emergencyPincode && Boolean(formik.errors.emergencyPincode)}
                helperText={formik.touched.emergencyPincode && formik.errors.emergencyPincode}
                fullWidth
                placeholder="Pincode"
                size="small"
                disabled={formik.values.emergencySameAsLocal}
              />
            </Grid>
          </Grid>
        </Box>
      );
    },
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
          options={[]}
          label="Category"
          value={props.formik.values.category}
          onChange={(value) => {
            props.formik.setFieldValue('category', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      );
    },
  },
  {
    name: 'RTE',
    label: 'Right to Education',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={[
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
          ]}
          label="Right to Education"
          value={props.formik.values.RTE}
          onChange={(value) => {
            props.formik.setFieldValue('RTE', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      );
    },
  },
  {
    name: 'bplStudent',
    label: 'BPL Student',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={[
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
          ]}
          label="BPL Student"
          value={props.formik.values.bplStudent}
          onChange={(value) => {
            props.formik.setFieldValue('bplStudent', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      );
    },
  },
  {
    name: 'bplCardNo',
    label: 'BPL Card No',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'personWithDisability',
    label: 'Person With Disability',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={[
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
          ]}
          label="Person With Disability"
          value={props.formik.values.personWithDisability}
          onChange={(value) => {
            props.formik.setFieldValue('personWithDisability', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
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
  },
  {
    name: 'singleParentChild',
    label: 'Single Parent Child',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={[
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
          ]}
          label="Single Parent Child"
          value={props.formik.values.singleParentChild}
          onChange={(value) => {
            props.formik.setFieldValue('singleParentChild', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
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
          options={[
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
          ]}
          label="Single Child"
          value={props.formik.values.singleChild}
          onChange={(value) => {
            props.formik.setFieldValue('singleChild', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      );
    },
  },
  {
    name: 'sponsorStudent',
    label: 'Sponsor Student',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <Autocomplete
          loading={false}
          noOptionsText="No Student Found"
          fullWidth
          value={props.formik.values.sponsorStudent}
          onChange={(e, value: any) => {
            props.formik.setFieldValue('sponsorStudent', value);
          }}
          options={[]}
          getOptionLabel={(option: any) => option?.firstName || ''}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Student"
              placeholder="Search  Student"
              fullWidth
            />
          )}
          renderOption={(prop: any, option: any) => (
            <li {...prop} key={option.id}>
              {option.firstName}
            </li>
          )}
        />
      );
    },
  },
  {
    name: 'sponsorName ',
    label: 'Sponsor Name',
    type: 'text',
    otherProps: {},
  },
];

export const medicalFields: FieldsType[] = [
  {
    name: 'weight',
    label: 'Weight (kg)',
    type: 'number',
    otherProps: {},
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
    type: 'number',
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
    label: 'Covid Vaccination',
    type: 'text',
    otherProps: {},
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
    otherProps: {},
  },
  {
    name: 'schoolAddress',
    label: 'Previous School Address',
    type: 'text',
    otherProps: {},
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
    otherProps: {},
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
    type: 'text',
    otherProps: {},
  },
  {
    name: 'percentage',
    label: 'Percentage',
    type: 'text',
    otherProps: {},
  },
];

export const bankDetailsFields: FieldsType[] = [
  {
    name: 'bankName',
    label: 'Bank Name',
    type: 'text',
    otherProps: {},
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

export const generalFieldsInitialValues = (editData?: any) => ({
  inquiryNo: editData?.inquiryNo || '',
  formNo: editData?.formNo || '',
  surname: editData?.surname || '',
  name: editData?.name || '',
  middleName: editData?.middleName || '',
  dob: null,
  age: '',
  gender: editData?.gender || '',
  adharNo: editData?.adharNo || '',
  religion: editData?.religion || '',
  familyCast: editData ? editData.familyCast : '',
  castCategory: editData ? editData.castCategory : '',
  motherTongue: editData?.motherTongue || '',
  nationality: editData?.nationality || '',
  birthPlace: editData?.birthPlace || '',
  temporaryGr: editData?.temporaryGr || '',
  remarks: editData?.remarks || '',
});

export const documentFieldsInitialValues = (editData?: any) => ({
  documents: editData?.documents || [],
});

export const familyFieldsInitialValues = (editData?: any) => ({
  fatherName: editData?.fatherName || '',
  fatherDob: editData?.fatherDob ? dayjs(editData.fatherDob) : null,
  fatherOccupation: editData?.fatherOccupation || '',
  fatherQualification: editData?.fatherQualification || '',
  fatherContactNo: editData?.fatherContactNo || '',
  fatherEmail: editData?.fatherEmail || '',
  fatherPassOutYear: editData?.fatherPassOutYear || '',
  fatherOfficeNo: editData?.fatherOfficeNo || '',
  fatherOfficeAddress: editData?.fatherOfficeAddress || '',
  fatherDesignation: editData?.fatherDesignation || '',
  fatherOrganization: editData?.fatherOrganization || '',
  fatherAadharNo: editData?.fatherAadharNo || '',
  fatherRemarks: editData?.fatherRemarks || '',
  fatherAddress: editData?.fatherAddress || '',
  motherName: editData?.motherName || '',
  motherDob: editData?.motherDob ? dayjs(editData.motherDob) : null,
  motherOccupation: editData?.motherOccupation || '',
  motherQualification: editData?.motherQualification || '',
  motherContactNo: editData?.motherContactNo || '',
  motherEmail: editData?.motherEmail || '',
  motherPassOutYear: editData?.motherPassOutYear || '',
  motherOfficeNo: editData?.motherOfficeNo || '',
  motherOfficeAddress: editData?.motherOfficeAddress || '',
  motherDesignation: editData?.motherDesignation || '',
  motherOrganization: editData?.motherOrganization || '',
  motherAadharNo: editData?.motherAadharNo || '',
  motherRemarks: editData?.motherRemarks || '',
  motherAddress: editData?.motherAddress || '',
  guardianName: editData?.guardianName || '',
  guardianDob: editData?.guardianDob ? dayjs(editData.guardianDob) : null,
  guardianOccupation: editData?.guardianOccupation || '',
  guardianQualification: editData?.guardianQualification || '',
  guardianContactNo: editData?.guardianContactNo || '',
  guardianEmail: editData?.guardianEmail || '',
  guardianPassOutYear: editData?.guardianPassOutYear || '',
  guardianOfficeNo: editData?.guardianOfficeNo || '',
  guardianOfficeAddress: editData?.guardianOfficeAddress || '',
  guardianDesignation: editData?.guardianDesignation || '',
  guardianOrganization: editData?.guardianOrganization || '',
  guardianAadharNo: editData?.guardianAadharNo || '',
  guardianRemarks: editData?.guardianRemarks || '',
  guardianAddress: editData?.guardianAddress || '',
});

export const CommunicationFieldsInitialValues = (editData?: any) => ({
  primaryContactNumber: editData?.primaryContactNumber || '',
  parentContactNumber: editData?.parentContactNumber || '',
  parentEmail: editData?.parentEmail || '',
  studentContactNo: editData?.studentContactNo || '',
  studentEmail: editData?.studentEmail || '',
  whatsAppContactNo: editData?.whatsAppContactNo || '',

  localState: editData?.localState || '',
  localCity: editData?.localCity || '',
  localPincode: editData?.localPincode || '',
  localAddress: editData?.localAddress || '',

  emergencyState: editData?.emergencyState || '',
  emergencyCity: editData?.emergencyCity || '',
  emergencyPincode: editData?.emergencyPincode || '',
  emergencyAddress: editData?.emergencyAddress || '',
  emergencySameAsLocal: editData?.emergencySameAsLocal || false,

  permanentAddress: editData?.permanentAddress || '',
  permanentState: editData?.permanentState || '',
  permanentCity: editData?.permanentCity || '',
  permanentPincode: editData?.permanentPincode || '',
  sameAsLocalForPermanent: editData?.sameAsLocalForPermanent || false,

  remarks: editData?.remarks || '',
});

export const additionalDetailsInitialValues = (editData?: any) => ({
  category: editData?.category || '',
  RTE: editData?.RTE || '',
  bplStudent: editData?.bplStudent || '',
  bplCardNo: editData?.bplCardNo || '',
  personWithDisability: editData?.personWithDisability || '',
  secondLanguage: editData?.secondLanguage || '',
  emergencyContactNo: editData?.emergencyContactNo || '',
  singleParentChild: editData?.singleParentChild || '',
  singleChild: editData?.singleChild || '',
  sponsorStudent: editData?.sponsorStudent || '',
  sponsorName: editData?.sponsorName || '',
});

export const medicalFieldsInitialValues = (editData?: any) => ({
  weight: editData?.weight || '',
  height: editData?.height || '',
  bmi: editData?.bmi || '',
  pulseRate: editData?.pulseRate || '',
  haemoglobin: editData?.haemoglobin || '',
  allergies: editData?.allergies || '',
  covidVaccination: editData?.covidVaccination || '',
  childImmunisation: editData?.childImmunisation || '',
  immunisationRemarks: editData?.immunisationRemarks || '',
});

export const previousSchoolFieldsInitialValues = (editData?: any) => ({
  schoolName: editData?.schoolName || '',
  schoolAddress: editData?.schoolAddress || '',
  schoolBoard: editData?.schoolBoard || '',
  schoolMedium: editData?.schoolMedium || '',
  tcNumber: editData?.tcNumber || '',
  lastClassPassed: editData?.lastClassPassed || '',
  percentage: editData?.percentage || '',
});

export const bankDetailsInitialValues = (editData?: any) => ({
  bankName: editData?.bankName || '',
  accountNo: editData?.accountNo || '',
  ifscCode: editData?.ifscCode || '',
  branchName: editData?.branchName || '',
  accountHolderName: editData?.accountHolderName || '',
});

function RenderFamilyInformation(props: any) {
  const { formik } = props;
  const [student, setStudent] = useState([]);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
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
              <DatePicker
                name="fatherDob"
                label="Father DOB"
                value={formik.values.fatherDob}
                onChange={(value) => {
                  formik.setFieldValue('fatherDob', value);
                }}
                slotProps={{
                  textField: {
                    error: formik.touched.fatherDob && Boolean(formik.errors.fatherDob),
                    helperText: formik.touched.fatherDob && formik.errors.fatherDob,
                    fullWidth: true,
                    size: 'small',
                  },
                }}
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
              <TextField
                name="fatherQualification"
                label="Father Qualification"
                value={formik.values.fatherQualification}
                onChange={formik.handleChange}
                error={
                  formik.touched.fatherQualification && Boolean(formik.errors.fatherQualification)
                }
                helperText={formik.touched.fatherQualification && formik.errors.fatherQualification}
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
                name="fatherEmail"
                label="Father Email"
                value={formik.values.fatherEmail}
                onChange={formik.handleChange}
                error={formik.touched.fatherEmail && Boolean(formik.errors.fatherEmail)}
                helperText={formik.touched.fatherEmail && formik.errors.fatherEmail}
                fullWidth
                size="small"
                inputProps={{
                  startAdornment: (
                    <>
                      <Iconify icon="mdi-light:email" />{' '}
                      <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                    </>
                  ),
                }}
              />

              <TextField
                name="fatherPassOutYear"
                label="Father Pass out Year"
                value={formik.values.fatherPassOutYear}
                onChange={formik.handleChange}
                error={formik.touched.fatherPassOutYear && Boolean(formik.errors.fatherPassOutYear)}
                helperText={formik.touched.fatherPassOutYear && formik.errors.fatherPassOutYear}
                fullWidth
                size="small"
              />

              <PhoneInput
                name="fatherOfficeNo"
                value={formik.values.fatherOfficeNo}
                onChange={(value) => {
                  formik.setFieldValue('fatherOfficeNo', value);
                }}
                placeholder="Enter Father Office No."
                error={formik.touched.fatherOfficeNo && Boolean(formik.errors.fatherOfficeNo)}
              />

              <TextField
                name="fatherOfficeAddress"
                multiline
                rows={3}
                label="Father Office Address"
                value={formik.values.fatherOfficeAddress}
                onChange={formik.handleChange}
                error={
                  formik.touched.fatherOfficeAddress && Boolean(formik.errors.fatherOfficeAddress)
                }
                helperText={formik.touched.fatherOfficeAddress && formik.errors.fatherOfficeAddress}
                fullWidth
                size="small"
              />
              <TextField
                name="fatherDesignation"
                label="Father Designation"
                value={formik.values.fatherDesignation}
                onChange={formik.handleChange}
                error={formik.touched.fatherDesignation && Boolean(formik.errors.fatherDesignation)}
                helperText={formik.touched.fatherDesignation && formik.errors.fatherDesignation}
                fullWidth
                size="small"
              />

              <TextField
                name="fatherOrganization"
                label="Father Organization"
                value={formik.values.fatherOrganization}
                onChange={formik.handleChange}
                error={
                  formik.touched.fatherOrganization && Boolean(formik.errors.fatherOrganization)
                }
                helperText={formik.touched.fatherOrganization && formik.errors.fatherOrganization}
                fullWidth
                size="small"
              />

              <TextField
                name="fatherAadharNo"
                label="Father Aadhar No."
                value={formik.values.fatherAadharNo}
                onChange={formik.handleChange}
                error={formik.touched.fatherAadharNo && Boolean(formik.errors.fatherAadharNo)}
                helperText={formik.touched.fatherAadharNo && formik.errors.fatherAadharNo}
                fullWidth
                size="small"
              />

              <TextField
                name="fatherRemarks"
                label="Remarks"
                multiline
                rows={3}
                value={formik.values.fatherRemarks}
                onChange={formik.handleChange}
                error={formik.touched.fatherRemarks && Boolean(formik.errors.fatherRemarks)}
                helperText={formik.touched.fatherRemarks && formik.errors.fatherRemarks}
                fullWidth
                size="small"
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
        <Grid item xs={3}>
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
              <DatePicker
                name="motherDob"
                label="Mother DOB"
                value={formik.values.motherDob}
                onChange={(value) => {
                  formik.setFieldValue('motherDob', value);
                }}
                slotProps={{
                  textField: {
                    error: formik.touched.motherDob && Boolean(formik.errors.motherDob),
                    helperText: formik.touched.motherDob && formik.errors.motherDob,
                    fullWidth: true,
                    size: 'small',
                  },
                }}
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
              <TextField
                name="motherQualification"
                label="Mother Qualification"
                value={formik.values.motherQualification}
                onChange={formik.handleChange}
                error={
                  formik.touched.motherQualification && Boolean(formik.errors.motherQualification)
                }
                helperText={formik.touched.motherQualification && formik.errors.motherQualification}
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
                name="motherEmail"
                label="Mother Email"
                value={formik.values.motherEmail}
                onChange={formik.handleChange}
                error={formik.touched.motherEmail && Boolean(formik.errors.motherEmail)}
                helperText={formik.touched.motherEmail && formik.errors.motherEmail}
                fullWidth
                size="small"
                inputProps={{
                  startAdornment: (
                    <>
                      <Iconify icon="mdi-light:email" />{' '}
                      <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                    </>
                  ),
                }}
              />

              <TextField
                name="motherPassOutYear"
                label="Mother Pass out Year"
                value={formik.values.motherPassOutYear}
                onChange={formik.handleChange}
                error={formik.touched.motherPassOutYear && Boolean(formik.errors.motherPassOutYear)}
                helperText={formik.touched.motherPassOutYear && formik.errors.motherPassOutYear}
                fullWidth
                size="small"
              />

              <PhoneInput
                name="motherOfficeNo"
                value={formik.values.motherOfficeNo}
                onChange={(value) => {
                  formik.setFieldValue('motherOfficeNo', value);
                }}
                placeholder="Enter Mother Office No."
                error={formik.touched.motherOfficeNo && Boolean(formik.errors.motherOfficeNo)}
              />

              <TextField
                name="motherOfficeAddress"
                multiline
                rows={3}
                label="Mother Office Address"
                value={formik.values.motherOfficeAddress}
                onChange={formik.handleChange}
                error={
                  formik.touched.motherOfficeAddress && Boolean(formik.errors.motherOfficeAddress)
                }
                helperText={formik.touched.motherOfficeAddress && formik.errors.motherOfficeAddress}
                fullWidth
                size="small"
              />
              <TextField
                name="motherDesignation"
                label="Mother Designation"
                value={formik.values.motherDesignation}
                onChange={formik.handleChange}
                error={formik.touched.motherDesignation && Boolean(formik.errors.motherDesignation)}
                helperText={formik.touched.motherDesignation && formik.errors.motherDesignation}
                fullWidth
                size="small"
              />

              <TextField
                name="motherOrganization"
                label="Mother Organization"
                value={formik.values.motherOrganization}
                onChange={formik.handleChange}
                error={
                  formik.touched.motherOrganization && Boolean(formik.errors.motherOrganization)
                }
                helperText={formik.touched.motherOrganization && formik.errors.motherOrganization}
                fullWidth
                size="small"
              />

              <TextField
                name="motherAadharNo"
                label="Mother Aadhar No."
                value={formik.values.motherAadharNo}
                onChange={formik.handleChange}
                error={formik.touched.motherAadharNo && Boolean(formik.errors.motherAadharNo)}
                helperText={formik.touched.motherAadharNo && formik.errors.motherAadharNo}
                fullWidth
                size="small"
              />

              <TextField
                name="motherRemarks"
                label="Remarks"
                multiline
                rows={3}
                value={formik.values.motherRemarks}
                onChange={formik.handleChange}
                error={formik.touched.motherRemarks && Boolean(formik.errors.motherRemarks)}
                helperText={formik.touched.motherRemarks && formik.errors.motherRemarks}
                fullWidth
                size="small"
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
              />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Guardian Details
            </Typography>
            <Stack spacing={1}>
              <TextField
                name="guardianName"
                label="Guardian Name"
                value={formik.values.guardianName}
                onChange={formik.handleChange}
                error={formik.touched.guardianName && Boolean(formik.errors.guardianName)}
                helperText={formik.touched.guardianName && formik.errors.guardianName}
                fullWidth
                size="small"
              />
              <DatePicker
                name="guardianDob"
                label="Guardian DOB"
                value={formik.values.guardianDob}
                onChange={(value) => {
                  formik.setFieldValue('guardianDob', value);
                }}
                slotProps={{
                  textField: {
                    error: formik.touched.guardianDob && Boolean(formik.errors.guardianDob),
                    helperText: formik.touched.guardianDob && formik.errors.guardianDob,
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
              <TextField
                name="guardianOccupation"
                label="Guardian Occupation"
                value={formik.values.guardianOccupation}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianOccupation && Boolean(formik.errors.guardianOccupation)
                }
                helperText={formik.touched.guardianOccupation && formik.errors.guardianOccupation}
                fullWidth
                size="small"
              />
              <TextField
                name="guardianQualification"
                label="Guardian Qualification"
                value={formik.values.guardianQualification}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianQualification &&
                  Boolean(formik.errors.guardianQualification)
                }
                helperText={
                  formik.touched.guardianQualification && formik.errors.guardianQualification
                }
                fullWidth
                size="small"
              />
              <PhoneInput
                name="guardianContactNo"
                value={formik.values.guardianContactNo}
                onChange={(value) => {
                  formik.setFieldValue('guardianContactNo', value);
                }}
                placeholder="Enter Spouse Contact No."
                error={formik.touched.guardianContactNo && Boolean(formik.errors.guardianContactNo)}
              />
              <TextField
                name="guardianEmail"
                label="Guardian Email"
                value={formik.values.guardianEmail}
                onChange={formik.handleChange}
                error={formik.touched.guardianEmail && Boolean(formik.errors.guardianEmail)}
                helperText={formik.touched.guardianEmail && formik.errors.guardianEmail}
                fullWidth
                size="small"
                inputProps={{
                  startAdornment: (
                    <>
                      <Iconify icon="mdi-light:email" />{' '}
                      <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                    </>
                  ),
                }}
              />

              <TextField
                name="guardianPassOutYear"
                label="Guardian Pass out Year"
                value={formik.values.guardianPassOutYear}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianPassOutYear && Boolean(formik.errors.guardianPassOutYear)
                }
                helperText={formik.touched.guardianPassOutYear && formik.errors.guardianPassOutYear}
                fullWidth
                size="small"
              />

              <PhoneInput
                name="guardianOfficeNo"
                value={formik.values.guardianOfficeNo}
                onChange={(value) => {
                  formik.setFieldValue('guardianOfficeNo', value);
                }}
                placeholder="Enter Mother Office No."
                error={formik.touched.guardianOfficeNo && Boolean(formik.errors.guardianOfficeNo)}
              />

              <TextField
                name="guardianOfficeAddress"
                multiline
                rows={3}
                label="Guardian Office Address"
                value={formik.values.guardianOfficeAddress}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianOfficeAddress &&
                  Boolean(formik.errors.guardianOfficeAddress)
                }
                helperText={
                  formik.touched.guardianOfficeAddress && formik.errors.guardianOfficeAddress
                }
                fullWidth
                size="small"
              />
              <TextField
                name="guardianDesignation"
                label="Guardian Designation"
                value={formik.values.guardianDesignation}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianDesignation && Boolean(formik.errors.guardianDesignation)
                }
                helperText={formik.touched.guardianDesignation && formik.errors.guardianDesignation}
                fullWidth
                size="small"
              />

              <TextField
                name="guardianOrganization"
                label="Guardian Organization"
                value={formik.values.guardianOrganization}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianOrganization && Boolean(formik.errors.guardianOrganization)
                }
                helperText={
                  formik.touched.guardianOrganization && formik.errors.guardianOrganization
                }
                fullWidth
                size="small"
              />

              <TextField
                name="guardianAadharNo"
                label="Guardian Aadhar No."
                value={formik.values.guardianAadharNo}
                onChange={formik.handleChange}
                error={formik.touched.guardianAadharNo && Boolean(formik.errors.guardianAadharNo)}
                helperText={formik.touched.guardianAadharNo && formik.errors.guardianAadharNo}
                fullWidth
                size="small"
              />

              <TextField
                name="guardianRemarks"
                label="Remarks"
                multiline
                rows={3}
                value={formik.values.guardianRemarks}
                onChange={formik.handleChange}
                error={formik.touched.guardianRemarks && Boolean(formik.errors.guardianRemarks)}
                helperText={formik.touched.guardianRemarks && formik.errors.guardianRemarks}
                fullWidth
                size="small"
              />

              <TextField
                name="guardianAddress"
                multiline
                rows={3}
                label="Guardian Address"
                value={formik.values.guardianAddress}
                onChange={formik.handleChange}
                error={formik.touched.guardianAddress && Boolean(formik.errors.guardianAddress)}
                helperText={formik.touched.guardianAddress && formik.errors.guardianAddress}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForSpouse}
              />
              {/* <FormControlLabel
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
              /> */}
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Sibling Details
            </Typography>
            <Autocomplete
              loading={false}
              noOptionsText="No Student Found"
              fullWidth
              value={student}
              onChange={(e, value: any) => {
                setStudent(value);
              }}
              multiple
              options={[]}
              getOptionLabel={(option: any) => option?.firstName || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Student"
                  placeholder="Search  Student"
                  fullWidth
                />
              )}
              renderOption={(prop: any, option: any) => (
                <li {...prop} key={option.id}>
                  {option.firstName}
                </li>
              )}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

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
