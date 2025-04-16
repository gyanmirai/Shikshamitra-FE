import React, { useState, useEffect } from 'react';

import { Box, Button, Tooltip, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

import FeeRefundPaymentDialog from './fee-refund-payment-dialog';
import { studentPayment } from '../data/fee-refund-approved-dialog-data';

import type { StudentPayment } from '../data/fee-refund-approved-dialog-data';
import type { IFinanceFeeRefundAllocationDialogProps } from '../interface/fee-refund-interface';

const FinanceFeeRefundAllocationDialog: React.FC<IFinanceFeeRefundAllocationDialogProps> = ({
  dialogValue,
  selectedData,
  onClose,
}) => {
  const dialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<StudentPayment[]>(studentPayment);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [paymentHistoryData, setPaymentHistoryData] = useState<StudentPayment[]>(studentPayment);

  const handleRefundChange = (index: string, value: string) => {
    const newData = [...paymentHistoryData];
    const existingIndex = newData.findIndex((val) => val.paymentId === index);
    newData[existingIndex].refundAmount = value;
    setPaymentHistoryData(newData);
  };

  const totalRefundAmount: number = paymentHistoryData.reduce(
    (total: number, item: StudentPayment) => total + Number(item.refundAmount),
    0
  );

  const handleSave = () => {};

  const closeDialog = () => {
    dialog.onFalse();
  };

  const handleDilog = () => {
    setIsEdit(true);
    setSelectedEntry(paymentHistoryData);

    dialog.onTrue();
  };

  const [tuitionFeeRefundAmount, setTuitionFeeRefundAmount] = useState<string>('');
  const [libraryFeeRefundAmount, setlibraryFeeRefundAmount] = useState<string>('');
  const [totalFeeRefundAmount, setTotalFeeRefundAmount] = useState<number>(0);

  const parseNumericValue = (formattedValue: string) =>
    parseFloat(formattedValue.replace(/,/g, '')) || 0;

  useEffect(() => {
    const a = parseNumericValue(tuitionFeeRefundAmount);
    const b = parseNumericValue(libraryFeeRefundAmount);
    setTotalFeeRefundAmount(a + b);
  }, [tuitionFeeRefundAmount, libraryFeeRefundAmount]);

  const handleChangeForTuition = (formattedValue: string, numericValue: number) => {
    setTuitionFeeRefundAmount(formattedValue);
  };

  const handleChangeForLibrary = (formattedValue: string, numericValue: number) => {
    setlibraryFeeRefundAmount(formattedValue);
  };

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
          tableId="fee-refund-allocated"
          isFilter={false}
          isShowedDense={false}
          isPagination={false}
          isScrollbar={false}
          isSearch={false}
          columns={[
            // { id: 'grNumber', label: 'Gr Number' },

            { id: 'feeHead', label: 'Fee Head' },
            {
              id: 'paidAmount',
              label: 'Paid Amount',
              filterType: 'number',
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
              label: 'Ask For Refund',
              filterType: 'number',
              render(value, row) {
                return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
              },
            },
            {
              id: 'refundAmount',
              label: 'Approved Refund Amount',
              filterType: 'number',
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
      <DialogActions>
        <Button type="submit" variant="contained" size="small">
          View Receipt
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default FinanceFeeRefundAllocationDialog;
