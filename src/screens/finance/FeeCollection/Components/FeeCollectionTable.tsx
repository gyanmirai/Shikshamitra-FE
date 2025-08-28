import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';

import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { Box, Button, MenuList, MenuItem, TextField, IconButton } from '@mui/material';

import {
  FeeCollectionStatusType,
  FeeCollectionStatusOptions,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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
  const [searchValue, setSearchValue] = useState('');

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
    <>
      <Box display="flex" gap={2}>
        <TextField
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            endAdornment: (
              <>
                {searchValue ? (
                  <IconButton
                    size="small"
                    sx={{ mr: '-12px', p: 1 }}
                    onClick={() => setSearchValue('')}
                  >
                    <ClearIcon />
                  </IconButton>
                ) : (
                  <IconButton size="small" sx={{ mr: '-12px', p: 1 }}>
                    <SearchIcon />
                  </IconButton>
                )}
              </>
            ),
          }}
          label="Search Student by Name, GR No, Class or Roll No"
          sx={{ width: '100%' }}
        />
        <Button onClick={() => {}} variant="contained" size="small" sx={{ marginTop: 0.5 }}>
          Search
        </Button>
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
          { id: 'name', label: 'Name', align: 'left', sticky: true },
          { id: 'board', label: 'Board', align: 'left' },
          { id: 'medium', label: 'Medium', align: 'left' },
          { id: 'className', label: 'Class', align: 'left' },
          { id: 'division', label: 'Division', align: 'left' },
          {
            id: 'totalFees',
            label: 'Total Fees',
            align: 'left',
            filterType: 'number',
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          {
            id: 'paidFees',
            label: 'Paid Fees',
            filterType: 'number',
            align: 'left',
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          {
            id: 'pendingFees',
            label: 'Pending Fees',
            filterType: 'number',
            align: 'left',
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            filterType: 'enum',
            enumOptions: FeeCollectionStatusOptions,
            sticky: true,
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
        data={data}
      />
    </>
  );
};

export default FeeCollectionTable;
