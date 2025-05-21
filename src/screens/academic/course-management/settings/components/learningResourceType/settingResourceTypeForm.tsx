'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IResourceTypeFormProps } from './type';

const SettingResourceTypeForm: React.FC<IResourceTypeFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      resourceTypeName: editData?.resourceTypeName || '',
    },
    validationSchema: Yup.object({
      resourceTypeName: Yup.string().trim().required('Resource Type Name is required'),
    }),
    onSubmit: (values, formikHelpers) => {
      console.log(values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ShakingTextField
                  error={
                    !!(formik.touched.resourceTypeName && formik.errors.resourceTypeName) || false
                  }
                >
                  <TextField
                    fullWidth
                    label="Resource Type Name"
                    name="resourceTypeName"
                    size="small"
                    value={formik.values.resourceTypeName}
                    placeholder="Enter Resource Type Name"
                    onChange={formik.handleChange}
                    error={
                      formik.touched.resourceTypeName && Boolean(formik.errors.resourceTypeName)
                    }
                    helperText={formik.touched.resourceTypeName && formik.errors.resourceTypeName}
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
              Submit
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default SettingResourceTypeForm;
