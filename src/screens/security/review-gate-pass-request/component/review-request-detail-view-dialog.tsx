'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { getReviewEarlyPassRequestInitialValues } from '../initialValue';
import { reviewEarlyPassRequestValidationSchema } from '../validationSchema';

import type { IReviewRequestDetailViewDialogProps } from '../review-gate-pass-request-interface';

const ReviewRequestDetailView: React.FC<IReviewRequestDetailViewDialogProps> = ({
  status,
  data,
  onClose,
}) => {
  const formik = useFormik({
    initialValues: getReviewEarlyPassRequestInitialValues(data),
    validationSchema: reviewEarlyPassRequestValidationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.childName && formik.errors.childName)}>
                <Autocomplete
                  disabled
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

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                disabled
                label="Desired Pickup Date *"
                format="DD-MM-YYYY"
                value={formik.values.pickupDate ? dayjs(formik.values.pickupDate) : null}
                onChange={(value) => {
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

            <Grid size={{ xs: 12, md: 6 }}>
              <TimePicker
                disabled
                label="Desired Pickup Time *"
                format="hh:mm A"
                value={formik.values.pickupTime ? dayjs(formik.values.pickupTime) : null}
                onChange={(val) => {
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

            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={!!(formik.touched.reasonForPickup && formik.errors.reasonForPickup)}
              >
                <Editor
                  value={formik.values.reasonForPickup}
                  onChange={(value) => formik.setFieldValue('reasonForPickup', value)}
                  placeholder="Reason for Pickup *"
                  editable={false}
                  sx={{ width: '100%', marginTop: '10px' }}
                  error={formik.touched.reasonForPickup && Boolean(formik.errors.reasonForPickup)}
                  helperText={formik.touched.reasonForPickup && formik.errors.reasonForPickup}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
                <Editor
                  value={formik.values.description}
                  onChange={(value) => formik.setFieldValue('description', value)}
                  placeholder="Description *"
                  editable={status === 'Pending'}
                  sx={{ width: '100%', marginTop: '10px' }}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </Scrollbar>

        {status === 'Pending' && (
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose();
              }}
              variant="outlined"
            >
              Reject
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.approvedIcon} />}
              type="submit"
              variant="contained"
            >
              Approved
            </Button>
          </DialogActions>
        )}
        {status !== 'Pending' && (
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose();
              }}
              variant="outlined"
            >
              Close
            </Button>
          </DialogActions>
        )}

        {/* {isDisabled && (
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
          )} */}
      </form>
    </BackPopUpChecked>
  );
};

export default ReviewRequestDetailView;
