import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, MenuList, MenuItem } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAllBoardQuery, useGetAllMediumQuery } from 'src/redux/feeCollection/feeCollection';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusOptions,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import type { IFeeData, IFeeTableProps } from './type';

const FeeCollectionTable: React.FC<IFeeTableProps> = ({
  data,
  onAddFee,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  onCollectFee,
  onView,
}) => {
  const [board, setBoard] = useState('');
  const [medium, setMedium] = useState('');

  const { data: allBoardData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllBoardQuery,
  });

  const { data: allMediumData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllMediumQuery,
  });

  // Provide fallback empty arrays to prevent undefined errors
  const allBoard = allBoardData || [];
  const allMedium = allMediumData || [];

  const actions = ({ row, popover }: any) => (
    <MenuList>
      <MenuItem
        onClick={() => {
          onCollectFee(row as IFeeData);
        }}
      >
        <Iconify icon="solar:wallet-bold" sx={{ height: '16px', width: '16px' }} /> Collect Fee
      </MenuItem>
    </MenuList>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, ml: 1 }}>
        <CustomSelect
          label="Board"
          name="board"
          options={allBoard}
          valueKey="name"
          labelKey="name"
          formControlProps={{ sx: { width: '25%' } }}
          value={board}
          onChange={(value) => {
            setBoard(value as string);
          }}
        />
        <CustomSelect
          options={allMedium}
          value={medium}
          onChange={(val) => {
            setMedium(val as string);
          }}
          label="Medium"
          valueKey="name"
          labelKey="name"
          formControlProps={{ sx: { width: '25%' } }}
        />
      </Box>
      <CustomizableTable
        tableId="fee-collection-table"
        noDataText={
          <>
            Fee Data Not Found{' '}
            <Box
              onClick={() => {
                onAddFee.onTrue();
                setOpenDialog(true);
                setEditData(null);
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Fee Record
            </Box>
          </>
        }
        columns={[
          { id: 'name', label: 'Name', align: 'left', isFilter: true, sticky: true },
          { id: 'className', label: 'Class', isFilter: true, align: 'left', minWidth: '90px' },
          { id: 'division', label: 'Division', isFilter: true, align: 'left', minWidth: '90px' },
          { id: 'grNumber', label: 'GR No.', align: 'left', isFilter: true, minWidth: '90px' },
          { id: 'rollNumber', label: 'Roll No.', align: 'left', isFilter: true, minWidth: '90px' },
          {
            id: 'totalFees',
            label: 'Total Fees',
            align: 'left',
            isFilter: true,
            filterType: 'number',
            minWidth: '120px',
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          {
            id: 'pendingFees',
            label: 'Pending Fees',
            filterType: 'number',
            align: 'left',
            isFilter: true,
            minWidth: '130px',
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          {
            id: 'overdueFees',
            label: 'Overdue Fees',
            filterType: 'number',
            align: 'left',
            minWidth: '140px',
            isFilter: true,
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            isFilter: true,
            filterType: 'enum',
            enumOptions: FeeCollectionStatusOptions,
            sticky: true,
            minWidth: '90px',
            render(value, row) {
              const color = FeeCollectionStatusTypeColors[
                value as FeeCollectionStatusType
              ] as LabelColor;
              return (
                <Label color={color}>
                  {FeeCollectionStatusType[value as FeeCollectionStatusType]}
                </Label>
              );
            },
          },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 60,
            align: 'left',
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(props) => actions({ ...props, row })}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {
                    onView(row as IFeeData);
                  }}
                />
              );
            },
          },
        ]}
        data={data || []} // Add fallback for data as well
      />
    </Box>
  );
};

export default FeeCollectionTable;
