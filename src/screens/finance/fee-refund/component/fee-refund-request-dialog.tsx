import * as Yup from 'yup';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import React, { useMemo, useEffect } from 'react'; // Import isEqual
import type { RootState } from 'src/redux/store';

import { useDispatch, useSelector } from 'react-redux';

import { Box, Grid, Button, TextField, Autocomplete } from '@mui/material';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';

interface FeeRefundRequestDialogProps {
  onClose: () => void;
}

const FeeRefundRequestDialog: React.FC<FeeRefundRequestDialogProps> = ({ onClose }) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const initialValues = useMemo(
    () => ({
      class: '',
      division: '',
      studentName: '',
      grNo: '',
      feeType: [],
      paidTerms: [],
      amountApplicableForRefund: '',
      askForRefund: '',
      reason: '',
    }),
    []
  );

  const validationSchema = Yup.object({
    class: Yup.string().required('Class is required'),
    division: Yup.string().required('Division is required'),
    studentName: Yup.string().required('Student Name is required'),
    grNo: Yup.string().required('GR No is required'),
    feeType: Yup.array().min(1, 'Select at least one Fee Type'),
    paidTerms: Yup.array().min(1, 'Select at least one Paid Term'),
    amountApplicableForRefund: Yup.string().required('Refund Amount is required'),
    askForRefund: Yup.string().required('Refund Amount is required'),
    reason: Yup.string().required('Reason is required'),
  });

  // Formik setup
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log('Form Submitted:', values);
    },
  });

  // Detect if form values have changed

  const dispatch = useDispatch();
  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);
  // Close dialog handler
  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} height="100%">
      <CustomBreadcrumbs
        heading="Fee Refund"
        links={[{ name: 'Finance' }, { name: 'Fee Refund' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleCloseDialog}
          >
            Back
          </Button>
        }
      />

      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} p={2}>
            {/* Class */}
            <Grid item xs={6}>
              <CustomSelect
                options={[
                  { label: '10', value: '10A' },
                  { label: '12', value: '10B' },
                  { label: '11', value: '10C' },
                ]}
                label="Class"
                name="class"
                value={formik.values.class}
                onChange={(e) => formik.setFieldValue('class', e)}
                onBlur={formik.handleBlur}
                fullWidth
                error={formik.touched.class && Boolean(formik.errors.class)}
                // helperText={formik.touched.class && formik.errors.class}
              />
            </Grid>

            {/* Division */}
            <Grid item xs={6}>
              <CustomSelect
                options={[
                  { label: 'A', value: 'A' },
                  { label: 'B', value: 'B' },
                  { label: 'C', value: 'C' },
                ]}
                label="Division"
                name="division"
                value={formik.values.division}
                onChange={(e) => formik.setFieldValue('division', e)}
                onBlur={formik.handleBlur}
                fullWidth
                error={formik.touched.division && Boolean(formik.errors.division)}
                // helperText={formik.touched.division && formik.errors.division}
              />
            </Grid>

            {/* Student Name */}
            <Grid item xs={6}>
              <Autocomplete
                options={[
                  { id: 1, firstName: 'John Doe' },
                  { id: 2, firstName: 'Jane Smith' },
                ]}
                getOptionLabel={(option) => option.firstName}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Student Name"
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
            </Grid>

            {/* GR No */}
            <Grid item xs={6}>
              <Autocomplete
                options={[
                  { id: 1, firstName: '987374' },
                  { id: 2, firstName: '838738' },
                ]}
                getOptionLabel={(option) => option.firstName}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="GR No"
                    placeholder="Search GR No"
                    size="small"
                    fullWidth
                    error={formik.touched.grNo && Boolean(formik.errors.grNo)}
                    helperText={formik.touched.grNo && formik.errors.grNo}
                  />
                )}
                onChange={(e, value) => formik.setFieldValue('grNo', value ? value.firstName : '')}
              />
            </Grid>

            {/* Fee Type */}
            <Grid item xs={6}>
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
                    label="Fee Type"
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
            </Grid>

            {/* Paid Terms */}
            <Grid item xs={6}>
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
                    label="Paid Terms"
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
            </Grid>

            {/* Refund Amount Fields */}
            <Grid item xs={6}>
              <NumericFormatCustom
                size="small"
                label="Amount Applicable For Refund"
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
              />
            </Grid>

            <Grid item xs={6}>
              <NumericFormatCustom
                size="small"
                label="Ask For Refund"
                name="askForRefund"
                value={formik.values.askForRefund}
                onChange={formik.handleChange}
                fullWidth
                error={formik.touched.askForRefund && Boolean(formik.errors.askForRefund)}
                helperText={formik.touched.askForRefund && formik.errors.askForRefund}
              />
            </Grid>

            {/* Additional Notes */}
            <Grid item xs={12}>
              <TextField
                label="Reason"
                name="reason"
                multiline
                rows={3}
                value={formik.values.reason}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                error={formik.touched.reason && Boolean(formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
              />
            </Grid>
          </Grid>

          {/* <Button

              // onClick={formik.handleSubmit }
              variant="contained"
              disabled={!isChanges || !formik.isValid}
            >
              Raise Refund Request

            </Button> */}
        </form>
      </Box>
    </Box>
  );
};

export default FeeRefundRequestDialog;
