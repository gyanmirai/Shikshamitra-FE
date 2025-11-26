'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialGuardShiftFormValues } from './initialValue';
import { guardShiftValidationSchema } from './validationSchema';

import type { IGuardShiftFormProps } from '../guard-settings-interface';

const GuardShiftsForm: React.FC<IGuardShiftFormProps> = ({ isEdit, data, onClose }) => {
  const formik = useFormik({
    initialValues: getInitialGuardShiftFormValues(data),
    validationSchema: guardShiftValidationSchema,
    onSubmit: (values) => {},
  });

  const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={12} pb="10px">
                <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
                  <TextField
                    disabled={isEdit}
                    name="name"
                    label="Name *"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    size="small"
                    fullWidth
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={6}>
                <TimePicker
                  label="Start Time"
                  ampm={false}
                  value={formik.values.startTime ? dayjs(formik.values.startTime, 'HH:mm') : null}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  onChange={(newTime) => formik.setFieldValue('startTime', newTime)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>

              {/* End Time */}
              <Grid size={6}>
                <TimePicker
                  label="End Time"
                  ampm={false}
                  value={formik.values.endTime ? dayjs(formik.values.endTime, 'HH:mm') : null}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  onChange={(newTime) => formik.setFieldValue('endTime', newTime)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={12} pb="10px">
                <ShakingTextField
                  error={formik.touched.description && Boolean(formik.errors.description)}
                >
                  <TextField
                    multiline
                    rows={4}
                    disabled={isEdit}
                    name="description"
                    label="Description *"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    size="small"
                    fullWidth
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose();
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {!isDisabled ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default GuardShiftsForm;
