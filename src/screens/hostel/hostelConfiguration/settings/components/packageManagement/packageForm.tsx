import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getPackageInitialValues } from './getPackageInitialValues';
import { packageValidationSchema } from './packageValidationSchema';

import type { IHostelPackageFormProps } from './type';

const facilityOptions = [
  { label: 'WiFi', value: 'wifi' },
  { label: 'Laundry', value: 'laundry' },
  { label: 'Gym', value: 'gym' },
  { label: 'Mess', value: 'mess' },
  { label: 'Parking', value: 'parking' },
];

const HostelPackageForm: React.FC<IHostelPackageFormProps> = ({ dialog, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getPackageInitialValues(editData),
    validationSchema: packageValidationSchema,
    onSubmit: (values) => {
      console.log('Form Values:', values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
                  <TextField
                    label="Package Name *"
                    name="name"
                    fullWidth
                    size="small"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={
                      formik.touched.name && typeof formik.errors.name === 'string'
                        ? formik.errors.name
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={facilityOptions}
                  size="small"
                  getOptionLabel={(opt) => opt.label}
                  value={facilityOptions.find((f) => formik.values.facilityGroup === f.value)}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('facilityGroup', newValue?.value || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Facility Group *"
                      error={formik.touched.facilityGroup && Boolean(formik.errors.facilityGroup)}
                      helperText={
                        formik.touched.facilityGroup &&
                        typeof formik.errors.facilityGroup === 'string'
                          ? formik.errors.facilityGroup
                          : undefined
                      }
                    />
                  )}
                />{' '}
              </Grid>

              <Grid item xs={6}>
                <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
                  <NumericFormatCustom
                    label="Monthly Amount (₹) *"
                    name="amount"
                    fullWidth
                    size="small"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    helperText={
                      formik.touched.amount && typeof formik.errors.amount === 'string'
                        ? formik.errors.amount
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={6}>
                <ShakingTextField
                  error={!!(formik.touched.depositAmount && formik.errors.depositAmount)}
                >
                  <NumericFormatCustom
                    label="Deposit Amount (₹) *"
                    name="depositAmount"
                    fullWidth
                    size="small"
                    value={formik.values.depositAmount}
                    onChange={formik.handleChange}
                    error={formik.touched.depositAmount && Boolean(formik.errors.depositAmount)}
                    helperText={
                      formik.touched.depositAmount &&
                      typeof formik.errors.depositAmount === 'string'
                        ? formik.errors.depositAmount
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12}>
                <Editor
                  value={formik.values.otherFacilities}
                  onChange={(value) => {
                    formik.setFieldValue('otherFacilities', value);
                  }}
                  placeholder="Add Other Facilities here..."
                  sx={{ width: '100%', marginTop: '10px' }}
                />
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            {editData ? (
              <Button
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                onClick={() => {
                  formik.handleSubmit();
                }}
                variant="contained"
              >
                Update
              </Button>
            ) : (
              <>
                <Button
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  onClick={() => {
                    formik.setFieldValue('status', 'draft');
                    formik.handleSubmit();
                  }}
                  variant="outlined"
                >
                  Draft
                </Button>
                <Button
                  type="submit"
                  startIcon={<Iconify icon={GlobalIcons.submit} />}
                  variant="contained"
                  onClick={() => {
                    formik.setFieldValue('status', 'Publish');
                    formik.handleSubmit();
                  }}
                >
                  Publish
                </Button>
              </>
            )}
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default HostelPackageForm;
