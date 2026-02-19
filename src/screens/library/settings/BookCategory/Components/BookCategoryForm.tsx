'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddBookCategoryMutation,
  useUpdateBookCategoryMutation,
} from 'src/redux/bookCategoryApi/bookCategoryApi';

import { getBookCategoryInitialValues } from './BookInitialValues';
import { bookCategoryValidationSchema } from './BookCategoryValidationSchema';

import type { IBookCategoryFormProps } from './type';

// import initial values & validation schema (you’ll create these files similar to FeeHead)

const BookCategoryForm: React.FC<IBookCategoryFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [addBookCategory, { isLoading: isAdding }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBookCategoryMutation,
  });

  const [updateBookCategory, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBookCategoryMutation,
  });

  const formik = useFormik({
    initialValues: getBookCategoryInitialValues(editData),
    validationSchema: bookCategoryValidationSchema,
    onSubmit: async (values) => {
      // Construct payload matching API specification
      const payload = {
        categoryName: values.categoryName,
        description: values.description,
      };
      try {
        if (editData) {
          // Update existing category
          await updateBookCategory({
            categoryId: editData.id,
            data: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `${values.categoryName} Book Category updated successfully`,
          });
        } else {
          // Create new category
          await addBookCategory({
            ...payload,
            academicYearId: currentYear?.id,
          }).unwrap();
          shikshaMitraToast.success({
            message: `${values.categoryName} Book Category added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        // Error handling is managed by useQueryAndMutation or global handler,
        // but we catch here to prevent closing dialog on error if using .unwrap()
        console.error('Failed to save book category:', error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Category Name */}
          <Grid size={12}>
            <ShakingTextField
              error={!!(formik.touched.categoryName && formik.errors.categoryName) || false}
            >
              <TextField
                fullWidth
                label="Category Name *"
                name="categoryName"
                size="small"
                value={formik.values.categoryName}
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
                  formik.setFieldValue('categoryName', value);
                }}
                error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
                helperText={(formik.touched.categoryName && formik.errors.categoryName) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Description */}
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              size="small"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          loading={isAdding || isUpdating}
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
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default BookCategoryForm;
