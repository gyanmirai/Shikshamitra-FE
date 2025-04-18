'use client';

import type { LabelColor } from 'src/components/label';

import React from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const EventsAndHolidaysRequest = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Request"
      links={[{ name: 'HR' }, { name: 'Events & Holidays' }, { name: 'Request' }]}
      sx={{ px: 1, mb: 2 }}
      description="The Request Screen allows you to handle various requests. You can approve or reject requests based on the details provided."
    />
    <CustomizableTable
      noDataText={<>No Leave Requet Found </>}
      searchFieldProps={{
        placeholder: 'Search by Start Date, End Date..',
        label: 'Search by Start Date, End Date...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      tableId="event-holiday-request"
      columns={[
        { id: 'createdBy', label: 'Created By' },
        { id: 'createdAt', label: 'Created At', filterType: 'date' },
        { id: 'startDate', label: 'Start Date', filterType: 'date' },
        { id: 'endDate', label: 'End Date', filterType: 'date' },
        { id: 'reason', label: 'Reason' },
        { id: 'approvedBy', label: 'Approved By' },
        {
          id: 'status',
          label: 'Status',
          filterType: 'enum',
          enumOptions: EmployeeLeaveStatusOptions,
          render(value, row) {
            const color = EmployeeLeaveStatusTypeColor[
              row.status as EmployeeLeaveStatusType
            ] as LabelColor;
            return <Label color={color}>{EmployeeLeaveStatusType[value]}</Label>;
          },
        },
        {
          id: 'actions',
          label: 'Actions',
          isSort: false,
          isFilter: false,
          minWidth: 50,
          sticky: true,
          render(value, row) {
            return (
              <ThreeDotsActions
                placement="right-top"
                actions={() => (
                  <MenuList>
                    <MenuItem onClick={() => {}}>
                      <Iconify icon="mdi:approve" sx={{ color: 'success.main' }} />
                      Approve
                    </MenuItem>
                    <MenuItem onClick={() => {}}>
                      <Iconify icon="entypo:cross" sx={{ color: 'error.main' }} />
                      Reject
                    </MenuItem>
                  </MenuList>
                )}
              />
            );
          },
        },
      ]}
      data={[
        {
          id: 1,
          createdBy: 'John Doe',
          createdAt: '2024-01-15',
          startDate: '2024-02-01',
          endDate: '2024-02-02',
          reason: 'Company Anniversary',
          approvedBy: '-',
          status: 0,
        },
        {
          id: 2,
          createdBy: 'Alice Johnson',
          createdAt: '2024-01-16',
          startDate: '2024-02-14',
          endDate: '2024-02-14',
          reason: 'Valentine Day Celebration',
          approvedBy: 'Robert Wilson',
          status: 1,
        },
        {
          id: 3,
          createdBy: 'Mike Brown',
          createdAt: '2024-01-17',
          startDate: '2024-03-15',
          endDate: '2024-03-15',
          reason: 'Team Building Event',
          approvedBy: 'Sarah Davis',
          status: 2,
        },
      ]}
    />
  </Box>
);

export default EventsAndHolidaysRequest;
