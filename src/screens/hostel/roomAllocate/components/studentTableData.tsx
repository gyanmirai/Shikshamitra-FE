'use client';

import type { LabelColor } from 'src/components/label';

import React, { useCallback } from 'react';

import { MenuItem, MenuList, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import {
  HostelRequestStatusType,
  HostelRequestStatusColors,
  HostelRequestStatusOptions,
} from 'src/enums/hostel-reqeust-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IHostelTableDataProps } from '../type';
import type { IHostelRequestFormType } from '../../newRequest/components/type';

const StudentTableData: React.FC<IHostelTableDataProps> = ({
  requests,
  onDelete,
  onRequestDetails,
  onAssignRoom,
  onRejected,
}) => {
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {/* {(row.status === 'Cancelled' || row.status === 'Scheduled') && ( */}
          {row.status === 0 ? (
            <MenuItem
              onClick={() => {
                onAssignRoom(row as IHostelRequestFormType);
                pop.onClose();
              }}
            >
              <Iconify icon="mdi:check-circle" sx={{ mr: 1 }} />
              Approve Request
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                onAssignRoom(row as IHostelRequestFormType);
                pop.onClose();
              }}
            >
              <Iconify icon="mdi:check-circle" sx={{ mr: 1 }} />
              Reassign Room
            </MenuItem>
          )}

          {row.status === 0 && (
            <MenuItem
              onClick={() => {
                onRejected(row as IHostelRequestFormType);
                pop.onClose();
              }}
            >
              <Iconify icon="mdi:cross-circle" sx={{ mr: 1 }} />
              Reject Request
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [onAssignRoom, onRejected]
  );
  return (
    <CustomizableTable
      tableId="hostel-request-table"
      searchFieldProps={{
        placeholder: 'Search by Student Name...',
        label: 'Search by Student Name...',
      }}
      noDataText={<>No Hostel Requests Found </>}
      columns={[
        { id: 'name', label: 'Student Name', align: 'left', minWidth: 150 },
        { id: 'gender', label: 'Gender', align: 'left', minWidth: 100 },
        { id: 'email', label: 'Email', align: 'left', minWidth: 150 },
        { id: 'className', label: 'Class', align: 'left', minWidth: 100 },
        { id: 'division', label: 'Division', align: 'left', minWidth: 100 },
        { id: 'hostelName', label: 'Hostel Name', align: 'left', minWidth: 130 },
        { id: 'hostelType', label: 'Hostel Type', align: 'left', minWidth: 130 },
        { id: 'packageName', label: 'Package', align: 'left', minWidth: 130 },
        {
          id: 'totalAmount',
          label: 'Amount',
          align: 'left',
          filterType: 'number',
          minWidth: 100,
          render(value, row) {
            return (
              <Typography
                sx={{
                  fontSize: '12px',
                  ...(row.id === 'total' ? { fontWeight: 'bold' } : {}),
                }}
              >
                {formatNumber(row.totalAmount, 'INR')}
              </Typography>
            );
          },
        },
        {
          id: 'status',
          label: 'Status',
          filterType: 'enum',
          enumOptions: HostelRequestStatusOptions,
          minWidth: '130px',
          align: 'left',
          render(value, row) {
            const color = HostelRequestStatusColors[value as HostelRequestStatusType] as LabelColor;
            return <Label color={color}>{HostelRequestStatusType[value]}</Label>;
          },
        },
        {
          id: 'action',
          label: 'Actions',
          minWidth: 100,
          isSort: false,
          sticky: true,
          isFilter: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                placement="right-top"
                actions={(prop) => actions({ ...prop, row })}
                showDeleteIcon
                showViewIcon
                handleViewClick={() => {
                  onRequestDetails(row as IHostelRequestFormType);
                }}
                handleDeleteClick={() => {
                  onDelete(row as IHostelRequestFormType);
                }}
              />
            );
          },
        },
      ]}
      data={requests}
    />
  );
};
export default StudentTableData;
