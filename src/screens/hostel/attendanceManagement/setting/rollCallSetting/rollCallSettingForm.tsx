import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { TimePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IRollCallFormProps } from './type';

const RollCallSettingForm: React.FC<IRollCallFormProps> = ({ dialog, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      rollCallName: editData?.rollCallName || '',
      startTime: dayjs(editData?.startTime) || null,
      endTime: dayjs(editData?.endTime) || null,
      description: editData?.description || '',
    },
    validationSchema: Yup.object().shape({
      rollCallName: Yup.string().required('Roll Call Name is required'),
      startTime: Yup.string().required('Start Time is required'),
      endTime: Yup.string().required('End Time is required'),
      description: Yup.string().required('Description is required'),
    }),
    onSubmit: (values) => {
      console.log('Submitted:', values);
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={!!(formik.touched.rollCallName && formik.errors.rollCallName)}
                >
                  <TextField
                    size="small"
                    label="Roll Call Name *"
                    name="rollCallName"
                    fullWidth
                    value={formik.values.rollCallName}
                    onChange={formik.handleChange}
                    error={formik.touched.rollCallName && Boolean(formik.errors.rollCallName)}
                    helperText={formik.touched.rollCallName && formik.errors.rollCallName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TimePicker
                  label="Start Time *"
                  value={formik.values.startTime}
                  onChange={(newValue) => formik.setFieldValue('startTime', newValue)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.startTime && Boolean(formik.errors.startTime),
                      helperText: formik.touched.startTime && String(formik.errors.startTime),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TimePicker
                  label="End Time *"
                  value={formik.values.endTime}
                  onChange={(newValue) => formik.setFieldValue('endTime', newValue)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.endTime && Boolean(formik.errors.endTime),
                      helperText: formik.touched.endTime && String(formik.errors.endTime),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  size="small"
                  label="Description *"
                  name="description"
                  fullWidth
                  multiline
                  minRows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onClose(null, false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {editData ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default RollCallSettingForm;
