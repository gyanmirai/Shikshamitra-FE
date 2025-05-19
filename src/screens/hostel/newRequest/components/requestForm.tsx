'use client';

import type { Division, Standards } from 'src/types/school';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { hostelRequestValidationSchema } from './validationSchema';
import { getHostelRequestInitialValues } from './getHostelInitialValues';

import type { IHostelRequestFormType } from './type';

const roomTypeFacilities: Record<string, string[]> = {
  single: ['Wi-Fi', 'AC', 'Laundry'],
  double: ['Wi-Fi', 'Laundry'],
  deluxe: ['Wi-Fi', 'AC', 'TV', 'Gym', 'Laundry'],
};

const HostelRequestForm: React.FC<{
  open: UseBooleanReturn;
  onClose: () => void;
  editData?: IHostelRequestFormType | null;
  disabled?: boolean;
}> = ({ open, onClose, editData, disabled }) => {
  // State to store division options
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // State to store selected facilities for the hostel room
  const [facilities, setFacilities] = useState<string[]>([]);

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Initialize form using Formik
  const formik = useFormik({
    // Set initial form values from edit data or default values
    initialValues: getHostelRequestInitialValues(editData),
    // Apply validation schema
    validationSchema: hostelRequestValidationSchema,
    // Handle form submission
    onSubmit: (values) => {
      console.log(values);
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              {/* Hostel Type */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.hostelType && formik.errors.hostelType)}>
                  <CustomSelect
                    size="small"
                    label="Hostel Type *"
                    disabled={disabled}
                    name="hostelType"
                    fullWidth
                    value={formik.values.hostelType}
                    options={[
                      { value: 'boys', label: 'Boys' },
                      { value: 'girls', label: 'Girls' },
                    ]}
                    onChange={(val) => formik.setFieldValue('hostelType', val)}
                    error={formik.touched.hostelType && Boolean(formik.errors.hostelType)}
                    helperText={
                      formik.touched.hostelType && formik.errors.hostelType
                        ? String(formik.errors.hostelType)
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
              {/* Hostel Name */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.hostelName && formik.errors.hostelName)}>
                  <CustomSelect
                    size="small"
                    label="Hostel Name *"
                    name="hostelName"
                    disabled={!formik.values.hostelType || disabled}
                    fullWidth
                    options={[
                      { value: 'Hostel A', label: 'Hostel A' },
                      { value: 'Hostel B', label: 'Hostel B' },
                      { value: 'Hostel C', label: 'Hostel C' },
                      { value: 'Hostel D', label: 'Hostel D' },
                      { value: 'Hostel E', label: 'Hostel E' },
                    ]}
                    value={formik.values.hostelName}
                    onChange={(val) => formik.setFieldValue('hostelName', val)}
                    error={formik.touched.hostelName && Boolean(formik.errors.hostelName)}
                    helperText={
                      formik.touched.hostelName && formik.errors.hostelName
                        ? String(formik.errors.hostelName)
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
              {/* Class */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
                  <CustomSelect
                    size="small"
                    label="Class *"
                    name="className"
                    disabled={disabled}
                    options={classData?.items || []}
                    fullWidth
                    labelKey="name"
                    valueKey="id"
                    value={formik.values.className}
                    onChange={(val) => {
                      formik.setFieldValue('className', val);
                      const selectedClass: Standards = classData.items.find(
                        (i: Standards) => i.id === val
                      );
                      setDivisionOptions(selectedClass?.divisions || []);
                    }}
                    error={formik.touched.className && Boolean(formik.errors.className)}
                    helperText={
                      formik.touched.className && formik.errors.className
                        ? String(formik.errors.className)
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
              {/* Division */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
                  <CustomSelect
                    size="small"
                    label="Division *"
                    options={divisionOptions}
                    name="division"
                    labelKey="name"
                    valueKey="id"
                    disabled={!formik.values.className || disabled}
                    fullWidth
                    value={formik.values.division}
                    onChange={(val) => {
                      formik.setFieldValue('division', val);
                    }}
                    error={formik.touched.division && Boolean(formik.errors.division)}
                    helperText={
                      formik.touched.division && formik.errors.division
                        ? String(formik.errors.division)
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
              {/* Name */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
                  <Autocomplete
                    size="small"
                    options={[
                      { label: 'John Doe', value: 'john' },
                      { label: 'Jane Smith', value: 'jane' },
                    ]}
                    getOptionLabel={(option) => option.label}
                    value={
                      [
                        { label: 'John Doe', value: 'john' },
                        { label: 'Jane Smith', value: 'jane' },
                      ].find((opt) => opt.value === formik.values.name) || null
                    }
                    onChange={(_, newValue) => {
                      formik.setFieldValue('name', newValue?.value || '');
                    }}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Name *"
                        name="name"
                        fullWidth
                        disabled={disabled}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                      />
                    )}
                  />
                </ShakingTextField>
              </Grid>
              {/* Gender */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.gender && formik.errors.gender)}>
                  <CustomSelect
                    size="small"
                    label="Gender *"
                    name="gender"
                    disabled={disabled}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                    ]}
                    fullWidth
                    value={formik.values.gender}
                    onChange={(val) => formik.setFieldValue('gender', val)}
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                    helperText={
                      formik.touched.gender && formik.errors.gender
                        ? String(formik.errors.gender)
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
              {/* Date of Birth */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.dateOfBirth && formik.errors.dateOfBirth)}
                >
                  <DatePicker
                    label="Date of Birth *"
                    disabled={disabled}
                    name="dateOfBirth"
                    format="DD/MM/YYYY"
                    value={formik.values.dateOfBirth}
                    onChange={(val) => {
                      formik.setFieldValue('dateOfBirth', val);
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth),
                        helperText:
                          formik.touched.dateOfBirth && formik.errors.dateOfBirth
                            ? String(formik.errors.dateOfBirth)
                            : undefined,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.email && formik.errors.email) || false}>
                  <TextField
                    value={formik.values.email}
                    fullWidth
                    size="small"
                    disabled={disabled}
                    name="email"
                    label="Email"
                    onChange={formik.handleChange}
                    placeholder="Email"
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
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
              </Grid>{' '}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={
                    !!(formik.touched.parentsContactNo && formik.errors.parentsContactNo) || false
                  }
                >
                  <PhoneInput
                    name="parentsContactNo"
                    value={formik.values.parentsContactNo}
                    onChange={(value) => {
                      formik.setFieldValue('parentsContactNo', value);
                    }}
                    disabled={disabled}
                    placeholder="Parents Contact No."
                    error={
                      formik.touched.parentsContactNo && Boolean(formik.errors.parentsContactNo)
                    }
                    helperText={formik.touched.parentsContactNo && formik.errors.parentsContactNo}
                    variant="outlined"
                    label="Parents Contact No."
                    size="small"
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={
                    !!(
                      formik.touched.alternateContactDetails &&
                      formik.errors.alternateContactDetails
                    ) || false
                  }
                >
                  <PhoneInput
                    name="alternateContactDetails"
                    disabled={disabled}
                    value={formik.values.alternateContactDetails}
                    onChange={(value) => {
                      formik.setFieldValue('alternateContactDetails', value);
                    }}
                    placeholder="Alternate Contact Details"
                    error={
                      formik.touched.alternateContactDetails &&
                      Boolean(formik.errors.alternateContactDetails)
                    }
                    helperText={
                      formik.touched.alternateContactDetails &&
                      formik.errors.alternateContactDetails
                    }
                    variant="outlined"
                    label="Alternate Contact Details"
                    onBlur={formik.handleBlur}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.addressLine1 && formik.errors.addressLine1) || false}
                >
                  <TextField
                    name="addressLine1"
                    label="Address Line 1"
                    disabled={disabled}
                    value={formik.values.addressLine1}
                    onChange={formik.handleChange}
                    error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
                    helperText={formik.touched.addressLine1 && formik.errors.addressLine1}
                    fullWidth
                    placeholder="Address Line 1"
                    size="small"
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.addressLine2 && formik.errors.addressLine2) || false}
                >
                  <TextField
                    name="addressLine2"
                    label="Address Line 2"
                    disabled={disabled}
                    value={formik.values.addressLine2}
                    onChange={formik.handleChange}
                    error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
                    helperText={(formik.touched.addressLine2 && formik.errors.addressLine2) || ''}
                    fullWidth
                    placeholder="Address Line 2"
                    size="small"
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.addressLine3 && formik.errors.addressLine3) || false}
                >
                  <TextField
                    name="addressLine3"
                    label="Address Line 3"
                    disabled={disabled}
                    value={formik.values.addressLine3}
                    onChange={formik.handleChange}
                    error={formik.touched.addressLine3 && Boolean(formik.errors.addressLine3)}
                    helperText={(formik.touched.addressLine3 && formik.errors.addressLine3) || ''}
                    fullWidth
                    placeholder="Address Line 3"
                    size="small"
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.country && formik.errors.country) || false}
                >
                  <CountryComponent
                    value={formik.values.country}
                    onChange={(_e, value) => {
                      formik.setFieldValue('state', null);
                      formik.setFieldValue('country', value);
                    }}
                    disabled={disabled}
                    error={formik.touched.country && Boolean(formik.errors?.country?.name)}
                    helperText={(formik.touched.country && formik.errors?.country?.name) || ''}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.state && formik.errors?.state?.name) || false}
                >
                  <StateComponent
                    value={formik.values.state}
                    onChange={(_e, value) => {
                      formik.setFieldValue('city', null);
                      formik.setFieldValue('state', value);
                    }}
                    disabled={disabled}
                    error={formik.touched.state && Boolean(formik.errors?.state?.name)}
                    helperText={formik.touched.state && formik.errors?.state?.name}
                    countryValue={formik.values.country}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.city && formik.errors.city) || false}>
                  <CityComponent
                    value={formik.values.city}
                    disabled={disabled}
                    onChange={(_e, value) => formik.setFieldValue('city', value)}
                    error={formik.touched.city && Boolean(formik.errors?.city?.name)}
                    helperText={formik.touched.city && formik.errors?.city?.name}
                    stateValue={formik.values.state}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.village && formik.errors.village) || false}
                >
                  <TextField
                    name="village"
                    value={formik.values.village}
                    disabled={disabled}
                    onChange={formik.handleChange}
                    error={formik.touched.village && Boolean(formik.errors.village)}
                    helperText={formik.touched.village && formik.errors.village}
                    fullWidth
                    placeholder="Village"
                    size="small"
                    label="Village"
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.pinCode && formik.errors.pinCode) || false}
                >
                  <TextField
                    name="pinCode"
                    value={formik.values.pinCode}
                    onChange={formik.handleChange}
                    disabled={disabled}
                    error={formik.touched.pinCode && Boolean(formik.errors.pinCode)}
                    helperText={formik.touched.pinCode && formik.errors.pinCode}
                    fullWidth
                    placeholder="Pincode"
                    size="small"
                    label="Pincode"
                  />
                </ShakingTextField>
              </Grid>
              {/* Package Name */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.roomType && formik.errors.roomType)}>
                  <CustomSelect
                    size="small"
                    label="Room Type *"
                    name="roomType"
                    fullWidth
                    disabled={disabled}
                    value={formik.values.roomType}
                    onChange={(val: any) => {
                      formik.setFieldValue('roomType', val);
                      setFacilities(roomTypeFacilities[val] || []);
                    }}
                    options={[
                      { value: 'single', label: 'single' },
                      { value: 'double', label: 'double' },
                      { value: 'deluxe', label: 'deluxe' },
                    ]}
                    error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                    helperText={
                      formik.touched.roomType && formik.errors.roomType
                        ? String(formik.errors.roomType)
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.totalAmount && formik.errors.totalAmount)}
                >
                  <NumericFormatCustom
                    size="small"
                    label="Total Amount *"
                    disabled={!formik.values.roomType}
                    name="totalAmount"
                    fullWidth
                    value={formik.values.totalAmount}
                    onChange={formik.handleChange}
                    error={formik.touched.totalAmount && Boolean(formik.errors.totalAmount)}
                    helperText={formik.touched.totalAmount && formik.errors.totalAmount}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12}>
                {facilities.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Facilities of Room :
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {facilities.map((facility) => (
                        <Chip key={facility} label={facility} variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
              {/* Total Amount */}
              {/* Schedule Date */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.scheduleDate && formik.errors.scheduleDate)}
                >
                  <DatePicker
                    label="Schedule Date *"
                    name="scheduleDate"
                    format="DD/MM/YYYY"
                    disabled
                    value={formik.values.scheduleDate}
                    onChange={formik.handleChange}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.scheduleDate && Boolean(formik.errors.scheduleDate),
                        helperText:
                          formik.touched.scheduleDate && formik.errors.scheduleDate
                            ? String(formik.errors.scheduleDate)
                            : undefined,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
              {/* Join Date */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.joinDate && formik.errors.joinDate)}>
                  <DatePicker
                    label="Join Date *"
                    name="joinDate"
                    format="DD/MM/YYYY"
                    value={formik.values.joinDate}
                    disabled={disabled}
                    onChange={formik.handleChange}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.joinDate && Boolean(formik.errors.joinDate),
                        helperText:
                          formik.touched.joinDate && formik.errors.joinDate
                            ? String(formik.errors.joinDate)
                            : undefined,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
              {/* Fees Frequency */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.feesFrequency && formik.errors.feesFrequency)}
                >
                  <CustomSelect
                    label="Fees Frequency *"
                    value={formik.values.feesFrequency}
                    onChange={(value) => formik.setFieldValue('feesFrequency', value)}
                    options={[
                      { label: 'Monthly', value: 'Monthly' },
                      { label: 'Quarterly', value: 'Quarterly' },
                      { label: 'Annually', value: 'Annually' },
                    ]}
                    disabled={disabled}
                    formControlProps={{ fullWidth: true }}
                    error={formik.touched.feesFrequency && Boolean(formik.errors.feesFrequency)}
                    helperText={
                      formik.touched.feesFrequency && formik.errors.feesFrequency
                        ? String(formik.errors.feesFrequency)
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
              {/* Interaction Cost */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.iterationCost && formik.errors.iterationCost)}
                >
                  <NumericFormatCustom
                    size="small"
                    label="Interation Cost *"
                    name="iterationCost"
                    disabled
                    fullWidth
                    value={formik.values.iterationCost}
                    onChange={formik.handleChange}
                    error={formik.touched.iterationCost && Boolean(formik.errors.iterationCost)}
                    helperText={formik.touched.iterationCost && formik.errors.iterationCost}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              {editData ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default HostelRequestForm;
