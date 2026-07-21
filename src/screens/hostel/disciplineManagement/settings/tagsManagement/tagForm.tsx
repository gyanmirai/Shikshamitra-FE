import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { TagFormProps } from './type';

const TagForm: React.FC<TagFormProps> = ({ dialog, onClose, editData }) => {
  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    // Set initial form values, using editData if available
    initialValues: {
      emergencyLevel: editData?.emergencyLevel || '',
      description: editData?.description || '',
    },
    // Define validation schema using Yup
    validationSchema: Yup.object().shape({
      tagName: Yup.string().required('Tag Name is required'),
      description: Yup.string().required('Description is required'),
    }),
    // Handle form submission
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
                  error={!!(formik.touched.emergencyLevel && formik.errors.emergencyLevel)}
                >
                  <TextField
                    size="small"
                    label="Emergency Level"
                    name="emergencyLevel"
                    fullWidth
                    value={formik.values.emergencyLevel}
                    onChange={formik.handleChange}
                    error={formik.touched.emergencyLevel && Boolean(formik.errors.emergencyLevel)}
                    helperText={formik.touched.emergencyLevel && formik.errors.emergencyLevel}
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

export default TagForm;
