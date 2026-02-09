'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
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
  const [isLoading, setIsLoading] = useState(false);

  // POST mutation for creating
  const { addFeeHead } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddFeeHeadMutation,
  });

  // PUT mutation for updating
  const { updateFeeHead } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeHeadMutation,
  });

  const formik = useFormik({
    initialValues: getFeeHeadInitialValues(editData),
    validationSchema: feeHeadValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        // Transform form data to API format
        const payload = {
          academicYearId: currentYear?.id,
          feeCategoryId: values.feeCategoryId,
          name: values.feeHeadName,
          description: values.description || '',
        };

        if (editData?.id) {
          // Update existing fee head
          await updateFeeHead({
            feeHeadId: editData.id,
            body: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `${values.feeHeadName} Fee Head updated successfully`,
          });
        } else {
          // Create new fee head
          await addFeeHead(payload).unwrap();

          shikshaMitraToast.success({
            message: `${values.feeHeadName} Fee Head added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Save operation failed:', error);
        shikshaMitraToast.error({
          message: `Failed to ${editData ? 'update' : 'create'} fee head`,
        });
      } finally {
        setIsLoading(false);
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
              <CustomSelect
                name="feeCategoryId"
                label="Fee Category *"
                options={[
                  { id: 'Tuition Fee', name: 'Tuition Fee' },
                  { id: 'Admission Fee', name: 'Admission Fee' },
                  { id: 'Examination Fee', name: 'Examination Fee' },
                  { id: 'Library Fee', name: 'Library Fee' },
                  { id: 'Laboratory Fee', name: 'Laboratory Fee' },
                  { id: 'Sports Fee', name: 'Sports Fee' },
                  { id: 'Transportation Fee', name: 'Transportation Fee' },
                  { id: 'Development Fee', name: 'Development Fee' },
                ]}
                value={formik.values.feeCategoryId || ''}
                labelKey="name"
                valueKey="id"
                onChange={(value) => {
                  formik.setFieldValue('feeCategoryId', value);
                  formik.setFieldTouched('feeCategoryId', false);
                }}
                error={!!(formik.touched.feeCategoryId && formik.errors.feeCategoryId) || false}
                helperText={(formik.touched.feeCategoryId && formik.errors.feeCategoryId) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </ShakingTextField>
          </Grid>

          {/* Fee Head Name */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.feeHeadName && formik.errors.feeHeadName) || false}
            >
              <TextField
                fullWidth
                label="Fee Head Name *"
                name="feeHeadName"
                size="small"
                value={formik.values.feeHeadName}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('feeHeadName', value);
                }}
                error={formik.touched.feeHeadName && Boolean(formik.errors.feeHeadName)}
                helperText={formik.touched.feeHeadName && formik.errors.feeHeadName}
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
          loading={isLoading}
          disabled={isLoading}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default FeeHeadForm;
