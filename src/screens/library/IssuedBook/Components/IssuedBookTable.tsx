import type { LabelColor } from 'src/components/label';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import { LibraryBookStatus, LibraryBookStatusColors } from 'src/enums/library-book-status'; // Make sure this import path is correct

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetIssueReturnListQuery } from 'src/redux/library/issueAndReturnApi/issueAndReturnApi';

import type { ILibraryBookData } from './type';

// const TABS = [
//   {
//     label: 'Issued',
//     value: LibraryBookStatus.Issued,
//     color: 'info',
//   },
//   {
//     label: 'Overdue',
//     value: LibraryBookStatus.Overdue,
//     color: 'error',
//   },
// ];

const BookIssueReturnTable = ({
  addDialog,
  onReturnBook,
}: {
  addDialog: UseBooleanReturn;
  onReturnBook: (row: ILibraryBookData) => void;
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  //   Fetch issued/returned books
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: issuedBooks } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIssueReturnListQuery,
    params: { academicYearId: currentYear?.id },
  });

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'memberName',
        label: 'Member Name',
        align: 'left',
        minWidth: '140px',
        sticky: true,
      },
      { id: 'memberId', label: 'Member ID', align: 'left', minWidth: '120px' },
      { id: 'role', label: 'Role', align: 'left', minWidth: '100px' },
      { id: 'bookTitle', label: 'Book Title', align: 'left', minWidth: '120px' },
      { id: 'accessionNo', label: 'Accession No.', align: 'left', minWidth: '150px' },
      {
        id: 'classDivision',
        label: 'Class/Division',
        align: 'left',
        minWidth: '130px',
        render: (_value, row) => (
          <span>
            {row.classNo}
            {row.division ? `-${row.division}` : ''}
          </span>
        ),
      },
      { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: 90 },
      { id: 'grNo', label: 'GR No.', align: 'left', minWidth: '120px' },
      { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '120px' },
      { id: 'bookCategory', label: 'Book Category', align: 'left', minWidth: '140px' },
      {
        id: 'requestedDate',
        label: 'Issue Date',
        align: 'left',
        filterType: 'date',
        minWidth: '120px',
      },
      {
        id: 'dueDate',
        label: 'Due Date',
        align: 'left',
        filterType: 'date',
        minWidth: '120px',
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        sticky: true,
        enumOptions: [
          { label: 'Issued', value: LibraryBookStatus.Issued },
          { label: 'Overdue', value: LibraryBookStatus.Overdue },
        ],
        align: 'left',
        render(value, row) {
          const color = LibraryBookStatusColors[value as LibraryBookStatus] as LabelColor;
          return <Label color={color}>{LibraryBookStatus[value]}</Label>;
        },
      },
    ],
    []
  );

  return (
    <CustomizableTable
      tableId="library-book-table"
      noDataText="No Issue Book Data Found "
      columns={columns}
      data={issuedBooks || []}
    />
  );
};
export default BookIssueReturnTable;
