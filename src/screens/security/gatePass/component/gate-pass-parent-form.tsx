'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';

import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getEarlyPassRequestInitialValues } from '../initialValue';
import { earlyPassRequestValidationSchema } from '../validationSchema';

import type { IGetEarlyPassRequestFormProps } from '../gate-pass-parent-interface';

const EarlyGateRequestForm: React.FC<IGetEarlyPassRequestFormProps> = ({
  isEdit,
  data,
  onClose,
}) => {
  const formik = useFormik({
    initialValues: getEarlyPassRequestInitialValues(data),
    validationSchema: earlyPassRequestValidationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.childName && formik.errors.childName) || false}
                >
                  <Autocomplete
                    disabled={isDisabled}
                    loading={false}
                    noOptionsText="No Child Found"
                    fullWidth
                    options={[]}
                    getOptionLabel={(option: any) => option?.firstName || ''}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Child Name *"
                        placeholder="Child Name"
                        fullWidth
                        error={formik.touched.childName && Boolean(formik.errors.childName)}
                        helperText={
                          formik.touched.childName && formik.errors.childName
                            ? String(formik.errors.childName)
                            : ''
                        }
                      />
                    )}
                    renderOption={(prop: any, option: any) => (
                      <li {...prop} key={option.id}>
                        {option.firstName}
                      </li>
                    )}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  disabled={isDisabled}
                  label="Desired Pickup Date *"
                  format="DD-MM-YYYY"
                  value={formik.values.pickupDate ? dayjs(formik.values.pickupDate) : null}
                  onChange={(value) => {
                    // value is a Dayjs object or null
                    formik.setFieldValue('pickupDate', value ? value.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.pickupDate && Boolean(formik.errors.pickupDate),
                      helperText:
                        formik.touched.pickupDate && formik.errors.pickupDate
                          ? String(formik.errors.pickupDate)
                          : '',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TimePicker
                  disabled={isDisabled}
                  label="Desired Pickup Time *"
                  format="hh:mm A"
                  value={formik.values.pickupTime ? dayjs(formik.values.pickupTime) : null}
                  onChange={(val) => {
                    // val is a Dayjs object or null
                    formik.setFieldValue('pickupTime', val ? val.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.pickupTime && Boolean(formik.errors.pickupTime),
                      helperText:
                        formik.touched.pickupTime && formik.errors.pickupTime
                          ? String(formik.errors.pickupTime)
                          : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <ShakingTextField
                  error={
                    !!(formik.touched.reasonForPickup && formik.errors.reasonForPickup) || false
                  }
                >
                  <div style={isDisabled ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                    <Editor
                      value={formik.values.reasonForPickup}
                      onChange={(value) => {
                        formik.setFieldValue('reasonForPickup', value);
                      }}
                      placeholder="Reason for Pickup *"
                      sx={{ width: '100%', marginTop: '10px' }}
                      error={
                        formik.touched.reasonForPickup && Boolean(formik.errors.reasonForPickup)
                      }
                      helperText={formik.touched.reasonForPickup && formik.errors.reasonForPickup}
                    />
                  </div>
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          {!isDisabled && (
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
                {isEdit ? 'Update' : 'Submit'}
              </Button>
            </DialogActions>
          )}

          {isDisabled && (
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
            </DialogActions>
          )}
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default EarlyGateRequestForm;
