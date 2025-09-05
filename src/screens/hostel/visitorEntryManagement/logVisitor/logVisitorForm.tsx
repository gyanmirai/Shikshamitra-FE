'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

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
              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={12}>
                <ShakingTextField
                  error={!!(formik.touched.personToVisit && formik.errors.personToVisit) || false}
                >
                  <Autocomplete
                    size="small"
                    options={[]}
                    getOptionLabel={(option) => option}
                    value={formik.values.personToVisit}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('personToVisit', newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Person To Visit *"
                        name="personToVisit"
                        fullWidth
                        error={formik.touched.personToVisit && Boolean(formik.errors.personToVisit)}
                        helperText={formik.touched.personToVisit && formik.errors.personToVisit}
                      />
                    )}
                  />{' '}
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DateTimePicker
                  label="Entry Date Time *"
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

              <Grid size={{ xs: 12, md: 6 }}>
                <DateTimePicker
                  label="Exit Date Time *"
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

              <Grid size={12}>
                <ShakingTextField
                  error={!!(formik.touched.reasonForVisit && formik.errors.reasonForVisit) || false}
                >
                  <Editor
                    value={formik.values.reasonForVisit}
                    onChange={(value) => {
                      formik.setFieldValue('reasonForVisit', value);
                    }}
                    placeholder="Reason For Visit *"
                    sx={{ width: '100%', marginTop: '10px' }}
                    error={formik.touched.reasonForVisit && Boolean(formik.errors.reasonForVisit)}
                    helperText={formik.touched.reasonForVisit && formik.errors.reasonForVisit}
                  />
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
