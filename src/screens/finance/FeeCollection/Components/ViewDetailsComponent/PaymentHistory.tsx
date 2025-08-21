import { IconButton } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetPaymentHistoryQuery } from 'src/redux/feeCollection/paymentHistory';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentFee } from '../type';

const PaymentHistory = ({ student }: { student: IStudentFee | null }) => {
  const { data: feeHistoryData, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaymentHistoryQuery,
  });
  return (
    <CustomizableTable
      tableId="student-receipt-details"
      noDataText="Fee Data Not Found"
      columns={[
        { id: 'receiptNo', label: 'Receipt No.', align: 'left' },
        { id: 'date', label: 'Date', align: 'left' },
        {
          id: 'amount',
          label: 'Amount',
          align: 'left',
          render: (value) => `₹ ${value.toLocaleString()}`,
        },
        { id: 'paymentMethod', label: 'Payment Method', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          render: (value) => (
            <Label color="success" variant="soft">
              {value}
            </Label>
          ),
        },
        {
          id: 'action',
          label: 'Action',
          align: 'left',
          isSort: false,
          isFilter: false,
          minWidth: 50,
          render: () => (
            <IconButton>
              <Iconify icon={GlobalIcons.download} />
            </IconButton>
          ),
        },
      ]}
      data={feeHistoryData || []}
    />
  );
};

export default PaymentHistory;
