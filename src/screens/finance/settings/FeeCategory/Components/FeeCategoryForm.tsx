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
  useAddFeeCategoryMutation,
  useUpdateFeeCategoryMutation,
} from 'src/redux/feeCategory/feeCategoryApi';

import { feeCategoryValidationSchema } from './FeeCategoryValidation';
import { getFeeCategoryInitialValues } from './FeeCategoryInitialValues';

import type { IFeeCategoryFormProps } from './type';

const FeeCategoryForm: React.FC<IFeeCategoryFormProps> = ({ open, onClose, editData }) => {
  const { currentAcademicYearId } = useSelector((state: RootState) => state.globalState);
  const [addFeeCategory, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddFeeCategoryMutation,
  });
  const [updateFeeCategory, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeCategoryMutation,
  });
  const formik = useFormik({
    initialValues: getFeeCategoryInitialValues(editData),
    validationSchema: feeCategoryValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        updateFeeCategory({
          feeCategoryId: editData.id,
          name: values.feeCategoryName,
          description: values.description,
        });
        shikshaMitraToast.success({
          message: `${values.feeCategoryName} Fee Category updated successfully`,
        });
      } else {
        addFeeCategory({
          academicYearId: currentAcademicYearId,
          name: values.feeCategoryName,
          description: values.description,
        });
        shikshaMitraToast.success({
          message: `${values.feeCategoryName} Fee Category added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Fee Category Name */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.feeCategoryName && formik.errors.feeCategoryName) || false}
            >
              <TextField
                fullWidth
                label="Fee Category Name *"
                name="feeCategoryName"
                size="small"
                value={formik.values.feeCategoryName}
                onChange={(e) => {
                  let value = e.target.value
                    .replace(/[^a-zA-Z0-9\s]/g, '') // Allow letters, numbers, spaces
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/^\d+/, '') // Remove leading numbers
                    .trimStart(); // Remove leading spaces
                  value = value
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');

                  formik.setFieldValue('feeCategoryName', value);
                }}
                error={formik.touched.feeCategoryName && Boolean(formik.errors.feeCategoryName)}
                helperText={formik.touched.feeCategoryName && formik.errors.feeCategoryName}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
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
          loading={isAddLoading || isUpdateLoading}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default FeeCategoryForm;
