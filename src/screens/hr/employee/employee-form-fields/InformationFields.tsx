import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import dayjs from 'dayjs';
import { capitalize } from 'lodash';
import { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';

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
  IconButton,
  FormControl,
  Autocomplete,
  FormHelperText,
  LinearProgress,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fileToBase64 } from 'src/utils/file-to-base64';

import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { EmployeeGroupType, EmployeeGroupTypeArray } from 'src/enums/employee-group';
import { MaritalStatusType, MaritalStatusTypeArray } from 'src/enums/marriatal-status';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { UploadAvatar } from 'src/components/upload';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import RenderShift from './RenderShift';
import { RenderRole } from './RenderRole';
import { RenderOrganization } from './RenderOrganization';

import type { FieldsType } from './types';

export const SectionCard = ({
  title,
  children,
  headerContent = null,
  isLoading = false,
}: {
  title?: string;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  isLoading?: boolean;
}) => (
  <Paper sx={{ p: 2, mb: 3, position: 'relative', overflow: 'hidden' }} elevation={6}>
    {isLoading && <LinearProgress sx={{ position: 'absolute', left: 0, top: 0, width: '100%' }} />}
    <Box
      display="flex"
      justifyContent={title ? 'space-between' : 'end'}
      alignItems="center"
      pb={title || headerContent ? 2 : 0}
    >
      {title && (
        <Typography variant="h6" color="primary.main">
          {title}
        </Typography>
      )}
      {headerContent}
    </Box>
    <Grid container spacing={3} sx={{ display: 'flex', alignItems: 'center' }}>
      {children}
    </Grid>
  </Paper>
);
// Motion variants for subtle slide
const editButtonVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

const actionButtonsVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};
export const CardActions = ({
  isEdit,
  onCancel = () => {},
  onSave = async () => {},
  isLoading = false,
}: {
  isEdit: UseBooleanReturn;
  onSave?: () => Promise<void | boolean>;
  onCancel?: () => void;
  isLoading?: boolean;
}) => {
  const isNewLoading = isLoading && isEdit.value;
  const [isClickOnSave, setIsClickOnSave] = useState<string>('no');
  useEffect(() => {
    if (isClickOnSave === 'yes' && !isLoading) {
      isEdit.onFalse();
      setIsClickOnSave('no');
    }
  }, [isClickOnSave, isEdit, isLoading]);

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minHeight: 40 }}>
      <AnimatePresence mode="wait">
        {!isEdit.value && (
          <motion.div
            key="edit"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={editButtonVariant}
            transition={{ duration: 0.3 }}
          >
            <CustomTooltip title="Edit" placement="top">
              <IconButton onClick={isEdit.onTrue} title="Edit">
                <Iconify icon="solar:pen-bold" sx={{ cursor: 'pointer' }} />
              </IconButton>
            </CustomTooltip>
          </motion.div>
        )}

        {isEdit.value && (
          <motion.div
            key="actions"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={actionButtonsVariant}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', gap: 8 }}
          >
            <CustomTooltip title="Save" placement="top">
              <IconButton
                onClick={async () => {
                  const isValid = await onSave();
                  if (typeof isValid === 'boolean' && !isValid) return;
                  setIsClickOnSave('yes');
                }}
                disabled={isNewLoading && isClickOnSave === 'yes'}
                title="Save Changes"
              >
                <Iconify
                  icon={
                    isNewLoading && isClickOnSave === 'yes'
                      ? 'eos-icons:loading'
                      : 'lets-icons:save'
                  }
                  width={20}
                  sx={{ cursor: 'pointer' }}
                />
              </IconButton>
            </CustomTooltip>

            <CustomTooltip title="Cancel" placement="top">
              <IconButton
                onClick={() => {
                  onCancel();
                  isEdit.onFalse();
                }}
                title="Cancel"
              >
                <Iconify icon="game-icons:cancel" width={20} sx={{ cursor: 'pointer' }} />
              </IconButton>
            </CustomTooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

const InformationAllFields = ({ formik, isMainForm, editData = null }: any) => {
  const isBasicDetailsEditable = useBoolean(!!isMainForm);
  const isContactDetailsEditable = useBoolean(!!isMainForm);
  const isProfessionalDetailsEditable = useBoolean(!!isMainForm);
  const isAddressDetailsEditable = useBoolean(!!isMainForm);
  console.log('formik erroes---', formik.errors);

  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;

    formik.resetForm({ values: formik.values });
    return undefined;
  };
  const handleCancel = () => {
    formik.resetForm();
  };

  return (
    <Box>
      <SectionCard
        title="Basic Details"
        headerContent={
          !isMainForm && (
            <CardActions
              isEdit={isBasicDetailsEditable}
              isLoading={formik.isSubmitting}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
          <UploadAvatar
            maxSize={3145728}
            onDrop={async (acceptedFiles: File[]) => {
              const file = acceptedFiles?.[0];
              if (!file) return;

              const base64 = await fileToBase64(file);

              formik.setFieldValue('photo', base64); // set value
              formik.setFieldTouched('photo', true, false); // mark as touched
              await formik.validateField('photo'); // force Yup validation
            }}
            value={formik.values.photo}
            error={formik.touched.photo && Boolean(formik.errors.photo)}
            // helperText={formik.touched.photo && formik.errors.photo}
            sx={{ m: 'initial' }}
            disabled={!isBasicDetailsEditable.value}
          />
          {/* <FormHelperText>{formik.touched.photo && formik.errors.photo}</FormHelperText> */}
        </Grid>
        <Grid item xs={12} md={10}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <ShakingTextField
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="First Name *"
                  {...formik.getFieldProps('firstName')}
                  onChange={(e) => {
                    const newName = capitalize(e.target.value);
                    if (/^[A-Za-z ]*$/.test(newName)) {
                      formik.setFieldValue('firstName', newName);
                    }
                  }}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  disabled={!isBasicDetailsEditable.value}
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
                  label="Middle Name"
                  {...formik.getFieldProps('middleName')}
                  name="middleName"
                  onChange={(e) => {
                    const newName = capitalize(e.target.value);
                    if (/^[A-Za-z ]*$/.test(newName)) {
                      formik.setFieldValue('middleName', newName);
                    }
                  }}
                  error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                  helperText={formik.touched.middleName && formik.errors.middleName}
                  disabled={!isBasicDetailsEditable.value}
                  onBlur={formik.handleBlur}
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
                    if (/^[A-Za-z ]*$/.test(newName)) {
                      formik.setFieldValue('lastName', newName);
                    }
                  }}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  disabled={!isBasicDetailsEditable.value}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <ShakingTextField
                error={formik.touched.shortName && Boolean(formik.errors.shortName)}
              >
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
                  disabled={!isBasicDetailsEditable.value}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <ShakingTextField error={formik.touched.dob && Boolean(formik.errors.dob)}>
                <DatePicker
                  label="Date of Birth *"
                  value={formik.values.dob}
                  onChange={(value) => {
                    formik.setFieldValue('dob', value);
                    // formik.setFieldTouched('dob', true);
                  }}
                  disableFuture
                  minDate={dayjs('1947-01-01')}
                  maxDate={dayjs()}
                  disabled={!isBasicDetailsEditable.value}
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: !!(formik.touched.dob && formik.errors.dob) || false,
                      helperText: (formik.touched.dob && formik.errors.dob) || '',
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <ShakingTextField error={formik.touched.gender && Boolean(formik.errors.gender)}>
                <FormControl
                  disabled={!isBasicDetailsEditable.value}
                  fullWidth
                  sx={{ display: 'flex', gap: 1, flexDirection: 'row', alignItems: 'center' }}
                >
                  <FormLabel
                    id="gender-radio-group"
                    sx={{
                      color: (theme) =>
                        formik.touched.gender && formik.errors.gender
                          ? '#ff563d !important'
                          : `${theme.palette.common.black} !important`,
                      mr: 1,
                    }}
                  >
                    Gender *
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
                  disabled={!isBasicDetailsEditable.value}
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
                  disabled={!isBasicDetailsEditable.value}
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
                    // Capitalize the first letter and keep the rest of the string as it is [A-Za-z]
                    const value = e?.target?.value?.replace(/[^A-Za-z\s]/g, '') || '';
                    const newName = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
                    formik.setFieldValue('familyCast', newName);
                  }}
                  error={formik.touched.familyCast && Boolean(formik.errors.familyCast)}
                  helperText={formik.touched.familyCast && formik.errors.familyCast}
                  disabled={!isBasicDetailsEditable.value}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <ShakingTextField
                error={formik.touched.maritalStatus && Boolean(formik.errors.maritalStatus)}
              >
                <FormControl
                  fullWidth
                  disabled={!isBasicDetailsEditable.value}
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
                  disabled={!isBasicDetailsEditable.value}
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

      <SectionCard
        title="Contact Information"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isContactDetailsEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={4}>
          <ShakingTextField error={formik.touched.email && Boolean(formik.errors.email)}>
            <TextField
              fullWidth
              size="small"
              label="Email *"
              {...formik.getFieldProps('email')}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={!isContactDetailsEditable.value}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="mdi-light:email" />
                      <Divider orientation="vertical" flexItem sx={{ height: 24 }} />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <ShakingTextField error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}>
            <PhoneInput
              name="mobileNo"
              value={formik.values.mobileNo}
              onChange={(value) => {
                formik.setFieldValue('mobileNo', value);
                formik.validateField('mobileNo');
              }}
              label="Primary Contact No. *"
              error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
              disabled={!isContactDetailsEditable.value}
              helperText={formik.touched.mobileNo && formik.errors.mobileNo}
              onBlur={formik.handleBlur}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <PhoneInput
            name="secondaryMobileNo"
            value={formik.values.secondaryMobileNo}
            onChange={(value) => {
              formik.setFieldValue('secondaryMobileNo', value);
            }}
            label="Secondary Contact No. "
            error={formik.touched.secondaryMobileNo && Boolean(formik.errors.secondaryMobileNo)}
            disabled={!isContactDetailsEditable.value}
            helperText={formik.touched.secondaryMobileNo && formik.errors.secondaryMobileNo}
            onBlur={formik.handleBlur}
          />
        </Grid>
      </SectionCard>

      <SectionCard
        title="Professional Details"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isProfessionalDetailsEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={formik.touched.dateOfJoining && Boolean(formik.errors.dateOfJoining)}
          >
            <DatePicker
              label="Date of Joining *"
              value={formik.values.dateOfJoining}
              onChange={(value) => formik.setFieldValue('dateOfJoining', value)}
              format="DD-MM-YYYY"
              disabled={!isProfessionalDetailsEditable.value}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: !!(formik.touched.dateOfJoining && formik.errors.dateOfJoining) || false,
                  helperText: (formik.touched.dateOfJoining && formik.errors.dateOfJoining) || '',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={formik.touched.employeeGroup && Boolean(formik.errors.employeeGroup)}
          >
            <FormControl
              fullWidth
              disabled={!isProfessionalDetailsEditable.value}
              error={!!formik.errors.employeeGroup && formik.touched.employeeGroup}
            >
              <InputLabel id="employee-group-label" size="small">
                Employee Group *
              </InputLabel>
              <Select
                labelId="employee-group-label"
                id="employeeGroup"
                value={formik.values.employeeGroup}
                onChange={formik.handleChange}
                size="small"
                label="Employee Group *"
                name="employeeGroup"
              >
                {EmployeeGroupTypeArray.map((item, index) => (
                  <MenuItem key={item} value={index}>
                    {EmployeeGroupType[index]}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.employeeGroup && formik.errors.employeeGroup && (
                <FormHelperText>{formik.errors.employeeGroup}</FormHelperText>
              )}
            </FormControl>
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
                const { value } = e.target;
                if (/^[A-Za-z\s]*$/.test(value)) {
                  const formattedValue = value
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                  formik.setFieldValue('department', formattedValue);
                }
              }}
              // onChange={(e) => {
              //   const newName = capitalize(e.target.value);
              //   formik.setFieldValue('department', newName);
              // }}
              error={formik.touched.department && Boolean(formik.errors.department)}
              helperText={formik.touched.department && formik.errors.department}
              disabled={!isProfessionalDetailsEditable.value}
            />
          </ShakingTextField>
        </Grid>
        {/* <Grid item xs={12} md={4}>
          <ShakingTextField
            error={formik.touched.designation && Boolean(formik.errors.designation)}
          >
            <TextField
              fullWidth
              size="small"
              label="Designation"
              {...formik.getFieldProps('designation')}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                formik.setFieldValue('designation', value);
              }}
              error={formik.touched.designation && Boolean(formik.errors.designation)}
              helperText={formik.touched.designation && formik.errors.designation}
              disabled={!isProfessionalDetailsEditable.value}
            />
          </ShakingTextField>
        </Grid> */}

        <Grid item xs={12} md={4}>
          <RenderRole formik={formik} disabled={!isProfessionalDetailsEditable.value} />
        </Grid>
        <Grid item xs={12} md={4}>
          <RenderOrganization formik={formik} disabled={!isProfessionalDetailsEditable.value} />
        </Grid>
        <Grid item xs={12} md={4}>
          <RenderShift formik={formik} disabled={!isProfessionalDetailsEditable.value} />
        </Grid>
      </SectionCard>

      <SectionCard
        title="Address Details"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isAddressDetailsEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
          >
            <TextField
              fullWidth
              size="small"
              label="Building No./Flat/House No. *"
              {...formik.getFieldProps('addressLine1')}
              onChange={formik.handleChange}
              error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
              helperText={formik.touched.addressLine1 && formik.errors.addressLine1}
              disabled={!isAddressDetailsEditable.value}
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
              onChange={formik.handleChange}
              error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
              helperText={formik.touched.addressLine2 && formik.errors.addressLine2}
              disabled={!isAddressDetailsEditable.value}
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
              label="Landmark"
              {...formik.getFieldProps('addressLine3')}
              onChange={formik.handleChange}
              error={formik.touched.addressLine3 && Boolean(formik.errors.addressLine3)}
              helperText={formik.touched.addressLine3 && formik.errors.addressLine3}
              disabled={!isAddressDetailsEditable.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <ShakingTextField error={formik.touched.country && Boolean(formik.errors.country?.name)}>
            <CountryComponent
              value={formik.values.country}
              onChange={(_e: any, value: any) => {
                formik.setFieldValue('state', { name: '', isoCode: '' });
                formik.setFieldValue('country', { name: value?.name, isoCode: value?.isoCode });
              }}
              error={formik.touched.country && Boolean(formik.errors.country?.name)}
              helperText={formik.touched.country && formik.errors.country?.name}
              textFieldProps={{
                label: 'Country *',
              }}
              disabled={!isAddressDetailsEditable.value}
              onBlur={formik.handleBlur}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <ShakingTextField error={formik.touched.state && Boolean(formik.errors?.state?.name)}>
            <StateComponent
              value={formik.values.state}
              countryValue={formik.values.country}
              onChange={(_e: any, value: any) => {
                formik.setFieldValue('state', {
                  ...(value || {}),
                  name: value?.name,
                  isoCode: value?.isoCode,
                });
                formik.setFieldValue('city', { name: '' });
              }}
              error={formik.touched.state && Boolean(formik.errors?.state?.name)}
              helperText={formik.touched.state && formik.errors?.state?.name}
              disabled={!isAddressDetailsEditable.value}
              textFieldProps={{
                label: 'State *',
              }}
              onBlur={formik.handleBlur}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <ShakingTextField error={formik.touched.city && Boolean(formik.errors.city?.name)}>
            <CityComponent
              value={formik.values.city}
              onChange={(_e: any, value: any) => {
                formik.setFieldValue('city', { name: value?.name });
              }}
              stateValue={formik.values.state}
              error={formik.touched.city && Boolean(formik.errors.city?.name)}
              helperText={formik.touched.city && formik.errors.city?.name}
              disabled={!isAddressDetailsEditable.value}
              textFieldProps={{
                label: 'City *',
              }}
              onBlur={formik.handleBlur}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <ShakingTextField error={formik.touched.pincode && Boolean(formik.errors.pincode)}>
            <TextField
              fullWidth
              size="small"
              label="PIN Code"
              type="number"
              {...formik.getFieldProps('pincode')}
              error={formik.touched.pincode && Boolean(formik.errors.pincode)}
              helperText={formik.touched.pincode && formik.errors.pincode}
              disabled={!isAddressDetailsEditable.value}
              name="pincode"
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 6) {
                  formik.handleChange(e);
                  formik.validateField('pincode');
                }
              }}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
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
};

export const InformationFields: FieldsType[] = [
  {
    type: 'text',
    label: ' ',
    name: ' ',
    gridProps: { xs: 12, md: 12 },
    renderComp: (props) => <InformationAllFields {...props} />,
  },
];
