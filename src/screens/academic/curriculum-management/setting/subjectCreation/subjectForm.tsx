'use client';

import React from 'react';
import { useFormik } from 'formik';
import { MuiColorInput } from 'mui-color-input';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getSubjectInitialValues } from './initialValues';
import { subjectValidationSchema } from './validationSchema';

import type { ISubjectFormProps } from './type';

const SettingSubjectForm: React.FC<ISubjectFormProps> = ({ open, onClose, editData }) => {
  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    // Set initial form values, populated from editData if available
    initialValues: getSubjectInitialValues(editData),
    // Apply validation rules defined in incidentValidationSchema
    validationSchema: subjectValidationSchema,
    // Handle form submission
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
                  error={!!(formik.touched.subjectName && formik.errors.subjectName) || false}
                >
                  <TextField
                    fullWidth
                    label="Subject Name"
                    name="subjectName"
                    size="small"
                    value={formik.values.subjectName}
                    placeholder="Enter Subject Name"
                    onChange={formik.handleChange}
                    error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
                    helperText={formik.touched.subjectName && formik.errors.subjectName}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.subjectColor && formik.errors.subjectColor) || false}
                >
                  <MuiColorInput
                    placeholder="Subject Color"
                    size="small"
                    format="hex"
                    value={formik.values.subjectColor}
                    onChange={(e) => {
                      formik.setFieldValue('subjectColor', e);
                    }}
                    sx={{
                      minWidth: 180,
                      width: '100%',
                      '& .MuiInputBase-root': {
                        fontSize: '0.875rem',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        fontSize: '0.875rem',
                      },
                    }}
                    error={formik.touched.subjectColor && Boolean(formik.errors.subjectColor)}
                    helperText={formik.touched.subjectColor && formik.errors.subjectColor}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
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

export default SettingSubjectForm;
