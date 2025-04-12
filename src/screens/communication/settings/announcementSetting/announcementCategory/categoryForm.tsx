'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';

import { announcementCatValidationSchema } from '../../validationSchema';

import type { ICategoryFormProps } from '../../type';

export const CategoryForm: React.FC<ICategoryFormProps> = ({
  onSubmit,
  data = null,
  isEdit = false,
}) => {
  /**
   * State to track if the category is in draft status
   * Initialized as true for new categories or if existing category status is 'Unpublish'
   */
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));

  /**
   * Formik instance for handling form state and submission
   * @property {object} initialValues - Initial form values, populated from data prop if available
   * @property {function} onSubmit - Handles form submission, combines form values with additional data
   */
  const formik = useFormik({
    initialValues: {
      categoryName: data?.categoryName || '',
      categoryDescription: data?.categoryDescription || '',
    },
    validationSchema: announcementCatValidationSchema,
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
              <ShakingTextField
                error={!!(formik.touched.categoryName && formik.errors.categoryName) || false}
              >
                <TextField
                  fullWidth
                  label="Category Name"
                  name="categoryName"
                  size="small"
                  value={formik.values.categoryName}
                  onChange={formik.handleChange}
                  error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
                  helperText={
                    formik.touched.categoryName && typeof formik.errors.categoryName === 'string'
                      ? formik.errors.categoryName
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <ShakingTextField
                error={
                  !!(formik.touched.categoryDescription && formik.errors.categoryDescription) ||
                  false
                }
              >
                <TextField
                  fullWidth
                  label="Category Description"
                  name="categoryDescription"
                  size="small"
                  rows={4}
                  multiline
                  value={formik.values.categoryDescription}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.categoryDescription && Boolean(formik.errors.categoryDescription)
                  }
                  helperText={
                    formik.touched.categoryDescription &&
                    typeof formik.errors.categoryDescription === 'string'
                      ? formik.errors.categoryDescription
                      : undefined
                  }
                />
              </ShakingTextField>
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
