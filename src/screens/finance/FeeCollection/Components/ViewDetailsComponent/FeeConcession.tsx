import type { LabelColor } from 'src/components/label';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeConcessionsQuery } from 'src/redux/feeCollection/feeConcession';
import {
  ConcessionStatusType,
  ConcessionStatusTypeColor,
  ConcessionStatusTypeOptions,
} from 'src/enums/concession-type';

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
          filterType: 'enum',
          enumOptions: ConcessionStatusTypeOptions,
          sticky: true,
          render(value, row) {
            const color = ConcessionStatusTypeColor[value as ConcessionStatusType] as LabelColor;
            return (
              <Label color={color}>{ConcessionStatusType[value as ConcessionStatusType]}</Label>
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
