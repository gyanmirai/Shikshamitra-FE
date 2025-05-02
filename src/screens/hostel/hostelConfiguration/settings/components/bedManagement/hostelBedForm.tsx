import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IBedNumberFormProps } from './type';

const AddBedNumberForm: React.FC<IBedNumberFormProps> = ({ dialog, onClose, editData }) => {
  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    // Set initial form values, using editData if available or empty strings as fallback
    initialValues: {
      bedNumber: editData?.bedNumber || '',
      hostelName: editData?.hostelName || '',
    },
    // Define validation schema using Yup
    validationSchema: Yup.object().shape({
      bedNumber: Yup.string().required('Bed Number is required'),
      hostelName: Yup.string().required('Hostel Name is required'),
    }),
    // Handle form submission
    onSubmit: (values) => {
      console.log('Form Values:', values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ShakingTextField error={!!(formik.touched.bedNumber && formik.errors.bedNumber)}>
                  <TextField
                    size="small"
                    label="Bed Number"
                    name="bedNumber"
                    fullWidth
                    value={formik.values.bedNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.bedNumber && Boolean(formik.errors.bedNumber)}
                    helperText={formik.touched.bedNumber && formik.errors.bedNumber}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12}>
                <ShakingTextField error={!!(formik.touched.hostelName && formik.errors.hostelName)}>
                  <CustomSelect
                    options={[]}
                    size="small"
                    label="Hostel Name"
                    name="hostelName"
                    fullWidth
                    value={formik.values.hostelName}
                    onChange={formik.handleChange}
                    error={formik.touched.hostelName && Boolean(formik.errors.hostelName)}
                    helperText={
                      formik.touched.hostelName && formik.errors.hostelName
                        ? String(formik.errors.hostelName)
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

export default AddBedNumberForm;
