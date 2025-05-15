'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';

import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { visitorWalkInValidationSchema } from './validationSchema';
import { getInitialWalkInVisitorApprovalValues } from './initialValue';

import type { IWalkInVisitorFormProps } from '../visitor-check-in-out-interface';

const WalkInVisitorForm: React.FC<IWalkInVisitorFormProps> = ({ isEdit, data, onClose }) => {
  const formik = useFormik({
    initialValues: getInitialWalkInVisitorApprovalValues(data),
    validationSchema: visitorWalkInValidationSchema,
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
              <Grid item xs={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.visitorName && Boolean(formik.errors.visitorName)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    disabled={isDisabled}
                    label="Visitor Name *"
                    value={formik.values.visitorName}
                    onChange={(e) => formik.setFieldValue('visitorName', Number(e.target.value))}
                    error={formik.touched.visitorName && Boolean(formik.errors.visitorName)}
                    helperText={formik.touched.visitorName && formik.errors.visitorName}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.visitorEmail && Boolean(formik.errors.visitorEmail)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    disabled={isDisabled}
                    label="Visitor Email *"
                    value={formik.values.visitorEmail}
                    onChange={(e) => formik.setFieldValue('visitorEmail', Number(e.target.value))}
                    error={formik.touched.visitorEmail && Boolean(formik.errors.visitorEmail)}
                    helperText={formik.touched.visitorEmail && formik.errors.visitorEmail}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.visitorPhone && Boolean(formik.errors.visitorPhone)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    disabled={isDisabled}
                    label="Visitor Phone *"
                    value={formik.values.visitorPhone}
                    onChange={(e) => formik.setFieldValue('visitorPhone', Number(e.target.value))}
                    error={formik.touched.visitorPhone && Boolean(formik.errors.visitorPhone)}
                    helperText={formik.touched.visitorPhone && formik.errors.visitorPhone}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={6} pb="10px">
                <ShakingTextField
                  error={formik.touched.visitingDate && Boolean(formik.errors.visitingDate)}
                >
                  <DatePicker
                    disabled={isDisabled}
                    label="Visiting Date *"
                    format="DD-MM-YYYY"
                    value={formik.values.visitingDate ? dayjs(formik.values.visitingDate) : null}
                    onChange={(value) => formik.setFieldValue('visitingDate', value)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.visitingDate && Boolean(formik.errors.visitingDate),
                        helperText:
                          formik.touched.visitingDate && formik.errors.visitingDate
                            ? String(formik.errors.visitingDate)
                            : '',
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TimePicker
                  disabled={isDisabled}
                  label="Time *"
                  format="hh:mm A"
                  value={formik.values.visitingTime ? dayjs(formik.values.visitingTime) : null}
                  onChange={(val) => {
                    // val is a Dayjs object or null
                    formik.setFieldValue('visitingTime', val ? val.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.visitingTime && Boolean(formik.errors.visitingTime),
                      helperText:
                        formik.touched.visitingTime && formik.errors.visitingTime
                          ? String(formik.errors.visitingTime)
                          : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <ShakingTextField
                  error={
                    !!(formik.touched.visitingPurpose && formik.errors.visitingPurpose) || false
                  }
                >
                  <div style={isDisabled ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                    <Editor
                      value={formik.values.visitingPurpose}
                      onChange={(value) => {
                        formik.setFieldValue('visitingPurpose', value);
                      }}
                      editable={isDisabled}
                      placeholder="Descriptive visitingPurpose *"
                      sx={{ width: '100%', marginTop: '10px' }}
                      error={
                        formik.touched.visitingPurpose && Boolean(formik.errors.visitingPurpose)
                      }
                      helperText={formik.touched.visitingPurpose && formik.errors.visitingPurpose}
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
                Reject
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                type="submit"
                variant="contained"
              >
                Approved
              </Button>
            </DialogActions>
          )}
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default WalkInVisitorForm;
