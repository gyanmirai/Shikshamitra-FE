import React from 'react';
import { useFormik } from 'formik';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface FinanceChequeBounceChargeCollectDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
}

const FinanceChequeBounceChargeCollect: React.FC<FinanceChequeBounceChargeCollectDialogProps> = ({
  data,
  dialogValue,
  onClose,
  onSave,
}) => {
  const formik = useFormik({
    initialValues: {
      paymentMode: '',
      chequeNo: data.chequeNo,
      bankName: data.bankName,
      receiptBook: '',
      amount: data.amount,
      id: data.id,

      remarks: '',
    },
    onSubmit: (values: any) => {
      console.log('Form Submitted type:', values);
      onSave(values);
    },
  });
  return (
    <CustomDialog title="Cheque Bounce Charge Collect" open={dialogValue} handleClose={onClose}>
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <Grid2 container spacing={2}>
                <Grid2 xs={6}>
                  <TextField
                    name="amount"
                    label="Amount"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    size="small"
                    type="text"
                    fullWidth
                    disabled
                  />
                </Grid2>
                <Grid2 xs={6}>
                  <CustomSelect
                    label="Payment Mode"
                    options={[
                      { value: 'Cash', label: 'Cash' },
                      { value: 'Card', label: 'Card' },
                      { value: 'Online', label: 'Online' },
                      { value: 'Cheque', label: 'Cheque' },
                    ]}
                    value={formik.values.paymentMode}
                    onChange={(selectedValues) =>
                      formik.setFieldValue('paymentMode', selectedValues)
                    }
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid2>
              </Grid2>
              {formik.values.paymentMode !== 'Cash' && formik.values.paymentMode !== '' && (
                <Grid2 container spacing={2}>
                  <Grid2 xs={6}>
                    {(formik.values.paymentMode === 'Online' ||
                      formik.values.paymentMode === 'Card') && (
                      <TextField
                        name="transactionId"
                        label="Transaction ID"
                        value={formik.values.transactionId}
                        onChange={formik.handleChange}
                        size="small"
                      />
                    )}

                    {formik.values.paymentMode === 'Cheque' && (
                      <TextField
                        name="chequeNo"
                        label="Cheque No"
                        value={formik.values.chequeNo}
                        onChange={formik.handleChange}
                        size="small"
                      />
                    )}
                  </Grid2>
                  {formik.values.paymentMode !== 'Cash' && (
                    <Grid2 xs={6}>
                      <TextField
                        name="bankName"
                        label="Bank Name"
                        value={formik.values.bankName}
                        onChange={formik.handleChange}
                        size="small"
                        type="text"
                        fullWidth
                        disabled
                      />
                    </Grid2>
                  )}
                </Grid2>
              )}

              <Grid2 container spacing={2}>
                <Grid2 xs={6}>
                  <CustomSelect
                    label="Receipt Book"
                    options={[
                      { value: 'GSEB', label: 'GSEB' },
                      { value: 'CBSE', label: 'CBSE' },
                    ]}
                    value={formik.values.paymentMode}
                    onChange={(selectedValues) =>
                      formik.setFieldValue('paymentMode', selectedValues)
                    }
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid2>
              </Grid2>
            </Box>
            <Box pt="17px" />
            <TextField
              multiline
              rows={3}
              name="remarks"
              label="Remarks"
              value={formik.values.remarks}
              onChange={formik.handleChange}
              size="small"
              type="text"
              fullWidth
            />
          </Scrollbar>
        </form>
        <DialogActions>
          <Button onClick={onClose} variant="contained" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" size="small">
            Generate Receipt
          </Button>
        </DialogActions>
      </Box>
    </CustomDialog>
  );
};

export default FinanceChequeBounceChargeCollect;
