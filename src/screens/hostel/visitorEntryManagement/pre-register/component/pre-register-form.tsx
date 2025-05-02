'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getVisitorInitialValues } from '../initialValue';
import { visitorValidationSchema } from '../validationSchema';

import type { IPreVisitorFormProps } from '../pre-register-interface';

const PreRegisterForm: React.FC<IPreVisitorFormProps> = ({ isEdit, data, onClose }) => {
  const formik = useFormik({
    initialValues: getVisitorInitialValues(data),
    validationSchema: visitorValidationSchema,
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

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.idProof && formik.errors.idProof) || false}
                >
                  <CustomSelect
                    disabled={isDisabled}
                    label="ID Proof *"
                    options={[
                      { value: 'Aadhar Card', label: 'Aadhar Card' },
                      { value: 'PAN Card', label: 'PAN Card' },
                      { value: 'Driving License', label: 'Driving License' },
                      { value: 'Passport', label: 'Passport' },
                    ]}
                    value={formik.values.idProof}
                    onChange={(val) => {
                      formik.setFieldValue('idProof', val);
                    }}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.idProof && Boolean(formik.errors.idProof)}
                    helperText={(formik.touched.idProof && formik.errors.idProof) || undefined}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.proofNumber && formik.errors.proofNumber) || false}
                >
                  <TextField
                    disabled={isDisabled}
                    size="small"
                    label="Proof Number *"
                    name="proofNumber"
                    fullWidth
                    value={formik.values.proofNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.proofNumber && Boolean(formik.errors.proofNumber)}
                    helperText={formik.touched.proofNumber && formik.errors.proofNumber}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.contactNo && formik.errors.contactNo) || false}
                >
                  <TextField
                    disabled={isDisabled}
                    size="small"
                    label="Contact Numbe *"
                    name="contactNo"
                    fullWidth
                    value={formik.values.contactNo}
                    onChange={formik.handleChange}
                    error={formik.touched.contactNo && Boolean(formik.errors.contactNo)}
                    helperText={formik.touched.contactNo && formik.errors.contactNo}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={12}>
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

              <Grid item xs={12} md={6}>
                <TimePicker
                  disabled={isDisabled}
                  label="Visit Time *"
                  format="hh:mm A"
                  value={formik.values.visitTime ? dayjs(formik.values.visitTime) : null}
                  onChange={(val) => {
                    // val is a Dayjs object or null
                    formik.setFieldValue('visitTime', val ? val.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.visitTime && Boolean(formik.errors.visitTime),
                      helperText:
                        formik.touched.visitTime && formik.errors.visitTime
                          ? String(formik.errors.visitTime)
                          : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  disabled={isDisabled}
                  label="Select Date *"
                  format="DD-MM-YYYY"
                  value={formik.values.visitDate ? dayjs(formik.values.visitDate) : null}
                  onChange={(value) => {
                    // value is a Dayjs object or null
                    formik.setFieldValue('visitDate', value ? value.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.visitDate && Boolean(formik.errors.visitDate),
                      helperText:
                        formik.touched.visitDate && formik.errors.visitDate
                          ? String(formik.errors.visitDate)
                          : '',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
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
