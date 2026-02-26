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
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useGetFeeCategoriesQuery } from 'src/redux/feeCategory/feeCategoryApi';
import { Grid, Button, Skeleton, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddFeeHeadMutation,
  useUpdateFeeHeadMutation,
} from 'src/redux/feeHeadManage/feeHeadManageApi';

import { getFeeHeadInitialValues } from './FeeHeadInitialValues';
import { feeHeadValidationSchema } from './FeeHeadValidationSchema';

import type { IFeeHeadFormProps } from './type';

const FeeHeadForm: React.FC<IFeeHeadFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Custom hook to fetch fee category data
  const {
    data: feeCategoryData,
    isLoading: isFeeCategoryLoading,
    isFetching: isFeeCategoryFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoriesQuery,
    params: { academicYearId: currentYear?.id },
  });
  // POST mutation for creating
  const [addFeeHead, { isLoading: isAddFeeHeadLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddFeeHeadMutation,
  });

  // PUT mutation for updating
  const [updateFeeHead, { isLoading: isUpdateFeeHeadLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeHeadMutation,
  });

  const formik = useFormik({
    initialValues: getFeeHeadInitialValues(editData),
    validationSchema: feeHeadValidationSchema,
    onSubmit: async (values) => {
      try {
        // Transform form data to API format
        const payload = {
          feeCategoryId: values.feeCategoryId,
          name: values.name,
          description: values.description || '',
        };

        if (editData?.id) {
          // Update existing fee head
          await updateFeeHead({
            id: editData.id,
            body: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `${values.name} Fee Head updated successfully`,
          });
        } else {
          // Create new fee head
          await addFeeHead({
            academicYearId: currentYear?.id,
            body: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `${values.name} Fee Head added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Save operation failed:', error);
        shikshaMitraToast.error({
          message: `Failed to ${editData ? 'update' : 'create'} fee head`,
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Fee Category */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.feeCategoryId && formik.errors.feeCategoryId) || false}
            >
              {isFeeCategoryLoading || isFeeCategoryFetching ? (
                <Skeleton variant="rounded" height={40} />
              ) : (
                <PaginatedSearchSelect
                  key={feeCategoryData?.items?.length ? 'category-loaded' : 'category-empty'}
                  label="Fee Category *"
                  noOptionsText="No Fee Category Found"
                  fetchOptions={async (query: string, page: number) => {
                    const filtered = (feeCategoryData?.items || []).filter((c: any) =>
                      c?.name?.toLowerCase().includes(query.toLowerCase())
                    );
                    const pageSize = 10;
                    const start = (page - 1) * pageSize;
                    const end = start + pageSize;
                    return {
                      data: filtered.slice(start, end).map((item: any) => ({
                        label: item.name,
                        id: item.id,
                      })),
                      hasMore: end < filtered.length,
                    };
                  }}
                  value={
                    feeCategoryData?.items?.find((c: any) => c.id === formik.values.feeCategoryId)
                      ? {
                          label: feeCategoryData.items.find(
                            (c: any) => c.id === formik.values.feeCategoryId
                          )?.name,
                          id: formik.values.feeCategoryId,
                        }
                      : null
                  }
                  isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
                  renderOption={(prop, option: any) => (
                    <li {...prop} key={option.id}>
                      {option.label}
                    </li>
                  )}
                  getOptionLabel={(option: any) => option?.label || ''}
                  minChars={0}
                  onChange={(_, val: any) => {
                    formik.setFieldValue('feeCategoryId', val?.id || '');
                    formik.setFieldTouched('feeCategoryId', false);
                  }}
                  size="small"
                  sx={{ width: '100%' }}
                  error={!!(formik.touched.feeCategoryId && formik.errors.feeCategoryId)}
                  helperText={
                    (formik.touched.feeCategoryId && formik.errors.feeCategoryId) as string
                  }
                />
              )}
            </ShakingTextField>
          </Grid>

          {/* Fee Head Name */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.name && formik.errors.name) || false}>
              <TextField
                fullWidth
                label="Fee Head Name *"
                name="name"
                size="small"
                value={formik.values.name}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('name', value);
                }}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </ShakingTextField>
          </Grid>

          {/* Description */}
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
          loading={isUpdateFeeHeadLoading || isAddFeeHeadLoading}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default FeeHeadForm;
