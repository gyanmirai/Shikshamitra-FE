import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IncidentTypeFormProps } from './type';

const IncidentTypeForm: React.FC<IncidentTypeFormProps> = ({ dialog, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      incidentTypeName: editData?.incidentTypeName || '',
      description: editData?.description || '',
    },
    validationSchema: Yup.object().shape({
      incidentTypeName: Yup.string().required('Incident Type Name is required'),
      description: Yup.string().required('Description is required'),
    }),
    onSubmit: (values) => {
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={!!(formik.touched.incidentTypeName && formik.errors.incidentTypeName)}
                >
                  <TextField
                    size="small"
                    label="Incident Type Name"
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
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description)}
                >
                  <TextField
                    size="small"
                    label="Description"
                    name="description"
                    fullWidth
                    multiline
                    minRows={2}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </ShakingTextField>
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

export default IncidentTypeForm;
