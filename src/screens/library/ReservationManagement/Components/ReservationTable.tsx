import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React, { useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IReservedBookData } from './type';

const ReservedBookTable = ({
  addDialog,
  data,
  isLoading,
  onEdit,
  onDelete,
  onIssueBook,
}: {
  addDialog: UseBooleanReturn;
  data: IReservedBookData[];
  isLoading?: boolean;
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
      isLoading={isLoading}
      noDataText="No Reserved Student Data Found"
      columns={[
        { id: 'memberName', label: 'Member Name', align: 'left', sticky: true, minWidth: '150px' },
        { id: 'memberId', label: 'Member ID', align: 'left', minWidth: '120px' },
        { id: 'role', label: 'Role', align: 'left' },
        {
          id: 'reservedOn',
          label: 'Reserved On',
          align: 'left',
          filterType: 'date',
          minWidth: '130px',
        },
        { id: 'classNo', label: 'Class', align: 'left', minWidth: '80px' },
        { id: 'division', label: 'Division', align: 'left', minWidth: '80px' },
        { id: 'grNo', label: 'GR No.', align: 'left', minWidth: '80px' },
        { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '120px' },
        {
          id: 'actions',
          label: 'Actions',
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
