import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import capitalizeWords from 'src/utils/capitalizeText';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import SubmitButton from 'src/components/submit-button';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Grid, TextField, Typography, DialogActions } from '@mui/material';

import { studentPayment } from '../data/fee-refund-approved-dialog-data';

import type { StudentPayment } from '../data/fee-refund-approved-dialog-data';
import type { IFinanceFeeCollectionRefundTabProps } from '../interface/fee-refund-interface';

const FinanceFeeCollectionRefundApprovedDialog: React.FC<IFinanceFeeCollectionRefundTabProps> = ({
  dialogValue,
  onClose,
}) => {
  // Dialog state management using custom boolean hook

  // State to store selected entry from student payment data

  // State to track edit mode

  // State to manage payment history data with initial student payment data
  const [paymentHistoryData] = useState<StudentPayment[]>(studentPayment);

  // Handler to update refund amount for specific payment entry

  // Calculate total refund amount from all payment history entries
  const totalRefundAmount: number = paymentHistoryData.reduce(
    (total: number, item: StudentPayment) => total + Number(item.refundAmount),
    0
  );

  // Row object to display total at the bottom of the table
  const totalRow = {
    paymentId: '',
    feeHead: '',
    paidAmount: 'Total',
    refundAmount: totalRefundAmount,
    paidDate: '',
    status: '',
  };

  // State to store tuition fee refund amount as string
  const [tuitionFeeRefundAmount] = useState<string>('');
  // State to store library fee refund amount as string
  const [libraryFeeRefundAmount] = useState<string>('');
  // State to store total fee refund amount as number
  const [, setTotalFeeRefundAmount] = useState<number>(0);

  // Helper function to parse numeric value from formatted string (removes commas)
  const parseNumericValue = (formattedValue: string) =>
    parseFloat(formattedValue.replace(/,/g, '')) || 0;

  // Calculate total refund amount whenever tuition or library fee amounts change
  useEffect(() => {
    const a = parseNumericValue(tuitionFeeRefundAmount);
    const b = parseNumericValue(libraryFeeRefundAmount);
    setTotalFeeRefundAmount(a + b);
  }, [tuitionFeeRefundAmount, libraryFeeRefundAmount]);

  // State to store discount values for different fee heads
  const [discountValues, setDiscountValues] = useState<{ [key: string]: string }>({});

  // State to control if save button should be enabled
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  // Handler to update discount value for a specific fee head
  // Removes any non-numeric characters except decimal point
  const handleDiscountChange = (feeHead: string, value: string) => {
    setDiscountValues((prev) => {
      const updatedValues = {
        ...prev,
        [feeHead]: value.replace(/[^0-9.]/g, ''),
      };

      return updatedValues;
    });
  };

  // Calculate total discount by summing all discount values
  const [feeRefundremark, setFeeRefundRemark] = useState('');
  // ✅ Use useEffect to correctly update isSaveEnabled when discountValues change
  useEffect(() => {
    const canSave =
      Object.values(discountValues).some((val) => Number(val) > 0) && feeRefundremark !== '';

    setIsSaveEnabled(canSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountValues, feeRefundremark]); // Depend on discountValues, so it updates correctly

  return (
    <CustomDialog
      maxWidth="xl"
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">Fee Refund Approval</Typography>
          <CustomTooltip
            arrow
            placement="right"
            title="This is the Approval Dialog, where you can approve a refund request by entering the refund amount for the student. You can also view the requested amount in the Ask for Refund column."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        <Box display="flex" flexDirection="row" gap={2} py="12px">
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
        <CustomizableTable
          tableId="fee-refund-table"
          columns={[
            // { id: 'grNumber', label: 'Gr Number' },
            // { id: 'studentName', label: 'Student Name' },
            { id: 'feeHead', label: 'Fee Head', isSort: false, isFilter: false },
            {
              id: 'paidAmount',
              label: 'Paid Amount',
              isFilter: false,
              isSort: false,
              render(value, row) {
                if (row.paidAmount === 'Total') {
                  return (
                    <Typography fontSize="12px" fontWeight="bold">
                      Total Refund
                    </Typography>
                  );
                }
                return (
                  <Typography fontSize="12px">{formatNumber(row.paidAmount, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'askForRefund',
              label: 'Refund Amount',
              isFilter: false,
              isSort: false,
              render(value, row) {
                return (
                  <Typography fontSize="12px">{formatNumber(row.askForRefund, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'refundAmount',
              label: 'Discount Amount',

              isFilter: false,
              isSort: false,
              render: (value: any, row: any) =>
                row.feeHead === paymentHistoryData[0].feeHead ? (
                  <NumericFormatCustom
                    autoFocus
                    size="small"
                    label={`${row.feeHead} Discount`}
                    name={`${row.feeHead.toLowerCase()}Discount`}
                    value={discountValues[row.feeHead] || ''}
                    onChange={(e) => handleDiscountChange(row.feeHead, e.target.value)}
                  />
                ) : (
                  <NumericFormatCustom
                    size="small"
                    label={`${row.feeHead} Discount`}
                    name={`${row.feeHead.toLowerCase()}Discount`}
                    value={discountValues[row.feeHead] || ''}
                    onChange={(e) => handleDiscountChange(row.feeHead, e.target.value)}
                  />
                ),
            },
          ]}
          data={[...paymentHistoryData, totalRow]}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }} sx={{ pt: '20px' }}>
            <TextField
              multiline
              rows={4}
              name="Reason For Refund"
              label="Reason For Refund"
              value="Paid Twice"
              onChange={() => {}}
              size="small"
              fullWidth
              disabled
            />
          </Grid>

          <Grid size={{ xs: 12 }} sx={{ pt: '20px' }}>
            <TextField
              multiline
              rows={4}
              name="remarks"
              label="Remarks"
              value={feeRefundremark}
              onChange={(e) => {
                setFeeRefundRemark(capitalizeWords(e.target.value));
              }}
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <SubmitButton
          onClick={() => {}}
          buttonText="Reject"
          variant="outlined"
          startIcon={<Iconify icon="material-symbols:cancel-outline-rounded" />}
        />
        <SubmitButton
          onClick={() => {}}
          buttonText="Approve"
          startIcon={<Iconify icon="material-symbols:check-circle-outline-rounded" />}
        />
      </DialogActions>
    </CustomDialog>
  );
};

export default FinanceFeeCollectionRefundApprovedDialog;
