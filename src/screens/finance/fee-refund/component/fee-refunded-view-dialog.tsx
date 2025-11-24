import { Box, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { Iconify } from 'src/components/iconify/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import data from 'src/json/finance/fee-refund/feeRefundViewData.json';

import type { IFinanceFeeRefundedViewDialogProps } from '../interface/fee-refund-interface';

const FinanceFeeRefundedViewDialog: React.FC<IFinanceFeeRefundedViewDialogProps> = ({
  dialogValue,
  selectedData,
  onClose,
}) => {
  // const [tableData, setTableData] = useState(data);
  const [paymentHistoryData] = useState(data);

  const [tuitionFeeRefundAmount] = useState('');
  const [libraryFeeRefundAmount] = useState('');
  const [, setTotalFeeRefundAmount] = useState(0);

  const parseNumericValue = (formattedValue: string) =>
    parseFloat(formattedValue.replace(/,/g, '')) || 0;

  useEffect(() => {
    const a = parseNumericValue(tuitionFeeRefundAmount);
    const b = parseNumericValue(libraryFeeRefundAmount);
    setTotalFeeRefundAmount(a + b);
  }, [tuitionFeeRefundAmount, libraryFeeRefundAmount]);

  return (
    <CustomDialog
      maxWidth="xl"
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">Fee Refund</Typography>
          <CustomTooltip
            arrow
            placement="right"
            title="The Fee Refund Details dialog displays all refund-related information for the student, including the refund mode, approved refund amount, requested date, and more."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar sx={{ p: 2, height: '500px' }}>
        <Box display="flex" gap={3} alignItems="center">
          <Typography fontSize="14px">
            <strong>Name:</strong> John Doe
          </Typography>
          <Typography fontSize="14px">
            <strong>Roll No:</strong> 1234
          </Typography>
          <Typography fontSize="14px">
            <strong>Class:</strong> 10th
          </Typography>
          <Typography fontSize="14px">
            <strong>GR No:</strong> 5678
          </Typography>
          <Typography fontSize="14px">
            <strong>Division:</strong> A
          </Typography>
        </Box>
        <CustomizableTable
          tableId="fee-refund-table"
          isFilter={false}
          isShowedDense={false}
          isPagination={false}
          isSearch={false}
          columns={[
            { id: 'feeHead', label: 'Fee Head' },

            {
              id: 'requestedOn',
              label: 'Requested On',
              filterType: 'date',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    08-09-2024
                  </Typography>
                );
              },
            },
            {
              id: 'approvedDate',
              label: 'Approved Date',
              filterType: 'date',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    09-10-2024
                  </Typography>
                );
              },
            },
            {
              id: 'refundedDate',
              label: 'Refunded Date',
              filterType: 'date',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    10-11-2024
                  </Typography>
                );
              },
            },
            {
              id: 'refundedMode',
              label: 'Refunded Mode',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    Cash
                  </Typography>
                );
              },
            },
            {
              id: 'paidAmount',
              label: 'Paid Amount',
              filterType: 'formattedNumber',
              align: 'right',
              render(value, row) {
                if (row.paidAmount === 'Total') {
                  return (
                    <Typography fontSize="12px" fontWeight="bold" minWidth="120px">
                      Total Refund
                    </Typography>
                  );
                }
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    {formatNumber(row.paidAmount, 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'askForRefund',
              label: 'Refund Amount',
              filterType: 'formattedNumber',
              align: 'right',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    {formatNumber(value, 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'refundAmount',
              label: 'Approved Refund Amount',
              filterType: 'formattedNumber',
              align: 'right',
              render: (value, row) => (
                <Typography fontSize="12px" minWidth="150px">
                  {formatNumber(row.paidAmount, 'INR')}
                </Typography>
              ),
            },
            {
              id: 'refundAmount',
              label: 'Refunded Amount',
              filterType: 'formattedNumber',
              align: 'right',
              render: (value, row) => (
                <Typography fontSize="12px" minWidth="150px">
                  {formatNumber(row.paidAmount, 'INR')}
                </Typography>
              ),
            },
            // {
            //   id: 'receiptNo',
            //   label: 'Receipt No',
            //   render(value, row) {
            //     return (
            //       <Typography fontSize="12px" minWidth="120px">
            //         8hsuqhs
            //       </Typography>
            //     );
            //   },
            // },
            // {
            //   id: 'transactionId',
            //   label: 'Transaction Id',
            //   render(value, row) {
            //     return (
            //       <Typography fontSize="12px" minWidth="150px">
            //         -
            //       </Typography>
            //     );
            //   },
            // },
          ]}
          data={paymentHistoryData}
        />
      </Scrollbar>
    </CustomDialog>
  );
};

export default FinanceFeeRefundedViewDialog;
