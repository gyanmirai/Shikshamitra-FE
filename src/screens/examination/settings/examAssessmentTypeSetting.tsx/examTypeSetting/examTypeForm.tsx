import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
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
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ShakingTextField error={!!(formik.touched.examType && formik.errors.examType)}>
                  <TextField
                    fullWidth
                    label="Exam Type *"
                    name="examType"
                    size="small"
                    // placeholder="Enter Exam Type"
                    value={formik.values.examType}
                    onChange={formik.handleChange}
                    error={formik.touched.examType && Boolean(formik.errors.examType)}
                    helperText={formik.touched.examType && formik.errors.examType}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description)}
                >
                  <TextField
                    fullWidth
                    label="Description *"
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
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={(e) => onClose(e, false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit} />}
              onClick={(e) => {
                // formik.handleSubmit();
              }}
            >
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Box>
    </BackPopUpChecked>
  );
};

export default ExamTypeForm;
