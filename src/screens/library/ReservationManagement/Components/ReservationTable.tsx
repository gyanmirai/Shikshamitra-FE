import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React, { useCallback } from 'react';

import { MenuItem, MenuList } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IReservedBookData } from './type';

const ReservedBookTable = ({
  addDialog,
  data,
  onEdit,
  onDelete,
  onIssueBook,
}: {
  addDialog: UseBooleanReturn;
  data: IReservedBookData[];
  onEdit: (row: IReservedBookData) => void;
  onDelete: (row: IReservedBookData) => void;
  onIssueBook: (row: IReservedBookData) => void;
}) => {
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onIssueBook(row as IReservedBookData);
            pop.onClose();
          }}
        >
          <Iconify icon="mdi:book-arrow-right" sx={{ height: '16px', width: '16px' }} />
          Issue Book
        </MenuItem>
      </MenuList>
    ),
    [onIssueBook]
  );

  return (
    <CustomizableTable
      tableId="reserved-book-table"
      noDataText="No Reserved Books Found"
      columns={[
        { id: 'memberId', label: 'Member ID', align: 'left' },
        { id: 'memberName', label: 'Member Name', align: 'left' },
        { id: 'role', label: 'Role', align: 'left' },
        { id: 'reservedOn', label: 'Reserved On', align: 'left', filterType: 'date' },
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
                showDeleteIcon
                showEditIcon
                handleEditClick={() => {
                  onEdit(row as IReservedBookData);
                }}
                handleDeleteClick={() => {
                  onDelete(row as IReservedBookData);
                }}
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

export default ReservedBookTable;
