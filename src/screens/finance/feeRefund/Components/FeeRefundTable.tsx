'use client';

import type { LabelColor } from 'src/components/label';

import React, { useCallback } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Avatar, MenuList, MenuItem } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  FeeRefundStatusType,
  FeeRefundStatusOptions,
  FeeRefundStatusTypeColors,
} from 'src/enums/feeRefund-status-type';

import type { IStudentFeeData, IStudentFeeTableProps } from '../type';

const StudentFeeRefundTable: React.FC<IStudentFeeTableProps> = ({
  data,
  onRequestRefund,
  onView,
  onProcessRefund,
}) => {
  // Memoized callback function to render action menu items
  // Takes popover and row data as parameters
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {row.status === FeeRefundStatusType.Approved && (
          <MenuItem
            onClick={() => {
              // Close the popover menu and trigger refund request
              pop.onClose();
              onProcessRefund?.(row);
            }}
          >
            {/* Icon and text for refund request action */}
            <Iconify icon="uil:process" sx={{ height: '16px', width: '16px' }} />
            Process for Refund
          </MenuItem>
        )}
      </MenuList>
    ),
    [onProcessRefund] // Re-create callback only when onRequestRefund changes
  );
  return (
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
          minWidth: 100,
        },
        { id: 'class', label: 'Class', align: 'left', isFilter: true },
        { id: 'division', label: 'Division', align: 'left', isFilter: true },
        { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: 120 },
        {
          id: 'refundAmount',
          label: 'Refund Amount',
          align: 'left',
          minWidth: '150px',
          isFilter: true,
          render: (value) => (value ? `₹ ${value.toLocaleString()}` : '-'),
        },
        {
          id: 'requestDate',
          label: 'Request Date',
          align: 'left',
          minWidth: '160px',
          isFilter: true,
          filterType: 'date',
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
                disabled={row.status !== FeeRefundStatusType.Approved}
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
  );
};

export default StudentFeeRefundTable;
