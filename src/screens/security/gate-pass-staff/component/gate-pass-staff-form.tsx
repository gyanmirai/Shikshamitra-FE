'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getStaffPassRequestInitialValues } from '../initialValue';
import { staffPassRequestValidationSchema } from '../validationSchema';

import type { IGatePassStaffRequestFormProps } from '../gate-pass-staff-interface';

const EarlyGatePassFormStaff: React.FC<IGatePassStaffRequestFormProps> = ({
  isEdit,
  data,
  onClose,
}) => {
  const formik = useFormik({
    initialValues: getStaffPassRequestInitialValues(data),
    validationSchema: staffPassRequestValidationSchema,
    onSubmit: (values) => {},
  });

  const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  disabled={isDisabled}
                  label="Desired Date *"
                  format="DD-MM-YYYY"
                  value={formik.values.leaveDate ? dayjs(formik.values.leaveDate) : null}
                  onChange={(value) => {
                    // value is a Dayjs object or null
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
                  disabled={isDisabled}
                  label="Desired Time *"
                  format="hh:mm A"
                  value={formik.values.leaveTime ? dayjs(formik.values.leaveTime) : null}
                  onChange={(val) => {
                    // val is a Dayjs object or null
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

              <Grid size={12}>
                <ShakingTextField
                  error={!!(formik.touched.reasonForLeave && formik.errors.reasonForLeave) || false}
                >
                  <div style={isDisabled ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                    <Editor
                      value={formik.values.reasonForLeave}
                      onChange={(value) => {
                        formik.setFieldValue('reasonForLeave', value);
                      }}
                      placeholder="Reason *"
                      sx={{ width: '100%', marginTop: '10px' }}
                      error={formik.touched.reasonForLeave && Boolean(formik.errors.reasonForLeave)}
                      helperText={formik.touched.reasonForLeave && formik.errors.reasonForLeave}
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

export default EarlyGatePassFormStaff;
