import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/type';

import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetMemberBorrowedBooksQuery } from 'src/redux/library/libraryMembers/memberManagementApi';

import type { IMember } from '../type';

interface IssuedBooksProps {
  member: IMember | null;
}

const IssuedBooks: React.FC<IssuedBooksProps> = ({ member }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: membersData, isLoading: mockIssuedLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMemberBorrowedBooksQuery,
    params: { memberId: member?.id, academicYearId: currentYear?.id },
  });

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'bookTitle', label: 'Book Title', align: 'left' },
      { id: 'bookId', label: 'Book Category', align: 'left' },
      { id: 'accessionNo', label: 'Accession No.', align: 'left' },
      { id: 'issueDate', label: 'Issued on', align: 'left' },
      { id: 'dueDate', label: 'Due on', align: 'left' },
    ],
    []
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomizableTable
        tableId="issued-books-table"
        noDataText="No Borrowed Books Data Found"
        isLoading={mockIssuedLoading}
        columns={columns}
        data={[]}
      />
    </Box>
  );
};

export default IssuedBooks;
