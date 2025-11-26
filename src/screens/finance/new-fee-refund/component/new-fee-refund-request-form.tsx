'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import capitalizeWords from 'src/utils/capitalizeText';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Card, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { getInitialStudentRefundRequest } from '../initialValue';
import { studentRefundRequestValidationSchema } from '../validationSchema';

import type { INewFeeRefundRequestFormProps } from '../new-refund-request-interface';

const NewFeeRefundRequestForm: React.FC<INewFeeRefundRequestFormProps> = ({
  isEdit,
  data,
  onClose,
}) => {
  const formik = useFormik({
    initialValues: getInitialStudentRefundRequest(data),
    validationSchema: studentRefundRequestValidationSchema,
    onSubmit: (values) => {},
  });

  return (
    <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
          <Box display="flex" flexDirection="column" gap={2} height="100%">
            <Scrollbar sx={{ p: 2, height: '100%' }}>
              <Grid container spacing={3}>
                {/* Class */}
                <Grid size={{ xs: 6, lg: 4 }}>
                  <ShakingTextField error={formik.touched.class && Boolean(formik.errors.class)}>
                    <CustomSelect
                      options={[
                        { label: '10', value: '10A' },
                        { label: '12', value: '10B' },
                        { label: '11', value: '10C' },
                      ]}
                      autoFocus
                      label="Class *"
                      name="class"
                      value={formik.values.class}
                      onChange={(e) => formik.setFieldValue('class', e)}
                      fullWidth
                      error={formik.touched.class && Boolean(formik.errors.class)}
                      helperText={(formik.touched.class && formik.errors.class) || ''}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Division */}
                <Grid size={{ xs: 6, lg: 4 }}>
                  <ShakingTextField
                    error={formik.touched.division && Boolean(formik.errors.division)}
                  >
                    <CustomSelect
                      options={[
                        { label: 'A', value: 'A' },
                        { label: 'B', value: 'B' },
                        { label: 'C', value: 'C' },
                      ]}
                      label="Division *"
                      name="division"
                      value={formik.values.division}
                      onChange={(e) => formik.setFieldValue('division', e)}
                      onBlur={formik.handleBlur}
                      fullWidth
                      error={formik.touched.division && Boolean(formik.errors.division)}
                      helperText={(formik.touched.division && formik.errors.division) || ''}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Student Name */}
                <Grid size={{ xs: 6, lg: 4 }}>
                  <ShakingTextField
                    error={formik.touched.studentName && Boolean(formik.errors.studentName)}
                  >
                    <Autocomplete
                      options={[
                        { id: 1, firstName: 'John Doe' },
                        { id: 2, firstName: 'Jane Smith' },
                      ]}
                      getOptionLabel={(option) => option.firstName}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Student Name *"
                          placeholder="Search Student Name"
                          size="small"
                          fullWidth
                          error={formik.touched.studentName && Boolean(formik.errors.studentName)}
                          helperText={formik.touched.studentName && formik.errors.studentName}
                        />
                      )}
                      onChange={(e, value) =>
                        formik.setFieldValue('studentName', value ? value.firstName : '')
                      }
                    />
                  </ShakingTextField>
                </Grid>

                {/* GR No */}
                <Grid size={{ xs: 6, lg: 4 }}>
                  <ShakingTextField error={formik.touched.grNo && Boolean(formik.errors.grNo)}>
                    <Autocomplete
                      options={[
                        { id: 1, firstName: '987374' },
                        { id: 2, firstName: '838738' },
                      ]}
                      getOptionLabel={(option) => option.firstName}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="GR No *"
                          placeholder="Search GR No"
                          size="small"
                          fullWidth
                          error={formik.touched.grNo && Boolean(formik.errors.grNo)}
                          helperText={formik.touched.grNo && formik.errors.grNo}
                        />
                      )}
                      onChange={(e, value) =>
                        formik.setFieldValue('grNo', value ? value.firstName : '')
                      }
                    />
                  </ShakingTextField>
                </Grid>

                {/* Fee Type */}
                <Grid size={{ xs: 6, lg: 4 }}>
                  <ShakingTextField
                    error={formik.touched.feeType && Boolean(formik.errors.feeType)}
                  >
                    <Autocomplete
                      multiple
                      options={[
                        { label: 'Tuition Fee', value: 'tuition' },
                        { label: 'Transport Fee', value: 'transport' },
                        { label: 'Lab Fee', value: 'lab' },
                      ]}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Fee Type *"
                          placeholder="Select Fee Type"
                          size="small"
                          fullWidth
                          error={formik.touched.feeType && Boolean(formik.errors.feeType)}
                          helperText={formik.touched.feeType && formik.errors.feeType}
                        />
                      )}
                      onChange={(e, value) =>
                        formik.setFieldValue(
                          'feeType',
                          value.map((v) => v.value)
                        )
                      }
                    />
                  </ShakingTextField>
                </Grid>

                {/* Paid Terms */}
                <Grid size={{ xs: 6, lg: 4 }}>
                  <ShakingTextField
                    error={formik.touched.paidTerms && Boolean(formik.errors.paidTerms)}
                  >
                    <Autocomplete
                      multiple
                      options={[
                        { label: 'Quarter 1', value: 'q1' },
                        { label: 'Quarter 2', value: 'q2' },
                        { label: 'Quarter 3', value: 'q3' },
                      ]}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Paid Terms *"
                          placeholder="Select Paid Terms"
                          size="small"
                          fullWidth
                          error={formik.touched.paidTerms && Boolean(formik.errors.paidTerms)}
                          helperText={formik.touched.paidTerms && formik.errors.paidTerms}
                        />
                      )}
                      onChange={(e, value) =>
                        formik.setFieldValue(
                          'paidTerms',
                          value.map((v) => v.value)
                        )
                      }
                    />
                  </ShakingTextField>
                </Grid>

                {/* Refund Amount Fields */}
                <Grid size={{ xs: 6, lg: 4 }}>
                  <NumericFormatCustom
                    size="small"
                    label="Amount Applicable For Refund *"
                    name="amountApplicableForRefund"
                    value={formik.values.amountApplicableForRefund}
                    onChange={formik.handleChange}
                    fullWidth
                    error={
                      formik.touched.amountApplicableForRefund &&
                      Boolean(formik.errors.amountApplicableForRefund)
                    }
                    helperText={
                      formik.touched.amountApplicableForRefund &&
                      formik.errors.amountApplicableForRefund
                    }
                    disabled
                  />
                </Grid>

                <Grid size={{ xs: 6, lg: 4 }}>
                  <ShakingTextField
                    error={formik.touched.askForRefund && Boolean(formik.errors.askForRefund)}
                  >
                    <NumericFormatCustom
                      size="small"
                      label="Refund Amount *"
                      name="askForRefund"
                      value={formik.values.askForRefund}
                      onChange={formik.handleChange}
                      fullWidth
                      error={formik.touched.askForRefund && Boolean(formik.errors.askForRefund)}
                      helperText={formik.touched.askForRefund && formik.errors.askForRefund}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Additional Notes */}
                <Grid size={{ xs: 12 }}>
                  <ShakingTextField error={formik.touched.reason && Boolean(formik.errors.reason)}>
                    <TextField
                      label="Reason *"
                      name="reason"
                      multiline
                      rows={3}
                      value={formik.values.reason}
                      onChange={(e) => {
                        formik.setFieldValue('reason', capitalizeWords(e.target.value));
                      }}
                      onBlur={formik.handleBlur}
                      fullWidth
                      error={formik.touched.reason && Boolean(formik.errors.reason)}
                      helperText={formik.touched.reason && formik.errors.reason}
                    />
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
    </Card>
  );
};

export default NewFeeRefundRequestForm;
