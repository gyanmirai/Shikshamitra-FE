import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

import { getAssessmentTypeInitialValues } from '../initialValues';
import { assessmentTypeValidationSchema } from '../validationSchema';

import type { IAssessmentTypeFormProps } from '../type';

const AssessmentTypeForm: React.FC<IAssessmentTypeFormProps> = ({
  onSubmit,
  data = null,
  isEdit = false,
}) => {
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));

  const formik = useFormik({
    initialValues: getAssessmentTypeInitialValues(data),
    validationSchema: assessmentTypeValidationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
      });
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assessment Type"
                name="assessmentType"
                size="small"
                value={formik.values.assessmentType}
                onChange={formik.handleChange}
                error={formik.touched.assessmentType && Boolean(formik.errors.assessmentType)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                size="small"
                rows={4}
                multiline
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsDraft(true);
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  setIsDraft(false);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};
export default AssessmentTypeForm;
