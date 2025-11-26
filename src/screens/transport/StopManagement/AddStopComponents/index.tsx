import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Grid, Button, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

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
  const formik = useFormik({
    initialValues: getStopManagementInitialValues(stopName, editData),
    validationSchema: stopManagementValidationSchema,
    onSubmit: (values) => {
      if (handleSubmit) {
        handleSubmit(values);
      }
      if (editData) {
        shikshaMitraToast.success({
          message: `Stop "${values.stopName}" updated successfully.`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Stop "${values.stopName}" added successfully.`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
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
          <Button
            variant="contained"
            onClick={(e: any) => formik.handleSubmit(e)}
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
          </Button>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};

export default AddStopIndex;
