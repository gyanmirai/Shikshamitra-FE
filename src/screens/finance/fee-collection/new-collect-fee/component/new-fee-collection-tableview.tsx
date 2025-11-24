import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  Box,
  Select,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import FeeReceiptPDF from '../receipt-view/new-receipt-pdf';

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

const feeHeadPaymentMethods: Record<string, string[]> = {
  Tuition: ['cash', 'cheque'],
  Library: ['cash'],
  Sports: ['cash', 'online'],
};

const paymentMethodOptions: Record<string, string> = {
  cash: 'Cash',
  cheque: 'Cheque',
  online: 'Online',
};

const FeeCollectionTable = () => {
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [receivedAmounts, setReceivedAmounts] = useState<Record<string, string>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>({});

  const [receiptData, setReceiptData] = useState<any>(null);

  // Flatten data
  const flattenedFees = Object.entries(dummyTermWiseFeeData)
    .flatMap(([month, fees]) =>
      fees.map((fee, index) => ({
        ...fee,
        month,
        id: `${month}-${fee.feeHead}-${index}`, // Unique key
      }))
    )
    .filter((fee) => fee.pending > 0);

  const toggleSelectFee = (id: string) => {
    setSelectedFees((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const totalDueAmount = selectedFees.reduce((acc, id) => {
    const item = flattenedFees.find((f) => f.id === id);
    return acc + (item?.pending || 0);
  }, 0);

  const totalReceivedAmount = selectedFees.reduce(
    (acc, id) => acc + Number(receivedAmounts[id] || 0),
    0
  );

  const [paymentDetailsById, setPaymentDetailsById] = useState<Record<string, any>>({});

  const updatePaymentDetails = (id: string, key: string, value: Dayjs | null | string) => {
    setPaymentDetailsById((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  const receiptViewDialog = useBoolean();

  const generateReceiptData = () => {
    const selectedReceiptData = selectedFees.map((id) => {
      const fee = flattenedFees.find((f) => f.id === id);
      const received = Number(receivedAmounts[id] || 0);
      const method = paymentMethods[id];
      const details = paymentDetailsById[id];

      return {
        feeHead: fee?.feeHead,
        month: fee?.month,
        dueAmount: fee?.pending,
        receivedAmount: received,
        paymentMode: paymentMethodOptions[method],
        ...(method === 'cheque' && {
          chequeNo: details?.chequeNumber,
          chequeDate: details?.chequeDate,
          bank: details?.bankName,
        }),
        ...(method === 'online' && {
          transactionId: details?.transactionId,
        }),
      };
    });

    setReceiptData(selectedReceiptData);
    receiptViewDialog.onTrue();
  };

  return (
    <>
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        <Box display="flex" flexDirection="row" gap={2} py="12px">
          <Typography>
            <strong>Name:</strong> Vishal RameshBhai Patel
          </Typography>
          <Typography>
            <strong>Standard:</strong> 10-B
          </Typography>
          <Typography>
            <strong>Gr Number:</strong> 89866
          </Typography>
          <Typography>
            <strong>Roll Number:</strong> 1
          </Typography>
        </Box>
        <Box>
          <CustomizableTable
            isFilter={false}
            tableId="fee-collection"
            noDataText="No Pending Fees"
            searchFieldProps={{
              placeholder: 'Search by Month, Fee Head, Pending Amount..',
              label: 'Search by Month, Fee Head, Pending Amount..',
              sx: {
                maxWidth: '400px',
                width: '100%',
              },
            }}
            columns={[
              {
                id: 'select',
                label: '',
                isSort: false,
                isFilter: false,
                render: (value: any, row: any) => (
                  <Checkbox
                    checked={selectedFees.includes(row.id)}
                    onChange={() => toggleSelectFee(row.id)}
                  />
                ),
              },
              { id: 'month', label: 'Month' },
              { id: 'feeHead', label: 'Fee Head' },
              {
                id: 'pending',
                label: 'Pending Amount',
                filterType: 'formattedNumber',
                isSort: false,
                render: (value: any) => formatNumber(value, 'INR'),
              },

              {
                id: 'receivedAmount',
                label: 'Received Amount',
                isSort: false,
                isFilter: false,
                render: (_: any, row: any) => {
                  const disabled = !selectedFees.includes(row.id);
                  const value = receivedAmounts[row.id] || '';

                  return (
                    <NumericFormatCustom
                      size="small"
                      fullWidth
                      autoFocus
                      disabled={disabled}
                      label={`${row.feeHead} Received`}
                      value={value}
                      error={Number(value) > row.pending}
                      helperText={
                        Number(value) > row.pending
                          ? `Amount should not exceed ₹ ${row.pending}`
                          : ''
                      }
                      onChange={(e) => {
                        setReceivedAmounts((prev) => ({
                          ...prev,
                          [row.id]: e.target.value,
                        }));
                      }}
                      onBlur={() => {
                        const amount = Number(value);
                        if (amount > row.pending) {
                          setReceivedAmounts((prev) => ({
                            ...prev,
                            [row.id]: row.pending,
                          }));
                        }
                      }}
                      name={`${row.feeHead.toLowerCase()}Received`}
                      sx={{ mb: 2 }}
                    />
                  );
                },
              },

              {
                id: 'paymentMethod',
                label: 'Payment Method',
                isSort: false,
                isFilter: false,
                render: (_, row) => {
                  const methods = feeHeadPaymentMethods[row.feeHead] || [];
                  const disabled = !selectedFees.includes(row.id);
                  const selectedMethod = paymentMethods[row.id] || '';

                  return (
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Select
                        size="small"
                        fullWidth
                        disabled={disabled}
                        displayEmpty
                        value={selectedMethod}
                        onChange={(e) =>
                          setPaymentMethods((prev) => ({
                            ...prev,
                            [row.id]: e.target.value,
                          }))
                        }
                      >
                        <MenuItem value="" disabled>
                          Select
                        </MenuItem>
                        {methods.map((method) => (
                          <MenuItem key={method} value={method}>
                            {paymentMethodOptions[method]}
                          </MenuItem>
                        ))}
                      </Select>

                      {/* Render extra fields based on method */}
                      {selectedMethod === 'cheque' && (
                        <Box display="flex" flexDirection="column" gap={1}>
                          <TextField
                            disabled={disabled}
                            size="small"
                            label="Cheque Number"
                            value={paymentDetailsById[row.id]?.chequeNumber || ''}
                            onChange={(e) =>
                              updatePaymentDetails(row.id, 'chequeNumber', e.target.value)
                            }
                          />
                          <DatePicker
                            disabled={disabled}
                            label="Date on Cheque"
                            name="chequeDate"
                            value={dayjs(paymentDetailsById[row.id]?.chequeDate) ?? null}
                            format="DD-MMM-YYYY"
                            onChange={(e) => {
                              updatePaymentDetails(row.id, 'chequeDate', e);
                            }}
                            slotProps={{
                              textField: {
                                size: 'small',
                                // helperText: formik.touched.endDate && (formik.errors.endDate as string),
                                // error: formik.touched.endDate && Boolean(formik.errors.endDate),
                              },
                            }}
                          />

                          <TextField
                            disabled={disabled}
                            size="small"
                            label="Bank Name"
                            value={paymentDetailsById[row.id]?.bankName || ''}
                            onChange={(e) =>
                              updatePaymentDetails(row.id, 'bankName', e.target.value)
                            }
                          />
                        </Box>
                      )}

                      {selectedMethod === 'online' && (
                        <TextField
                          disabled={disabled}
                          size="small"
                          label="Transaction ID"
                          value={paymentDetailsById[row.id]?.transactionId || ''}
                          onChange={(e) =>
                            updatePaymentDetails(row.id, 'transactionId', e.target.value)
                          }
                        />
                      )}
                    </Box>
                  );
                },
              },
            ]}
            data={flattenedFees}
          />
        </Box>
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 1,
              border: '1px solid #ddd',
              minWidth: '300px',
              visibility: selectedFees.length > 0 ? 'visible' : 'hidden',
            }}
          >
            {[
              {
                label: 'Total Due Amount',
                value: formatNumber(totalDueAmount, 'INR'),
                color: 'error.main',
              },
              {
                label: 'Total Received Amount',
                value: formatNumber(totalReceivedAmount, 'INR'),
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

          <Box display="flex" gap={2} justifyContent="flex-end" alignItems="center">
            <Button
              size="medium"
              variant="contained"
              onClick={generateReceiptData}
              disabled={selectedFees.length === 0 || totalReceivedAmount === 0}
            >
              Generate Receipt
            </Button>
          </Box>
        </Box>
      </DialogActions>

      {receiptViewDialog.value && (
        <CustomDialog
          title="Receipt"
          maxWidth="md"
          handleClose={() => {
            receiptViewDialog.onFalse();
            // setReceiptData(null);
          }}
          open={receiptViewDialog.value}
        >
          <FeeReceiptPDF
            from={{
              name: 'Deep Darshan Vidhya Sankool',
              address: 'Near Madhuvan Circle',
              branch: 'Dindoli - 560078',
            }}
            to={{ name: 'Vishal Patel', className: '5-A', rollNo: '23' }}
            selectedFees={receiptData}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default FeeCollectionTable;
