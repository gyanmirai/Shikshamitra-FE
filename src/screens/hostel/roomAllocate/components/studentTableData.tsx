'use client';

import type { LabelColor } from 'src/components/label';

import React, { useMemo, useCallback } from 'react';

import { Tab, Box, Tabs, MenuItem, MenuList, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { formatNumber } from 'src/utils/formate_number';

import { HostelRequestStatusType } from 'src/enums/hostel-reqeust-status';

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
  onLeftStudent,
}) => {
  const tabs = useTabs(HostelRequestStatusType.Pending);

  const counts = useMemo(
    () => ({
      pending: requests?.filter((i: any) => i.status === HostelRequestStatusType.Pending)?.length,
      approved: requests?.filter((i: any) => i.status === HostelRequestStatusType.Approved)?.length,
      rejected: requests?.filter((i: any) => i.status === HostelRequestStatusType.Rejected)?.length,
    }),
    [requests]
  );
  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: HostelRequestStatusType.Pending,
        count: counts.pending || 0,
        color: 'warning',
      },
      {
        label: 'Approved',
        value: HostelRequestStatusType.Approved,
        count: counts.approved || 0,
        color: 'success',
      },
      {
        label: 'Rejected',
        value: HostelRequestStatusType.Rejected,
        count: counts.rejected || 0,
        color: 'error',
      },
    ],
    [counts]
  );

  const tableData = useMemo(
    () => requests?.filter((i: any) => i.status === tabs.value),
    [requests, tabs.value]
  );

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
            <>
              <MenuItem
                onClick={() => {
                  onAssignRoom(row as IHostelRequestFormType);
                  pop.onClose();
                }}
              >
                <Iconify icon="mdi:check-circle" sx={{ mr: 1 }} />
                Reassign Room
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onLeftStudent(row as IHostelRequestFormType);
                  pop.onClose();
                }}
              >
                <Iconify icon="mdi:arrow-right-bold" sx={{ mr: 1 }} />
                Leave Student
              </MenuItem>
            </>
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
    [onAssignRoom, onLeftStudent, onRejected]
  );
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  return (
    <Box>
      <Box display="flex" gap={1} alignItems="flex-start">
        <Tabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{
            mb: 2,
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}{' '}
                  <Label
                    // variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
                    color={(tab?.color as LabelColor) || 'default'}
                  >
                    {tab.count}
                  </Label>
                </Box>
              }
              // icon={tab.icon}
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>
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
          { id: 'roomType', label: 'Room Type', align: 'left', minWidth: 130 },
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
        data={tableData}
      />
    </Box>
  );
};
export default StudentTableData;
