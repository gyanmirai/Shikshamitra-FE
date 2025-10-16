'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialStopStatusData } from '../RouteFormComponent/getInitialRouteData';

import type { ChangeStopStatusProps } from './type';

const StopStatusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

const ChangeStopStatusForm: React.FC<ChangeStopStatusProps> = ({
  isOpen,
  onClose,
  stopData,
  onStatusChange,
}) => {
  const formik = useFormik({
    initialValues: getInitialStopStatusData(stopData),
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Stop status changed to ${values.status} successfully`,
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
              <CustomSelect
                label="Select Status *"
                name="status"
                options={StopStatusOptions}
                value={formik.values.status}
                onChange={(value) => formik.setFieldValue('status', value)}
                error={!!(formik.touched.status && formik.errors.status)}
                helperText={formik.touched.status ? formik.errors.status : undefined}
                formControlProps={{ fullWidth: true }}
                size="small"
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
        <Button
          startIcon={<Iconify icon="mdi:content-save" width={16} height={16} />}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Save
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChangeStopStatusForm;
