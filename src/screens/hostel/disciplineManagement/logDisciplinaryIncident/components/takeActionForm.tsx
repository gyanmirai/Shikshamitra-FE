'use client';

import React from 'react';
import { useFormik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Box,
  Grid,
  Button,
  Checkbox,
  TextField,
  Typography,
  FormControl,
  Autocomplete,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { incidentValidationSchema } from './validationSchema';
import { getTakeActionInitialValues } from './takeActionInitialValues';

import type { ITakeActionFormProps } from '../type';

const TakeActionForm: React.FC<ITakeActionFormProps> = ({ open, onClose, editData }) => {
  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    // Set initial form values, populated from editData if available
    initialValues: getTakeActionInitialValues(editData),
    // Apply validation rules defined in incidentValidationSchema
    validationSchema: incidentValidationSchema,
    // Handle form submission
    onSubmit: (values, formikHelpers) => {
      console.log(values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Scrollbar sx={{ p: 2, maxHeight: '70vh', overflowY: 'auto' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.hostelName && formik.errors.hostelName) || false}
                >
                  <CustomSelect
                    size="small"
                    label="Hostel Name"
                    name="hostelName"
                    fullWidth
                    disabled
                    value={formik.values.hostelName}
                    onChange={(val) => {
                      formik.setFieldValue('hostelName', val);
                    }}
                    error={formik.touched.hostelName && Boolean(formik.errors.hostelName)}
                    helperText={
                      formik.touched.hostelName && formik.errors.hostelName
                        ? String(formik.errors.hostelName)
                        : undefined
                    }
                    options={[]}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.floor && formik.errors.floor) || false}>
                  <CustomSelect
                    size="small"
                    label="Floor"
                    name="floor"
                    fullWidth
                    disabled
                    value={formik.values.floor}
                    onChange={(val) => {
                      formik.setFieldValue('floor', val);
                    }}
                    error={formik.touched.floor && Boolean(formik.errors.floor)}
                    helperText={
                      formik.touched.floor && formik.errors.floor
                        ? String(formik.errors.floor)
                        : undefined
                    }
                    options={[]}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.students && formik.errors.students) || false}
                >
                  <FormControl
                    fullWidth
                    error={formik.touched.students && Boolean(formik.errors.students)}
                  >
                    <Autocomplete
                      multiple
                      id="students-select"
                      disabled
                      options={[
                        { label: 'Student 1', value: 'STU001' },
                        { label: 'Student 2', value: 'STU002' },
                        { label: 'Student 3', value: 'STU003' },
                        { label: 'Student 4', value: 'STU004' },
                        { label: 'Student 5', value: 'STU005' },
                        { label: 'Student 6', value: 'STU006' },
                        { label: 'Student 7', value: 'STU007' },
                        { label: 'Student 8', value: 'STU008' },
                        { label: 'Student 9', value: 'STU009' },
                        { label: 'Student 10', value: 'STU010' },
                      ]}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option.label}
                      renderOption={(props, option, { selected }) => {
                        const { key, ...optionProps } = props;
                        return (
                          <li key={key} {...optionProps}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlankIcon />}
                              checkedIcon={<CheckBoxIcon />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.value}
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Students"
                          placeholder="Select students"
                          size="small"
                        />
                      )}
                    />
                    {formik.touched.students && formik.errors.students && (
                      <FormHelperText>{formik.errors.students}</FormHelperText>
                    )}
                  </FormControl>
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.incidentDate && formik.errors.incidentDate) || false}
                >
                  <DatePicker
                    label="Incident Date"
                    format="DD/MM/YYYY"
                    disabled
                    value={formik.values.incidentDate}
                    onChange={(val) => formik.setFieldValue('incidentDate', val)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.incidentDate && Boolean(formik.errors.incidentDate),
                        helperText:
                          formik.touched.incidentDate && formik.errors.incidentDate
                            ? String(formik.errors.incidentDate)
                            : undefined,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.incidentTime && formik.errors.incidentTime) || false}
                >
                  <TimePicker
                    label="Incident Time"
                    format="HH:mm"
                    disabled
                    value={formik.values.incidentTime}
                    onChange={(val) => formik.setFieldValue('incidentTime', val)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.incidentTime && Boolean(formik.errors.incidentTime),
                        helperText:
                          formik.touched.incidentTime && formik.errors.incidentTime
                            ? String(formik.errors.incidentTime)
                            : undefined,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.incidentType && formik.errors.incidentType) || false}
                >
                  <CustomSelect
                    size="small"
                    label="Incident Type"
                    name="incidentType"
                    fullWidth
                    disabled
                    value={formik.values.incidentType}
                    onChange={(val) => {
                      formik.setFieldValue('incidentType', val);
                    }}
                    error={formik.touched.incidentType && Boolean(formik.errors.incidentType)}
                    helperText={
                      formik.touched.incidentType && formik.errors.incidentType
                        ? String(formik.errors.incidentType)
                        : undefined
                    }
                    options={[]}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description) || false}
                >
                  <Editor
                    value={formik.values.description}
                    onChange={(value) => {
                      // setQuestion(value);
                      formik.setFieldValue('description', value);
                    }}
                    editable={false}
                    placeholder="Incident Description"
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={
                      formik.touched.description && formik.errors.description
                        ? String(formik.errors.description)
                        : ''
                    }
                  />{' '}
                </ShakingTextField>
              </Grid>
              <Grid item xs={12}>
                <UploadBox
                  onDrop={() => {}}
                  disabled={!formik.values.actionName}
                  placeholder={
                    <Box
                      sx={{
                        gap: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.disabled',
                        flexDirection: 'column',
                      }}
                    >
                      <Iconify icon="eva:cloud-upload-fill" width={40} />
                      <Typography variant="body2">Drag Attachment</Typography>
                    </Box>
                  }
                  sx={{
                    py: 2.5,
                    width: '100%',
                    height: 'auto',
                    borderRadius: 1.5,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Take Action</Typography>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" flexDirection="row" gap={2}>
                  {['Warning', 'Parent Meeting', 'Fine', 'Suspension', 'Community Service'].map(
                    (label) => (
                      <FormControlLabel
                        key={label}
                        control={
                          <Checkbox
                            checked={formik.values.actionName === label}
                            onChange={() => formik.setFieldValue('actionName', label)}
                          />
                        }
                        label={label}
                      />
                    )
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description) || false}
                >
                  <Editor
                    value={formik.values.note}
                    onChange={(value) => {
                      // setQuestion(value);
                      formik.setFieldValue('note', value);
                    }}
                    placeholder="Notes"
                  />{' '}
                </ShakingTextField>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" flexDirection="row" gap={2}>
                  {['Student', 'Parent', 'Warden'].map((label) => (
                    <FormControlLabel
                      key={label}
                      control={
                        <Checkbox
                          checked={formik.values.notification === label}
                          onChange={() => formik.setFieldValue('notification', label)}
                        />
                      }
                      label={label}
                    />
                  ))}
                </Box>
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
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              Submit
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default TakeActionForm;
