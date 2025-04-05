import * as Yup from 'yup';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import React, { useMemo, useEffect } from 'react'; // Import isEqual
import type { RootState } from 'src/redux/store';

import { useDispatch, useSelector } from 'react-redux';

import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';

const validationSchema = Yup.object({
  class: Yup.string().required('Class is required'),
  division: Yup.string().required('Division is required'),
  studentName: Yup.string().required('Student Name is required'),
  grNo: Yup.string().required('GR No is required'),
  feeType: Yup.array().min(1, 'Select at least one Fee Type'),
  paidTerms: Yup.array().min(1, 'Select at least one Paid Term'),
  amountApplicableForRefund: Yup.string().required('Refund Amount is required'),
  askForRefund: Yup.number()
    .typeError('Must be a valid number')
    .required('This field is required')
    .moreThan(0, 'Must be greater than 0'),
  reason: Yup.string().required('Reason is required'),
});

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

  // Formik setup
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {},
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

      <form
        onSubmit={formik.handleSubmit}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Card
          sx={{
            height: '100%',
            boxShadow: 'var(--shadows-4)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box gap={2} flexGrow={1}>
            <Grid container spacing={3} p={2} my={1}>
              {/* Class */}
              <Grid item lg={4} xs={6}>
                <ShakingTextField error={formik.touched.class && Boolean(formik.errors.class)}>
                  <CustomSelect
                    options={[
                      { label: '10', value: '10A' },
                      { label: '12', value: '10B' },

                      { label: '11', value: '10C' },
                    ]}
                    autoFocus
                    label="Class"
                    name="class"
                    value={formik.values.class}
                    onChange={(e) => formik.setFieldValue('class', e)}
                    onBlur={formik.handleBlur}
                    fullWidth
                    error={formik.touched.class && Boolean(formik.errors.class)}
                    helperText={(formik.touched.class && formik.errors.class) || ''}
                  />
                </ShakingTextField>
              </Grid>

              {/* Division */}
              <Grid item lg={4} xs={6}>
                <ShakingTextField
                  error={formik.touched.division && Boolean(formik.errors.division)}
                >
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
                    helperText={(formik.touched.division && formik.errors.division) || ''}
                  />
                </ShakingTextField>
              </Grid>

              {/* Student Name */}
              <Grid item lg={4} xs={6}>
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
                </ShakingTextField>
              </Grid>

              {/* GR No */}
              <Grid item lg={4} xs={6}>
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
                        label="GR No"
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
              <Grid item lg={4} xs={6}>
                <ShakingTextField error={formik.touched.feeType && Boolean(formik.errors.feeType)}>
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
                </ShakingTextField>
              </Grid>

              {/* Paid Terms */}
              <Grid item lg={4} xs={6}>
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
                </ShakingTextField>
              </Grid>

              {/* Refund Amount Fields */}
              <Grid item lg={4} xs={6}>
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
                  disabled
                />
              </Grid>

              <Grid item lg={4} xs={6}>
                <ShakingTextField
                  error={formik.touched.askForRefund && Boolean(formik.errors.askForRefund)}
                >
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
                </ShakingTextField>
              </Grid>

              {/* Additional Notes */}
              <Grid item xs={12}>
                <ShakingTextField error={formik.touched.reason && Boolean(formik.errors.reason)}>
                  <TextField
                    label="Reason"
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
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={2} p={2} mt="auto">
            {/* <Button variant='outlined' onClick={handleCloseDialog}>Cancel</Button> */}
            <Button variant="outlined" type="submit" onClick={() => {}}>
              Save
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
};

export default FeeRefundRequestDialog;
