// Add MenuItem import
import React from 'react';
import { Typography } from '@mui/material';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable'; // Make sure Iconify is correctly imported
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import {
  PaymentStatusType,
  PaymentStatusOptions,
  PaymentStatusTypeColors,
} from 'src/enums/payment-status';

interface FinanceStudentPaymentHistoryDialogProps {
  dialogValue: boolean;
  data: any; // Assuming 'data' contains the relevant row data including payment history
  onSave: (values: any) => void;
  onClose: () => void;
}

const FinanceStudentPaymentHistoryDialog: React.FC<FinanceStudentPaymentHistoryDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
}) => (
  <CustomDialog maxWidth="lg" title="Payment History" open={dialogValue} handleClose={onClose}>
    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '350px' }}>
      <CustomizableTable
        noDataText="No payment history found. It looks like no payments have been made yet."
        tableId="financeStudentPaymentHistory"
        isFilter={false}
        isScrollbar={false}
        isSearch={false}
        isPagination={false}
        isShowedDense={false}
        columns={[
          { id: 'feeHead', label: 'Fee Head' },
          { id: 'paymentId', label: 'Payment Id / Cheque No' },

          { id: 'paymentMode', label: 'Payment Mode' },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'formattedNumber',
            align: 'right',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amount, 'INR')}</Typography>;
            },
          },
          {
            id: 'paymentStatus',
            label: 'Status',
            filterType: 'enum',
            enumOptions: PaymentStatusOptions,
            minWidth: '180px',
            align: 'left',
            render(value, row) {
              const color = PaymentStatusTypeColors[value as PaymentStatusType] as LabelColor;

              return <Label color={color}>{PaymentStatusType[value as PaymentStatusType]}</Label>;
            },
          },
        ]}
        data={data.paymentHistory}
      />
    </Scrollbar>
  </CustomDialog>
);

export default FinanceStudentPaymentHistoryDialog;
