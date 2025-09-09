'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getBookConditionInitialValues } from './BookCategoryInitialValues';
import { bookConditionValidationSchema } from './BookCategoryValidationSchema';

import type { IBookConditionFormProps } from './type';

const BookConditionForm: React.FC<IBookConditionFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getBookConditionInitialValues(editData),
    validationSchema: bookConditionValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${values.conditionType} condition updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.conditionType} condition added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Book Condition Type Name */}
          <Grid size={12}>
            <ShakingTextField
              error={!!(formik.touched.conditionType && formik.errors.conditionType) || false}
            >
              <TextField
                fullWidth
                label="Book Condition Type Name *"
                name="conditionType"
                size="small"
                value={formik.values.conditionType}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('conditionType', value);
                }}
                error={formik.touched.conditionType && Boolean(formik.errors.conditionType)}
                helperText={(formik.touched.conditionType && formik.errors.conditionType) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Code */}
          <Grid size={12}>
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

export default BookConditionForm;
