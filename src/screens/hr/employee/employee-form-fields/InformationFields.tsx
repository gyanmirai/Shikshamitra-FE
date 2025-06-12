import { capitalize } from 'lodash';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Radio,
  Paper,
  Select,
  Divider,
  MenuItem,
  FormLabel,
  TextField,
  RadioGroup,
  InputLabel,
  Typography,
  FormControl,
  Autocomplete,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { fileToBase64 } from 'src/utils/file-to-base64';

import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { EmployeeGroupType, EmployeeGroupTypeArray } from 'src/enums/employee-group';
import { MaritalStatusType, MaritalStatusTypeArray } from 'src/enums/marriatal-status';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { UploadAvatar } from 'src/components/upload';
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import RenderShift from './RenderShift';
import { RenderRole } from './RenderRole';
import { RenderOrganization } from './RenderOrganization';

import type { FieldsType } from './types';

export const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Paper sx={{ p: 3, mb: 3 }} elevation={6}>
    <Typography variant="h6" sx={{ mb: 2 }} color="primary.main">
      {title}
    </Typography>
    <Grid container spacing={3} sx={{ display: 'flex', alignItems: 'center' }}>
      {children}
    </Grid>
  </Paper>
);

const InformationAllFields = ({ formik, disabled }: any) => (
  <Box>
    <SectionCard title="Basic Details">
      <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
        <UploadAvatar
          maxSize={3145728}
          onDrop={async (acceptedFiles: File[]) => {
            const value = acceptedFiles[0];
            const base64 = await fileToBase64(value);
            formik.setFieldValue('photo', base64);
          }}
          value={formik.values.photo}
          error={formik.touched.photo && Boolean(formik.errors.photo)}
          sx={{ m: 'initial' }}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} md={10}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ShakingTextField error={formik.touched.firstName && Boolean(formik.errors.firstName)}>
              <TextField
                fullWidth
                size="small"
                label="First Name *"
                {...formik.getFieldProps('firstName')}
                onChange={(e) => {
                  const newName = capitalize(e.target.value);
                  formik.setFieldValue('firstName', newName);
                }}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                disabled={disabled}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShakingTextField
              error={formik.touched.middleName && Boolean(formik.errors.middleName)}
            >
              <TextField
                fullWidth
                size="small"
                label="Middle Name *"
                {...formik.getFieldProps('middleName')}
                onChange={(e) => {
                  const newName = capitalize(e.target.value);
                  formik.setFieldValue('middleName', newName);
                }}
                error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                helperText={formik.touched.middleName && formik.errors.middleName}
                disabled={disabled}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShakingTextField error={formik.touched.lastName && Boolean(formik.errors.lastName)}>
              <TextField
                fullWidth
                size="small"
                label="Last Name *"
                {...formik.getFieldProps('lastName')}
                onChange={(e) => {
                  const newName = capitalize(e.target.value);
                  formik.setFieldValue('lastName', newName);
                }}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                disabled={disabled}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShakingTextField error={formik.touched.shortName && Boolean(formik.errors.shortName)}>
              <TextField
                fullWidth
                size="small"
                label="Short Name"
                {...formik.getFieldProps('shortName')}
                onChange={(e) => {
                  const newName = capitalize(e.target.value);
                  formik.setFieldValue('shortName', newName);
                }}
                error={formik.touched.shortName && Boolean(formik.errors.shortName)}
                helperText={formik.touched.shortName && formik.errors.shortName}
                disabled={disabled}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <ShakingTextField error={formik.touched.dob && Boolean(formik.errors.dob)}>
              <DatePicker
                label="DOB *"
                value={formik.values.dob}
                onChange={(value) => formik.setFieldValue('dob', value)}
                disabled={disabled}
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.dob && Boolean(formik.errors.dob),
                    helperText: formik.touched.dob && formik.errors.dob,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShakingTextField error={formik.touched.gender && Boolean(formik.errors.gender)}>
              <FormControl
                fullWidth
                sx={{ display: 'flex', gap: 1, flexDirection: 'row', alignItems: 'center' }}
              >
                <FormLabel
                  id="gender-radio-group"
                  sx={{ color: (theme) => theme.palette.common.black }}
                >
                  Gender
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="gender-radio-group"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                >
                  <FormControlLabel value={0} control={<Radio size="small" />} label="Male" />
                  <FormControlLabel value={1} control={<Radio size="small" />} label="Female" />
                </RadioGroup>
              </FormControl>
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShakingTextField error={formik.touched.religion && Boolean(formik.errors.religion)}>
              <FormControl
                fullWidth
                disabled={disabled}
                error={!!formik.errors.religion && formik.touched.religion}
              >
                <InputLabel id="religion-label" size="small">
                  Religion *
                </InputLabel>
                <Select
                  labelId="religion-label"
                  id="religion"
                  value={formik.values.religion}
                  onChange={formik.handleChange}
                  size="small"
                  label="Religion *"
                  name="religion"
                >
                  <MenuItem value="Hinduism">Hinduism</MenuItem>
                  <MenuItem value="Islam">Islam</MenuItem>
                  <MenuItem value="Christianity">Christianity</MenuItem>
                  <MenuItem value="Sikhism">Sikhism</MenuItem>
                  <MenuItem value="Buddhism">Buddhism</MenuItem>
                  <MenuItem value="Jainism">Jainism</MenuItem>
                  <MenuItem value="Judaism">Judaism</MenuItem>
                  <MenuItem value="Zoroastrianism">Zoroastrianism (Parsi)</MenuItem>
                </Select>
                {formik.touched.religion && formik.errors.religion && (
                  <FormHelperText>{formik.errors.religion}</FormHelperText>
                )}
              </FormControl>
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShakingTextField error={formik.touched.castType && Boolean(formik.errors.castType)}>
              <Autocomplete
                options={EmployeeCastTypeArray.map((item, index) => ({
                  id: index,
                  label: EmployeeCastType[index],
                }))}
                getOptionLabel={(option) => option.label}
                disabled={disabled}
                value={
                  EmployeeCastTypeArray.map((_, index) => ({
                    id: index,
                    label: EmployeeCastType[index],
                  })).find((item) => item.id === formik.values.castType) || null
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category *"
                    size="small"
                    fullWidth
                    error={formik.touched.castType && Boolean(formik.errors.castType)}
                    helperText={formik.touched.castType && formik.errors.castType}
                  />
                )}
                onChange={(e, value) => {
                  formik.setFieldValue('castType', value?.id);
                }}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShakingTextField
              error={formik.touched.familyCast && Boolean(formik.errors.familyCast)}
            >
              <TextField
                fullWidth
                size="small"
                label="Family Cast *"
                {...formik.getFieldProps('familyCast')}
                onChange={(e) => {
                  const newName = capitalize(e.target.value);
                  formik.setFieldValue('familyCast', newName);
                }}
                error={formik.touched.familyCast && Boolean(formik.errors.familyCast)}
                helperText={formik.touched.familyCast && formik.errors.familyCast}
                disabled={disabled}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShakingTextField
              error={formik.touched.maritalStatus && Boolean(formik.errors.maritalStatus)}
            >
              <FormControl
                fullWidth
                disabled={disabled}
                error={!!formik.errors.maritalStatus && formik.touched.maritalStatus}
              >
                <InputLabel id="dropdown-label" size="small">
                  Marital Status *
                </InputLabel>
                <Select
                  labelId="dropdown-label"
                  id="dropdown"
                  value={formik.values.maritalStatus}
                  onChange={formik.handleChange}
                  size="small"
                  label="Marital Status *"
                  name="maritalStatus"
                >
                  {MaritalStatusTypeArray.map((i, index) => (
                    <MenuItem key={i} value={index}>
                      {MaritalStatusType[index]}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.maritalStatus && formik.errors.maritalStatus && (
                  <FormHelperText>{formik.errors.maritalStatus}</FormHelperText>
                )}
              </FormControl>
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShakingTextField
              error={formik.touched.bloodGroup && Boolean(formik.errors.bloodGroup)}
            >
              <FormControl
                fullWidth
                disabled={disabled}
                error={!!formik.errors.bloodGroup && formik.touched.bloodGroup}
              >
                <InputLabel id="blood-group-label" size="small">
                  Blood Group
                </InputLabel>
                <Select
                  labelId="blood-group-label"
                  id="bloodGroup"
                  value={formik.values.bloodGroup}
                  onChange={formik.handleChange}
                  size="small"
                  label="Blood Group"
                  name="bloodGroup"
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
                {formik.touched.bloodGroup && formik.errors.bloodGroup && (
                  <FormHelperText>{formik.errors.bloodGroup}</FormHelperText>
                )}
              </FormControl>
            </ShakingTextField>
          </Grid>
        </Grid>
      </Grid>
    </SectionCard>

    <SectionCard title="Contact Information">
      <Grid item xs={12} md={6}>
        <ShakingTextField error={formik.touched.email && Boolean(formik.errors.email)}>
          <TextField
            fullWidth
            size="small"
            label="Email *"
            {...formik.getFieldProps('email')}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={disabled}
            InputProps={{
              startAdornment: (
                <>
                  <Iconify icon="mdi-light:email" />{' '}
                  <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                </>
              ),
            }}
          />
        </ShakingTextField>
      </Grid>
      <Grid item xs={12} md={6}>
        <ShakingTextField error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}>
          <PhoneInput
            name="mobileNo"
            value={formik.values.mobileNo}
            onChange={(value) => {
              formik.setFieldValue('mobileNo', value);
              formik.validateField('mobileNo');
            }}
            label="Mobile No. *"
            error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
            disabled={disabled}
            helperText={formik.touched.mobileNo && formik.errors.mobileNo}
          />
        </ShakingTextField>
      </Grid>
    </SectionCard>

    <SectionCard title="Professional Details">
      <Grid item xs={12} md={4}>
        <ShakingTextField
          error={formik.touched.dateOfJoining && Boolean(formik.errors.dateOfJoining)}
        >
          <DatePicker
            label="Date of Joining *"
            value={formik.values.dateOfJoining}
            onChange={(value) => formik.setFieldValue('dateOfJoining', value)}
            format="DD-MM-YYYY"
            disabled={disabled}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                error: formik.touched.dateOfJoining && Boolean(formik.errors.dateOfJoining),
                helperText: formik.touched.dateOfJoining && formik.errors.dateOfJoining,
              },
            }}
          />
        </ShakingTextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <ShakingTextField
          error={formik.touched.employeeGroup && Boolean(formik.errors.employeeGroup)}
        >
          <Autocomplete
            options={EmployeeGroupTypeArray.map((item, index) => ({
              id: index,
              label: EmployeeGroupType[index],
            }))}
            getOptionLabel={(option) => option.label}
            disabled={disabled}
            value={
              EmployeeGroupTypeArray.map((_, index) => ({
                id: index,
                label: EmployeeGroupType[index],
              })).find((item) => item.id === formik.values.employeeGroup) || null
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Employee Group *"
                size="small"
                fullWidth
                error={formik.touched.employeeGroup && Boolean(formik.errors.employeeGroup)}
                helperText={formik.touched.employeeGroup && formik.errors.employeeGroup}
              />
            )}
            onChange={(e, value) => {
              formik.setFieldValue('employeeGroup', value?.id);
            }}
          />
        </ShakingTextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <ShakingTextField error={formik.touched.department && Boolean(formik.errors.department)}>
          <TextField
            fullWidth
            size="small"
            label="Department"
            {...formik.getFieldProps('department')}
            onChange={(e) => {
              const newName = capitalize(e.target.value);
              formik.setFieldValue('department', newName);
            }}
            error={formik.touched.department && Boolean(formik.errors.department)}
            helperText={formik.touched.department && formik.errors.department}
            disabled={disabled}
          />
        </ShakingTextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <ShakingTextField error={formik.touched.designation && Boolean(formik.errors.designation)}>
          <TextField
            fullWidth
            size="small"
            label="Designation"
            {...formik.getFieldProps('designation')}
            onChange={(e) => {
              const newName = capitalize(e.target.value);
              formik.setFieldValue('designation', newName);
            }}
            error={formik.touched.designation && Boolean(formik.errors.designation)}
            helperText={formik.touched.designation && formik.errors.designation}
            disabled={disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} md={4}>
        <RenderRole formik={formik} disabled={disabled} />
      </Grid>
      <Grid item xs={12} md={4}>
        <RenderOrganization formik={formik} disabled={disabled} />
      </Grid>
      <Grid item xs={12} md={4}>
        <RenderShift formik={formik} disabled={disabled} />
      </Grid>
    </SectionCard>

    <SectionCard title="Address Details">
      <Grid item xs={12} md={4}>
        <ShakingTextField
          error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
        >
          <TextField
            fullWidth
            size="small"
            label="Building No./Flat/House No."
            {...formik.getFieldProps('addressLine1')}
            onChange={(e) => {
              const newName = capitalize(e.target.value);
              formik.setFieldValue('addressLine1', newName);
            }}
            error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
            helperText={formik.touched.addressLine1 && formik.errors.addressLine1}
            disabled={disabled}
          />
        </ShakingTextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <ShakingTextField
          error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
        >
          <TextField
            fullWidth
            size="small"
            label="Area/Locality/Road Name *"
            {...formik.getFieldProps('addressLine2')}
            onChange={(e) => {
              const newName = capitalize(e.target.value);
              formik.setFieldValue('addressLine2', newName);
            }}
            error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
            helperText={formik.touched.addressLine2 && formik.errors.addressLine2}
            disabled={disabled}
          />
        </ShakingTextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <ShakingTextField
          error={formik.touched.addressLine3 && Boolean(formik.errors.addressLine3)}
        >
          <TextField
            fullWidth
            size="small"
            label="Landmark *"
            {...formik.getFieldProps('addressLine3')}
            onChange={(e) => {
              const newName = capitalize(e.target.value);
              formik.setFieldValue('addressLine3', newName);
            }}
            error={formik.touched.addressLine3 && Boolean(formik.errors.addressLine3)}
            helperText={formik.touched.addressLine3 && formik.errors.addressLine3}
            disabled={disabled}
          />
        </ShakingTextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <ShakingTextField error={formik.touched.country && Boolean(formik.errors.country?.name)}>
          <CountryComponent
            value={formik.values.country}
            onChange={(_e: any, value: any) => {
              formik.setFieldValue('state', null);
              formik.setFieldValue('country', value);
            }}
            error={formik.touched.country && Boolean(formik.errors.country?.name)}
            helperText={formik.touched.country && formik.errors.country?.name}
            textFieldProps={{
              label: 'Country ',
            }}
            disabled={disabled}
          />
        </ShakingTextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <ShakingTextField error={formik.touched.state && Boolean(formik.errors?.state?.name)}>
          <StateComponent
            value={formik.values.state}
            countryValue={formik.values.country}
            onChange={(_e: any, value: any) => {
              formik.setFieldValue('state', value);
              formik.setFieldValue('city', null);
            }}
            error={formik.touched.state && Boolean(formik.errors?.state?.name)}
            helperText={formik.touched.state && formik.errors?.state?.name}
            disabled={disabled}
          />
        </ShakingTextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <ShakingTextField error={formik.touched.city && Boolean(formik.errors.city?.name)}>
          <CityComponent
            value={formik.values.city}
            onChange={(_e: any, value: any) => {
              formik.setFieldValue('city', value);
            }}
            stateValue={formik.values.state}
            error={formik.touched.city && Boolean(formik.errors.city?.name)}
            helperText={formik.touched.city && formik.errors.city?.name}
            disabled={disabled}
          />
        </ShakingTextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <ShakingTextField error={formik.touched.pincode && Boolean(formik.errors.pincode)}>
          <TextField
            fullWidth
            size="small"
            label="Pincode"
            type="number"
            {...formik.getFieldProps('pincode')}
            error={formik.touched.pincode && Boolean(formik.errors.pincode)}
            helperText={formik.touched.pincode && formik.errors.pincode}
            disabled={disabled}
            name="pincode"
            onChange={(e) => {
              const { value } = e.target;
              if (value.length <= 6) {
                formik.handleChange(e);
                formik.validateField('pincode');
              }
            }}
            inputProps={{
              maxLength: 6,
              pattern: '[0-9]*',
            }}
          />
        </ShakingTextField>
      </Grid>
    </SectionCard>
  </Box>
);

export const InformationFields: FieldsType[] = [
  {
    type: 'text',
    label: ' ',
    name: ' ',
    gridProps: { xs: 12, md: 12 },
    renderComp: (props) => <InformationAllFields {...props} />,
  },
];
