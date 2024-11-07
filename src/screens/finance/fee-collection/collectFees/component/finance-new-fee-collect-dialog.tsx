import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface FinanceNewCollectFeeDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValues {
  selectStudent: string;
  feeType: number[];
  amount: number;
  paymentMode: string;
  transactionId: string;
  note: string;
  selectedTerms: string[];
  receiptNumber: number;
  chequeDate: any;
  bankName:string;
}

const FinanceNewCollectFeeDialog: React.FC<FinanceNewCollectFeeDialogProps> = ({
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
      selectStudent: data.name,
      feeType: [], // Ensure this is an array
      amount: 0,
      paymentMode: '',
      transactionId: '',
      note: '',
      selectedTerms: [],
      receiptNumber:0,
      chequeDate: "",
      bankName:"",
    },
    onSubmit: (values) => {
      onSave(values);
    },
  });

  useEffect(() => {
    const options = data.fees.map((fee: any) => ({
      value: fee.feeHeadId,
      label: fee.feeHead,
    }));
    setFeeOptions(options);
  }, [data]);

  useEffect(() => {
    // Ensure that formik.values.feeType is an array before calling includes
    const unpaidTerms = data.fees
      .filter((fee: any) => Array.isArray(formik.values.feeType) && formik.values.feeType.includes(fee.feeHeadId))
      .flatMap((fee: any) =>
        fee.paymentDates
          .filter((status: any) => status.status === 'Unpaid')
          .map((status: any) => ({
            value: `${fee.feeHead}-${status.month}`,
            label: `${fee.feeHead} - ${status.month}`,
            amount: fee.amount,
          }))
      );
    setTermOptions(unpaidTerms);
  }, [formik.values.feeType, data]);

  const handleTermSelection = (selectedTerms: any) => {
    formik.setFieldValue('selectedTerms', selectedTerms);

    const totalAmount = termOptions
      .filter((term) => selectedTerms.includes(term.value))
      .reduce((sum, term) => sum + term.amount, 0);

    formik.setFieldValue('amount', totalAmount);
  };

  return (
    <CustomDialog title="Fee Collection" open={dialogValue} handleClose={onClose}>
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
                    // @ts-ignore
                    value={formik.values.feeType}
                    onChange={(selectedValues) => {
                      if (Array.isArray(selectedValues)) {
                        formik.setFieldValue('feeType', selectedValues);
                      }
                    }}
                    formControlProps={{ sx: { minWidth: 195 } }}
                    multiple
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                <CustomSelect
                    label="Pending Terms"
                    options={termOptions}
                    // @ts-ignore
                    value={formik.values.selectedTerms}
                    onChange={handleTermSelection}
                    formControlProps={{ sx: { minWidth: 195 } }}
                     multiple
                  />
                </Grid>
              </Grid>
             
              

             

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
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
                    name="reciptNumber"
                    label="Receipt Number"
                    value={formik.values.receiptNumber}
                    onChange={formik.handleChange}
                    size="small"
                    disabled // Amount is calculated based on fee type and should be read-only
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
                    value={formik.values.bankName}
                    onChange={formik.handleChange}
                    size="small"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item  xs={12} sm={6}>
                   <TextField
                    name="amount"
                    label="Amount"
                    value={formik.values.amount}
                    size="small"
                    InputProps={{ readOnly: true }}
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

export default FinanceNewCollectFeeDialog;
