import { useState } from 'react';
import { capitalize } from 'lodash';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Divider,
  Checkbox,
  TextField,
  Typography,
  Autocomplete,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import ShakingTextField from 'src/components/shaking-text-field';

function MotherOfficeAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Grid container spacing={2} p={3}>
      <Grid item xs={12}>
        <FormControlLabel
          disabled={!!disabled}
          control={
            <Checkbox
              checked={formik.values.sameAsFatherOfficeAddressForMother}
              onChange={(e) => {
                formik.setFieldValue('sameAsFatherOfficeAddressForMother', e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue('motherOfficeAddress1', formik.values.fatherOfficeAddress1);
                  formik.setFieldValue('motherOfficeAddress2', formik.values.fatherOfficeAddress2);
                  formik.setFieldValue('motherOfficeAddress3', formik.values.fatherOfficeAddress3);
                }
              }}
              name="sameAsFatherOfficeAddressForMother"
            />
          }
          label="Same as Father Office Address"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherOfficeAddress1 && Boolean(formik.errors.motherOfficeAddress1)}
        >
          <TextField
            name="motherOfficeAddress1"
            label="Building / Flat / House No"
            placeholder="Enter Building / Flat / House No"
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
            label="Street / Road Name"
            placeholder="Enter Street / Road Name"
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
            label="Area / Locality / Landmark"
            placeholder="Enter Area / Locality / Landmark"
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
    <Grid container spacing={2} p={3}>
      <Grid item xs={12}>
        <FormControlLabel
          disabled={!!disabled}
          control={
            <Checkbox
              checked={formik.values.sameAsFatherOfficeAddressForGuardian}
              onChange={(e) => {
                formik.setFieldValue('sameAsFatherOfficeAddressForGuardian', e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue(
                    'guardianOfficeAddress1',
                    formik.values.fatherOfficeAddress1
                  );
                  formik.setFieldValue(
                    'guardianOfficeAddress2',
                    formik.values.fatherOfficeAddress2
                  );
                  formik.setFieldValue(
                    'guardianOfficeAddress3',
                    formik.values.fatherOfficeAddress3
                  );
                }
              }}
              name="sameAsFatherOfficeAddressForGuardian"
            />
          }
          label="Same as Father Office Address"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={
            formik.touched.guardianOfficeAddress1 && Boolean(formik.errors.guardianOfficeAddress1)
          }
        >
          <TextField
            name="guardianOfficeAddress1"
            label="Building / Flat / House No"
            placeholder="Enter Building / Flat / House No"
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
            label="Street / Road Name"
            placeholder="Enter Street / Road Name"
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
            label="Area / Locality / Landmark"
            placeholder="Enter Area / Locality / Landmark"
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
    <Grid container spacing={2} p={3}>
      <Grid item xs={12}>
        <FormControlLabel
          disabled={!!disabled}
          control={
            <Checkbox
              checked={formik.values.sameAsFatherAddress}
              onChange={(e) => {
                formik.setFieldValue('sameAsFatherAddress', e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue('motherAddress1', formik.values.fatherAddress1);
                  formik.setFieldValue('motherAddress2', formik.values.fatherAddress2);
                  formik.setFieldValue('motherAddress3', formik.values.fatherAddress3);
                }
              }}
              name="sameAsFatherAddress"
            />
          }
          label="Same as Father Address"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherAddress1 && Boolean(formik.errors.motherAddress1)}
        >
          <TextField
            name="motherAddress1"
            label="Building / Flat / House No"
            placeholder="Enter Building / Flat / House No"
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
            label="Street / Road Name"
            placeholder="Enter Street / Road Name"
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
            label="Area / Locality / Landmark"
            placeholder="Enter Area / Locality / Landmark"
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
    <Grid container spacing={2} p={3}>
      <Grid item xs={12}>
        <FormControlLabel
          disabled={!!disabled}
          control={
            <Checkbox
              checked={formik.values.sameAsFatherAddress}
              onChange={(e) => {
                formik.setFieldValue('sameAsFatherAddress', e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue('guardianAddress1', formik.values.fatherAddress1);
                  formik.setFieldValue('guardianAddress2', formik.values.fatherAddress2);
                  formik.setFieldValue('guardianAddress3', formik.values.fatherAddress3);
                }
              }}
              name="sameAsFatherAddress"
            />
          }
          label="Same as Father Address"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.guardianAddress1 && Boolean(formik.errors.guardianAddress1)}
        >
          <TextField
            name="guardianAddress1"
            label="Building / Flat / House No"
            placeholder="Enter Building / Flat / House No"
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
            label="Street / Road Name"
            placeholder="Enter Street / Road Name"
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
            label="Area / Locality / Landmark"
            placeholder="Enter Area / Locality / Landmark"
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
  const { formik, isEdit } = props;
  const [student, setStudent] = useState([]);

  return (
    <Box sx={{ width: '100%' }}>
      <SectionCard title="Father Details">
        <Grid item xs={12} md={4} lg={3}>
          <ShakingTextField error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}>
            <TextField
              name="fatherName"
              label=" Father full name *"
              value={formik.values.fatherName}
              autoFocus
              onChange={(e) => {
                const value = capitalize(e.target.value);
                formik.setFieldValue('fatherName', value);
              }}
              error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}
              helperText={formik.touched.fatherName && formik.errors.fatherName}
              fullWidth
              size="small"
              disabled={!isEdit}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <ShakingTextField error={formik.touched.fatherDob && Boolean(formik.errors.fatherDob)}>
            <DatePicker
              name="fatherDob"
              label="Father DOB"
              value={formik.values.fatherDob}
              onChange={(value) => {
                formik.setFieldValue('fatherDob', value);
              }}
              disableFuture
              disabled={!isEdit}
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
            label="Father Occupation"
            value={formik.values.fatherOccupation}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('fatherOccupation', value);
            }}
            error={formik.touched.fatherOccupation && Boolean(formik.errors.fatherOccupation)}
            helperText={formik.touched.fatherOccupation && formik.errors.fatherOccupation}
            fullWidth
            size="small"
            disabled={!isEdit}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherEmail"
            label="Father Email"
            placeholder="Enter Father Email"
            value={formik.values.fatherEmail}
            onChange={formik.handleChange}
            error={formik.touched.fatherEmail && Boolean(formik.errors.fatherEmail)}
            helperText={formik.touched.fatherEmail && formik.errors.fatherEmail}
            fullWidth
            size="small"
            disabled={!isEdit}
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
            name="fatherPassOutYear"
            label="Father's Year of Passing"
            type="number"
            value={formik.values.fatherPassOutYear}
            onChange={formik.handleChange}
            error={formik.touched.fatherPassOutYear && Boolean(formik.errors.fatherPassOutYear)}
            helperText={formik.touched.fatherPassOutYear && formik.errors.fatherPassOutYear}
            fullWidth
            size="small"
            disabled={!isEdit}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherQualification"
            label="Father Qualification"
            value={formik.values.fatherQualification}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('fatherQualification', value);
            }}
            error={formik.touched.fatherQualification && Boolean(formik.errors.fatherQualification)}
            helperText={formik.touched.fatherQualification && formik.errors.fatherQualification}
            fullWidth
            size="small"
            disabled={!isEdit}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <PhoneInput
            name="fatherContactNo"
            value={formik.values.fatherContactNo}
            onChange={(value) => {
              formik.setFieldValue('fatherContactNo', value);
            }}
            placeholder="Enter Father Contact No."
            label="Father Contact No."
            disabled={!isEdit}
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
            label="Father Office No."
            placeholder="Enter Father Office No."
            error={formik.touched.fatherOfficeNo && Boolean(formik.errors.fatherOfficeNo)}
            disabled={!isEdit}
          />
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherDesignation"
            label="Father Designation"
            value={formik.values.fatherDesignation}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('fatherDesignation', value);
            }}
            error={formik.touched.fatherDesignation && Boolean(formik.errors.fatherDesignation)}
            helperText={formik.touched.fatherDesignation && formik.errors.fatherDesignation}
            fullWidth
            size="small"
            disabled={!isEdit}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherOrganization"
            label="Father Organization"
            disabled={!isEdit}
            value={formik.values.fatherOrganization}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('fatherOrganization', value);
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
            label="Father Aadhar No."
            type="number"
            disabled={!isEdit}
            value={formik.values.fatherAadharNo}
            onChange={formik.handleChange}
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
            disabled={!isEdit}
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
          <Typography variant="subtitle1">Father Office Address</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={
              formik.touched.fatherOfficeAddress1 && Boolean(formik.errors.fatherOfficeAddress1)
            }
          >
            <TextField
              name="fatherOfficeAddress1"
              label="Building / Flat / House No"
              placeholder="Enter Building / Flat / House No"
              value={formik.values.fatherOfficeAddress1}
              onChange={formik.handleChange}
              error={
                formik.touched.fatherOfficeAddress1 && Boolean(formik.errors.fatherOfficeAddress1)
              }
              helperText={formik.touched.fatherOfficeAddress1 && formik.errors.fatherOfficeAddress1}
              fullWidth
              size="small"
              disabled={!isEdit}
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
              label="Street / Road Name"
              placeholder="Enter Street / Road Name"
              value={formik.values.fatherOfficeAddress2}
              onChange={formik.handleChange}
              error={
                formik.touched.fatherOfficeAddress2 && Boolean(formik.errors.fatherOfficeAddress2)
              }
              helperText={formik.touched.fatherOfficeAddress2 && formik.errors.fatherOfficeAddress2}
              fullWidth
              size="small"
              disabled={!isEdit}
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
              label="Area / Locality / Landmark"
              placeholder="Enter Area / Locality / Landmark"
              value={formik.values.fatherOfficeAddress3}
              onChange={formik.handleChange}
              error={
                formik.touched.fatherOfficeAddress3 && Boolean(formik.errors.fatherOfficeAddress3)
              }
              helperText={formik.touched.fatherOfficeAddress3 && formik.errors.fatherOfficeAddress3}
              fullWidth
              size="small"
              disabled={!isEdit}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1">Father Address</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
          >
            <TextField
              name="fatherAddress1"
              label="Building / Flat / House No"
              placeholder="Enter Building / Flat / House No"
              value={formik.values.fatherAddress1}
              onChange={formik.handleChange}
              error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
              helperText={formik.touched.fatherAddress1 && formik.errors.fatherAddress1}
              fullWidth
              size="small"
              disabled={!isEdit}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched.fatherAddress2 && Boolean(formik.errors.fatherAddress2)}
          >
            <TextField
              name="fatherAddress2"
              label="Street / Road Name"
              placeholder="Enter Street / Road Name"
              value={formik.values.fatherAddress2}
              onChange={formik.handleChange}
              error={formik.touched.fatherAddress2 && Boolean(formik.errors.fatherAddress2)}
              helperText={formik.touched.fatherAddress2 && formik.errors.fatherAddress2}
              fullWidth
              size="small"
              disabled={!isEdit}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched.fatherAddress3 && Boolean(formik.errors.fatherAddress3)}
          >
            <TextField
              name="fatherAddress3"
              label="Area / Locality / Landmark"
              placeholder="Enter Area / Locality / Landmark"
              value={formik.values.fatherAddress3}
              onChange={formik.handleChange}
              error={formik.touched.fatherAddress3 && Boolean(formik.errors.fatherAddress3)}
              helperText={formik.touched.fatherAddress3 && formik.errors.fatherAddress3}
              fullWidth
              size="small"
              disabled={!isEdit}
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>

      <SectionCard title="Mother Details">
        <Grid item xs={12} md={4} lg={3}>
          <ShakingTextField error={formik.touched.motherName && Boolean(formik.errors.motherName)}>
            <TextField
              name="motherName"
              label="Mother full name *"
              disabled={!isEdit}
              value={formik.values.motherName}
              onChange={(e) => {
                const value = capitalize(e.target.value);
                formik.setFieldValue('motherName', value);
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
              label="Mother DOB"
              disabled={!isEdit}
              value={formik.values.motherDob}
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
            label="Mother Occupation"
            disabled={!isEdit}
            value={formik.values.motherOccupation}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('motherOccupation', value);
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
            label="Mother Email"
            placeholder="Enter Mother Email"
            disabled={!isEdit}
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
            name="motherPassOutYear"
            label="Mother's Year of Passing"
            type="number"
            disabled={!isEdit}
            value={formik.values.motherPassOutYear}
            onChange={formik.handleChange}
            error={formik.touched.motherPassOutYear && Boolean(formik.errors.motherPassOutYear)}
            helperText={formik.touched.motherPassOutYear && formik.errors.motherPassOutYear}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherQualification"
            label="Mother Qualification"
            disabled={!isEdit}
            value={formik.values.motherQualification}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('motherQualification', value);
            }}
            error={formik.touched.motherQualification && Boolean(formik.errors.motherQualification)}
            helperText={formik.touched.motherQualification && formik.errors.motherQualification}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <PhoneInput
            name="motherContactNo"
            disabled={!isEdit}
            value={formik.values.motherContactNo}
            onChange={(value) => {
              formik.setFieldValue('motherContactNo', value);
            }}
            label="Mother Contact No."
            placeholder="Enter Mother Contact No."
            error={formik.touched.motherContactNo && Boolean(formik.errors.motherContactNo)}
            helperText={formik.touched.motherContactNo && formik.errors.motherContactNo}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <PhoneInput
            name="motherOfficeNo"
            disabled={!isEdit}
            value={formik.values.motherOfficeNo}
            onChange={(value) => {
              formik.setFieldValue('motherOfficeNo', value);
            }}
            placeholder="Enter Mother Office No."
            label="Mother Office No."
            error={formik.touched.motherOfficeNo && Boolean(formik.errors.motherOfficeNo)}
          />
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherDesignation"
            label="Mother Designation"
            disabled={!isEdit}
            value={formik.values.motherDesignation}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('motherDesignation', value);
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
            label="Mother Organization"
            disabled={!isEdit}
            value={formik.values.motherOrganization}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('motherOrganization', value);
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
            label="Mother Aadhar No."
            type="number"
            disabled={!isEdit}
            value={formik.values.motherAadharNo}
            onChange={formik.handleChange}
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
            disabled={!isEdit}
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
        <MotherOfficeAddressComponent formik={formik} disabled={!isEdit} />

        <MotherAddressComponent formik={formik} disabled={!isEdit} />
      </SectionCard>

      <SectionCard title="Guardian Details">
        <Grid item xs={12} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched.guardianName && Boolean(formik.errors.guardianName)}
          >
            <TextField
              name="guardianName"
              label="Guardian Full Name"
              disabled={!isEdit}
              value={formik.values.guardianName}
              onChange={(e) => {
                const value = capitalize(e.target.value);
                formik.setFieldValue('guardianName', value);
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
              label="Guardian DOB"
              disabled={!isEdit}
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
            label="Guardian Occupation"
            disabled={!isEdit}
            value={formik.values.guardianOccupation}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('guardianOccupation', value);
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
            label="Guardian Email"
            placeholder="Enter Guardian Email"
            disabled={!isEdit}
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
            name="guardianPassOutYear"
            label="Guardian's Year of Passing"
            type="number"
            disabled={!isEdit}
            value={formik.values.guardianPassOutYear}
            onChange={formik.handleChange}
            error={formik.touched.guardianPassOutYear && Boolean(formik.errors.guardianPassOutYear)}
            helperText={formik.touched.guardianPassOutYear && formik.errors.guardianPassOutYear}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianQualification"
            label="Guardian Qualification"
            disabled={!isEdit}
            value={formik.values.guardianQualification}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('guardianQualification', value);
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
          <PhoneInput
            name="guardianContactNo"
            disabled={!isEdit}
            value={formik.values.guardianContactNo}
            onChange={(value) => {
              formik.setFieldValue('guardianContactNo', value);
            }}
            label="Guardian Contact No."
            placeholder="Enter Guardian Contact No."
            error={formik.touched.guardianContactNo && Boolean(formik.errors.guardianContactNo)}
            helperText={formik.touched.guardianContactNo && formik.errors.guardianContactNo}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <PhoneInput
            name="guardianOfficeNo"
            disabled={!isEdit}
            value={formik.values.guardianOfficeNo}
            onChange={(value) => {
              formik.setFieldValue('guardianOfficeNo', value);
            }}
            label="Guardian Office No."
            placeholder="Enter Guardian Office No."
            error={formik.touched.guardianOfficeNo && Boolean(formik.errors.guardianOfficeNo)}
          />
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianDesignation"
            label="Guardian Designation"
            disabled={!isEdit}
            value={formik.values.guardianDesignation}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('guardianDesignation', value);
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
            label="Guardian Organization"
            disabled={!isEdit}
            value={formik.values.guardianOrganization}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue('guardianOrganization', value);
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
            label="Guardian Aadhar No."
            type="number"
            disabled={!isEdit}
            value={formik.values.guardianAadharNo}
            onChange={formik.handleChange}
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
            disabled={!isEdit}
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
        <GuardianOfficeAddressComponent formik={formik} disabled={!isEdit} />
        <GuardianAddressComponent formik={formik} disabled={!isEdit} />
      </SectionCard>

      <SectionCard title="Sibling Details">
        <Grid item xs={12} md={4} lg={3}>
          <Autocomplete
            disabled={!isEdit}
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
        </Grid>
      </SectionCard>
    </Box>
  );
}

export default RenderFamilyInformation;
