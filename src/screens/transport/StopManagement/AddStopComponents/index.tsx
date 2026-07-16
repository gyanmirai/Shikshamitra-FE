import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Grid, Button, DialogActions } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useCreateStopMutation,
  useUpdateStopMutation,
} from 'src/redux/transport/vehicle-management/stop-management-api';

import StopInformation from './StopManagementForm';
import { stopManagementValidationSchema } from '../Components/StopManagementValidation';
import { getStopManagementInitialValues } from '../Components/StopManagementInitialValuse';
import RouteTopHeader from '../../ApplicationManagement/Components/TransportApplicationDetails/RouteTopHeader';

import type { IStopData } from '../Components/type';
import type { IRouteData } from '../../RouteManagement/Components/type';

interface AddStopIndexProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  routeDetails?: IRouteData | null;
  editData?: IStopData | null;
  stopName?: string;
  handleSubmit?: (values: any) => void;
}

const AddStopIndex: React.FC<AddStopIndexProps> = ({
  open,
  onClose,
  routeDetails,
  editData,
  stopName,
  handleSubmit,
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [createStop, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateStopMutation,
  });
  const [updateStop, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStopMutation,
  });
  const formik = useFormik({
    initialValues: getStopManagementInitialValues(stopName, editData),
    validationSchema: stopManagementValidationSchema,
    onSubmit: async (values, formikHelpers) => {
      try {
        if (editData) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            stopId: (editData as IStopData).id,
            body: {
              stopName: values.stopName,
              zoneId: values.zone || values.zoneId,
              amount: values.amount,
              approxKmFromSchool: values.approxKmFromSchool,
              pinCode: values.pincode,
              addressLine1: values.addressLine1,
              addressLine2: values.addressLine2,
              description: values.description,
              landmark: values.landmark,
            },
          };
          await updateStop(payload).unwrap();
          shikshaMitraToast.success({
            message: `Stop : "${values.stopName}" updated successfully`,
          });
          onClose(null, true);
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            body: {
              stopName: values.stopName,
              zoneId: values.zone || values.zoneId,
              amount: values.amount,
              approxKmFromSchool: values.approxKmFromSchool,
              pinCode: values.pincode,
              addressLine1: values.addressLine1,
              addressLine2: values.addressLine2,
              description: values.description,
              landmark: values.landmark,
            },
          };
          await createStop(payload).unwrap();
          shikshaMitraToast.success({
            message: `Stop : "${values.stopName}" added successfully`,
          });
          onClose(null, true);
        }
      } catch (error) {
        // Error handling is managed by the API hook or global error handler if configured
        console.error('Failed to save stop', error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={1} height="100%">
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container>
            {/* Left Column - Stop Information Form */}
            {routeDetails && (
              <Grid size={{ xs: 12 }} sx={{ mb: 0 }}>
                <RouteTopHeader routeDetails={routeDetails} />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <StopInformation editData={editData} formik={formik} />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onClose(null, false)}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            onClick={(e: any) => formik.handleSubmit(e)}
            loading={isAddLoading || isUpdateLoading}
            size="small"
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={editData ? 16 : 20}
                height={editData ? 16 : 20}
              />
            }
          >
            {editData ? 'Update' : 'Submit'}
          </LoadingButton>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};

export default AddStopIndex;
