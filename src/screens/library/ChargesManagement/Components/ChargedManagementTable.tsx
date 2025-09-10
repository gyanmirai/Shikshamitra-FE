import type { LabelColor } from 'src/components/label';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React, { useCallback } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  LibraryChargeStatusType,
  LibraryChargeStatusOptions,
  LibraryChargeStatusTypeColors,
} from 'src/enums/library_charges_type';

import type { ILibraryChargeData } from './type';

const LibraryChargesTable = ({
  data,
  addChargesDialog,
  onCollectCharges,
  onEditCharge,
  onDeleteCharge,
  onViewCharges,
}: {
  data: ILibraryChargeData[];
  addChargesDialog: UseBooleanReturn;
  onCollectCharges: (row: ILibraryChargeData) => void;
  onEditCharge: (row: ILibraryChargeData) => void;
  onDeleteCharge: (row: ILibraryChargeData) => void;
  onViewCharges: (row: ILibraryChargeData) => void;
}) => {
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onCollectCharges(row);
            pop.onClose();
          }}
        >
          <Iconify icon="mdi:cash-multiple" sx={{ height: '16px', width: '16px' }} />
          Collect Charges
        </MenuItem>
      </MenuList>
    ),
    [onCollectCharges]
  );

  return (
    <CustomizableTable
      tableId="library-charges-table"
      noDataText="No Charge Records Found"
      columns={[
        { id: 'memberId', label: 'Member ID', align: 'left' },
        { id: 'memberName', label: 'Member Name', align: 'left' },
        { id: 'role', label: 'Role', align: 'left' },
        { id: 'chargeCategory', label: 'Charge Category', align: 'left' },
        { id: 'fineAmount', label: 'Fine Amount', align: 'left' },
        { id: 'reason', label: 'Reason', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          filterType: 'enum',
          enumOptions: LibraryChargeStatusOptions,
          sticky: true,
          render(value, row) {
            const color = LibraryChargeStatusTypeColors[
              value as LibraryChargeStatusType
            ] as LabelColor;
            return (
              <Label
                color={color as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'}
              >
                {LibraryChargeStatusType[value as LibraryChargeStatusType]}
              </Label>
            );
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
                showEditIcon
                handleEditClick={() => {
                  onEditCharge(row as ILibraryChargeData);
                }}
                showDeleteIcon
                handleDeleteClick={() => {
                  onDeleteCharge(row as ILibraryChargeData);
                }}
                showViewIcon
                handleViewClick={() => {
                  onViewCharges(row as ILibraryChargeData);
                }}
              />
            );
          },
        },
      ]}
      data={data || []}
    />
  );
};

export default LibraryChargesTable;
