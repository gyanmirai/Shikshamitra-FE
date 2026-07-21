import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

// const facilitiesOptions = ['AC', 'Wi-Fi', 'Study Table', 'Attached Bathroom'];

const AddRoomCategoryForm = ({ dialog, onClose, editData }: any) => {
  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    // Set initial form values, using editData if available or empty defaults
    initialValues: {
      name: editData?.name || '',
      description: editData?.description || '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Category Name is required'),
      description: Yup.string().required('Description is required'),
    }),
    onSubmit: (values) => {},
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
                  <TextField
                    size="small"
                    label="Room Type *"
                    name="name"
                    fullWidth
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={
                      formik.touched.name && typeof formik.errors.name === 'string'
                        ? formik.errors.name
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={12}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description)}
                >
                  <TextField
                    size="small"
                    label="Description *"
                    name="description"
                    type="number"
                    fullWidth
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={
                      formik.touched.description && typeof formik.errors.description === 'string'
                        ? formik.errors.description
                        : undefined
                    }
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

export default AddRoomCategoryForm;
