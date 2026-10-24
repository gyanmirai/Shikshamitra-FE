'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Alert, Button, TextField, DialogActions } from '@mui/material';
import { getAccountSettingSaveError } from 'src/screens/finance/settings/components/account-setting-save-error';
import {
  useGetIncomeCategoriesQuery,
  usePutIncomeCategoryMutation,
  usePostIncomeCategoryMutation,
} from 'src/redux/finance/incomeCategory';

import { getIncomeCategoryInitialValues } from './IncomeCategoryInitialValues';
import { incomeCategoryValidationSchema } from './IncomeCategoryValidationSchema';

import type { IIncomeCategoryFormProps } from './type';

const IncomeCategoryForm: React.FC<IIncomeCategoryFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [saveError, setSaveError] = useState('');

  const { data: incomeCategoryData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeCategoriesQuery,
    params: { academicYearId: currentYear?.id, page: 1, pageSize: 100 },
    options: {
      skip: !currentYear?.id || !open?.value,
    },
  });

  const existingNames = useMemo(
    () =>
      new Set<string>(
        (incomeCategoryData?.items ?? []).map((t: any) => t.name.trim().toLowerCase())
      ),
    [incomeCategoryData]
  );

  // POST mutation for creating
  const [addIncomeCategory, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostIncomeCategoryMutation,
  });

  // PUT mutation for updating
  const [updateIncomeCategory, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutIncomeCategoryMutation,
  });

  const formik = useFormik({
    initialValues: getIncomeCategoryInitialValues(editData),
    enableReinitialize: true,
    validationSchema: incomeCategoryValidationSchema(existingNames, editData),
    onSubmit: async (values) => performSubmission(values),
  });

  // Perform the actual form submission
  const performSubmission = async (values: any) => {
    setSaveError('');
    try {
      // Transform form data to API format
      const payload = {
        name: values.name.trim(),
        description: values.description || '',
        tags: editData?.tags || [],
        concurrencyStamp: editData ? values.concurrencyStamp : null,
      };

      if (editData?.id) {
        // Update existing income category
        await updateIncomeCategory({
          incomeCategoryId: editData.id,
          body: payload,
        }).unwrap();

        shikshaMitraToast.success({
          message: `${values.name} Income Category updated successfully`,
        });
      } else {
        // Create new income category
        await addIncomeCategory({
          academicYearId: currentYear?.id,
          body: payload,
        }).unwrap();

        shikshaMitraToast.success({
          message: `${values.name} Income Category added successfully`,
        });
      }
      onClose(null, true);
    } catch (error) {
      const problem = getAccountSettingSaveError(error, 'category');
      setSaveError(problem.message);
      if (problem.field) {
        formik.setFieldTouched(problem.field, true, false);
        formik.setFieldError(problem.field, problem.message);
      }
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}
        <FormSectionCard
          descriptionTooltip="Name and describe this category to organize your income records."
          icon="solar:wallet-money-bold-duotone"
          title="Income category details"
        >
          <Grid container spacing={1.5}>
            {/* Income Category Name */}
            <Grid size={12}>
              <ShakingTextField error={!!(formik.touched.name && formik.errors.name) || false}>
                <TextField
                  fullWidth
                  label="Income Category Name *"
                  name="name"
                  size="small"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={
                    (formik.touched.name && formik.errors.name ? formik.errors.name : undefined) ||
                    undefined
                  }
                  inputProps={{ maxLength: 40 }}
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
        </FormSectionCard>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
          disabled={isAddLoading || isUpdateLoading}
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
          loading={isAddLoading || isUpdateLoading}
          disabled={isAddLoading || isUpdateLoading}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default IncomeCategoryForm;
