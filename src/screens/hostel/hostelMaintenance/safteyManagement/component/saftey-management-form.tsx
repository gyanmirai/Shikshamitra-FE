'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
  Box,
  Grid,
  Radio,
  Button,
  TextField,
  Typography,
  RadioGroup,
  FormControl,
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

import { getSafetyManagementInitialValues } from '../initialValue';
import { safetyManagementValidationSchema } from '../validationSchema';

import type { IReportSafteyManagemtFormProps } from '../saftey-management-interface';

const ReportSafteyManagemtForm: React.FC<IReportSafteyManagemtFormProps> = ({
  isEdit,
  data,
  onClose,
}) => {
  const formik = useFormik({
    initialValues: getSafetyManagementInitialValues(data),
    validationSchema: safetyManagementValidationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.incidentTitle && formik.errors.incidentTitle) || false}
                >
                  <TextField
                    disabled={isDisabled}
                    size="small"
                    label="Incident Title *"
                    name="incidentTitle"
                    fullWidth
                    value={formik.values.incidentTitle}
                    onChange={formik.handleChange}
                    error={formik.touched.incidentTitle && Boolean(formik.errors.incidentTitle)}
                    helperText={formik.touched.incidentTitle && formik.errors.incidentTitle}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.incidentType && Boolean(formik.errors.incidentType)}
                >
                  <CustomSelect
                    disabled={isDisabled}
                    label="Incident Type *"
                    options={[]}
                    value={formik.values.incidentType}
                    onChange={(value) => formik.setFieldValue('incidentType', value)}
                    error={formik.touched.incidentType && Boolean(formik.errors.incidentType)}
                    helperText={
                      formik.touched.incidentType && formik.errors.incidentType
                        ? String(formik.errors.incidentType)
                        : ''
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  disabled={isDisabled}
                  label="Select Date *"
                  format="DD-MM-YYYY"
                  value={formik.values.incidentDate ? dayjs(formik.values.incidentDate) : null}
                  onChange={(value) => {
                    // value is a Dayjs object or null
                    formik.setFieldValue('incidentDate', value ? value.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.incidentDate && Boolean(formik.errors.incidentDate),
                      helperText:
                        formik.touched.incidentDate && formik.errors.incidentDate
                          ? String(formik.errors.incidentDate)
                          : '',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TimePicker
                  disabled={isDisabled}
                  label="Select Time *"
                  format="hh:mm A"
                  value={formik.values.incidentTime ? dayjs(formik.values.incidentTime) : null}
                  onChange={(val) => {
                    // val is a Dayjs object or null
                    formik.setFieldValue('incidentTime', val ? val.toISOString() : null);
                  }}
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
              </Grid>
              <Grid item xs={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.incidentType && Boolean(formik.errors.incidentType)}
                >
                  <CustomSelect
                    label="Select Urgency *"
                    options={[]}
                    value={formik.values.incidentType}
                    onChange={(value) => formik.setFieldValue('incidentType', value)}
                    disabled={isEdit}
                    error={formik.touched.incidentType && Boolean(formik.errors.incidentType)}
                    helperText={
                      formik.touched.incidentType && formik.errors.incidentType
                        ? String(formik.errors.incidentType)
                        : ''
                    }
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12}>
                <ShakingTextField
                  error={
                    !!(formik.touched.incidentDescription && formik.errors.incidentDescription) ||
                    false
                  }
                >
                  <div style={isDisabled ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                    <Editor
                      value={formik.values.incidentDescription}
                      onChange={(value) => {
                        formik.setFieldValue('incidentDescription', value);
                      }}
                      placeholder="Description Of the Incident *"
                      sx={{ width: '100%', marginTop: '10px' }}
                      error={
                        formik.touched.incidentDescription &&
                        Boolean(formik.errors.incidentDescription)
                      }
                      helperText={
                        formik.touched.incidentDescription && formik.errors.incidentDescription
                      }
                    />
                  </div>
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} pb="20px">
                <div style={isDisabled ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                  <UploadBox
                    onDrop={() => {}}
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
                        <Typography variant="body2">Upload file</Typography>
                      </Box>
                    }
                    sx={{
                      py: 2.5,
                      width: 'auto',
                      height: 'auto',
                      borderRadius: 1.5,
                    }}
                  />
                </div>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Identity Option (For Students):</Typography>
              <Box display="flex" flexDirection="row" gap={2} mt={2}>
                <ShakingTextField
                  error={
                    !!(formik.touched.incidentReportedBy && formik.errors.incidentReportedBy) ||
                    false
                  }
                >
                  <FormControl
                    error={
                      !!(formik.touched.incidentReportedBy && formik.errors.incidentReportedBy)
                    }
                  >
                    <RadioGroup
                      row
                      name="Identity Option:"
                      value={formik.values.incidentReportedBy}
                      onChange={formik.handleChange}
                    >
                      <FormControlLabel
                        value="identified"
                        control={<Radio />}
                        label="Report with Identity"
                        disabled={isDisabled}
                      />
                      <FormControlLabel
                        value="anonymous"
                        control={<Radio />}
                        label="Report Anonymously"
                        disabled={isDisabled}
                      />
                    </RadioGroup>
                    {formik.touched.incidentReportedBy && formik.errors.incidentReportedBy && (
                      <FormHelperText>{String(formik.errors.incidentReportedBy)}</FormHelperText>
                    )}
                  </FormControl>
                </ShakingTextField>
              </Box>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose();
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default ReportSafteyManagemtForm;
