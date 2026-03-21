'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { getVisitorInitialValues } from '../initialValue';
import { visitorValidationSchema } from '../validationSchema';

import type { IPreVisitorFormProps } from '../pre-register-interface';

const PreRegisterForm: React.FC<IPreVisitorFormProps> = ({ isEdit, data, onClose }) => {
  const formik = useFormik({
    initialValues: getVisitorInitialValues(data),
    validationSchema: visitorValidationSchema,
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
                <ShakingTextField
                  error={!!(formik.touched.visitorName && formik.errors.visitorName) || false}
                >
                  <TextField
                    disabled={isDisabled}
                    size="small"
                    label="Visitor Name *"
                    name="visitorName"
                    fullWidth
                    value={formik.values.visitorName}
                    onChange={formik.handleChange}
                    error={formik.touched.visitorName && Boolean(formik.errors.visitorName)}
                    helperText={formik.touched.visitorName && formik.errors.visitorName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.contactNo && formik.errors.contactNo) || false}
                >
                  <TextField
                    disabled={isDisabled}
                    size="small"
                    label="Contact Number *"
                    name="contactNo"
                    fullWidth
                    value={formik.values.contactNo}
                    onChange={formik.handleChange}
                    error={formik.touched.contactNo && Boolean(formik.errors.contactNo)}
                    helperText={formik.touched.contactNo && formik.errors.contactNo}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.relationship && formik.errors.relationship) || false}
                >
                  <TextField
                    disabled={isDisabled}
                    size="small"
                    label="Relationship *"
                    name="relationship"
                    fullWidth
                    value={formik.values.relationship}
                    onChange={formik.handleChange}
                    error={formik.touched.relationship && Boolean(formik.errors.relationship)}
                    helperText={formik.touched.relationship && formik.errors.relationship}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DateTimePicker
                  disabled={isDisabled}
                  label="Select Start Date Time*"
                  value={
                    formik.values.visitStartDateTime
                      ? dayjs(formik.values.visitStartDateTime)
                      : null
                  }
                  onChange={(val) => {
                    // val is a Dayjs object or null
                    formik.setFieldValue('visitStartDateTime', val ? val.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error:
                        formik.touched.visitStartDateTime &&
                        Boolean(formik.errors.visitStartDateTime),
                      helperText:
                        formik.touched.visitStartDateTime && formik.errors.visitStartDateTime
                          ? String(formik.errors.visitStartDateTime)
                          : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DateTimePicker
                  disabled={isDisabled}
                  label="Select End Date Time*"
                  value={
                    formik.values.visitEndDateTime ? dayjs(formik.values.visitEndDateTime) : null
                  }
                  onChange={(value) => {
                    // value is a Dayjs object or null
                    formik.setFieldValue('visitEndDateTime', value ? value.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error:
                        formik.touched.visitEndDateTime && Boolean(formik.errors.visitEndDateTime),
                      helperText:
                        formik.touched.visitEndDateTime && formik.errors.visitEndDateTime
                          ? String(formik.errors.visitEndDateTime)
                          : '',
                    },
                  }}
                />
              </Grid>

              <Grid size={12}>
                <ShakingTextField
                  error={!!(formik.touched.reasonForVisit && formik.errors.reasonForVisit) || false}
                >
                  <div style={isDisabled ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                    <Editor
                      value={formik.values.reasonForVisit}
                      onChange={(value) => {
                        formik.setFieldValue('reasonForVisit', value);
                      }}
                      placeholder="Reason for Visit *"
                      sx={{ width: '100%', marginTop: '10px' }}
                      error={formik.touched.reasonForVisit && Boolean(formik.errors.reasonForVisit)}
                      helperText={formik.touched.reasonForVisit && formik.errors.reasonForVisit}
                    />
                  </div>
                </ShakingTextField>
              </Grid>

              <Grid size={12}>
                <UploadBox
                  onDrop={() => {}}
                  placeholder={
                    <Box
                      sx={{
                        gap: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.disabled',
                        flexDirection: 'column',
                      }}
                    >
                      <Iconify icon="eva:cloud-upload-fill" width={40} />
                      <Typography variant="body2">Upload Id Proof</Typography>
                    </Box>
                  }
                  sx={{
                    py: 2.5,
                    width: '100%',
                    height: '100%',
                    borderRadius: 1.5,
                  }}
                />
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
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default PreRegisterForm;
