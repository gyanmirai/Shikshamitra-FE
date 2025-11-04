'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetAvailableRoutesQuery } from 'src/redux/transport/vehicle-management/driver-conductor-api';
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
  const { data: availableRoutes } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAvailableRoutesQuery,
  });

  const routesData = availableRoutes || [];
  console.log('routesData---', routesData);
  const formik = useFormik({
    initialValues: getAssignRouteInitialValues(driverData),
    validationSchema: assignRouteValidationSchema,
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Route "${values.selectedRoute}" assigned to ${values.driverName} successfully`,
      });
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Driver Information */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                    <Iconify icon="mdi:account" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {driverData?.name} ({driverData?.employeeId})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Current Route: {driverData?.assignedRoute || 'None'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Select Route */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.selectedRoute && formik.errors.selectedRoute) || false}
            >
              <TextField
                select
                fullWidth
                label="Route *"
                name="selectedRoute"
                size="small"
                value={formik.values.selectedRoute}
                onChange={formik.handleChange}
                error={formik.touched.selectedRoute && Boolean(formik.errors.selectedRoute)}
                helperText={formik.touched.selectedRoute && formik.errors.selectedRoute}
              >
                {routesData.map((route: any) => (
                  <MenuItem key={route.value} value={route.value}>
                    {route.label}
                  </MenuItem>
                ))}
              </TextField>
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          size="small"
          onClick={() => {
            onClose(null, false);
          }}
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignRouteForm;
