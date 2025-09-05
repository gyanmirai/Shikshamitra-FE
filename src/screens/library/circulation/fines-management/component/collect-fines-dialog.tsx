import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import FormattedAmountInput from 'src/screens/finance/common/input-for-finance';
import { Box, Grid, Button, MenuItem, TextField, Typography, DialogActions } from '@mui/material';

interface CollectFinesDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
}

const paymentModes = [
  { value: 'cash', label: 'Cash' },
  { value: 'online', label: 'Online Payment' },
  { value: 'bank', label: 'Bank Transfer' },
];

const CollectFinesDialog: React.FC<CollectFinesDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
}) => {
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('cash');

  const formik = useFormik({
    initialValues: {
      name: data?.memberName || '',
      fineAmount: data?.totalFineAmount || '',
      notes: '',
      paymentMode: 'cash',
      upiId: '',
      bankAccount: '',
      ifsc: '',
      accountHolder: '',
    },
    onSubmit: (values) => {
      console.log('Form Submitted:', values);
      onSave(values);
    },
  });

  const handlePaymentModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const mode = event.target.value;
    setSelectedPaymentMode(mode);
    formik.setFieldValue('paymentMode', mode);

    // Reset related fields when payment mode changes
    if (mode === 'online') {
      formik.setFieldValue('upiId', '');
    } else if (mode === 'bank') {
      formik.setFieldValue('bankAccount', '');
      formik.setFieldValue('ifsc', '');
      formik.setFieldValue('accountHolder', '');
    }
  };
  const [penaltyAmountState, setPenaltyAmountState] = useState('');
  const [fineAmountState, setFineAmountState] = useState('');

  function parseNumber(value: string): number {
    return parseFloat(value.replace(/,/g, ''));
  }

  const handlePenaltyAmountChange = (formattedValue: string, numericValue: number) => {
    setPenaltyAmountState(formattedValue);
  };
  const handleFineAmountChange = (formattedValue: string, numericValue: number) => {
    setFineAmountState(formattedValue);
  };
  return (
    <CustomDialog title="Fine Collection" open={dialogValue} handleClose={onClose} maxWidth="lg">
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
            <Grid container spacing={3} pt="10px">
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">{data?.memberName}</Typography>
                <Typography variant="body2">Gr Number: {data?.memberId}</Typography>
              </Grid>

              {/* Table for Fines */}
              <Grid size={{ xs: 12 }}>
                <CustomizableTable
                  tableId="finesTable"
                  isFilter={false}
                  isSearch={false}
                  isShowedDense={false}
                  columns={[
                    { id: 'bookId', label: 'Book ID' },
                    { id: 'title', label: 'Book Title' },
                    { id: 'issueDate', label: 'Issued Date' },
                    { id: 'dueDate', label: 'Due Date' },
                    { id: 'returnDate', label: 'Return Date' },
                    {
                      id: 'fineAmount',
                      label: 'Fine Amount',
                      render(value, row) {
                        return (
                          <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>
                        );
                      },
                    },
                    { id: 'fineReason', label: 'Reason' },
                    {
                      id: 'status',
                      label: 'Status',
                      render(value, row) {
                        return (
                          <Label
                            variant="soft"
                            color={
                              value === 'Paid'
                                ? 'success'
                                : value === 'Pending'
                                  ? 'warning'
                                  : 'error'
                            }
                          >
                            {value}
                          </Label>
                        );
                      },
                    },
                  ]}
                  data={data?.fines || []}
                />
              </Grid>

              {/* Fine Amount */}
              <Grid size={{ xs: 12, md: 3 }}>
                <FormattedAmountInput
                  label="Fine Amount"
                  value={fineAmountState}
                  onChange={handleFineAmountChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormattedAmountInput
                  label="Penalty Amount"
                  value={penaltyAmountState}
                  onChange={handlePenaltyAmountChange}
                />{' '}
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  name="pReason"
                  label="Penalty Reason"
                  value=""
                  onChange={(e) => {
                    const formattedValue = formatNumber(e.target.value, 'INR');
                    formik.setFieldValue('pReason', formattedValue);
                  }}
                  size="small"
                />
              </Grid>
              {/* Payment Mode */}
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  name="paymentMode"
                  label="Payment Mode"
                  value={formik.values.paymentMode}
                  onChange={handlePaymentModeChange}
                  size="small"
                >
                  {paymentModes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Dynamic Fields for Online Payment */}
              {selectedPaymentMode === 'online' && (
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    name="upiId"
                    label="UPI ID"
                    value={formik.values.upiId}
                    onChange={formik.handleChange}
                    size="small"
                  />
                </Grid>
              )}

              {/* Dynamic Fields for Bank Transfer */}
              {selectedPaymentMode === 'bank' && (
                <>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      name="bankAccount"
                      label="Bank Account Number"
                      value={formik.values.bankAccount}
                      onChange={formik.handleChange}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      name="ifsc"
                      label="IFSC Code"
                      value={formik.values.ifsc}
                      onChange={formik.handleChange}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      name="accountHolder"
                      label="Account Holder Name"
                      value={formik.values.accountHolder}
                      onChange={formik.handleChange}
                      size="small"
                    />
                  </Grid>
                </>
              )}

              {/* Notes */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  rows={4}
                  multiline
                  fullWidth
                  name="notes"
                  label="Notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  size="small"
                />
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            {/* <Button type="button" onClick={onClose} size="small" variant="outlined">
                            Cancel
                        </Button> */}
            <Button type="submit" variant="contained" size="small">
              Collect Fine
            </Button>
          </DialogActions>
        </form>
      </Box>
    </CustomDialog>
  );
};

export default CollectFinesDialog;
