import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizable-table/types';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetMemberChargesQuery } from 'src/redux/library/library-members/memberManagementApi';
import {
  FinesChargesStatusType,
  FinesChargesStatusTypeColors,
  FinesChargesStatusTypeOptions,
} from 'src/enums/library-status-types';

import type { IMember } from '../type';

interface FinesChargesProps {
  member: IMember | null;
}

const FinesCharges: React.FC<FinesChargesProps> = ({ member }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { data: mockFinesCharges, isLoading: mockFinesChargesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMemberChargesQuery,
    params: {
      memberId: member?.id,
      academicYearId: currentYear,
    },
  });

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'bookTitle', sticky: true, minWidth: '150px', label: 'Book Title', align: 'left' },
      { id: 'bookCategory', minWidth: '150px', label: 'Book Category', align: 'left' },
      { id: 'accessionNo', minWidth: '180px', label: 'Accession No.', align: 'left' },
      {
        id: 'amount',
        label: 'Amount',
        align: 'left',
        filterType: 'number',
        render(value) {
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          }).format(value);
        },
      },
      { id: 'dateIssued', label: 'Date', align: 'left' },
      { id: 'chargeType', minWidth: '180px', label: 'Charge Type', align: 'left' },
      { id: 'reason', minWidth: '300px', label: 'Reason', align: 'left' },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        sticky: true,
        filterType: 'enum',
        enumOptions: FinesChargesStatusTypeOptions,
        render(value) {
          // Get corresponding color from enum colors mapping
          const color = FinesChargesStatusTypeColors[value as FinesChargesStatusType] || 'default';
          return <Label color={color as LabelColor}>{FinesChargesStatusType[value]}</Label>;
        },
      },
    ],
    []
  );

  return (
    <CustomizableTable
      tableId="fines-charges-table"
      noDataText="No Fines or Charges Data Found"
      isLoading={mockFinesChargesLoading}
      columns={columns}
      data={mockFinesCharges || []}
    />
  );
};

export default FinesCharges;
