'use client';

import React from 'react';
import { useFormik } from 'formik';

import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getBookCategoryInitialValues } from './BookInitialValues';
import { bookCategoryValidationSchema } from './BookCategoryValidationSchema';

import type { IBookCategoryFormProps } from './type';

// import initial values & validation schema (you’ll create these files similar to FeeHead)

const BookCategoryForm: React.FC<IBookCategoryFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getBookCategoryInitialValues(editData),
    validationSchema: bookCategoryValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${values.categoryName} Book Category updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.categoryName} Book Category added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Category Name */}
          <Grid item xs={12}>
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

          {/* Code */}
          <Grid item xs={12}>
            <ShakingTextField error={!!(formik.touched.code && formik.errors.code) || false}>
              <TextField
                fullWidth
                label="Code *"
                name="code"
                size="small"
                value={formik.values.code}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  const uppercaseValue = rawValue.toUpperCase().replace(/[^A-Z0-9\-_]/g, '');
                  formik.setFieldValue('code', uppercaseValue);
                }}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={(formik.touched.code && formik.errors.code) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
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
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default BookCategoryForm;
