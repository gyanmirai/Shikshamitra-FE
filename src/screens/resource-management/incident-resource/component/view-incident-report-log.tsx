import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, TextField, Typography, DialogActions } from '@mui/material';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialIncidentResourceStatusValues } from '../initialValue';
import { incidentResourceStatusValidationSchema } from '../validationSchema';

import type {
  IViewEquipmentIncidentDialogProps,
  IIncidentResourceStatusFormValues,
} from '../incident-resource-interface';

const ViewIncidentReportDialog: React.FC<IViewEquipmentIncidentDialogProps> = ({
  isEdit,
  data,
  onClose,
}) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IIncidentResourceStatusFormValues>(
    () => getInitialIncidentResourceStatusValues(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IIncidentResourceStatusFormValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: incidentResourceStatusValidationSchema,

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
              error={formik.touched.incidentName && Boolean(formik.errors.incidentName)}
            >
              <TextField
                disabled
                name="incidentName"
                label="Incident Name"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.incidentName && Boolean(formik.errors.incidentName)}
                helperText={formik.touched.incidentName && formik.errors.incidentName}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
            >
              <TextField
                disabled
                name="resourceName"
                label="Resource Name"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
                helperText={formik.touched.resourceName && formik.errors.resourceName}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.reportedDate && Boolean(formik.errors.reportedDate)}
            >
              <DatePicker
                disabled
                label="Select Date"
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.reportedBy && Boolean(formik.errors.reportedBy)}
            >
              <TextField
                disabled
                name="reportedBy"
                label="Reported By"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.reportedBy && Boolean(formik.errors.reportedBy)}
                helperText={formik.touched.reportedBy && formik.errors.reportedBy}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.reporterRole && Boolean(formik.errors.reporterRole)}
            >
              <TextField
                disabled
                name="reporterRole"
                label="Reporter Role"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.reporterRole && Boolean(formik.errors.reporterRole)}
                helperText={formik.touched.reporterRole && formik.errors.reporterRole}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.reporterdepartment && Boolean(formik.errors.reporterdepartment)}
            >
              <TextField
                disabled
                name="reporterdepartment"
                label="Reporter Department"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={
                  formik.touched.reporterdepartment && Boolean(formik.errors.reporterdepartment)
                }
                helperText={formik.touched.reporterdepartment && formik.errors.reporterdepartment}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} pb="10px">
            <ShakingTextField
              error={
                formik.touched.incidentDescription && Boolean(formik.errors.incidentDescription)
              }
            >
              <TextField
                fullWidth
                multiline
                rows={4}
                disabled
                onChange={(value) => {
                  formik.setFieldValue('description', value);
                }}
                value={formik.values.incidentDescription}
                placeholder="Incident Description"
                error={
                  formik.touched.incidentDescription && Boolean(formik.errors.incidentDescription)
                }
                helperText={formik.touched.incidentDescription && formik.errors.incidentDescription}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.incidentType && Boolean(formik.errors.incidentType)}
            >
              <TextField
                disabled
                name="incidentType"
                label="Incident Type"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.incidentType && Boolean(formik.errors.incidentType)}
                helperText={formik.touched.incidentType && formik.errors.incidentType}
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
          <Grid item xs={6} pb="10px">
            <ShakingTextField error={formik.touched.status && Boolean(formik.errors.status)}>
              <CustomSelect
                label="Update Status *"
                options={[]}
                value={formik.values.status}
                onChange={(value) => formik.setFieldValue('status', value)}
                disabled={isEdit}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={
                  formik.touched.status && formik.errors.status ? String(formik.errors.status) : ''
                }
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.actionTaken && Boolean(formik.errors.actionTaken)}
            >
              <CustomSelect
                label="Action Taken *"
                options={[]}
                value={formik.values.actionTaken}
                onChange={(value) => formik.setFieldValue('actionTaken', value)}
                disabled={isEdit}
                error={formik.touched.actionTaken && Boolean(formik.errors.actionTaken)}
                helperText={
                  formik.touched.actionTaken && formik.errors.actionTaken
                    ? String(formik.errors.actionTaken)
                    : ''
                }
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
                  formik.setFieldValue('description', value);
                }}
                value={formik.values.incidentDescription}
                placeholder="Admin Notes"
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
        </Grid>
      </Scrollbar>
      <DialogActions>
        <CancelButton onClick={onClose} />
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </form>
  );
};

export default ViewIncidentReportDialog;
