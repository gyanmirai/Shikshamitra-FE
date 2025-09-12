import { Box } from '@mui/system';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetOutstandingFeesQuery } from 'src/redux/feeCollection/outstandingFeeData';

import type { IStudentFee } from '../type';

const OutstandingFee = ({ student }: { student: IStudentFee | null }) => {
  const { data: outstandingFeeData, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOutstandingFeesQuery,
  });
  return (
    <CustomizableTable
      tableId="student-fee-details"
      noDataText="Fee Data Not Found"
      columns={[
        { id: 'installmentName', label: 'Installment Name', align: 'left', isFilter: true },
        {
          id: 'feeHead',
          label: 'Fee Head',
          align: 'left',
          isFilter: true,
          render: (value) =>
            Array.isArray(value) ? <Box>{value.join(', ')}</Box> : <Box>{value}</Box>,
        },
        {
          id: 'amount',
          label: 'Amount',
          align: 'left',
          filterType: 'number',
          render: (value) => `₹ ${value.toLocaleString()}`,
        },
        { id: 'dueDate', label: 'Due Date', align: 'left', filterType: 'date' },
      ]}
      data={outstandingFeeData || []}
    />
  );
};

export default OutstandingFee;
