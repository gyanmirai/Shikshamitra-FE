'use client';

import React from 'react';
import { useFormik } from 'formik';

import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getVisitorInitialValues } from './initialValues';
import { visitorValidationSchema } from './validationSchema';

import type { IVisitorFormProps } from './type';

const VisitorForm: React.FC<IVisitorFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getVisitorInitialValues(editData),
    validationSchema: visitorValidationSchema,
    onSubmit: (values, formikHelpers) => {
      console.log(values);
    },
  });

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
                  error={!!(formik.touched.aadharNumber && formik.errors.aadharNumber) || false}
                >
                  <TextField
                    size="small"
                    label="Aadhar Number *"
                    name="aadharNumber"
                    fullWidth
                    value={formik.values.aadharNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.aadharNumber && Boolean(formik.errors.aadharNumber)}
                    helperText={formik.touched.aadharNumber && formik.errors.aadharNumber}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.contactNo && formik.errors.contactNo) || false}
                >
                  <TextField
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

              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.visingWhome && formik.errors.visingWhome) || false}
                >
                  <Autocomplete
                    size="small"
                    options={[]}
                    getOptionLabel={(option) => option}
                    value={formik.values.visingWhome}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('visingWhome', newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Visiting Whom *"
                        name="visingWhome"
                        fullWidth
                        error={formik.touched.visingWhome && Boolean(formik.errors.visingWhome)}
                        helperText={formik.touched.visingWhome && formik.errors.visingWhome}
                      />
                    )}
                  />{' '}
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Entry Time *"
                  format="HH:mm"
                  value={formik.values.entryTime}
                  onChange={(val) => {
                    formik.setFieldValue('entryTime', val);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.entryTime && Boolean(formik.errors.entryTime),
                      helperText:
                        formik.touched.entryTime && formik.errors.entryTime
                          ? String(formik.errors.entryTime)
                          : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Exit Time *"
                  format="HH:mm"
                  value={formik.values.exitTime}
                  onChange={(val) => {
                    formik.setFieldValue('exitTime', val);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.exitTime && Boolean(formik.errors.exitTime),
                      helperText:
                        formik.touched.exitTime && formik.errors.exitTime
                          ? String(formik.errors.exitTime)
                          : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.reasonForVisit && formik.errors.reasonForVisit) || false}
                >
                  <Editor
                    value={formik.values.reasonForVisit}
                    onChange={(value) => {
                      formik.setFieldValue('reasonForVisit', value);
                    }}
                    placeholder="Question *"
                    sx={{ width: '100%', marginTop: '10px' }}
                    error={formik.touched.reasonForVisit && Boolean(formik.errors.reasonForVisit)}
                    helperText={formik.touched.reasonForVisit && formik.errors.reasonForVisit}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {editData ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default VisitorForm;
