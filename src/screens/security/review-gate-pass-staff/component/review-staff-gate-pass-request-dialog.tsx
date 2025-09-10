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
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getReviewStaffGatePassRequestInitialValues } from '../initialValue';
import { reviewStaffGatePassRequestValidationSchema } from '../validationSchema';

import type { IReviewStaffGatePassRequestDetailViewDialogProps } from '../review-gate-pass-staff-interfcae';

const ReviewStaffGatePassRequestDialog: React.FC<
  IReviewStaffGatePassRequestDetailViewDialogProps
> = ({ status, data, onClose }) => {
  const formik = useFormik({
    initialValues: getReviewStaffGatePassRequestInitialValues(data),
    validationSchema: reviewStaffGatePassRequestValidationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }} pb="10px">
              <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
                <TextField
                  disabled
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

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                disabled
                label="Desired Date *"
                format="DD-MM-YYYY"
                value={formik.values.leaveDate ? dayjs(formik.values.leaveDate) : null}
                onChange={(value) => {
                  formik.setFieldValue('leaveDate', value ? value.toISOString() : null);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.leaveDate && Boolean(formik.errors.leaveDate),
                    helperText:
                      formik.touched.leaveDate && formik.errors.leaveDate
                        ? String(formik.errors.leaveDate)
                        : '',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TimePicker
                disabled
                label="Desired Time *"
                format="hh:mm A"
                value={formik.values.leaveTime ? dayjs(formik.values.leaveTime) : null}
                onChange={(val) => {
                  formik.setFieldValue('leaveTime', val ? val.toISOString() : null);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.leaveTime && Boolean(formik.errors.leaveTime),
                    helperText:
                      formik.touched.leaveTime && formik.errors.leaveTime
                        ? String(formik.errors.leaveTime)
                        : undefined,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={!!(formik.touched.reasonForLeave && formik.errors.reasonForLeave)}
              >
                <Editor
                  value={formik.values.reasonForLeave}
                  onChange={(value) => {
                    formik.setFieldValue('reasonForLeave', value);
                  }}
                  placeholder="Reason for Leave *"
                  editable={false}
                  sx={{ width: '100%', marginTop: '10px' }}
                  error={formik.touched.reasonForLeave && Boolean(formik.errors.reasonForLeave)}
                  helperText={formik.touched.reasonForLeave && formik.errors.reasonForLeave}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
                <Editor
                  value={formik.values.description}
                  onChange={(value) => {
                    formik.setFieldValue('description', value);
                  }}
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

export default ReviewStaffGatePassRequestDialog;
