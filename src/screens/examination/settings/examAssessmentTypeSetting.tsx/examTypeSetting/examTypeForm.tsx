import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getExamTypeInitialValues } from '../initialValues';
import { examTypeValidationSchema } from '../validationSchema';

import type { IExamTypeFormProps } from '../type';

const ExamTypeForm: React.FC<IExamTypeFormProps> = ({
  onClose,
  onSubmit,
  data = null,
  isEdit = false,
}) => {
  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    // Set initial form values based on provided data
    initialValues: getExamTypeInitialValues(data),

    // Apply validation schema for form fields
    validationSchema: examTypeValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      onSubmit({
        ...values,
        // Generate new ID if not editing existing record
        id: data?.id || Date.now(),
      });
      shikshaMitraToast.success({
        message: `${values.examType} Exam type ${data ? 'updated' : 'created'} successfully`,
      });
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2}>
        {/* <form onSubmit={formik.handleSubmit}> */}
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <ShakingTextField error={!!(formik.touched.examType && formik.errors.examType)}>
                <TextField
                  fullWidth
                  label="Exam Type *"
                  name="examType"
                  size="small"
                  // placeholder="Enter Exam Type"
                  value={formik.values.examType}
                  onChange={(e) => {
                    const value = e.target.value
                      // Remove everything except letters and spaces
                      .replace(/[^a-zA-Z\s]/g, '')
                      // Capitalize each word
                      .split(' ')
                      .map((word) =>
                        word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                      )
                      .join(' ');
                    formik.setFieldValue('examType', value);
                  }}
                  error={formik.touched.examType && Boolean(formik.errors.examType)}
                  helperText={formik.touched.examType && formik.errors.examType}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={12}>
              <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  size="small"
                  rows={4}
                  multiline
                  // placeholder="Enter Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            size="small"
            onClick={(e) => onClose(e, false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            startIcon={
              <Iconify
                icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit}
                width={isEdit ? 16 : 20}
                height={isEdit ? 16 : 20}
              />
            }
            onClick={(e: any) => {
              formik.handleSubmit(e);
            }}
          >
            {isEdit ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
        {/* </form> */}
      </Box>
    </BackPopUpChecked>
  );
};

export default ExamTypeForm;
