'use client';

import type { LabelColor } from 'src/components/label';
import type { FeeRefundStatusType } from 'src/enums/feeRefund-status-type';

import React, { useState, useCallback } from 'react';

import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { Box, Avatar, Button, MenuList, MenuItem, TextField, IconButton } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { FeeRefundStatusOptions, FeeRefundStatusTypeColors } from 'src/enums/feeRefund-status-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentFeeData, IStudentFeeTableProps } from '../type';

const StudentFeeRefundTable: React.FC<IStudentFeeTableProps> = ({
  data,
  onRequestRefund,
  onView,
  onProcessRefund,
}) => {
  // State to store and manage the search input value
  const [searchValue, setSearchValue] = useState('');

  // Memoized callback function to render action menu items
  // Takes popover and row data as parameters
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            // Close the popover menu and trigger refund request
            pop.onClose();
            onRequestRefund?.(row);
          }}
        >
          {/* Icon and text for refund request action */}
          <Iconify icon={GlobalIcons.addIcon} sx={{ height: '16px', width: '16px' }} />
          Request Refund
        </MenuItem>
        <MenuItem
          onClick={() => {
            // Close the popover menu and trigger refund request
            pop.onClose();
            onProcessRefund?.(row);
          }}
        >
          {/* Icon and text for refund request action */}
          <Iconify icon={GlobalIcons.addIcon} sx={{ height: '16px', width: '16px' }} />
          Process for Refund
        </MenuItem>
      </MenuList>
    ),
    [onProcessRefund, onRequestRefund] // Re-create callback only when onRequestRefund changes
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
        tableId="student-fee-table"
        noDataText={<>No Student Fee Data Found</>}
        columns={[
          {
            id: 'name',
            label: 'Name',
            align: 'left',
            minWidth: 170,
            sticky: true,
            render: (value, row) => (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar src={row.avatarUrl} sx={{ width: 32, height: 32 }} />
                {row.name}
              </Box>
            ),
          },
          { id: 'grNo', label: 'GR No.', align: 'left', isFilter: true, minWidth: 80 },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
            isFilter: true,
            filterType: 'number',
            minWidth: 80,
          },
          { id: 'board', label: 'Board', align: 'left', isFilter: true },
          { id: 'medium', label: 'Medium', align: 'left', isFilter: true },
          { id: 'class', label: 'Class', align: 'left', isFilter: true },
          { id: 'division', label: 'Division', align: 'left', isFilter: true },
          { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: '120px', isFilter: true },
          {
            id: 'totalPaidFees',
            label: 'Total Paid Fees',
            align: 'left',
            minWidth: '150px',
            isFilter: true,
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          {
            id: 'totalPendingFees',
            label: 'Total Pending Fees',
            align: 'left',
            minWidth: '170px',
            isFilter: true,
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          {
            id: 'refundAmount',
            label: 'Refund Amount',
            align: 'left',
            minWidth: '150px',
            isFilter: true,
            render: (value) => (value ? `₹ ${value.toLocaleString()}` : '-'),
          },
          {
            id: 'reasonOfRefund',
            label: 'Reason of Refund',
            align: 'left',
            minWidth: '160px',
            isFilter: true,
            render: (value) => value || '-',
          },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            minWidth: '120px',
            filterType: 'enum',
            isFilter: true,
            enumOptions: FeeRefundStatusOptions,
            sticky: true,
            render: (value) => {
              if (value === undefined || value === null) return '-';
              const color = FeeRefundStatusTypeColors[value as FeeRefundStatusType] as LabelColor;
              return (
                <Label color={color}>
                  {FeeRefundStatusOptions.find((opt) => opt.value === value)?.label}
                </Label>
              );
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            align: 'left',
            minWidth: 50,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  showViewIcon
                  handleViewClick={() => {
                    onView?.(row as IStudentFeeData);
                  }}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={data || []}
      />
    </>
  );
};

export default StudentFeeRefundTable;
