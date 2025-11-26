import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IIncidentTypeFormProps } from '../type';

const IncidentTypeSettingForm: React.FC<IIncidentTypeFormProps> = ({
  dialog,
  onClose,
  editData,
}) => {
  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    // Set initial form values, using editData if available
    initialValues: {
      incidentTypeName: editData?.incidentTypeName || '',
      description: editData?.description || '',
    },
    // Define validation schema using Yup
    validationSchema: Yup.object().shape({
      incidentTypeName: Yup.string().required('Incident Type is required'),
      description: Yup.string().required('Description is required'),
    }),
    // Handle form submission
    onSubmit: (values) => {
      onClose(null, true);
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={!!(formik.touched.incidentTypeName && formik.errors.incidentTypeName)}
                >
                  <TextField
                    size="small"
                    label="Incident Type *"
                    name="incidentTypeName"
                    fullWidth
                    value={formik.values.incidentTypeName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.incidentTypeName && Boolean(formik.errors.incidentTypeName)
                    }
                    helperText={formik.touched.incidentTypeName && formik.errors.incidentTypeName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  size="small"
                  label="Description *"
                  name="description"
                  fullWidth
                  multiline
                  minRows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onClose(null, false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {editData ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default IncidentTypeSettingForm;
