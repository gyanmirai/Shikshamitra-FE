'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetVehicleOptionsQuery } from 'src/redux/transport/vehicle-management/vehicle-management-api';
import { useAssignVehicleToRouteMutation } from 'src/redux/transport/vehicle-management/route-management-api';
import {
  useGetStaffOptionsQuery,
  useGetAvailableRoutesQuery,
} from 'src/redux/transport/vehicle-management/driver-conductor-api';
import {
  Box,
  Grid,
  Card,
  Button,
  Avatar,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  DialogActions,
} from '@mui/material';

import { assignRouteValidationSchema } from './DriverManagementValidation';
import { getAssignRouteInitialValues } from './DriverManagementInitialValues';

import type { IAssignRouteFormProps } from './type';

const AssignRouteForm: React.FC<IAssignRouteFormProps> = ({ onClose, driverData }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { data: availableRoutes } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAvailableRoutesQuery,
    params: { academicMediumId: currentMedium?.id },
    options: { skip: !currentMedium?.id },
  });
  const { data: availableVehicles = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetVehicleOptionsQuery,
    params: { academicMediumId: currentMedium?.id, onlyAssignable: true },
    options: { skip: !currentMedium?.id },
  });
  const { data: availableConductors = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStaffOptionsQuery,
    params: { academicMediumId: currentMedium?.id, role: 1, onlyAssignable: true },
    options: { skip: !currentMedium?.id },
  });
  const [assignVehicleToRoute, { isLoading: isAssigning }] = useAssignVehicleToRouteMutation();

  const routesData = availableRoutes || [];

  const formik = useFormik({
    initialValues: getAssignRouteInitialValues(driverData),
    validationSchema: assignRouteValidationSchema,
    onSubmit: async (values) => {
      try {
        if (!driverData?.id) {
          shikshaMitraToast.error({ message: 'Staff ID is missing' });
          return;
        }

        await assignVehicleToRoute({
          routeId: values.selectedRoute,
          academicMediumId: currentMedium?.id,
          body: {
            vehicleId: values.selectedVehicle,
            driverStaffId: driverData.id,
            conductorStaffId: values.selectedConductor || null,
          },
        }).unwrap();

        shikshaMitraToast.success({
          message: `Route assigned to ${values.driverName} successfully`,
        });
        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to assign route',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Driver Information */}
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'visible', // For potential creative overlaps if needed, but keeping clean for now
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      border: '1px solid',
                      borderColor: 'primary.light',
                    }}
                  >
                    <Iconify icon="mdi:account" width={32} />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                      {driverData?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      ID: {driverData?.employeeId}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: driverData?.assignedRoute ? 'info.lighter' : 'warning.lighter',
                        color: driverData?.assignedRoute ? 'info.darker' : 'warning.darker',
                        typography: 'caption',
                        fontWeight: 600,
                      }}
                    >
                      {driverData?.assignedRoute
                        ? `Current Route: ${driverData?.assignedRoute}`
                        : 'No Active Route'}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Select Route */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, ml: 0.5 }}>
              Assign New Route
            </Typography>
            <ShakingTextField
              error={!!(formik.touched.selectedRoute && formik.errors.selectedRoute) || false}
            >
              <TextField
                select
                fullWidth
                label="Select Route"
                name="selectedRoute"
                value={formik.values.selectedRoute}
                onChange={formik.handleChange}
                error={formik.touched.selectedRoute && Boolean(formik.errors.selectedRoute)}
                helperText={formik.touched.selectedRoute && formik.errors.selectedRoute}
                placeholder="Choose a route..."
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              >
                {routesData.length > 0 ? (
                  routesData.map((route: any) => (
                    <MenuItem key={route.value} value={route.value}>
                      {route.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No available routes
                  </MenuItem>
                )}
              </TextField>
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, ml: 0.5 }}>
              Vehicle
            </Typography>
            <ShakingTextField
              error={!!(formik.touched.selectedVehicle && formik.errors.selectedVehicle) || false}
            >
              <TextField
                select
                fullWidth
                label="Select Vehicle"
                name="selectedVehicle"
                value={formik.values.selectedVehicle}
                onChange={formik.handleChange}
                error={formik.touched.selectedVehicle && Boolean(formik.errors.selectedVehicle)}
                helperText={formik.touched.selectedVehicle && formik.errors.selectedVehicle}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              >
                {availableVehicles.length > 0 ? (
                  availableVehicles.map((vehicle: any) => (
                    <MenuItem key={vehicle.value} value={vehicle.value}>
                      {vehicle.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No available vehicles
                  </MenuItem>
                )}
              </TextField>
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, ml: 0.5 }}>
              Conductor
            </Typography>
            <TextField
              select
              fullWidth
              label="Select Conductor"
              name="selectedConductor"
              value={formik.values.selectedConductor}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            >
              <MenuItem value="">No conductor</MenuItem>
              {availableConductors.map((conductor: any) => (
                <MenuItem key={conductor.value} value={conductor.value}>
                  {conductor.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          color="inherit"
          onClick={() => {
            onClose(null, false);
          }}
          sx={{ borderRadius: 1 }}
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
          type="submit"
          variant="contained"
          onClick={(e: any) => formik.handleSubmit(e)}
          disabled={isAssigning}
          sx={{
            borderRadius: 1,
            px: 3,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          {isAssigning ? 'Assigning...' : 'Assign Route'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignRouteForm;
