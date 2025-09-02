import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetOutstandingFeesQuery } from 'src/redux/feeCollection/outstandingFeeData';

import CustomizableTable from 'src/components/customizabaleTable';

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
        { id: 'feeHead', label: 'Fee Head', align: 'left', isFilter: true },
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
