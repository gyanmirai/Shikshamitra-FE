import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { Grid, Button, DialogActions } from '@mui/material';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import StopInformation from './StopManagementForm';
import { stopManagementValidationSchema } from '../Components/StopManagementValidation';
import { getStopManagementInitialValues } from '../Components/StopManagementInitialValuse';

import type { IStopData } from '../Components/type';

interface AddStopIndexProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData?: IStopData | null;
  stopName?: string;
  handleSubmit?: (values: any) => void;
}

const AddStopIndex: React.FC<AddStopIndexProps> = ({
  open,
  onClose,
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
  console.log('formik.erroes---', formik.errors);
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Left Column - Stop Information Form */}
          <Grid size={{ xs: 12 }}>
            <StopInformation editData={editData} formik={formik} />
          </Grid>
        </Grid>
      </DialogScrollContent>
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
    </BackPopUpChecked>
  );
};

export default AddStopIndex;
