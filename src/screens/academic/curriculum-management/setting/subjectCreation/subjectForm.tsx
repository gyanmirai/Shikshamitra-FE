'use client';

import React from 'react';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';

import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
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
          <Scrollbar sx={{ p: 2, height: '170px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.subjectName && formik.errors.subjectName) || false}
                >
                  <TextField
                    fullWidth
                    label="Subject Name *"
                    name="subjectName"
                    size="small"
                    value={formik.values.subjectName}
                    // placeholder="Enter Subject Name"
                    onChange={(e) => {
                      const value = capitalize(e.target.value);
                      formik.setFieldValue('subjectName', value);
                    }}
                    error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
                    helperText={formik.touched.subjectName && formik.errors.subjectName}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.subjectColor && formik.errors.subjectColor) || false}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1 }}
                    color={
                      formik.touched.subjectColor && formik.errors.subjectColor
                        ? 'error.main'
                        : 'text.primary'
                    }
                  >
                    Subject Color
                  </Typography>
                  <ColorPickerCircle
                    onSelect={(color: string) => formik.setFieldValue('subjectColor', color)}
                    initialColor={formik.values.subjectColor}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
              variant="outlined"
              size="small"
            >
              Cancel
            </Button>
            <Button
              startIcon={
                <Iconify
                  icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                  width={editData ? 16 : 20}
                  height={editData ? 16 : 20}
                />
              }
              type="submit"
              variant="contained"
              size="small"
            >
              {editData ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default SettingSubjectForm;
