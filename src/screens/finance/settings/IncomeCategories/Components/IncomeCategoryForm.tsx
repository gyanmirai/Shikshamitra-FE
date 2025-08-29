'use client';

import React from 'react';
import { useFormik } from 'formik';

import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getIncomeCategoryInitialValues } from './IncomeCategoryInitialValues';
import { incomeCategoryValidationSchema } from './IncomeCategoryValidationSchema';

import type { IIncomeCategoryFormProps } from './type';

const IncomeCategoryForm: React.FC<IIncomeCategoryFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getIncomeCategoryInitialValues(editData),
    validationSchema: incomeCategoryValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${values.incomeCategoryName} Income Category updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.incomeCategoryName} Income Category added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Income Category Name */}
          <Grid item xs={12}>
            <ShakingTextField
              error={
                !!(formik.touched.incomeCategoryName && formik.errors.incomeCategoryName) || false
              }
            >
              <TextField
                fullWidth
                label="Income Category Name *"
                name="incomeCategoryName"
                size="small"
                value={formik.values.incomeCategoryName}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('incomeCategoryName', value);
                }}
                error={
                  formik.touched.incomeCategoryName && Boolean(formik.errors.incomeCategoryName)
                }
                helperText={formik.touched.incomeCategoryName && formik.errors.incomeCategoryName}
              />
            </ShakingTextField>
          </Grid>

          {/* Budget */}
          <Grid item xs={12}>
            <ShakingTextField error={!!(formik.touched.budget && formik.errors.budget) || false}>
              <CustomSelect
                name="budget"
                label="Budget *"
                options={[
                  { id: 'Income Budget 2025', name: 'Income Budget 2025' },
                  { id: 'Annual Income Budget 2025', name: 'Annual Income Budget 2025' },
                  {
                    id: 'Cultural & Sports Event Income 2025',
                    name: 'Cultural & Sports Event Income 2025',
                  },
                  { id: 'Annual Tuition Income 2025', name: 'Annual Tuition Income 2025' },
                ]}
                value={formik.values.budget || ''}
                labelKey="name"
                valueKey="id"
                onChange={(value) => {
                  formik.setFieldValue('budget', value);
                  formik.setFieldTouched('budget', false);
                }}
                error={!!(formik.touched.budget && formik.errors.budget) || false}
                helperText={(formik.touched.budget && formik.errors.budget) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
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

export default IncomeCategoryForm;
