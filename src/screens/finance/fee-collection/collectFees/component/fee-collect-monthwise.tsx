import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, Tooltip, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import TemplatesOneFeeReceipt from 'src/screens/finance/viewReceipt/Templates/TemplatesOne';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';

import type { IFeeCollectionMonthWiseProps } from './fee-collection-monthwise-interface';

const dummyTermWiseFeeData = {
  January: [
    { feeHead: 'Tuition', amount: 5000, pending: 0 },
    { feeHead: 'Sports', amount: 800, pending: 300 },
    { feeHead: 'Library', amount: 500, pending: 0 },
  ],
  February: [
    { feeHead: 'Tuition', amount: 5000, pending: 5000 },
    { feeHead: 'Library', amount: 500, pending: 500 },
    { feeHead: 'Sports', amount: 800, pending: 800 },
  ],
};

const FeeCollectionMonthWise: React.FC<IFeeCollectionMonthWiseProps> = ({
  students,
  dialogValue,
  onClose,
}) => {
  const receiptViewDialog = useBoolean();

  // Formik initialValues for receivedAmount per fee item added dynamically
  const formik = useFormik<any>({
    initialValues: {
      feeType: '',
      selectedTerms: [],
      paymentMode: [],
      dueAmount: 0,
      receivedAmountTotal: 0, // total received amount input by user across fees
      chequeDetails: {
        chequeNo: '',
        bankName: '',
        chequeDate: null,
      },
      onlineDetails: {
        transectionId: '',
        paymentApp: '',
      },
      cardDetails: {
        transactionId: '',
      },
      // Store receivedAmount per fee item (keyed by `${month}-${feeHead}`)
      receivedAmountsByFeeItem: {},
    },
    onSubmit: (values) => {
      console.log('Form Values:', values);
    },
  });

  const { values, setFieldValue } = formik;
  const { paymentMode } = values;

  const [receiptData, setReceiptData] = React.useState<any>(null);

  // Group fees by feeHead from selected terms
  const groupedFeesBySection = React.useMemo(() => {
    const acc: Record<string, any[]> = {};
    values.selectedTerms.forEach((term: string) => {
      const fees = dummyTermWiseFeeData[term as keyof typeof dummyTermWiseFeeData] || [];
      fees.forEach((fee: { feeHead: string; amount: number; pending: number }) => {
        if (!acc[fee.feeHead]) {
          acc[fee.feeHead] = [];
        }
        acc[fee.feeHead].push({
          month: term,
          ...fee,
          key: `${term}-${fee.feeHead}`,
        });
      });
    });
    return acc;
  }, [values.selectedTerms]);

  // Calculate total dueAmount dynamically based on selected terms & fees
  useEffect(() => {
    let totalDue = 0;
    values.selectedTerms.forEach((term: string) => {
      const fees = dummyTermWiseFeeData[term as keyof typeof dummyTermWiseFeeData] || [];
      fees.forEach((fee: { pending: number }) => {
        totalDue += fee.pending;
      });
    });
    setFieldValue('dueAmount', totalDue);
  }, [values.selectedTerms, setFieldValue]);

  // Calculate total receivedAmount across fee items whenever individual receivedAmount changes
  useEffect(() => {
    const totalReceived = Object.values(values.receivedAmountsByFeeItem).reduce(
      (sum: number, val: unknown) => sum + Number(val || 0),
      0
    );
    setFieldValue('receivedAmountTotal', totalReceived);
  }, [values.receivedAmountsByFeeItem, setFieldValue]);
  // Generate receipt data grouped by fee heads and months
  const generateReceiptData = () => {
    // Flatten fees for selected terms with received amounts
    const selectedData = values.selectedTerms.flatMap((term: string) => {
      const fees = dummyTermWiseFeeData[term as keyof typeof dummyTermWiseFeeData] || [];
      return fees.map((fee: { feeHead: string; amount: number; pending: number }) => {
        const key = `${term}-${fee.feeHead}`;
        return {
          month: term,
          feeHead: fee.feeHead,
          amount: fee.amount,
          pending: fee.pending,
          receivedAmount: Number(values.receivedAmountsByFeeItem[key] || 0),
        };
      });
    });

    const total = selectedData.reduce(
      (sum: number, item: { receivedAmount: number }) => sum + item.receivedAmount,
      0
    );
    const pending = selectedData.reduce(
      (sum: number, item: { pending: number }) => sum + item.pending,
      0
    );
    const mode = values.paymentMode || '-';

    const paymentDetails: any = {
      mode,

      bank: '',
      date: new Date().toLocaleDateString(),
      chequeNo: '',
      chequeDate: '',

      transactionId: '1',
    };

    if (mode === 'Cheque') {
      paymentDetails.chequeNo = values.chequeDetails.chequeNo.toUpperCase();
      paymentDetails.bank = values.chequeDetails.bankName.toUpperCase();
      paymentDetails.chequeDate = values.chequeDetails.chequeDate;
    } else if (mode === 'Online') {
      paymentDetails.transactionId = values.onlineDetails.transectionId;
    } else if (mode === 'Card') {
      paymentDetails.reference = values.cardDetails.transactionId;
    }

    const filterData = selectedData.filter(
      (item: { receivedAmount: number }) => item.receivedAmount > 0
    );
    setReceiptData({
      data: filterData,
      total,
      pending,
      paymentDetails,
    });

    receiptViewDialog.onTrue();
  };

  return (
    <>
      <CustomDialog
        fullScreen
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Fee Collection</Typography>
            <Tooltip
              arrow
              placement="right"
              title="To collect the fee, please select the term. The pending fee will automatically appear in the due amount input under Fee-wise. Enter the received amount in the Received Amount input field."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
        open={dialogValue}
        handleClose={onClose}
      >
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" pb="20px">
              <Box flex={8} display="flex" flexDirection="row" gap={2} py="12px">
                <Typography>
                  <strong>Name:</strong> Vishal RameshBhai Patel
                </Typography>
                <Typography>
                  <strong>Standard:</strong> 10/B
                </Typography>
                <Typography>
                  <strong>Gr Number:</strong> 89866
                </Typography>
                <Typography>
                  <strong>Roll Number:</strong> 1
                </Typography>
              </Box>
              <Box flex={3}>
                <CustomSelect
                  autoFocus
                  multiple
                  label="Select Term"
                  options={Object.keys(dummyTermWiseFeeData).map((term) => ({
                    label: term,
                    value: term,
                  }))}
                  // @ts-ignore
                  value={values.selectedTerms}
                  onChange={(selectedValues) => {
                    setFieldValue('selectedTerms', selectedValues);
                    // Clear received amounts on term change
                    setFieldValue('receivedAmountsByFeeItem', {});
                  }}
                  size="small"
                />
              </Box>
            </Box>

            {/* Grouped Fee Sections */}
            {values.selectedTerms.length === 0 ? (
              <Typography sx={{ mt: 3 }} color="text.secondary">
                Please select at least one term to see fee details.
              </Typography>
            ) : (
              Object.entries(groupedFeesBySection).map(([feeHead, fees]) => {
                const totalPending = fees.reduce((sum, fee) => sum + fee.pending, 0);
                const totalReceived = fees.reduce(
                  (sum, fee) => sum + Number(values.receivedAmountsByFeeItem[fee.key] || 0),
                  0
                );

                return (
                  <Box
                    key={feeHead}
                    sx={{ mb: 4, border: '1px solid #ccc', borderRadius: 1, p: 2 }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="h6">{feeHead} Fees</Typography>
                      <Typography variant="h6">Due Amount</Typography>
                    </Box>

                    {fees.map((fee: any) => {
                      const { key } = fee;
                      return (
                        <Grid container spacing={2} key={key} alignItems="center" sx={{ mb: 1 }}>
                          <Grid item xs={3}>
                            <Typography>{fee.month}</Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography>{formatNumber(fee.pending, 'INR')}</Typography>
                          </Grid>
                          {fee.pending > 0 && (
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                label="Received Amount"
                                size="small"
                                type="number"
                                inputProps={{ min: 0, max: fee.pending }}
                                value={values.receivedAmountsByFeeItem[key] || ''}
                                onChange={(e) =>
                                  setFieldValue('receivedAmountsByFeeItem', {
                                    ...values.receivedAmountsByFeeItem,
                                    [key]: e.target.value,
                                  })
                                }
                              />
                            </Grid>
                          )}
                        </Grid>
                      );
                    })}

                    {/* Totals Row */}
                    <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ mr: 4 }}>
                        <strong>Total Due:</strong> {formatNumber(totalPending, 'INR')}
                      </Typography>
                      <Typography variant="subtitle1">
                        <strong>Total Received:</strong> {formatNumber(totalReceived, 'INR')}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}

            {/* Payment Mode Select */}
            {values.selectedTerms.length !== 0 && (
              <Grid container mt={2}>
                <Grid item xs={3}>
                  <CustomSelect
                    label="Select Payment Mode"
                    options={[
                      { label: 'Cash', value: 'Cash' },
                      { label: 'Cheque', value: 'Cheque' },
                      { label: 'Online', value: 'Online' },
                      { label: 'Card', value: 'Card' },
                    ]}
                    // @ts-ignore
                    value={paymentMode}
                    onChange={(selected) => {
                      setFieldValue('paymentMode', selected);
                    }}
                    multiple={false}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}

            {/* Payment Mode Details */}
            {paymentMode.includes('Cheque') && values.selectedTerms.length !== 0 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Cheque No."
                      size="small"
                      fullWidth
                      value={values.chequeDetails.chequeNo}
                      onChange={(e) => setFieldValue('chequeDetails.chequeNo', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Bank Name"
                      size="small"
                      fullWidth
                      value={values.chequeDetails.bankName}
                      onChange={(e) => setFieldValue('chequeDetails.bankName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <DatePicker
                      label="Date on Cheque"
                      name="endDate"
                      value={
                        values.chequeDetails.chequeDate
                          ? dayjs(values.chequeDetails.chequeDate)
                          : null
                      }
                      format="DD-MMM-YYYY"
                      onChange={(e) => setFieldValue('chequeDetails.chequeDate', e)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          // helperText: formik.touched.endDate && (formik.errors.endDate as string),
                          // error: formik.touched.endDate && Boolean(formik.errors.endDate),
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {paymentMode.includes('Online') && values.selectedTerms.length !== 0 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Transection No."
                      size="small"
                      fullWidth
                      value={values.onlineDetails.transectionId}
                      onChange={(e) => setFieldValue('onlineDetails.transectionId', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {paymentMode.includes('Card') && values.selectedTerms.length !== 0 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Transaction ID"
                      size="small"
                      fullWidth
                      value={values.cardDetails.transactionId}
                      onChange={(e) => setFieldValue('cardDetails.transactionId', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Summary */}
          </Scrollbar>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              flexWrap="wrap"
              gap={2}
            >
              {values.selectedTerms.length !== 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #ddd',
                    minWidth: '300px',
                  }}
                >
                  {[
                    {
                      label: 'Total Due Amount',
                      value: formatNumber(values.dueAmount, 'INR'),
                      color: 'error.main',
                    },
                    {
                      label: 'Total Received Amount',
                      value: formatNumber(values.receivedAmountTotal, 'INR'),
                      color: 'success.main',
                    },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography color="text.primary">
                        <strong>{item.label}:</strong>
                      </Typography>
                      <Typography sx={{ color: item.color, textAlign: 'right', minWidth: '100px' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Box display="flex" gap={2}>
                <Button
                  size="medium"
                  variant="contained"
                  onClick={() => generateReceiptData()}
                  disabled={
                    values.selectedTerms.length === 0 ||
                    values.receivedAmountTotal === 0 ||
                    values.paymentMode === ''
                  }
                >
                  Generate Receipt
                </Button>
                <Button size="medium" variant="outlined" onClick={onClose}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </DialogActions>
        </form>
      </CustomDialog>

      {/* Receipt View Dialog */}
      {receiptViewDialog.value && (
        <CustomDialog
          title="Receipt"
          maxWidth="md"
          handleClose={() => {
            receiptViewDialog.onFalse();
            setReceiptData(null);
          }}
          open={receiptViewDialog.value}
        >
          <TemplatesOneFeeReceipt
            paymentDetails={receiptData.paymentDetails}
            data={receiptData.data}
            total={receiptData.total}
            pending={receiptData.pending}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default FeeCollectionMonthWise;
