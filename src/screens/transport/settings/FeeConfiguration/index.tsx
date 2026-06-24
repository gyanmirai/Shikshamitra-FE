'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useSelector, useDispatch } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetChargeCategoriesQuery } from 'src/redux/finance/chargeCategory';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Card, Grid, Button, Typography, DialogActions } from '@mui/material';
import {
  useGetFeeConfigurationQuery,
  useAddFeeConfigurationMutation,
  useUpdateFeeConfigurationMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import FeeRunPanel from './Components/FeeRunPanel';
import StopBasedModel from './Components/StopBasedModel';
import FeeModelSelection from './Components/FeeModelSelection';
import DistanceBasedModel from './Components/DistanceBasedModel';
import { getInitialValuesByModel } from './Components/getInitialValuesByModel';
import { getValidationSchemaByModel } from './Components/FeeConfigurationValidationSchema';

const FeeConfiguration = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);
  const academicMediumId = currentMedium?.id;
  const dispatch = useDispatch();

  const { data: feeConfiguration } = useGetFeeConfigurationQuery(
    { academicMediumId },
    { skip: !academicMediumId }
  );
  const { data: chargeCategoryData, isLoading: isLoadingChargeCategories } =
    useGetChargeCategoriesQuery(
      { academicYearId: currentYear?.id, page: 1, pageSize: 100 },
      { skip: !currentYear?.id }
    );

  const [addFeeConfiguration, { isLoading: isAdding }] = useAddFeeConfigurationMutation();
  const [updateFeeConfiguration, { isLoading: isUpdating }] = useUpdateFeeConfigurationMutation();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      // Reset logic here
    }
  };

  const [selectedModel, setSelectedModel] = useState('distance-based');
  const [editData] = useState(null); // for edit mode, set an object

  React.useEffect(() => {
    if (feeConfiguration?.model) {
      setSelectedModel(feeConfiguration.model);
    }
  }, [feeConfiguration?.model]);

  const initialValues = React.useMemo(
    () => getInitialValuesByModel(selectedModel, editData, feeConfiguration),
    [selectedModel, editData, feeConfiguration]
  );

  const chargeCategoryOptions = React.useMemo(() => {
    const rows =
      (chargeCategoryData as any)?.items ?? (chargeCategoryData as any)?.data?.items ?? [];
    return rows.map((row: any) => ({ label: row.name, value: row.id }));
  }, [chargeCategoryData]);

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchemaByModel(selectedModel, currentYear),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (!academicMediumId) {
          shikshaMitraToast.error({
            message: 'Academic medium is required to save fee configuration',
          });
          return;
        }

        const payload = {
          feeModelType: values.model,
          ratePerKm: values.model === 'distance-based' ? Number(values.ratePerKm) : null,
          feeFrequency: Number(values.feeFrequency),
          chargeCategoryId: values.chargeCategoryId,
          effectiveFrom:
            values.effectiveFrom?.toISOString?.() ??
            values.effectiveFrom?.toDate?.()?.toISOString?.() ??
            values.effectiveFrom,
          isActive: true,
        };

        if (feeConfiguration?.id) {
          await updateFeeConfiguration({
            configurationId: feeConfiguration.id,
            academicMediumId,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: 'Fee Configuration updated successfully',
          });
        } else {
          await addFeeConfiguration({
            academicMediumId,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: 'Fee Configuration created successfully',
          });
        }
        dispatch(setIsChanges(false));
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to save fee configuration',
        });
      }
    },
  });

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {showBreadCumb && (
        <CustomBreadcrumbs
          heading="Fee Configuration"
          description="This screen is used to configure the transport fee structure for the school. It allows users to choose one of four transport fee models — Flat-Rate, Distance-Based, Stop-Based, or Zone-Based — and set up the corresponding fee configuration as per the selected model."
          links={[
            { name: 'Transport', href: '/transport/dashboard' },
            { name: 'Setting', href: '/transport/settings/vehicleType' },
            { name: 'Fee Configuration' },
          ]}
          action={
            <Button
              onClick={(e: any) => formik.handleSubmit(e)}
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:content-save" />}
              disabled={isAdding || isUpdating}
              sx={{ px: '32px' }}
            >
              {isAdding || isUpdating ? 'Saving...' : 'Save '}
            </Button>
          }
        />
      )}
      <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
            <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
              <Scrollbar sx={{ p: 2, height: '100%' }}>
                <Card sx={{ boxShadow: 'var(--shadows-4)', mb: 2 }}>
                  <Box p={2}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Finance Posting
                    </Typography>
                    <Grid container spacing={3} mt={1}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <CustomSelect
                          label="Charge Category *"
                          options={chargeCategoryOptions}
                          value={formik.values.chargeCategoryId || ''}
                          onChange={(val) => formik.setFieldValue('chargeCategoryId', val)}
                          error={
                            !!(formik.touched.chargeCategoryId && formik.errors.chargeCategoryId)
                          }
                          helperText={
                            (formik.touched.chargeCategoryId &&
                              formik.errors.chargeCategoryId) as string
                          }
                          isLoading={isLoadingChargeCategories}
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Card>

                <Card sx={{ boxShadow: 'var(--shadows-4)', mb: 2 }}>
                  <FeeModelSelection formik={formik} setSelectedModel={setSelectedModel} />
                </Card>

                {formik.values.model === 'distance-based' && (
                  <Card sx={{ boxShadow: 'var(--shadows-4)', mb: 2 }}>
                    <DistanceBasedModel formik={formik} />
                  </Card>
                )}

                {formik.values.model === 'stop-based' && (
                  <Card sx={{ boxShadow: 'var(--shadows-4)' }}>
                    <StopBasedModel formik={formik} />
                  </Card>
                )}

                <FeeRunPanel academicMediumId={academicMediumId} academicYearId={currentYear?.id} />
              </Scrollbar>
            </form>
          </BackPopUpChecked>

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)', mb: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => handleClose(e, false)}
              startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
              disabled={isAdding || isUpdating}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={(e: any) => formik.handleSubmit(e)}
              startIcon={<Iconify icon="mdi:content-save" />}
              disabled={isAdding || isUpdating}
            >
              {isAdding || isUpdating ? 'Saving...' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </Card>
    </Box>
  );
};

export default FeeConfiguration;
