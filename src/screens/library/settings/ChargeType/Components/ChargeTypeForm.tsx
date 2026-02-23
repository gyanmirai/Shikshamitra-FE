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
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, Switch, TextField, DialogActions, FormControlLabel } from '@mui/material';
import {
  useAddChargeCategoryMutation,
  useUpdateChargeCategoryMutation,
} from 'src/redux/library/settingApi';

import { getChargeTypeInitialValues } from './ChargeInitialValues';
import { chargeTypeValidationSchema } from './ChargeTypeValidationSchema';

import type { IChargeTypeFormProps } from './type';

const ChargeTypeForm: React.FC<IChargeTypeFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [addChargeCategory, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddChargeCategoryMutation,
  });

  const [updateChargeCategory, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateChargeCategoryMutation,
  });

  const formik = useFormik({
    initialValues: getChargeTypeInitialValues(editData),
    validationSchema: chargeTypeValidationSchema,
    onSubmit: async (values) => {
      // Construct payload matching API specification
      const numericAmount = values.amount
        ? Number(String(values.amount).replace(/[^0-9.-]+/g, ''))
        : 0;

      const payload = {
        chargeType: values.chargeType,
        amount: values.isFixed ? numericAmount : 0,
        isFixed: values.isFixed,
        description: values.description,
      };

      try {
        if (editData) {
          // Update existing charge category
          await updateChargeCategory({
            categoryId: editData.id,
            data: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `${values.chargeType} Charge Category updated successfully`,
          });
        } else {
          // Create new charge category - POST /library/settings/charge-categories
          await addChargeCategory({
            ...payload,
            academicYearId: currentYear?.id,
          }).unwrap();
          shikshaMitraToast.success({
            message: `${values.chargeType} Charge Category added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Failed to save charge category:', error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Charge Type */}
          <Grid size={12}>
            <ShakingTextField
              error={!!(formik.touched.chargeType && formik.errors.chargeType) || false}
            >
              <TextField
                fullWidth
                label="Category Name *"
                name="chargeType"
                size="small"
                value={formik.values.chargeType}
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
                  formik.setFieldValue('chargeType', value);
                }}
                error={formik.touched.chargeType && Boolean(formik.errors.chargeType)}
                helperText={(formik.touched.chargeType && formik.errors.chargeType) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isFixed}
                    onChange={() => formik.setFieldValue('isFixed', !formik.values.isFixed)}
                  />
                }
                label="Fixed Amount"
              />
            </ShakingTextField>
          </Grid>

          {/* Amount */}
          {formik.values.isFixed && (
            <Grid size={12}>
              <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
                <NumericFormatCustom
                  fullWidth
                  label="Amount *"
                  size="small"
                  name="amount"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={(formik.touched.amount && formik.errors.amount) as string}
                />
              </ShakingTextField>
            </Grid>
          )}

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
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChargeTypeForm;
