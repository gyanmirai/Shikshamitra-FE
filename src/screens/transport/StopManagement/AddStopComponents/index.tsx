import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Grid, Button, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import StopLocationMap from './StopLocationMap';
import StopInformation from './StopManagementForm';
import { stopManagementValidationSchema } from '../Components/StopManagementValidation';
import { getStopManagementInitialValues } from '../Components/StopManagementInitialValuse';

import type { IStopData } from '../Components/type';

interface AddStopIndexProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData?: IStopData | null;
}

const AddStopIndex: React.FC<AddStopIndexProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getStopManagementInitialValues(editData),
    validationSchema: stopManagementValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `Stop ${values.stopName} updated successfully!`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Stop ${values.stopName} added successfully!`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={2}>
              {/* Left Column - Stop Information Form */}
              <Grid size={{ xs: 12, md: 4 }}>
                <StopInformation editData={editData} formik={formik} />
              </Grid>
              {/* Right Column - Map */}
              <Grid size={{ xs: 12, md: 8 }} display="flex" flexDirection="column" gap={2}>
                <StopLocationMap formik={formik} />
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
              size="small"
              type="submit"
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
      </form>
    </BackPopUpChecked>
  );
};

export default AddStopIndex;
