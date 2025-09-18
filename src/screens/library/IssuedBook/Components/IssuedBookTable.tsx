import type { LabelColor } from 'src/components/label';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React, { useCallback } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  LibraryBookStatus,
  LibraryBookStatusColors,
  LibraryBookStatusOptions,
} from 'src/enums/library-book-status';

import type { ILibraryBookData } from './type';

const BookIssueReturnTable = ({
  addDialog,
  data,
  onReturnBook,
}: {
  addDialog: UseBooleanReturn;
  data: ILibraryBookData[];
  onReturnBook: (row: ILibraryBookData) => void;
}) => {
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onReturnBook(row);
            pop.onClose();
          }}
        >
          <Iconify icon="mdi:book-arrow-left" sx={{ height: '16px', width: '16px' }} />
          Return Book
        </MenuItem>
      </MenuList>
    ),
    [onReturnBook]
  );

  return (
    <CustomizableTable
      tableId="library-book-table"
      noDataText="No Book Records Found"
      columns={[
        { id: 'memberId', label: 'Member ID', align: 'left', minWidth: '120px' },
        { id: 'memberName', label: 'Member Name', align: 'left', minWidth: '140px' },
        { id: 'bookCategory', label: 'Book Category', align: 'left', minWidth: '140px' },
        { id: 'bookTitle', label: 'Book Title', align: 'left', minWidth: '120px' },
        {
          id: 'requestedDate',
          label: 'Issue Date',
          align: 'left',
          filterType: 'date',
          minWidth: '120px',
        },
        { id: 'dueDate', label: 'Due Date', align: 'left', filterType: 'date', minWidth: '120px' },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          filterType: 'enum',
          enumOptions: LibraryBookStatusOptions,
          sticky: true,
          render(value, row) {
            const color = LibraryBookStatusColors[value as LibraryBookStatus];
            return <Label color={color as LabelColor}>{LibraryBookStatus[value]}</Label>;
          },
        },
        {
          id: 'actions',
          label: 'Action',
          align: 'left',
          isSort: false,
          isFilter: false,
          minWidth: 80,
          sticky: true,
          render(value, row) {
            return (
              <ThreeDotsActions
                actions={(prop) => actions({ ...prop, row })}
                placement="right-top"
              />
            );
          },
        },
      ]}
      data={data || []}
    />
  );
};

export default BookIssueReturnTable;
