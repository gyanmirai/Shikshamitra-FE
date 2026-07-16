import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IHostelTypeFormProps } from './type';

const AddHostelTypeForm: React.FC<IHostelTypeFormProps> = ({ dialog, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      hostelTypeName: editData?.hostelTypeName || '',
      description: editData?.description || '',
    },
    validationSchema: Yup.object().shape({
      hostelTypeName: Yup.string().required('Hostel Type Name is required'),
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
                <ShakingTextField
                  error={!!(formik.touched.hostelTypeName && formik.errors.hostelTypeName)}
                >
                  <TextField
                    size="small"
                    label="Hostel Type Name *"
                    name="hostelTypeName"
                    fullWidth
                    value={formik.values.hostelTypeName}
                    onChange={formik.handleChange}
                    error={formik.touched.hostelTypeName && Boolean(formik.errors.hostelTypeName)}
                    helperText={formik.touched.hostelTypeName && formik.errors.hostelTypeName}
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
                    fullWidth
                    multiline
                    minRows={3}
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
              onClick={() => {
                onClose(null, false);
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
              {editData ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AddHostelTypeForm;
