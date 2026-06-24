'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouteStatus } from 'src/enums/route-status';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import { useChangeRouteStatusMutation } from 'src/redux/transport/vehicle-management/route-management-api';

import { getInitialStopStatusData } from '../RouteFormComponent/getInitialRouteData';

import type { ChangeStopStatusProps } from './type';

const allowedStatuses = [RouteStatus.Active, RouteStatus.Inactive];

const options = allowedStatuses.map((status) => ({
  label: RouteStatus[status],
  value: status,
  description:
    status === RouteStatus.Active
      ? 'Stop is currently active and available for use.'
      : status === RouteStatus.Inactive
        ? 'Stop is inactive and not available for use.'
        : 'Stop has been reported as lost.',
}));

const ChangeStopStatusForm: React.FC<ChangeStopStatusProps> = ({
  isOpen,
  onClose,
  routeData,
  onStatusChange,
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [changeRouteStatus, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeRouteStatusMutation,
  });
  const formik = useFormik({
    initialValues: getInitialStopStatusData(routeData),
    onSubmit: async (values) => {
      await changeRouteStatus({
        routeId: routeData?.id,
        academicMediumId: currentMedium?.id,
        body: {
          status: values.status,
          remarks: values.reason,
        },
      }).unwrap();
      shikshaMitraToast.success({
        message: `Route status for "${routeData?.routeName}" changed to ${RouteStatus[values.status]} successfully`,
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
          type="submit"
          variant="contained"
          size="small"
          loading={isLoading}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChangeStopStatusForm;
