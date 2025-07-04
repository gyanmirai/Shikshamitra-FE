import { useState } from 'react';
import { capitalize } from 'lodash';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Divider, TextField, Typography, Autocomplete } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import ShakingTextField from 'src/components/shaking-text-field';

function MotherOfficeAddressComponent(props: any) {
  const { formik, disabled, isMainForm = false } = props;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle1">Office Address</Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherOfficeAddress1 && Boolean(formik.errors.motherOfficeAddress1)}
        >
          <TextField
            name="motherOfficeAddress1"
            label="Building No./Flat/House No."
            value={formik.values.motherOfficeAddress1}
            onChange={formik.handleChange}
            error={
              formik.touched.motherOfficeAddress1 && Boolean(formik.errors.motherOfficeAddress1)
            }
            helperText={formik.touched.motherOfficeAddress1 && formik.errors.motherOfficeAddress1}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherOfficeAddress2 && Boolean(formik.errors.motherOfficeAddress2)}
        >
          <TextField
            name="motherOfficeAddress2"
            label="Area/Locality/Road Name"
            value={formik.values.motherOfficeAddress2}
            onChange={formik.handleChange}
            error={
              formik.touched.motherOfficeAddress2 && Boolean(formik.errors.motherOfficeAddress2)
            }
            helperText={formik.touched.motherOfficeAddress2 && formik.errors.motherOfficeAddress2}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherOfficeAddress3 && Boolean(formik.errors.motherOfficeAddress3)}
        >
          <TextField
            name="motherOfficeAddress3"
            label="Landmark"
            value={formik.values.motherOfficeAddress3}
            onChange={formik.handleChange}
            error={
              formik.touched.motherOfficeAddress3 && Boolean(formik.errors.motherOfficeAddress3)
            }
            helperText={formik.touched.motherOfficeAddress3 && formik.errors.motherOfficeAddress3}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}

function GuardianOfficeAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle1">Office Address</Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={
            formik.touched.guardianOfficeAddress1 && Boolean(formik.errors.guardianOfficeAddress1)
          }
        >
          <TextField
            name="guardianOfficeAddress1"
            label="Building No./Flat/House No."
            value={formik.values.guardianOfficeAddress1}
            onChange={formik.handleChange}
            error={
              formik.touched.guardianOfficeAddress1 && Boolean(formik.errors.guardianOfficeAddress1)
            }
            helperText={
              formik.touched.guardianOfficeAddress1 && formik.errors.guardianOfficeAddress1
            }
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={
            formik.touched.guardianOfficeAddress2 && Boolean(formik.errors.guardianOfficeAddress2)
          }
        >
          <TextField
            name="guardianOfficeAddress2"
            label="Area/Locality/Road Name"
            value={formik.values.guardianOfficeAddress2}
            onChange={formik.handleChange}
            error={
              formik.touched.guardianOfficeAddress2 && Boolean(formik.errors.guardianOfficeAddress2)
            }
            helperText={
              formik.touched.guardianOfficeAddress2 && formik.errors.guardianOfficeAddress2
            }
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={
            formik.touched.guardianOfficeAddress3 && Boolean(formik.errors.guardianOfficeAddress3)
          }
        >
          <TextField
            name="guardianOfficeAddress3"
            label="Landmark"
            value={formik.values.guardianOfficeAddress3}
            onChange={formik.handleChange}
            error={
              formik.touched.guardianOfficeAddress3 && Boolean(formik.errors.guardianOfficeAddress3)
            }
            helperText={
              formik.touched.guardianOfficeAddress3 && formik.errors.guardianOfficeAddress3
            }
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}

function MotherAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle1">Local Address</Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherAddress1 && Boolean(formik.errors.motherAddress1)}
        >
          <TextField
            name="motherAddress1"
            label="Building No./Flat/House No."
            value={formik.values.motherAddress1}
            onChange={formik.handleChange}
            error={formik.touched.motherAddress1 && Boolean(formik.errors.motherAddress1)}
            helperText={formik.touched.motherAddress1 && formik.errors.motherAddress1}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherAddress2 && Boolean(formik.errors.motherAddress2)}
        >
          <TextField
            name="motherAddress2"
            label="Area/Locality/Road Name"
            value={formik.values.motherAddress2}
            onChange={formik.handleChange}
            error={formik.touched.motherAddress2 && Boolean(formik.errors.motherAddress2)}
            helperText={formik.touched.motherAddress2 && formik.errors.motherAddress2}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherAddress3 && Boolean(formik.errors.motherAddress3)}
        >
          <TextField
            name="motherAddress3"
            label="Landmark"
            value={formik.values.motherAddress3}
            onChange={formik.handleChange}
            error={formik.touched.motherAddress3 && Boolean(formik.errors.motherAddress3)}
            helperText={formik.touched.motherAddress3 && formik.errors.motherAddress3}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}

function GuardianAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle1">Local Address</Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.guardianAddress1 && Boolean(formik.errors.guardianAddress1)}
        >
          <TextField
            name="guardianAddress1"
            label="Building No./Flat/House No."
            value={formik.values.guardianAddress1}
            onChange={formik.handleChange}
            error={formik.touched.guardianAddress1 && Boolean(formik.errors.guardianAddress1)}
            helperText={formik.touched.guardianAddress1 && formik.errors.guardianAddress1}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.guardianAddress2 && Boolean(formik.errors.guardianAddress2)}
        >
          <TextField
            name="guardianAddress2"
            label="Area/Locality/Road Name"
            value={formik.values.guardianAddress2}
            onChange={formik.handleChange}
            error={formik.touched.guardianAddress2 && Boolean(formik.errors.guardianAddress2)}
            helperText={formik.touched.guardianAddress2 && formik.errors.guardianAddress2}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.guardianAddress3 && Boolean(formik.errors.guardianAddress3)}
        >
          <TextField
            name="guardianAddress3"
            label="Landmark"
            value={formik.values.guardianAddress3}
            onChange={formik.handleChange}
            error={formik.touched.guardianAddress3 && Boolean(formik.errors.guardianAddress3)}
            helperText={formik.touched.guardianAddress3 && formik.errors.guardianAddress3}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}

