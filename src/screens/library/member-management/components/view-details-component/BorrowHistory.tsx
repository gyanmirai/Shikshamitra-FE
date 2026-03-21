import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizable-table/types';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetMemberBorrowHistoryQuery } from 'src/redux/library/library-members/memberManagementApi';

import type { IMember } from '../type';

interface IBorrowHistoryProps {
  member: IMember | null;
}

const BorrowHistory: React.FC<IBorrowHistoryProps> = ({ member }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { data: mockIssuedBooks, isLoading: mockIssuedLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMemberBorrowHistoryQuery,
    params: {
      memberId: member?.id,
      academicYearId: currentYear?.id,
    },
  });

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'bookTitle', label: 'Book Title', align: 'left' },
      { id: 'bookId', label: 'Book Category', align: 'left' },
      { id: 'accessionNo', label: 'Accession No.', align: 'left' },
      { id: 'issueDate', label: 'Issued on', align: 'left' },
      { id: 'dueDate', label: 'Due on', align: 'left' },
      // {
      //   id: 'status',
      //   label: 'Status',
      //   align: 'left',
      //   render(value) {
      //     // Find the status type based on the label from enum options
      //     const statusType = BookIssueStatusTypeOptions.find(
      //       (option) => option.label === value
      //     )?.value;

      //     // Get corresponding color from enum colors mapping
      //     const color =
      //       statusType !== undefined ? BookIssueStatusTypeColors[statusType] : 'default';

      //     return <Label color={color as any}>{value}</Label>;
      //   },
      // },
    ],
    []
  );

  return (
    <CustomizableTable
      tableId="issued-books-table"
      noDataText="No Borrowed History Data Found"
      isLoading={mockIssuedLoading}
      columns={columns}
      data={mockIssuedBooks || []}
    />
  );
};

export default BorrowHistory;
