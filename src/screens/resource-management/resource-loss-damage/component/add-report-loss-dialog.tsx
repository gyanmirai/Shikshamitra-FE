import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Typography, DialogActions } from '@mui/material';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialResourceIncidentValues } from '../initialValue';
import { resourceIncidentValidationSchema } from '../validationSchema';

import type {
  IAddReportLossDialogProps,
  IResourceIncidentFormValues,
} from '../resource-loss-damage-interface';

const AddReportLossDialog: React.FC<IAddReportLossDialogProps> = ({ isEdit, data, onClose }) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IResourceIncidentFormValues>(
    () => getInitialResourceIncidentValues(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IResourceIncidentFormValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: resourceIncidentValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={6} pb="10px">
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
          <Grid item xs={6} pb="10px">
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

          <Grid item xs={6} pb="10px">
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

          <Grid item xs={12} pb="10px">
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
                helperText={formik.touched.incidentDescription && formik.errors.incidentDescription}
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

          <Grid item xs={12} sx={{ pb: '10px' }}>
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
  );
};

export default AddReportLossDialog;
