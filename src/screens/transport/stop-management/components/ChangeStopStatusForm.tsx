'use client';

import React from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import { useChangeStopStatusMutation } from 'src/redux/transport/vehicle-management/stop-management-api';

import { StopStatusType } from './type';
import { stopStatusChangeValidationSchema } from './StopManagementValidation';
import { getStopStatusChangeInitialValues } from './StopManagementInitialValuse';

import type { ChangeStopStatusProps } from './type';

const allowedStatuses = [StopStatusType.Active, StopStatusType.Inactive];

const options = allowedStatuses.map((status) => ({
  label: StopStatusType[status],
  value: status,
  description:
    status === StopStatusType.Active
      ? 'Stop is currently active and available for use.'
      : status === StopStatusType.Inactive
        ? 'Stop is inactive and not available for use.'
        : 'Stop has been reported as lost.',
}));

const ChangeStopStatusForm: React.FC<ChangeStopStatusProps> = ({
  isOpen,
  onClose,
  stopData,
  onStatusChange,
}) => {
  const [changeStopStatus, { isLoading: isChangeStopStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeStopStatusMutation,
  });
  const formik = useFormik({
    initialValues: getStopStatusChangeInitialValues(stopData),
    validationSchema: stopStatusChangeValidationSchema,
    onSubmit: (values) => {
      changeStopStatus({
        stopId: stopData?.id,
        status: values.status,
        remarks: values.reason,
      });
      shikshaMitraToast.success({
        message: `Stop status for "${stopData?.stopName}" changed to ${StopStatusType[values.status]} successfully`,
      });
      onStatusChange(values);
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Select Status */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.status && formik.errors.status)}>
              <Autocomplete
                options={options}
                value={options.find((o) => o.value === formik.values.status)}
                onChange={(_, newValue) => formik.setFieldValue('status', newValue?.value)}
                size="small"
                disableClearable
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box
                      component="li"
                      key={key}
                      {...otherProps}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
                    >
                      {option.label}
                      <Box sx={{ marginLeft: 'auto' }}>
                        <CustomTooltip title={option.description} placement="right">
                          <Iconify icon="mdi:information" width={20} />
                        </CustomTooltip>
                      </Box>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Status *"
                    fullWidth
                    size="small"
                    error={!!(formik.touched.status && formik.errors.status)}
                    helperText={formik.touched.status ? formik.errors.status : undefined}
                  />
                )}
              />
            </ShakingTextField>
          </Grid>

          {/* Reason */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks"
                name="reason"
                size="small"
                value={formik.values.reason}
                onChange={formik.handleChange}
                error={!!(formik.touched.reason && formik.errors.reason)}
                helperText={(formik.touched.reason && formik.errors.reason) as string}
              />
            </ShakingTextField>
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
          startIcon={<Iconify icon="mdi:content-save" width={16} height={16} />}
          variant="contained"
          size="small"
          loading={isChangeStopStatusLoading}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChangeStopStatusForm;
