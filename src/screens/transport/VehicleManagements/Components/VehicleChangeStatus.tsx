'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import { useChangeVehicleStatusMutation } from 'src/redux/transport/vehicle-management/vehicle-management-api';

export enum VehicleStatus {
  Active,
  Inactive,
  Maintenance,
}

const getInitialVehicleStatusData = (vehicleData: any) => ({
  status: vehicleData?.status || VehicleStatus.Active,
  reason: '',
});

interface ChangeVehicleStatusProps {
  isOpen: boolean;
  onClose: (e: any, isSaved?: boolean) => void;
  vehicleData: any;
  vehicleId?: string;
}

const allowedStatuses = [VehicleStatus.Active, VehicleStatus.Inactive, VehicleStatus.Maintenance];

const options = allowedStatuses.map((status) => ({
  label: VehicleStatus[status],
  value: status,
  description:
    status === VehicleStatus.Active
      ? 'Vehicle is currently operational and available for routes.'
      : status === VehicleStatus.Inactive
        ? 'Vehicle is inactive and not assigned to any route.'
        : 'Vehicle is under maintenance and temporarily unavailable.',
}));

const ChangeVehicleStatusForm: React.FC<ChangeVehicleStatusProps> = ({
  isOpen,
  onClose,
  vehicleData,
  vehicleId,
}) => {
  const [changeVehicleStatus, { isLoading }] = useChangeVehicleStatusMutation();

  const formik = useFormik({
    initialValues: getInitialVehicleStatusData(vehicleData),
    onSubmit: async (values) => {
      try {
        const vehicleIdToUse = vehicleId || vehicleData?.id;
        if (!vehicleIdToUse) {
          shikshaMitraToast.error({ message: 'Vehicle ID is required' });
          return;
        }

        await changeVehicleStatus({
          vehicleId: vehicleIdToUse,
          body: {
            status: VehicleStatus[values.status],
            remarks: values.reason || undefined,
          },
        }).unwrap();

        shikshaMitraToast.success({
          message: `Vehicle status changed to ${VehicleStatus[values.status]} successfully`,
        });
        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to change vehicle status',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Select Vehicle Status */}
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
                    label="Vehicle Status *"
                    fullWidth
                    size="small"
                    error={!!(formik.touched.status && formik.errors.status)}
                    helperText={
                      formik.touched.status ? (formik.errors.status as string) : undefined
                    }
                  />
                )}
              />
            </ShakingTextField>
          </Grid>

          {/* Remarks */}
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
        <Button
          startIcon={<Iconify icon="mdi:content-save" width={16} height={16} />}
          type="submit"
          variant="contained"
          size="small"
          disabled={isLoading}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChangeVehicleStatusForm;
