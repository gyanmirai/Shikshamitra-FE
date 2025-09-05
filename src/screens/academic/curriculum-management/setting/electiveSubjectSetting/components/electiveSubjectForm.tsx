'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { getElectiveSubjectInitialValues } from './initialValues';
import { electiveSubjectValidationSchema } from './validationSchema';

import type { IElectiveSubjectFormProps } from '../type';

const SettingElectiveSubjectForm: React.FC<IElectiveSubjectFormProps> = ({
  open,
  onClose,
  editData,
}: IElectiveSubjectFormProps) => {
  // Initialize formik form with initial values, validation schema and submit handler
  const formik = useFormik({
    // Get initial form values from edit data or default values
    initialValues: getElectiveSubjectInitialValues(editData),
    // Apply validation rules to form fields
    validationSchema: electiveSubjectValidationSchema,
    // Handle form submission
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${values.title} Elective Group updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.title} Elective Group added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {/* <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '240px' }}> */}
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
              <TextField
                fullWidth
                label="Elective Group Name *"
                name="title"
                onChange={(e) => {
                  const value = e.target.value
                    // Remove everything except letters, numbers, spaces, dash, colon
                    .replace(/[^a-zA-Z-:0-9\s]/g, '')
                    // Capitalize each word
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('title', value);
                }}
                size="small"
                value={formik.values.title}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ResponsiveMultiSelect
              label="Select Subjects *"
              options={['Sanskrit', 'Hindi', 'Physical Training', 'Computer']}
              value={formik.values.subjects.map((s) => s.name)}
              getOptionLabel={(opt: any) => opt}
              getOptionValue={(opt: any) => opt}
              onChange={(selected: string[]) => {
                formik.setFieldValue(
                  'subjects',
                  selected.map((item) => ({
                    name: item,
                    subjectColor: '#000000', // default or from mapping
                  }))
                );
              }}
              error={!!(formik.touched.subjects && formik.errors.subjects)}
              helperText={
                Array.isArray(formik.errors.subjects)
                  ? formik.errors.subjects.join(', ')
                  : (formik.touched.subjects && formik.errors.subjects) || undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
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
                Elective Group Color *
              </Typography>
              <ColorPickerCircle
                onSelect={(color: string) => formik.setFieldValue('subjectColor', color)}
                initialColor={formik.values.subjectColor}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>
      {/* </Scrollbar> */}

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          onClick={() => {
            onClose(null, false);
          }}
          variant="outlined"
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
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
          size="small"
          variant="contained"
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
      {/* </Box>
      </form> */}
    </BackPopUpChecked>
  );
};

export default SettingElectiveSubjectForm;
