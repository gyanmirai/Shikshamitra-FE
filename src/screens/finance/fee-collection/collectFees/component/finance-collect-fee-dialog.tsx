import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

const studentData = {
  studentId: '12345',
  name: 'John Doe',
  paymentDate: '2024-05-01',
  feeHeadListArray: [
    {
      feeHead: 'Tuition',
      paymentTerm: 'Annually',
      totalAmount: 1200,
      paymentStatus: [
        { title: '2024-2025', status: 'Unpaid', paymentMode: 'Cash', transactionId: 'txn123' },
      ],
    },
    {
      feeHead: 'Sports',
      paymentTerm: 'Monthly',
      totalAmount: 100,
      paymentStatus: [
        { title: 'January', status: 'Unpaid', paymentMode: 'Cash', transactionId: null },
        { title: 'February', status: 'Paid', paymentMode: 'Cash', transactionId: 'txn124' },
        { title: 'March', status: 'Unpaid', paymentMode: 'Cash', transactionId: 'txn124' },
      ],
    },
  ],
};

interface FinanceCollectFeeDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValues {
  selectStudent: string;
  feeType: string;
  amount: string;
  paymentMode: string;
  transactionId: string;
  note: string;
  term: string;
  multipleTerm: string[];
}

const FinanceCollectFeeDialog: React.FC<FinanceCollectFeeDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  isEdit,
  allData,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
  const [feeOptions, setFeeOptions] = useState<any[]>([]);
  const [termOptions, setTermOptions] = useState<any[]>([]);

  const formik = useFormik<FormikValues>({
    initialValues: {
      selectStudent: studentData.name,
      feeType: isEdit ? (data.feeType ?? '') : '',
      amount: isEdit ? (data.amount ?? '') : '',
      paymentMode: isEdit ? (data.paymentMode ?? '') : '',
      transactionId: isEdit ? (data.transactionId ?? '') : '',
      note: isEdit ? (data.note ?? '') : '',
      term: '',
      multipleTerm: [],
    },
    onSubmit: (values) => {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.selectStudent) === normalize(values.selectStudent)
      );
      if (!isEdit) {
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
        }
      } else {
        onSave(values);
      }
    },
  });

  useEffect(() => {
    // Set fee options based on studentData
    const options = studentData.feeHeadListArray.map((fee) => ({
      value: fee.feeHead,
      label: fee.feeHead,
    }));
    setFeeOptions(options);
  }, []);

  useEffect(() => {
    // Update term options based on selected feeType
    const selectedFee = studentData.feeHeadListArray.find(
      (fee) => fee.feeHead === formik.values.feeType
    );
    if (selectedFee) {
      const unpaidTerms = selectedFee.paymentStatus.filter((status) => status.status === 'Unpaid');
      const options = unpaidTerms.map((status) => ({
        value: status.title,
        label: status.title,
      }));
      setTermOptions(options);
      formik.setFieldValue('amount', selectedFee.totalAmount);
    } else {
      setTermOptions([]);
      formik.setFieldValue('amount', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.feeType]);

  return (
    <CustomDialog maxWidth="xl" title="Fee Collection" open={dialogValue} handleClose={onClose}>
      <Box px="20px">
        {showExistingEntryMessage && (
          <Typography component="span" fontSize="14" color="red">
            This Entry Already Exists
          </Typography>
        )}
      </Box>
      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>
            <Box pt="15px" display="flex" flexDirection="column" gap={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <CustomSelect
                    label="Fee Type"
                    options={feeOptions}
                    value={formik.values.feeType}
                    onChange={(selectedValues) => formik.setFieldValue('feeType', selectedValues)}
                    formControlProps={{ sx: { minWidth: 195 } }}
                    disabled={isEdit}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="amount"
                    label="Amount"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    size="small"
                    disabled // Amount is calculated based on fee type and should be read-only
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {/* <CustomSelect
                                        label="Select Term"
                                        options={termOptions}
                                        value={formik.values.term}
                                        onChange={(selectedValues) => formik.setFieldValue('term', selectedValues)}
                                        formControlProps={{ sx: { minWidth: 195 } }}
                                        disabled={isEdit}
                                    /> */}
                  <DatePicker
                    label="Current Date"
                    slotProps={{
                      textField: {
                        sx: { width: '100%', maxWidth: '200px' },
                        size: 'small',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="reciptNumber"
                    label="Receipt Number"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    size="small"
                    disabled // Amount is calculated based on fee type and should be read-only
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <CustomSelect
                    label="Payment Mode"
                    options={[
                      { value: 'Cash', label: 'Cash' },
                      { value: 'Card', label: 'Card' },
                      { value: 'Online', label: 'Online' },
                    ]}
                    value={formik.values.paymentMode}
                    onChange={(selectedValues) =>
                      formik.setFieldValue('paymentMode', selectedValues)
                    }
                    formControlProps={{ sx: { minWidth: 195 } }}
                    disabled={isEdit}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="transactionId"
                    label="Transaction ID"
                    value={formik.values.transactionId}
                    onChange={formik.handleChange}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Cheque Date"
                    slotProps={{
                      textField: {
                        sx: { width: '100%', maxWidth: '200px' },
                        size: 'small',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="bankName"
                    label="Bank Name"
                    value={formik.values.transactionId}
                    onChange={formik.handleChange}
                    size="small"
                  />
                </Grid>
              </Grid>

              <TextField
                multiline
                rows={4}
                name="note"
                label="Note"
                value={formik.values.note}
                onChange={formik.handleChange}
                size="small"
              />
            </Box>
            <DialogActions>
              <Button onClick={onClose} variant="contained" size="small">
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="small">
                Save
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Scrollbar>
    </CustomDialog>
  );
};

export default FinanceCollectFeeDialog;
