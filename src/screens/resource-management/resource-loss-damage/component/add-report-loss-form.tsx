'use client';

import React from 'react';
import { useFormik } from 'formik';
import { Editor } from 'src/components/editor';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Typography, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialResourceIncidentValues } from '../initialValue';
import { resourceIncidentValidationSchema } from '../validationSchema';

import type { IAddReportLossFormProps } from '../resource-loss-damage-interface';

const AddReportLossForm: React.FC<IAddReportLossFormProps> = ({ isEdit, data, onClose }) => {
  const formik = useFormik({
    initialValues: getInitialResourceIncidentValues(data),
    validationSchema: resourceIncidentValidationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={2}>
            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
              >
                <CustomSelect
                  label="Select Category *"
                  options={[]}
                  value={formik.values.resourceName}
                  onChange={(value) => formik.setFieldValue('resourceName', value)}
                  disabled={isEdit}
                  error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
                  helperText={
                    formik.touched.resourceName && formik.errors.resourceName
                      ? String(formik.errors.resourceName)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>
            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.typeOfIncident && Boolean(formik.errors.typeOfIncident)}
              >
                <CustomSelect
                  label="Select Item *"
                  options={[]}
                  value={formik.values.typeOfIncident}
                  onChange={(value) => formik.setFieldValue('typeOfIncident', value)}
                  disabled={isEdit}
                  error={formik.touched.typeOfIncident && Boolean(formik.errors.typeOfIncident)}
                  helperText={
                    formik.touched.typeOfIncident && formik.errors.typeOfIncident
                      ? String(formik.errors.typeOfIncident)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.dateOfIncident && Boolean(formik.errors.dateOfIncident)}
              >
                <DatePicker
                  label="Select Date *"
                  format="DD-MM-YYYY"
                  value={formik.values.dateOfIncident}
                  onChange={(value) => formik.setFieldValue('dateOfIncident', value)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.dateOfIncident && Boolean(formik.errors.dateOfIncident),
                      helperText:
                        formik.touched.dateOfIncident && formik.errors.dateOfIncident
                          ? String(formik.errors.dateOfIncident)
                          : '',
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={12} pb="10px">
              <ShakingTextField
                error={
                  formik.touched.incidentDescription && Boolean(formik.errors.incidentDescription)
                }
              >
                <Editor
                  onChange={(value) => {
                    formik.setFieldValue('incidentDescription', value);
                  }}
                  value={formik.values.incidentDescription}
                  placeholder="Incident Description *"
                  error={
                    formik.touched.incidentDescription && Boolean(formik.errors.incidentDescription)
                  }
                  helperText={
                    formik.touched.incidentDescription && formik.errors.incidentDescription
                  }
                  editable={isEdit}
                  sx={{ height: '100%' }}
                  slotProps={{
                    wrap: {
                      height: '100%',
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={12} sx={{ pb: '10px' }}>
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
                    <Typography variant="body2">Drag Your File</Typography>
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
          </Grid>
        </Scrollbar>
        <DialogActions>
          <CancelButton
            onClick={() => {
              onClose();
            }}
          />
          <SubmitButton onClick={() => {}} />
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};

export default AddReportLossForm;
