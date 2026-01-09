import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/type';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetMemberReservedBooksQuery } from 'src/redux/library/libraryMembers/memberManagementApi';

import type { IMember } from '../type';

interface ReservedBooksProps {
  member: IMember | null;
}

const ReservedBooks: React.FC<ReservedBooksProps> = ({ member }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { data: mockReservedBooks, isLoading: memberLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMemberReservedBooksQuery,
    params: { memberId: member?.id, academicYearId: currentYear?.id },
  });

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'bookTitle', label: 'Book Title', align: 'left' },
      { id: 'bookCategory', label: 'Book Category', align: 'left' },
      { id: 'reservationDate', label: 'Reserved on', align: 'left' },
      { id: 'author', label: 'Author', align: 'left' },
    ],
    []
  );

  return (
    <CustomizableTable
      tableId="reserved-books-table"
      noDataText="No Reserved Books Data Found"
      isLoading={memberLoading}
      columns={columns}
      data={mockReservedBooks || []}
    />
  );
};

export default ReservedBooks;