function RenderFamilyInformation(props: any) {
  const { formik, isEdit, isMainForm = false } = props;
  const [student, setStudent] = useState([]);

  const isFatherDetailsEditable = useBoolean(isMainForm);
  const isMotherDetailsEditable = useBoolean(isMainForm);
  const isGuardianDetailsEditable = useBoolean(isMainForm);
  const isSiblingDetailsEditable = useBoolean(isMainForm);
  const handleSave = () => {
    formik.submitForm();
  };

  const handelFatherDetailsCancel = () => {};
  const handelMotherDetailsCancel = () => {};

  const handelGuardianDetailsCancel = () => {};
  const handelSiblingDetailsCancel = () => {};

  return (
    <Box sx={{ width: '100%' }}>
      <SectionCard
        title="Father Details"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isFatherDetailsEditable}
              onSave={handleSave}
              onCancel={handelFatherDetailsCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={4} lg={3}>
          <ShakingTextField error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}>
            <TextField
              name="fatherName"
              label=" Full name *"
              value={formik.values.fatherName}
              autoFocus
              onChange={(e) => {
                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                const capitalized = capitalize(onlyLetters);
                formik.setFieldValue('fatherName', capitalized);
              }}
              error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}
              helperText={formik.touched.fatherName && formik.errors.fatherName}
              fullWidth
              size="small"
              disabled={!isFatherDetailsEditable.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <ShakingTextField error={formik.touched.fatherDob && Boolean(formik.errors.fatherDob)}>
            <DatePicker
              name="fatherDob"
              label="Date Of Birth"
              value={formik.values.fatherDob}
              format="DD-MM-YYYY"
              onChange={(value) => {
                formik.setFieldValue('fatherDob', value);
              }}
              disableFuture
              disabled={!isFatherDetailsEditable.value}
              slotProps={{
                textField: {
                  error: formik.touched.fatherDob && Boolean(formik.errors.fatherDob),
                  helperText: formik.touched.fatherDob && formik.errors.fatherDob,
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherOccupation"
            label="Occupation"
            value={formik.values.fatherOccupation}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);

              formik.setFieldValue('fatherOccupation', capitalized);
            }}
            error={formik.touched.fatherOccupation && Boolean(formik.errors.fatherOccupation)}
            helperText={formik.touched.fatherOccupation && formik.errors.fatherOccupation}
            fullWidth
            size="small"
            disabled={!isFatherDetailsEditable.value}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherEmail"
            label="Email"
            value={formik.values.fatherEmail}
            onChange={formik.handleChange}
            error={formik.touched.fatherEmail && Boolean(formik.errors.fatherEmail)}
            helperText={formik.touched.fatherEmail && formik.errors.fatherEmail}
            fullWidth
            size="small"
            disabled={!isFatherDetailsEditable.value}
            InputProps={{
              startAdornment: (
                <>
                  <Iconify icon="mdi-light:email" />{' '}
                  <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                </>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherQualification"
            label="Qualification"
            value={formik.values.fatherQualification}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(value);
              formik.setFieldValue('fatherQualification', capitalized);
            }}
            error={formik.touched.fatherQualification && Boolean(formik.errors.fatherQualification)}
            helperText={formik.touched.fatherQualification && formik.errors.fatherQualification}
            fullWidth
            size="small"
            disabled={!isFatherDetailsEditable.value}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherPassOutYear"
            label="Year of Passing"
            type="number"
            value={formik.values.fatherPassOutYear}
            onChange={formik.handleChange}
            error={formik.touched.fatherPassOutYear && Boolean(formik.errors.fatherPassOutYear)}
            helperText={formik.touched.fatherPassOutYear && formik.errors.fatherPassOutYear}
            fullWidth
            size="small"
            disabled={!isFatherDetailsEditable.value}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <PhoneInput
            name="fatherContactNo"
            value={formik.values.fatherContactNo}
            onChange={(value) => {
              formik.setFieldValue('fatherContactNo', value);
            }}
            label="Contact No."
            disabled={!isFatherDetailsEditable.value}
            error={formik.touched.fatherContactNo && Boolean(formik.errors.fatherContactNo)}
            helperText={formik.touched.fatherContactNo && formik.errors.fatherContactNo}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <PhoneInput
            name="fatherOfficeNo"
            value={formik.values.fatherOfficeNo}
            onChange={(value) => {
              formik.setFieldValue('fatherOfficeNo', value);
            }}
            label="Office No."
            error={formik.touched.fatherOfficeNo && Boolean(formik.errors.fatherOfficeNo)}
            disabled={!isFatherDetailsEditable.value}
            helperText={formik.touched.fatherOfficeNo && formik.errors.fatherOfficeNo}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherDesignation"
            label="Designation"
            value={formik.values.fatherDesignation}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('fatherDesignation', capitalized);
            }}
            error={formik.touched.fatherDesignation && Boolean(formik.errors.fatherDesignation)}
            helperText={formik.touched.fatherDesignation && formik.errors.fatherDesignation}
            fullWidth
            size="small"
            disabled={!isFatherDetailsEditable.value}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherOrganization"
            label="Organization"
            disabled={!isFatherDetailsEditable.value}
            value={formik.values.fatherOrganization}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('fatherOrganization', capitalized);
            }}
            error={formik.touched.fatherOrganization && Boolean(formik.errors.fatherOrganization)}
            helperText={formik.touched.fatherOrganization && formik.errors.fatherOrganization}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherAadharNo"
            label="Aadhar No."
            type="number"
            disabled={!isFatherDetailsEditable.value}
            value={formik.values.fatherAadharNo}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 12) {
                value = value.slice(0, 12);
              }
              formik.setFieldValue('fatherAadharNo', value);
            }}
            error={formik.touched.fatherAadharNo && Boolean(formik.errors.fatherAadharNo)}
            helperText={formik.touched.fatherAadharNo && formik.errors.fatherAadharNo}
            fullWidth
            size="small"
          />
        </Grid>
        {/* <Grid item xs={12} md={4} lg={4}>
          <TextField
            name="fatherRemarks"
            label="Remarks"
            
            disabled={!isFatherDetailsEditable.value}
            multiline
            rows={3}
            value={formik.values.fatherRemarks}
            onChange={formik.handleChange}
            error={formik.touched.fatherRemarks && Boolean(formik.errors.fatherRemarks)}
            helperText={formik.touched.fatherRemarks && formik.errors.fatherRemarks}
            fullWidth
            size="small"
          />
        </Grid> */}
        <Grid item xs={12}>
          <Typography variant="subtitle1">Office Address</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={
              formik.touched.fatherOfficeAddress1 && Boolean(formik.errors.fatherOfficeAddress1)
            }
          >
            <TextField
              name="fatherOfficeAddress1"
              label="Building No./Flat/House No."
              value={formik.values.fatherOfficeAddress1}
              onChange={formik.handleChange}
              error={
                formik.touched.fatherOfficeAddress1 && Boolean(formik.errors.fatherOfficeAddress1)
              }
              helperText={formik.touched.fatherOfficeAddress1 && formik.errors.fatherOfficeAddress1}
              fullWidth
              size="small"
              disabled={!isFatherDetailsEditable.value}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={
              formik.touched.fatherOfficeAddress2 && Boolean(formik.errors.fatherOfficeAddress2)
            }
          >
            <TextField
              name="fatherOfficeAddress2"
              label="Area/Locality/Road Name"
              value={formik.values.fatherOfficeAddress2}
              onChange={formik.handleChange}
              error={
                formik.touched.fatherOfficeAddress2 && Boolean(formik.errors.fatherOfficeAddress2)
              }
              helperText={formik.touched.fatherOfficeAddress2 && formik.errors.fatherOfficeAddress2}
              fullWidth
              size="small"
              disabled={!isFatherDetailsEditable.value}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={
              formik.touched.fatherOfficeAddress3 && Boolean(formik.errors.fatherOfficeAddress3)
            }
          >
            <TextField
              name="fatherOfficeAddress3"
              label="Landmark"
              value={formik.values.fatherOfficeAddress3}
              onChange={formik.handleChange}
              error={
                formik.touched.fatherOfficeAddress3 && Boolean(formik.errors.fatherOfficeAddress3)
              }
              helperText={formik.touched.fatherOfficeAddress3 && formik.errors.fatherOfficeAddress3}
              fullWidth
              size="small"
              disabled={!isFatherDetailsEditable.value}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1">Local Address</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
          >
            <TextField
              name="fatherAddress1"
              label="Building No./Flat/House No."
              value={formik.values.fatherAddress1}
              onChange={formik.handleChange}
              error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
              helperText={formik.touched.fatherAddress1 && formik.errors.fatherAddress1}
              fullWidth
              size="small"
              disabled={!isFatherDetailsEditable.value}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched.fatherAddress2 && Boolean(formik.errors.fatherAddress2)}
          >
            <TextField
              name="fatherAddress2"
              label="Area/Locality/Road Name"
              value={formik.values.fatherAddress2}
              onChange={formik.handleChange}
              error={formik.touched.fatherAddress2 && Boolean(formik.errors.fatherAddress2)}
              helperText={formik.touched.fatherAddress2 && formik.errors.fatherAddress2}
              fullWidth
              size="small"
              disabled={!isFatherDetailsEditable.value}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched.fatherAddress3 && Boolean(formik.errors.fatherAddress3)}
          >
            <TextField
              name="fatherAddress3"
              label="Landmark"
              value={formik.values.fatherAddress3}
              onChange={formik.handleChange}
              error={formik.touched.fatherAddress3 && Boolean(formik.errors.fatherAddress3)}
              helperText={formik.touched.fatherAddress3 && formik.errors.fatherAddress3}
              fullWidth
              size="small"
              disabled={!isFatherDetailsEditable.value}
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>

      <SectionCard
        title="Mother Details"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isMotherDetailsEditable}
              onSave={handleSave}
              onCancel={handelMotherDetailsCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={4} lg={3}>
          <ShakingTextField error={formik.touched.motherName && Boolean(formik.errors.motherName)}>
            <TextField
              name="motherName"
              label="Full name *"
              disabled={!isMotherDetailsEditable.value}
              value={formik.values.motherName}
              onChange={(e) => {
                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                const capitalized = capitalize(onlyLetters);
                formik.setFieldValue('motherName', capitalized);
              }}
              error={formik.touched.motherName && Boolean(formik.errors.motherName)}
              helperText={formik.touched.motherName && formik.errors.motherName}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <ShakingTextField error={formik.touched.motherDob && Boolean(formik.errors.motherDob)}>
            <DatePicker
              name="motherDob"
              label="Date Of Birth"
              disabled={!isMotherDetailsEditable.value}
              value={formik.values.motherDob}
              format="DD-MM-YYYY"
              onChange={(value) => {
                formik.setFieldValue('motherDob', value);
              }}
              disableFuture
              slotProps={{
                textField: {
                  error: formik.touched.motherDob && Boolean(formik.errors.motherDob),
                  helperText: formik.touched.motherDob && formik.errors.motherDob,
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherOccupation"
            label="Occupation"
            disabled={!isMotherDetailsEditable.value}
            value={formik.values.motherOccupation}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('motherOccupation', capitalized);
            }}
            error={formik.touched.motherOccupation && Boolean(formik.errors.motherOccupation)}
            helperText={formik.touched.motherOccupation && formik.errors.motherOccupation}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherEmail"
            label="Email"
            disabled={!isMotherDetailsEditable.value}
            value={formik.values.motherEmail}
            onChange={formik.handleChange}
            error={formik.touched.motherEmail && Boolean(formik.errors.motherEmail)}
            helperText={formik.touched.motherEmail && formik.errors.motherEmail}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <>
                  <Iconify icon="mdi-light:email" />{' '}
                  <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                </>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherQualification"
            label="Qualification"
            disabled={!isMotherDetailsEditable.value}
            value={formik.values.motherQualification}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(value);
              formik.setFieldValue('motherQualification', capitalized);
            }}
            error={formik.touched.motherQualification && Boolean(formik.errors.motherQualification)}
            helperText={formik.touched.motherQualification && formik.errors.motherQualification}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherPassOutYear"
            label="Year of Passing"
            type="number"
            disabled={!isMotherDetailsEditable.value}
            value={formik.values.motherPassOutYear}
            onChange={formik.handleChange}
            error={formik.touched.motherPassOutYear && Boolean(formik.errors.motherPassOutYear)}
            helperText={formik.touched.motherPassOutYear && formik.errors.motherPassOutYear}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <PhoneInput
            name="motherContactNo"
            disabled={!isMotherDetailsEditable.value}
            value={formik.values.motherContactNo}
            onChange={(value) => {
              formik.setFieldValue('motherContactNo', value);
            }}
            label="Contact No."
            error={formik.touched.motherContactNo && Boolean(formik.errors.motherContactNo)}
            helperText={formik.touched.motherContactNo && formik.errors.motherContactNo}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <PhoneInput
            name="motherOfficeNo"
            disabled={!isMotherDetailsEditable.value}
            value={formik.values.motherOfficeNo}
            onChange={(value) => {
              formik.setFieldValue('motherOfficeNo', value);
            }}
            onBlur={formik.handleBlur}
            label="Office No."
            error={formik.touched.motherOfficeNo && Boolean(formik.errors.motherOfficeNo)}
            helperText={formik.touched.motherOfficeNo && formik.errors.motherOfficeNo}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherDesignation"
            label="Designation"
            disabled={!isMotherDetailsEditable.value}
            value={formik.values.motherDesignation}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('motherDesignation', capitalized);
            }}
            error={formik.touched.motherDesignation && Boolean(formik.errors.motherDesignation)}
            helperText={formik.touched.motherDesignation && formik.errors.motherDesignation}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherOrganization"
            label="Organization"
            disabled={!isMotherDetailsEditable.value}
            value={formik.values.motherOrganization}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('motherOrganization', capitalized);
            }}
            error={formik.touched.motherOrganization && Boolean(formik.errors.motherOrganization)}
            helperText={formik.touched.motherOrganization && formik.errors.motherOrganization}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherAadharNo"
            label="Aadhar No."
            type="number"
            disabled={!isMotherDetailsEditable.value}
            value={formik.values.motherAadharNo}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 12) {
                value = value.slice(0, 12);
              }
              formik.setFieldValue('motherAadharNo', value);
            }}
            error={formik.touched.motherAadharNo && Boolean(formik.errors.motherAadharNo)}
            helperText={formik.touched.motherAadharNo && formik.errors.motherAadharNo}
            fullWidth
            size="small"
          />
        </Grid>
        {/* <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherRemarks"
            label="Remarks"
            
            disabled={!isFatherDetailsEditable.value}
            multiline
            rows={3}
            value={formik.values.motherRemarks}
            onChange={formik.handleChange}
            error={formik.touched.motherRemarks && Boolean(formik.errors.motherRemarks)}
            helperText={formik.touched.motherRemarks && formik.errors.motherRemarks}
            fullWidth
            size="small"
          />
        </Grid> */}
        <Grid item xs={12}>
          <MotherOfficeAddressComponent formik={formik} disabled={!isMotherDetailsEditable.value} />
        </Grid>
        <Grid item xs={12}>
          <MotherAddressComponent formik={formik} disabled={!isMotherDetailsEditable.value} />
        </Grid>
      </SectionCard>

      <SectionCard
        title="Guardian Details"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isGuardianDetailsEditable}
              onSave={handleSave}
              onCancel={handelGuardianDetailsCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched.guardianName && Boolean(formik.errors.guardianName)}
          >
            <TextField
              name="guardianName"
              label="Full Name"
              disabled={!isGuardianDetailsEditable.value}
              value={formik.values.guardianName}
              onChange={(e) => {
                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                const capitalized = capitalize(onlyLetters);
                formik.setFieldValue('guardianName', capitalized);
              }}
              error={formik.touched.guardianName && Boolean(formik.errors.guardianName)}
              helperText={formik.touched.guardianName && formik.errors.guardianName}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched.guardianDob && Boolean(formik.errors.guardianDob)}
          >
            <DatePicker
              name="guardianDob"
              label="Date Of Birth"
              format="DD-MM-YYYY"
              disabled={!isGuardianDetailsEditable.value}
              value={formik.values.guardianDob}
              onChange={(value) => {
                formik.setFieldValue('guardianDob', value);
              }}
              disableFuture
              slotProps={{
                textField: {
                  error: formik.touched.guardianDob && Boolean(formik.errors.guardianDob),
                  helperText: formik.touched.guardianDob && formik.errors.guardianDob,
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianOccupation"
            label="Occupation"
            disabled={!isGuardianDetailsEditable.value}
            value={formik.values.guardianOccupation}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('guardianOccupation', capitalized);
            }}
            error={formik.touched.guardianOccupation && Boolean(formik.errors.guardianOccupation)}
            helperText={formik.touched.guardianOccupation && formik.errors.guardianOccupation}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianEmail"
            label="Email"
            disabled={!isGuardianDetailsEditable.value}
            value={formik.values.guardianEmail}
            onChange={formik.handleChange}
            error={formik.touched.guardianEmail && Boolean(formik.errors.guardianEmail)}
            helperText={formik.touched.guardianEmail && formik.errors.guardianEmail}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <>
                  <Iconify icon="mdi-light:email" />{' '}
                  <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                </>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianQualification"
            label="Qualification"
            disabled={!isGuardianDetailsEditable.value}
            value={formik.values.guardianQualification}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('guardianQualification', capitalized);
            }}
            error={
              formik.touched.guardianQualification && Boolean(formik.errors.guardianQualification)
            }
            helperText={formik.touched.guardianQualification && formik.errors.guardianQualification}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianPassOutYear"
            label="Year of Passing"
            type="number"
            disabled={!isGuardianDetailsEditable.value}
            value={formik.values.guardianPassOutYear}
            onChange={formik.handleChange}
            error={formik.touched.guardianPassOutYear && Boolean(formik.errors.guardianPassOutYear)}
            helperText={formik.touched.guardianPassOutYear && formik.errors.guardianPassOutYear}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <PhoneInput
            name="guardianContactNo"
            disabled={!isGuardianDetailsEditable.value}
            value={formik.values.guardianContactNo}
            onChange={(value) => {
              formik.setFieldValue('guardianContactNo', value);
            }}
            label="Contact No."
            error={formik.touched.guardianContactNo && Boolean(formik.errors.guardianContactNo)}
            helperText={formik.touched.guardianContactNo && formik.errors.guardianContactNo}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <PhoneInput
            name="guardianOfficeNo"
            disabled={!isGuardianDetailsEditable.value}
            value={formik.values.guardianOfficeNo}
            onChange={(value) => {
              formik.setFieldValue('guardianOfficeNo', value);
            }}
            label="Office No."
            error={formik.touched.guardianOfficeNo && Boolean(formik.errors.guardianOfficeNo)}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianDesignation"
            label="Designation"
            disabled={!isGuardianDetailsEditable.value}
            value={formik.values.guardianDesignation}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('guardianDesignation', capitalized);
            }}
            error={formik.touched.guardianDesignation && Boolean(formik.errors.guardianDesignation)}
            helperText={formik.touched.guardianDesignation && formik.errors.guardianDesignation}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianOrganization"
            label="Organization"
            disabled={!isGuardianDetailsEditable.value}
            value={formik.values.guardianOrganization}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('guardianOrganization', capitalized);
            }}
            error={
              formik.touched.guardianOrganization && Boolean(formik.errors.guardianOrganization)
            }
            helperText={formik.touched.guardianOrganization && formik.errors.guardianOrganization}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianAadharNo"
            label="Aadhar No."
            type="number"
            disabled={!isGuardianDetailsEditable.value}
            value={formik.values.guardianAadharNo}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 12) {
                value = value.slice(0, 12);
              }
              formik.setFieldValue('guardianAadharNo', value);
            }}
            error={formik.touched.guardianAadharNo && Boolean(formik.errors.guardianAadharNo)}
            helperText={formik.touched.guardianAadharNo && formik.errors.guardianAadharNo}
            fullWidth
            size="small"
          />
        </Grid>
        {/* <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianRemarks"
            label="Remarks"
            
            disabled={!isGuardianDetailsEditable.value}
            multiline
            rows={3}
            value={formik.values.guardianRemarks}
            onChange={formik.handleChange}
            error={formik.touched.guardianRemarks && Boolean(formik.errors.guardianRemarks)}
            helperText={formik.touched.guardianRemarks && formik.errors.guardianRemarks}
            fullWidth
            size="small"
          />
        </Grid> */}
        <Grid item xs={12}>
          <GuardianOfficeAddressComponent
            formik={formik}
            disabled={!isGuardianDetailsEditable.value}
          />
        </Grid>
        <Grid item xs={12}>
          <GuardianAddressComponent formik={formik} disabled={!isGuardianDetailsEditable.value} />
        </Grid>
      </SectionCard>

      <SectionCard
        title="Sibling Details"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isSiblingDetailsEditable}
              onSave={handleSave}
              onCancel={handelSiblingDetailsCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={4} lg={3}>
          <Autocomplete
            disabled={!isSiblingDetailsEditable.value}
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
              <TextField {...params} size="small" label="Student" fullWidth />
            )}
            renderOption={(prop: any, option: any) => (
              <li {...prop} key={option.id}>
                {option.firstName}
              </li>
            )}
          />
        </Grid>
      </SectionCard>
    </Box>
  );
}

export default RenderFamilyInformation;
