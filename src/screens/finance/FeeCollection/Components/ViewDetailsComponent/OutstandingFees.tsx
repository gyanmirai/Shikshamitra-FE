import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetOutstandingFeesQuery } from 'src/redux/feeCollection/outstandingFeeData';

import { Label } from 'src/components/label';
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
        { id: 'feeHead', label: 'Fee Head', align: 'left' },
        {
          id: 'amount',
          label: 'Amount',
          align: 'left',
          render: (value) => `₹ ${value.toLocaleString()}`,
        },
        { id: 'dueDate', label: 'Due Date', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          render: (value) => {
            const colors: Record<string, 'success' | 'warning' | 'error'> = {
              Paid: 'success',
              Pending: 'warning',
              Overdue: 'error',
            };
            return (
              <Label color={colors[value]} variant="soft">
                {value}
              </Label>
            );
          },
        },
      ]}
      data={outstandingFeeData || []}
    />
  );
};

export default OutstandingFee;
