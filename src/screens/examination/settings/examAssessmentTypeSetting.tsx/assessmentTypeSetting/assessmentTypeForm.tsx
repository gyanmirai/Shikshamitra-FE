import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getAssessmentTypeInitialValues } from '../initialValues';
import { assessmentTypeValidationSchema } from '../validationSchema';

import type { IAssessmentTypeFormProps } from '../type';

const AssessmentTypeForm: React.FC<IAssessmentTypeFormProps> = ({
  onClose,
  onSubmit,
  data = null,
  isEdit = false,
}) => {
  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    // Set initial form values based on provided data
    initialValues: getAssessmentTypeInitialValues(data),
    // Apply validation schema for form fields
    validationSchema: assessmentTypeValidationSchema,
    // Handle form submission
    onSubmit: (values) => {
      // Call parent onSubmit with form values and generate/use existing ID
      onSubmit({
        ...values,
        id: data?.id || Date.now(), // Use existing ID or generate new timestamp-based ID
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
                <ShakingTextField
                  error={!!(formik.touched.assessmentType && formik.errors.assessmentType)}
                >
                  <TextField
                    fullWidth
                    label="Assessment Type *"
                    name="assessmentType"
                    size="small"
                    placeholder="Enter Assessment Type"
                    value={formik.values.assessmentType}
                    onChange={formik.handleChange}
                    error={formik.touched.assessmentType && Boolean(formik.errors.assessmentType)}
                    helperText={
                      formik.touched.assessmentType && (formik.errors.assessmentType as string)
                    }
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
                    placeholder="Enter Description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && (formik.errors.description as string)}
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
              startIcon={<Iconify icon={data ? GlobalIcons.edit : GlobalIcons.submit} />}
              onClick={(e) => {
                formik.handleSubmit();
              }}
            >
              {data ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Box>
    </BackPopUpChecked>
  );
};

export default AssessmentTypeForm;
