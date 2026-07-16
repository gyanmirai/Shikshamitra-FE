import React from 'react';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Grid, TextField, Typography, Autocomplete } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { collectFeeValidationSchema } from './validationSchema';

import type { ICollectFeesFormProps } from '../type';
// Define TypeScript interfaces for data structure

const CollectFeesForm: React.FC<ICollectFeesFormProps> = ({ open, onClose, student }) => {
  // Formik hook for managing form state and validation
  const formik = useFormik<any>({
    initialValues: {
      feeType: '',
      selectedTerms: [],
      paymentMode: [],
      dueAmount: '', // added
      receivedAmount: '',
    },
    validationSchema: collectFeeValidationSchema,
    onSubmit: (values) => {},
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box flex={8} display="flex" flexDirection="row" gap={1} py="12px">
              <Label color="primary" sx={{ fontSize: '12px' }}>
                Name : ABC
              </Label>
              <Label color="info" sx={{ fontSize: '12px' }}>
                Hostel : xyz
              </Label>
              <Label color="warning" sx={{ fontSize: '12px' }}>
                Room : xyz
              </Label>
            </Box>
          </Box>
          <Box flex={1}>
            <ShakingTextField
              error={!!(formik.touched.selectedTerms && formik.errors.selectedTerms) || false}
            >
              <Autocomplete
                options={['Term 1', 'Term 2', 'Term 3']}
                multiple
                getOptionLabel={(option) => option}
                onChange={(_, value) => {
                  formik.setFieldValue('selectedTerms', value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Term *"
                    name="selectedTerms"
                    variant="outlined"
                    fullWidth
                    size="small"
                    error={formik.touched.selectedTerms && Boolean(formik.errors.selectedTerms)}
                    helperText={
                      formik.touched.selectedTerms &&
                      typeof formik.errors.selectedTerms === 'string'
                        ? formik.errors.selectedTerms
                        : ''
                    }
                  />
                )}
                sx={{ maxWidth: '280px', width: '100%' }}
              />
            </ShakingTextField>
          </Box>
          {/* Fee Type And Payment Mode Selection */}
          <Typography sx={{ my: 3 }} variant="h6">
            Hostel Fees
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ShakingTextField error={!!(formik.touched.dueAmount && formik.errors.dueAmount)}>
                <NumericFormatCustom
                  label="Due Amount *"
                  value={formik.values.dueAmount}
                  onChange={(e) => formik.setFieldValue('dueAmount', e.target.value)}
                  size="small"
                  fullWidth
                  error={formik.touched.dueAmount && Boolean(formik.errors.dueAmount)}
                  helperText={
                    formik.touched.dueAmount && typeof formik.errors.dueAmount === 'string'
                      ? formik.errors.dueAmount
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <ShakingTextField
                error={!!(formik.touched.receivedAmount && formik.errors.receivedAmount)}
              >
                <NumericFormatCustom
                  label="Received Amount *"
                  value={formik.values.receivedAmount}
                  onChange={(e) => formik.setFieldValue('receivedAmount', e.target.value)}
                  size="small"
                  fullWidth
                  error={formik.touched.receivedAmount && Boolean(formik.errors.receivedAmount)}
                  helperText={
                    formik.touched.receivedAmount &&
                    typeof formik.errors.receivedAmount === 'string'
                      ? formik.errors.receivedAmount
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <ShakingTextField error={!!(formik.touched.paymentMode && formik.errors.paymentMode)}>
                <Autocomplete
                  multiple
                  options={['Cash', 'Online']}
                  getOptionLabel={(option) => option}
                  value={formik.values.paymentMode}
                  onChange={(_, newValue) => formik.setFieldValue('paymentMode', newValue)}
                  onBlur={() => formik.setFieldTouched('paymentMode', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Payment Mode *"
                      error={formik.touched.paymentMode && Boolean(formik.errors.paymentMode)}
                      helperText={
                        Array.isArray(formik.errors.paymentMode)
                          ? formik.errors.paymentMode.join(', ')
                          : formik.touched.paymentMode &&
                              typeof formik.errors.paymentMode === 'string'
                            ? formik.errors.paymentMode
                            : undefined
                      }
                      size="small"
                    />
                  )}
                  sx={{ width: '100%' }}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </Scrollbar>
      </form>
    </BackPopUpChecked>
  );
};

export default CollectFeesForm;
