import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeConcessionsQuery } from 'src/redux/feeCollection/feeConcession';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentFee } from '../type';

const FeeConcession = ({ student }: { student: IStudentFee | null }) => {
  const { data: feeConcessionData, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeConcessionsQuery,
  });
  return (
    <CustomizableTable
      tableId="concession-details"
      noDataText="Concession Data Not Found"
      columns={[
        { id: 'concessionType', label: 'Concession Type', align: 'left' },
        { id: 'reason', label: 'Reason of Concession Type', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          render: (value) => {
            const colors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
              Approved: 'success',
              'Under Review': 'info',
              Pending: 'warning',
              Rejected: 'error',
            };
            return (
              <Label color={colors[value]} variant="soft">
                {value}
              </Label>
            );
          },
        },
        {
          id: 'action',
          label: 'Action',
          align: 'left',
          isSort: false,
          isFilter: false,
          minWidth: 50,
          render(value, row) {
            return (
              <ThreeDotsActions
                // actions={(prop) => actions({ ...props, row })}
                placement="right-top"
                showViewIcon
                showThreeDots={false}
                handleViewClick={() => {}}
              />
            );
          },
        },
      ]}
      data={feeConcessionData || []}
    />
  );
};

export default FeeConcession;
