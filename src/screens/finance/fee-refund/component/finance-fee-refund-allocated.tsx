import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';

import { Box, Button, Tooltip, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

import FeeRefundPaymentDialog from './fee-refund-payment-dialog';
import { studentPayment } from '../data/fee-refund-approved-dialog-data';
import FeeRefundReceiptPDF from '../../transection-receipt/fee-refund-receipt';

import type { StudentPayment } from '../data/fee-refund-approved-dialog-data';
import type { IFinanceFeeRefundAllocationDialogProps } from '../interface/fee-refund-interface';

const FinanceFeeRefundAllocationDialog: React.FC<IFinanceFeeRefundAllocationDialogProps> = ({
  dialogValue,
  selectedData,
  onClose,
}) => {
  // Dialog state for payment dialog
  const dialog = useBoolean();

  // State to store selected payment entries
  const [selectedEntry, setSelectedEntry] = useState<StudentPayment[]>(studentPayment);

  // State to track edit mode
  const [isEdit, setIsEdit] = useState<boolean>(false);

  // State to store payment history data
  const [paymentHistoryData, setPaymentHistoryData] = useState<StudentPayment[]>(studentPayment);

  // Handler to update refund amount for a specific payment entry
  const handleRefundChange = (index: string, value: string) => {
    const newData = [...paymentHistoryData];
    const existingIndex = newData.findIndex((val) => val.paymentId === index);
    newData[existingIndex].refundAmount = value;
    setPaymentHistoryData(newData);
  };

  // Calculate total refund amount from all payment entries
  const totalRefundAmount: number = paymentHistoryData.reduce(
    (total: number, item: StudentPayment) => total + Number(item.refundAmount),
    0
  );

  // Handler for saving refund data
  const handleSave = () => {};

  // Close payment dialog
  const closeDialog = () => {
    dialog.onFalse();
  };

  // Open payment dialog and set edit mode
  const handleDilog = () => {
    setIsEdit(true);
    setSelectedEntry(paymentHistoryData);
    dialog.onTrue();
  };

  // States for different fee refund amounts
  const [tuitionFeeRefundAmount, setTuitionFeeRefundAmount] = useState<string>('');
  const [libraryFeeRefundAmount, setlibraryFeeRefundAmount] = useState<string>('');
  const [totalFeeRefundAmount, setTotalFeeRefundAmount] = useState<number>(0);

  // Helper function to parse numeric value from formatted string
  const parseNumericValue = (formattedValue: string) =>
    parseFloat(formattedValue.replace(/,/g, '')) || 0;

  // Calculate total fee refund amount when individual amounts change
  useEffect(() => {
    const a = parseNumericValue(tuitionFeeRefundAmount);
    const b = parseNumericValue(libraryFeeRefundAmount);
    setTotalFeeRefundAmount(a + b);
  }, [tuitionFeeRefundAmount, libraryFeeRefundAmount]);

  // Handler for tuition fee refund amount change
  const handleChangeForTuition = (formattedValue: string, numericValue: number) => {
    setTuitionFeeRefundAmount(formattedValue);
  };

  // Handler for library fee refund amount change
  const handleChangeForLibrary = (formattedValue: string, numericValue: number) => {
    setlibraryFeeRefundAmount(formattedValue);
  };

  // Dialog state for fee refund receipt
  const feeRefundReceiptDialog = useBoolean();
  return (
    <CustomDialog
      maxWidth="xl"
      title={
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <Typography variant="h5">Fee Refund</Typography>
          <Tooltip
            arrow
            placement="right"
            title="Refunds can be processed only after approval of the student's refund request. You can view the requested refund amount, the approved amount, and any remarks. Please review the remarks carefully before initiating the refund process."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </Tooltip>
        </Box>
      }
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
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
        <CustomizableTable
          tableId="fee-refund-allocated"
          isFilter={false}
          isShowedDense={false}
          isPagination={false}
          isScrollbar={false}
          isSearch={false}
          columns={[
            // { id: 'grNumber', label: 'Gr Number' },

            {
              id: 'feeHead',
              label: 'Fee Head',
              isFilter: false,
              isSort: false,
            },
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
                return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
              },
            },
            {
              id: 'refundAmount',
              label: 'Approved Refund Amount',
              isFilter: false,
              isSort: false,
              render: (value: any, row: any) => (
                <Typography fontSize="12px">{formatNumber(row.paidAmount, 'INR')}</Typography>
              ),
            },
          ]}
          // data={[...paymentHistoryData, totalRow]}
          data={paymentHistoryData}
        />

        <FeeRefundPaymentDialog
          onSave={handleSave}
          dialogValue
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
          allData={paymentHistoryData}
          total={totalRefundAmount}
          tuitionFeeAmount={tuitionFeeRefundAmount}
          libraryFeeFeeAmount={libraryFeeRefundAmount}
          totalFeeAmount={totalFeeRefundAmount}
        />
      </Scrollbar>
      {feeRefundReceiptDialog.value && (
        <CustomDialog
          title="Charges"
          maxWidth="md"
          handleClose={() => {
            feeRefundReceiptDialog.onFalse();
            // setReceiptData(null);
          }}
          open={feeRefundReceiptDialog.value}
        >
          <FeeRefundReceiptPDF
            from={{
              name: 'Deep Darshan Vidhya Sankool',
              address: 'Near Madhuvan Circle',
              branch: 'Dindoli - 560078',
            }}
            to={{ name: 'Vishal Patel', className: '5-A', rollNo: '23' }}
            selectedCharges={[
              { feeHead: 'Tuition Fee', refundedAmount: 1500 },
              { feeHead: 'Library Fee', refundedAmount: 500 },
            ]}
            paymentDetails={{
              paymentMode: 'Cheque',
              chequeNo: '123456',
              bank: 'SBI',
              dateOnCheque: dayjs('2025-05-20'),
            }}
          />
        </CustomDialog>
      )}

      <DialogActions>
        <Button
          type="submit"
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.receiptIcon} />}
          onClick={() => {
            feeRefundReceiptDialog.onTrue();
          }}
        >
          View Receipt
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default FinanceFeeRefundAllocationDialog;
