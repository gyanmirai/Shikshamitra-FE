import React from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetReservedBooksQuery } from 'src/redux/memberManagement/memberManagementApi';

import type { IMember } from '../type';

interface ReservedBooksProps {
  member: IMember | null;
}

const ReservedBooks: React.FC<ReservedBooksProps> = ({ member }) => {
  const { data: mockReservedBooks, isLoading: memberLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReservedBooksQuery,
  });

  return (
    <CustomizableTable
      tableId="reserved-books-table"
      noDataText="No Reserved Books Data Found"
      isLoading={memberLoading}
      columns={[
        { id: 'bookTitle', label: 'Book Title', align: 'left' },
        { id: 'bookCategory', label: 'Book Category', align: 'left' },
        { id: 'reservationDate', label: 'Reserved on', align: 'left' },
        { id: 'author', label: 'Author', align: 'left' },
      ]}
      data={mockReservedBooks || []}
    />
  );
};

export default ReservedBooks;
