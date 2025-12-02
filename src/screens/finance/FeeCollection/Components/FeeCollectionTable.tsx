import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, MenuList, MenuItem, Typography } from '@mui/material';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusOptions,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import type { IFeeData, IFeeTableProps } from './type';

const FeeCollectionTable: React.FC<IFeeTableProps> = ({
  data,
  onAddFee,
  selectedBoard,
  setSelectedBoard,
  selectedMedium,
  setSelectedMedium,
  onCollectFee,
  onView,
}) => {
  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    // Filter boards based on academic year ID from edit data
    setBoards(currentYear?.boards);
    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  const actions = ({ row }: any) => (
    <MenuList>
      <MenuItem
        onClick={() => {
          onCollectFee(row as IFeeData);
        }}
      >
        <Iconify icon="fluent:payment-16-regular" sx={{ height: '16px', width: '16px' }} />
        Collect Fee
      </MenuItem>
    </MenuList>
  );

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, ml: 1 }}>
        <CustomSelect
          label="Board"
          options={boards || []}
          labelKey="name"
          valueKey="id"
          value={selectedBoard}
          onChange={(value) => {
            setSelectedBoard(value as string);
            setSelectedMedium('');
          }}
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
        />
        <CustomSelect
          label="Medium"
          options={mediums || []}
          labelKey="name"
          disabled={!selectedBoard}
          valueKey="id"
          value={selectedMedium}
          onChange={(value) => setSelectedMedium(value as string)}
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
        />
      </Box>
      {selectedMedium && (
        <CustomizableTable
          tableId="fee-collection-table"
          noDataText={<>Fee Collection Data Not Found </>}
          columns={[
            {
              id: 'name',
              label: 'Name',
              align: 'left',
              isFilter: true,
              minWidth: '200px',
              sticky: true,
              render: (value, row) => (
                <Typography variant="caption" fontSize="13px">
                  {value || '-'} ({row.grNumber})
                </Typography>
              ),
            },
            {
              id: 'className',
              label: 'Class/Div',
              isFilter: true,
              align: 'left',
              minWidth: '90px',
              render: (value, row) => (
                <Typography variant="caption" fontSize="13px">
                  {value || '-'}-{row.division}
                </Typography>
              ),
            },
            {
              id: 'rollNumber',
              label: 'Roll No.',
              align: 'left',
              isFilter: true,
              minWidth: '90px',
            },
            {
              id: 'paybleFees',
              label: 'Payble Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              minWidth: '120px',
              render: (value) => `₹ ${value.toLocaleString()}`,
            },
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
              render(value) {
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
          data={data || []}
        />
      )}
    </>
  );
};

export default FeeCollectionTable;
