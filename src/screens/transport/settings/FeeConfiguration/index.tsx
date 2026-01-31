'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useSelector, useDispatch } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Card, Button, DialogActions } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useGetFeeConfigurationQuery,
  useAddFeeConfigurationMutation,
  useUpdateFeeConfigurationMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import StopBasedModel from './Components/StopBasedModel';
import FeeModelSelection from './Components/FeeModelSelection';
import DistanceBasedModel from './Components/DistanceBasedModel';
import { getInitialValuesByModel } from './Components/getInitialValuesByModel';
import { getValidationSchemaByModel } from './Components/FeeConfigurationValidationSchema';

const FeeConfiguration = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const { data: feeConfiguration } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeConfigurationQuery,
  });

  const { addFeeConfiguration, isLoading: isAdding } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddFeeConfigurationMutation,
  });

  const { updateFeeConfiguration, isLoading: isUpdating } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeConfigurationMutation,
  });
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      // Reset logic here
    }
  };
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [selectedModel, setSelectedModel] = useState('distance-based');
  const [editData] = useState(null); // for edit mode, set an object

  const initialValues = React.useMemo(
    () => getInitialValuesByModel(selectedModel, editData, feeConfiguration),
    [selectedModel, editData, feeConfiguration]
  );

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchemaByModel(selectedModel, currentYear),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = {
          feeModelType: values.model,
          ratePerKm: values.ratePerKm || null,
          feeFrequency: values.feeFrequency,
          isActive: true,
        };

        if (feeConfiguration) {
          await updateFeeConfiguration(payload);
          shikshaMitraToast.success({
            message: 'Fee Configuration updated successfully',
          });
        } else {
          await addFeeConfiguration(payload);
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
