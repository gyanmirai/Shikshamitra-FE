'use client';

import { sanitizeFinanceName } from 'src/utils/finance-name';
import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import React, { useRef, useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { financePermissions } from 'src/constants/finance-menu';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeCategoriesQuery } from 'src/redux/feeCategory/feeCategoryApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';
import FinancePrerequisiteState from 'src/screens/finance/components/FinancePrerequisiteState';
import { Grid, Switch, Button, TextField, DialogActions, FormControlLabel } from '@mui/material';
import DownstreamUsageWarning from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import { setupOptionsMissing } from 'src/screens/finance/settings/components/financeSetupPrerequisites';
import { useRefreshFinancePrerequisites } from 'src/screens/finance/hooks/useRefreshFinancePrerequisites';
import {
  useGetFeeHeadsQuery,
  useAddFeeHeadMutation,
  useUpdateFeeHeadMutation,
} from 'src/redux/feeHeadManage/feeHeadManageApi';

import { getFeeHeadInitialValues } from './FeeHeadInitialValues';
import { feeHeadValidationSchema } from './FeeHeadValidationSchema';
import { useFinancePermissions } from '../../../hooks/useFinancePermissions';

import type { IFeeHeadFormProps } from './type';

const FeeHeadForm: React.FC<IFeeHeadFormProps> = ({ open, onClose, editData }) => {
  const access = useFinancePermissions(financePermissions.fees.settings.feeHead);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [showDownstreamWarning, setShowDownstreamWarning] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);

  // Custom hook to fetch fee category data
  const feeCategoryQuery = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoriesQuery,
    params: { academicYearId: currentYear?.id },
  });

  const incomeCategoryQuery = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinanceRoutingOptionsQuery,
    params: {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 100,
      operation: 'fee-head',
    },
    options: {
      skip: !currentYear?.id || !open?.value,
    },
  });

  const {
    data: feeCategoryData,
    isLoading: isFeeCategoryLoading,
    isFetching: isFeeCategoryFetching,
  } = feeCategoryQuery;
  const {
    data: incomeCategoryData,
    isLoading: isIncomeCategoryLoading,
    isFetching: isIncomeCategoryFetching,
  } = incomeCategoryQuery;
  const prerequisites = [
    ...(setupOptionsMissing(
      feeCategoryQuery,
      !!currentYear?.id && !!open?.value,
      editData?.feeCategoryId
    )
      ? [{ key: 'fee-category' as const }]
      : []),
    ...(setupOptionsMissing(
      incomeCategoryQuery,
      !!currentYear?.id && !!open?.value,
      editData?.incomeCategoryId
    )
      ? [{ key: 'income-category' as const }]
      : []),
  ];
  const refreshPrerequisites = () => {
    if (!feeCategoryQuery.isUninitialized) feeCategoryQuery.refetch?.();
    if (!incomeCategoryQuery.isUninitialized) incomeCategoryQuery.refetch?.();
  };
  useRefreshFinancePrerequisites(refreshPrerequisites, !!open?.value);

  const incomeCategoryOptions = useMemo(
    () =>
      (incomeCategoryData?.items ?? [])
        .filter(
          (category: any) =>
            String(category.name ?? '')
              .trim()
              .toLowerCase() !== 'none'
        )
        .map((category: any) => ({
          id: category.id,
          displayName: category.name,
        })),
    [incomeCategoryData]
  );

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

  const { data: feeHeadsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeHeadsQuery,
    params: { academicYearId: currentYear?.id },
    options: {
      skip: !currentYear?.id || !open?.value,
    },
  });

  const existingNames = useMemo(
    () => new Set<string>((feeHeadsData?.items ?? []).map((t: any) => t.name.trim().toLowerCase())),
    [feeHeadsData]
  );
  const existingNamesRef = useRef<Set<string>>(new Set());
  existingNamesRef.current = existingNames;

  const formik = useFormik({
    initialValues: getFeeHeadInitialValues(editData),
    enableReinitialize: true,
    validationSchema: feeHeadValidationSchema(existingNames, editData),
    onSubmit: async (values) => {
      if (!access.canAdd || prerequisites.length) return;
      // Check if updating an item that is used downstream
      if ((editData as any)?.isUsedInDownstream && editData?.id) {
        setPendingFormValues(values);
        setShowDownstreamWarning(true);
        return;
      }

      // Proceed with submission if not used downstream
      await performSubmission(values);
    },
  });

  // Perform the actual form submission
  const performSubmission = async (values: any) => {
    if (!access.canAdd || prerequisites.length) return;
    try {
      // Transform form data to API format
      const payload = {
        feeCategoryId: values.feeCategoryId,
        name: values.name,
        isConcessionApplied: values.isConcessionApplied,
        description: values.description || '',
        incomeCategoryId: values.incomeCategoryId,
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
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {prerequisites.length ? (
          <FinancePrerequisiteState requirements={prerequisites} onRefresh={refreshPrerequisites} />
        ) : (
          <Grid container spacing={3}>
            {/* Fee Category */}
            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={!!(formik.touched.feeCategoryId && formik.errors.feeCategoryId) || false}
              >
                <CustomSelect
                  name="feeCategoryId"
                  label="Fee Category *"
                  options={feeCategoryData?.items || []}
                  value={formik.values.feeCategoryId || ''}
                  labelKey="name"
                  valueKey="id"
                  isLoading={isFeeCategoryLoading || isFeeCategoryFetching}
                  onChange={(value) => {
                    formik.setFieldValue('feeCategoryId', value);
                    formik.setFieldTouched('feeCategoryId', false);
                  }}
                  error={!!(formik.touched.feeCategoryId && formik.errors.feeCategoryId) || false}
                  helperText={formik.touched.feeCategoryId ? formik.errors.feeCategoryId : ''}
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                />
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
                    const value = sanitizeFinanceName(e.target.value)
                      .split(' ')
                      .map((word) =>
                        word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                      )
                      .join(' ');
                    formik.setFieldValue('name', value);
                  }}
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

            {/* Concession Applicable Switch */}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isConcessionApplied}
                    onChange={(e) => formik.setFieldValue('isConcessionApplied', e.target.checked)}
                    size="small"
                  />
                }
                label="Enable concessions"
              />
            </Grid>

            {/* Accounting mapping */}
            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={
                  !!(formik.touched.incomeCategoryId && formik.errors.incomeCategoryId) || false
                }
              >
                <CustomSelect
                  name="incomeCategoryId"
                  label="Income Category *"
                  options={incomeCategoryOptions}
                  value={formik.values.incomeCategoryId || ''}
                  labelKey="displayName"
                  valueKey="id"
                  isLoading={isIncomeCategoryLoading || isIncomeCategoryFetching}
                  disabled={Boolean(editData?.isUsedInDownstream)}
                  onChange={(value) => {
                    formik.setFieldValue('incomeCategoryId', value);
                    formik.setFieldTouched('incomeCategoryId', false);
                  }}
                  error={formik.touched.incomeCategoryId && Boolean(formik.errors.incomeCategoryId)}
                  helperText={
                    (formik.touched.incomeCategoryId && formik.errors.incomeCategoryId
                      ? (formik.errors.incomeCategoryId as string)
                      : editData?.isUsedInDownstream
                        ? 'Locked because this Fee Head is already used in a locked Fee Structure.'
                        : 'Collections are recorded under the selected Income Category.') ||
                    undefined
                  }
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
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
        )}
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
          disabled={!access.canAdd || prerequisites.length > 0}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>

      {/* Downstream Usage Warning Dialog */}
      <DownstreamUsageWarning
        open={showDownstreamWarning}
        itemName={editData?.name || ''}
        itemType="Fee Head"
        isLoading={isUpdateFeeHeadLoading || isAddFeeHeadLoading}
        onConfirm={async () => {
          if (pendingFormValues) {
            await performSubmission(pendingFormValues);
            setShowDownstreamWarning(false);
            setPendingFormValues(null);
          }
        }}
        onCancel={() => {
          setShowDownstreamWarning(false);
          setPendingFormValues(null);
        }}
      />
    </BackPopUpChecked>
  );
};

export default FeeHeadForm;
