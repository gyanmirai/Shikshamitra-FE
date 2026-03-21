import type { LabelColor } from 'src/components/label';

import { Typography } from '@mui/material';
import { Label } from 'src/components/label';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeConcessionsQuery } from 'src/redux/fee-collection/feeConcession';
import {
  ConcessionStatusType,
  ConcessionStatusTypeColor,
  ConcessionStatusTypeOptions,
} from 'src/enums/concession-type';

import type { IStudentFee } from '../type';

const FeeConcession = ({ student }: { student: IStudentFee | null }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: feeConcessionData, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeConcessionsQuery,
  });

  return (
    <CustomizableTable
      tableId="concession-details"
      noDataText="Concession Data Not Found"
      columns={[
        { id: 'concessionType', label: 'Name', align: 'left', minWidth: '150px' },
        { id: 'feeHead', label: 'Fee Head', align: 'left', minWidth: '130px' },
        {
          id: 'reason',
          label: 'Reason of Concession Type',
          align: 'left',
          minWidth: '230px',
          render: (value) => (
            <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  fontSize: '13px',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {value}
              </Typography>
            </CustomTooltip>
          ),
        },
        {
          id: 'rejectReason',
          label: 'Reason of Reject',
          align: 'left',
          minWidth: '200px',
          render: (value, row) =>
            row.status === 3 ? (
              <CustomTooltip title={value || '-'} arrow sx={{ textAlign: 'justify' }}>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    maxWidth: 180,
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {value || '-'}
                </Typography>
              </CustomTooltip>
            ) : (
              '-'
            ),
        },
        {
          id: 'amount',
          label: 'Amount',
          align: 'left',
          render: (value) => `₹ ${value.toLocaleString()}`,
        },
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
          sticky: true,
          isFilter: false,
          minWidth: 50,
          render(value, row) {
            return (
              <ThreeDotsActions
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
