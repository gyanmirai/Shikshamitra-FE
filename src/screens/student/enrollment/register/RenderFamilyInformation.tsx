import { useState } from 'react';
import { capitalize } from 'lodash';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Divider, TextField, Autocomplete } from '@mui/material';

import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import ShakingTextField from 'src/components/shaking-text-field';

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
            name="fatherOfficeAddress"
            multiline
            rows={3}
            label="Father Office Address"
            value={formik.values.fatherOfficeAddress}
            onChange={formik.handleChange}
            error={formik.touched.fatherOfficeAddress && Boolean(formik.errors.fatherOfficeAddress)}
            helperText={formik.touched.fatherOfficeAddress && formik.errors.fatherOfficeAddress}
            fullWidth
            size="small"
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
        <Grid item xs={12} md={4} lg={3}>
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
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="fatherAddress"
            multiline
            rows={3}
            label="Father Address"
            disabled={!isEdit}
            value={formik.values.fatherAddress}
            onChange={formik.handleChange}
            error={formik.touched.fatherAddress && Boolean(formik.errors.fatherAddress)}
            helperText={formik.touched.fatherAddress && formik.errors.fatherAddress}
            fullWidth
            size="small"
          />
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
            name="motherOfficeAddress"
            multiline
            rows={3}
            label="Mother Office Address"
            disabled={!isEdit}
            value={formik.values.motherOfficeAddress}
            onChange={formik.handleChange}
            error={formik.touched.motherOfficeAddress && Boolean(formik.errors.motherOfficeAddress)}
            helperText={formik.touched.motherOfficeAddress && formik.errors.motherOfficeAddress}
            fullWidth
            size="small"
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
        <Grid item xs={12} md={4} lg={3}>
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
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="motherAddress"
            multiline
            disabled={!isEdit}
            rows={3}
            label="Mother Address"
            value={formik.values.motherAddress}
            onChange={formik.handleChange}
            error={formik.touched.motherAddress && Boolean(formik.errors.motherAddress)}
            helperText={formik.touched.motherAddress && formik.errors.motherAddress}
            fullWidth
            size="small"
          />
        </Grid>
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
            name="guardianOfficeAddress"
            multiline
            rows={3}
            label="Guardian Office Address"
            disabled={!isEdit}
            value={formik.values.guardianOfficeAddress}
            onChange={formik.handleChange}
            error={
              formik.touched.guardianOfficeAddress && Boolean(formik.errors.guardianOfficeAddress)
            }
            helperText={formik.touched.guardianOfficeAddress && formik.errors.guardianOfficeAddress}
            fullWidth
            size="small"
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
        <Grid item xs={12} md={4} lg={3}>
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
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            name="guardianAddress"
            multiline
            rows={3}
            label="Guardian Address"
            disabled={!isEdit || formik.values.sameAsFatherAddressForSpouse}
            value={formik.values.guardianAddress}
            onChange={formik.handleChange}
            error={formik.touched.guardianAddress && Boolean(formik.errors.guardianAddress)}
            helperText={formik.touched.guardianAddress && formik.errors.guardianAddress}
            fullWidth
            size="small"
          />
        </Grid>
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
